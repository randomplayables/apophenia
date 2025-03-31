import React from 'react';

interface GameResultsProps {
  score: number;
  totalRounds: number;
  onRestart: () => void;
}

const GameResults: React.FC<GameResultsProps> = ({ score, totalRounds, onRestart }) => {
  const percentage = Math.round((score / totalRounds) * 100);
  
  let message = '';
  let messageClass = '';
  
  if (percentage >= 90) {
    message = 'Amazing! You have an exceptional eye for patterns.';
    messageClass = 'text-green-600';
  } else if (percentage >= 70) {
    message = 'Great job! You have a good eye for patterns.';
    messageClass = 'text-green-500';
  } else if (percentage >= 50) {
    message = 'Good effort! With more practice, you can improve your pattern recognition.';
    messageClass = 'text-blue-500';
  } else if (percentage >= 30) {
    message = 'Not bad! The line-up protocol can be challenging.';
    messageClass = 'text-yellow-500';
  } else {
    message = 'This is tough! Remember that even experts can be fooled by random patterns.';
    messageClass = 'text-red-500';
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-6">Game Results</h2>
      
      <div className="text-5xl font-bold mb-4">
        {score} / {totalRounds}
      </div>
      
      <div className="text-2xl mb-6">
        {percentage}% Correct
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
          Each time you correctly identify the real data, it provides statistical evidence that the pattern you observed is significant.
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