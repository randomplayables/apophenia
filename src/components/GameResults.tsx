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
  let message = '';
  let messageClass = '';
  
  if (score >= 10) {
    message = 'Amazing! You have an exceptional eye for patterns, even with significant noise.';
    messageClass = 'text-green-600';
  } else if (score >= 7) {
    message = 'Great job! You have a good eye for patterns and can detect them through moderate noise.';
    messageClass = 'text-green-500';
  } else if (score >= 5) {
    message = 'Good effort! You demonstrated decent pattern recognition skills.';
    messageClass = 'text-blue-500';
  } else if (score >= 3) {
    message = 'Not bad! The line-up protocol gets challenging quickly with increasing noise.';
    messageClass = 'text-yellow-500';
  } else {
    message = 'This is tough! Even experts can be fooled by random patterns, especially with noise.';
    messageClass = 'text-red-500';
  }
  
  const noiseIncrease = (finalNoiseLevel - initialNoiseLevel).toFixed(2);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-6">Game Results</h2>
      
      <div className="text-5xl font-bold mb-4">
        {score} Levels Completed
      </div>
      
      <div className="text-2xl mb-2">
        Initial Noise: {initialNoiseLevel.toFixed(2)}
      </div>
      
      <div className="text-2xl mb-6">
        Final Noise: {finalNoiseLevel.toFixed(2)} (+{noiseIncrease})
      </div>
      
      <p className={`text-lg ${messageClass} mb-8`}>
        {message}
      </p>
      
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">What Does This Mean?</h3>
        <p className="mb-2">
          The line-up protocol tests your ability to distinguish real patterns from random noise.
        </p>
        <p>
          As you correctly identified patterns, the noise level increased, making each subsequent
          round more challenging. Your score represents how many increasingly difficult rounds you
          were able to complete successfully.
        </p>
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