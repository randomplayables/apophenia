import { useState } from 'react'
import './App.css'
import GameSetup from './components/GameSetup.tsx'
import RorschachProtocol from './components/RorschachProtocol.tsx'
import LineupProtocol from './components/LineupProtocol.tsx'
import GameResults from './components/GameResults.tsx'
import { GameConfig, GameState, Protocol } from './types.ts'
import { updateNoiseLevel } from './utils/dataGenerator.ts'

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

  const startGame = (config: GameConfig) => {
    const initialNoiseLevel = config.funcConfig?.initialNoiseLevel || 0.5;
    
    setGameState({
      ...gameState,
      stage: 'protocol-selection',
      config,
      currentNoiseLevel: initialNoiseLevel
    })
  }

  const selectProtocol = (protocol: Protocol) => {
    setGameState({
      ...gameState,
      stage: protocol === 'rorschach' ? 'rorschach' : 'lineup',
      protocol,
      currentTruePos: protocol === 'lineup' ? Math.floor(Math.random() * gameState.config!.n) + 1 : null
    })
  }

  const skipRorschach = () => {
    setGameState({
      ...gameState,
      stage: 'lineup',
      protocol: 'lineup',
      currentTruePos: Math.floor(Math.random() * gameState.config!.n) + 1
    })
  }

  const handleSelection = (selectedPos: number) => {
    const isCorrect = selectedPos === gameState.currentTruePos
    
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
    }
  }

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
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Apophenia: Graphical Inference Game</h1>
      
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
        />
      )}
      
      {gameState.stage === 'lineup' && gameState.config && gameState.currentTruePos !== null && (
        <LineupProtocol 
          config={gameState.config}
          truePos={gameState.currentTruePos}
          round={gameState.roundsPlayed + 1}
          noiseLevel={gameState.currentNoiseLevel}
          onSelection={handleSelection}
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