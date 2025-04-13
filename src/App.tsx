/**
 * Main App component for Apophenia game.
 * 
 * This component manages the overall game state and flow between different stages:
 * 1. Setup - Configure game parameters
 * 2. Protocol Selection - Choose between Rorschach (practice) or Lineup (game)
 * 3. Rorschach Protocol - View randomized data to calibrate perception
 * 4. Lineup Protocol - Identify the true pattern among randomized plots
 * 5. Results - View final score and game statistics
 * 
 * The game is based on visual inference principles from the field of statistical graphics,
 * as described in:
 *   H. Wickham, D. Cook, H. Hofmann and A. Buja, "Graphical inference for infovis," in IEEE
 *   Transactions on Visualization and Computer Graphics, vol. 16, no. 6, pp. 973-979, Nov.-Dec.
 *   2010, doi: 10.1109/TVCG.2010.161.
 * 
 *   Buja A, Cook D, Hofmann H, Lawrence M, Lee E, Swayne DF, Wickham H (2009). “Statistical Inference
 *   for Exploratory Data Analysis and Model Diagnostics.” Royal Society Philosophical Transactions A,
 *   367 (1906), 4361-4383. doi:10.1098/rsta.2009.0120.
 * 
 * These papers introduce lineup and Rorschach protocols as formal statistical methods
 * for graphical inference, which this game adapts into an interactive experience that
 * measures a player's ability to detect signal from noise.
 * 
 * @component
 * @returns {JSX.Element} Complete game interface that adapts based on current game stage
 */
import { useEffect, useState } from 'react'
import './App.css'
import GameSetup from './components/GameSetup.tsx'
import RorschachProtocol from './components/RorschachProtocol.tsx'
import LineupProtocol from './components/LineupProtocol.tsx'
import GameResults from './components/GameResults.tsx'
import { GameConfig, GameState, Protocol } from './types.ts'
import { updateNoiseLevel } from './utils/dataGenerator.ts'
import { useApopheniaData } from './hooks/useApopheniaData.tsx'

