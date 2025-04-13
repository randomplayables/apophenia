/**
 * GameResults component for Apophenia game.
 * 
 * Displays the final results of a completed game session including the score (levels completed),
 * initial noise level, final noise level, and the increase in noise level throughout the game.
 * Also provides a button to restart the game.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.score - Number of levels the player successfully completed
 * @param {number} props.finalNoiseLevel - The noise level reached at the end of the game
 * @param {number} props.initialNoiseLevel - The starting noise level when the game began
 * @param {Function} props.onRestart - Callback function triggered when the "Play Again" button is clicked
 * @returns {JSX.Element} Rendered game results summary with score information and restart button
 */
import React from 'react';

interface GameResultsProps {
  score: number;
  finalNoiseLevel: number;
  initialNoiseLevel: number;
  onRestart: () => void;
}

const GameResults: React.FC<GameResultsProps> = ({ 
  score, 
  finalNoiseLevel,
  initialNoiseLevel,
  onRestart 
}) => {
  
  const noiseIncrease = (finalNoiseLevel - initialNoiseLevel).toFixed(2);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-6">Game Results</h2>
      
      <div className="text-5xl font-bold mb-4">
        Levels Completed: {score}
      </div>
      
      <div className="text-2xl mb-2">
        Initial Noise: {initialNoiseLevel.toFixed(2)}
      </div>
      
      <div className="text-2xl mb-6">
        Final Noise: {finalNoiseLevel.toFixed(2)} (+{noiseIncrease})
      </div>
      
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={onRestart}
      >
        Play Again
      </button>
    </div>
  );
};

export default GameResults;