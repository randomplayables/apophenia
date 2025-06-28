import { useEffect, useState, useRef } from 'react'
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
  
  const appInitialized = useRef(false);

  // Initialize our data tracking hook
  const { 
    initializeSession,
    recordSetup,
    startRorschachSession,
    recordRorschachRegenerate,
    endRorschachSession,
    startLineupRound,
    recordLineupSelection,
    recordGameEnd,
  } = useApopheniaData();

  useEffect(() => {
    // This effect now runs only once, even in React Strict Mode.
    if (!appInitialized.current) {
        initializeSession();
        appInitialized.current = true;
    }
    // Debug logging to observe state changes without causing re-renders
    console.log('Game stage:', gameState.stage);
  }, [initializeSession, gameState.stage]);


  /**
   * Starts a new game with the provided configuration.
   * Records setup data and transitions to protocol selection stage.
   * * @param {GameConfig} config - Game configuration from setup form
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
   * * @param {Protocol} protocol - Selected protocol ('rorschach' or 'lineup')
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
   * * @param {number} selectedPos - Position index selected by the player
   * @param {PlotData[]} datasets - The datasets shown in the round
   */
  const handleSelection = (selectedPos: number, datasets: any[]) => {
    const isCorrect = selectedPos === gameState.currentTruePos

    // Record the user's selection with all necessary context
    recordLineupSelection(
      gameState.roundsPlayed + 1,
      gameState.currentNoiseLevel,
      gameState.currentTruePos!,
      datasets,
      selectedPos,
      isCorrect
    );
    
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

    // Re-initialize the session for the new game
    initializeSession();
  }

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