function App() {
  const [gameState, setGameState] = useState<GameState>({
    stage: 'setup',
    config: null,
    protocol: null,
    score: 0,
    roundsPlayed: 0,
    currentNoiseLevel: 0.5,
    currentTruePos: null
  })

  // Initialize our data tracking hook
  const { 
    sessionData,
    recordSetup,
    startRorschachSession,
    recordRorschachRegenerate,
    endRorschachSession,
    startLineupRound,
    recordLineupSelection,
    recordGameEnd,
    resetSessionData
  } = useApopheniaData();

  /**
   * Starts a new game with the provided configuration.
   * Records setup data and transitions to protocol selection stage.
   * 
   * @param {GameConfig} config - Game configuration from setup form
   */
  const startGame = (config: GameConfig) => {
    const initialNoiseLevel = config.funcConfig?.initialNoiseLevel || 0.5;
    
    // Record the setup data
    recordSetup(config);
    
    setGameState({
      ...gameState,
      stage: 'protocol-selection',
      config,
      currentNoiseLevel: initialNoiseLevel
    })
  }

  /**
   * Sets the game protocol (Rorschach or Lineup) and prepares the appropriate stage.
   * For Lineup protocol, also generates the initial true position randomly.
   * 
   * @param {Protocol} protocol - Selected protocol ('rorschach' or 'lineup')
   */
  const selectProtocol = (protocol: Protocol) => {
    setGameState({
      ...gameState,
      stage: protocol === 'rorschach' ? 'rorschach' : 'lineup',
      protocol,
      currentTruePos: protocol === 'lineup' ? Math.floor(Math.random() * gameState.config!.n) + 1 : null
    })
  }

  /**
   * Transitions from Rorschach protocol to Lineup protocol.
   * Records the end of Rorschach session if applicable.
   */
  const skipRorschach = () => {
    // If we're currently in Rorschach mode, record the end
    if (gameState.stage === 'rorschach') {
      endRorschachSession();
    }
    
    const truePos = Math.floor(Math.random() * gameState.config!.n) + 1;
    
    setGameState({
      ...gameState,
      stage: 'lineup',
      protocol: 'lineup',
      currentTruePos: truePos
    })
  }

  /**
   * Handles player selection in the Lineup protocol.
   * If correct, increases difficulty and continues to next round.
   * If incorrect, ends the game and shows results.
   * 
   * @param {number} selectedPos - Position index selected by the player
   */
  const handleSelection = (selectedPos: number) => {
    const isCorrect = selectedPos === gameState.currentTruePos
    
    // Record the user's selection
    recordLineupSelection(selectedPos, isCorrect);
    
    if (isCorrect) {
      // Player got it right, increase difficulty
      const newNoiseLevel = updateNoiseLevel(
        gameState.config!, 
        gameState.currentNoiseLevel
      );
      
      // Continue to next round
      setGameState({
        ...gameState,
        score: gameState.score + 1,
        roundsPlayed: gameState.roundsPlayed + 1,
        currentNoiseLevel: newNoiseLevel,
        currentTruePos: Math.floor(Math.random() * gameState.config!.n) + 1
      })
    } else {
      // Game over
      setGameState({
        ...gameState,
        stage: 'results',
        roundsPlayed: gameState.roundsPlayed + 1
      })
      
      // Record the end of the game
      recordGameEnd(gameState.score, gameState.currentNoiseLevel);
    }
  }

  /**
   * Resets the game to initial state and starts a new session.
   */
  const restartGame = () => {
    setGameState({
      stage: 'setup',
      config: null,
      protocol: null,
      score: 0,
      roundsPlayed: 0,
      currentNoiseLevel: 0.5,
      currentTruePos: null
    })

    // Reset the session data when restarting the game
    resetSessionData();
  }

  useEffect(() => {
    // Debug logging for development - helps verify data collection
    console.log('Current session data:', sessionData);
    
    // Optional - log detailed state changes only when they happen
    console.log('Game stage:', gameState.stage);
    console.log('Round data:', sessionData.lineupData.rounds);
  }, [sessionData, gameState.stage]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Apophenia</h1>
      
      {gameState.stage === 'setup' && (
        <GameSetup onSubmit={startGame} />
      )}
      
      {gameState.stage === 'protocol-selection' && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Choose Protocol</h2>
          <p className="mb-4">
            The Rorschach protocol will help you learn to identify random patterns.
            The Lineup protocol will test your ability to spot real data among decoys.
          </p>
          <div className="flex space-x-4 justify-center">
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => selectProtocol('rorschach')}
            >
              Start with Rorschach
            </button>
            <button 
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => selectProtocol('lineup')}
            >
              Go directly to Lineup
            </button>
          </div>
        </div>
      )}
      
      {gameState.stage === 'rorschach' && gameState.config && (
        <RorschachProtocol 
          config={gameState.config} 
          onContinue={skipRorschach}
          onRorschachStart={startRorschachSession}
          onRorschachRegenerate={recordRorschachRegenerate}
        />
      )}
      
      {gameState.stage === 'lineup' && gameState.config && gameState.currentTruePos !== null && (
        <LineupProtocol 
          config={gameState.config}
          truePos={gameState.currentTruePos}
          round={gameState.roundsPlayed + 1}
          noiseLevel={gameState.currentNoiseLevel}
          onSelection={handleSelection}
          onLineupStart={startLineupRound}
        />
      )}
      
      {gameState.stage === 'results' && gameState.config && (
        <GameResults 
          score={gameState.score}
          initialNoiseLevel={gameState.config.funcConfig?.initialNoiseLevel || 0.5}
          finalNoiseLevel={gameState.currentNoiseLevel}
          onRestart={restartGame}
        />
      )}
    </div>
  )
}

export default App