/**
 * GameSetup component for Apophenia game.
 * 
 * Provides a form interface for configuring the game parameters before starting. 
 * Allows users to set the number of plots, data points per plot, and initial noise level.
 * Also includes advanced options for customizing the data generation function and 
 * difficulty progression through custom JavaScript code.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Callback function triggered when the form is submitted with the game configuration
 * @returns {JSX.Element} Rendered form for game configuration with basic and advanced options
 */
import { useState } from 'react';
import { GameConfig } from '../types';

interface GameSetupProps {
  onSubmit: (config: GameConfig) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onSubmit }) => {
  const [n, setN] = useState<number>(9);
  const [r, setR] = useState<number>(100);
  const [initialNoiseLevel, setInitialNoiseLevel] = useState<number>(0.5);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [functionCode, setFunctionCode] = useState<string>(
    `// Define a function named generateData that returns an array of {x, y} points
// You can use the jStat library for statistical functions
// noiseLevel parameter will control the difficulty
function generateData(n, noiseLevel) {
  const data = [];
  
  // Create a linear relationship with some noise
  for (let i = 0; i < n; i++) {
    // Using jStat to generate x values from normal distribution
    const x = jStat.normal.sample(0, 1);
    
    // y is a function of x plus some noise
    // 2x + 1 with controlled noise
    const y = 2 * x + 1 + jStat.normal.sample(0, noiseLevel);
    
    data.push({ x, y });
  }
  
  return data;
}`
  );
  
  const [noiseStepCode, setNoiseStepCode] = useState<string>(
    `// Define how the noise level should increase after each correct answer
// This function takes the current noise level and returns the new noise level
function updateNoiseLevel(currentLevel) {
  // Simple linear increase - add 0.3 to noise level each time
  return currentLevel + 0.3;
}`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const config: GameConfig = {
      method: 'function',
      n,
      r,
      funcConfig: { 
        code: functionCode, 
        noiseStepCode: noiseStepCode,
        initialNoiseLevel: initialNoiseLevel
      }
    };
    
    onSubmit(config);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-6 mb-8 p-8">
          <div className="w-1/2 p-8">
            <label className="block text-gray-700 text-sm font-bold mb-3 p-8">
              Number of plots (n)
            </label>
            <input
              type="number"
              className="shadow appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition-colors"
              value={n}
              min={4}
              max={100}
              onChange={(e) => setN(parseInt(e.target.value))}
            />
          </div>
          <div className="w-1/2 p-8">
            <label className="block text-gray-700 text-sm font-bold mb-3 p-8">
              Data points per plot (r)
            </label>
            <input
              type="number"
              className="shadow appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition-colors"
              value={r}
              min={2}
              max={1000}
              onChange={(e) => setR(parseInt(e.target.value))}
            />
          </div>
        </div>
        <div className="my-6">&nbsp;</div>
        <div className="m-8 p-8">
          <label className="block text-gray-700 text-sm font-bold mb-3 p-8">
            Initial Difficulty (Noise Level)
          </label>
          <input
            type="range"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            min={0.1}
            max={3}
            step={0.1}
            value={initialNoiseLevel}
            onChange={(e) => setInitialNoiseLevel(parseFloat(e.target.value))}
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>(0.1)</span>
            <span>Value: {initialNoiseLevel.toFixed(1)}</span>
            <span>(3.0)</span>
          </div>
        </div>
        <div className="my-6">&nbsp;</div>
        <div className="flex justify-between items-center mb-8">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium transition-colors"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            {showAdvancedOptions ? '– Hide Advanced Options' : '+ Show Advanced Options'} 
          </button>
        </div>
        
        {showAdvancedOptions && (
          <div className="mb-6 border-t pt-4">
            <h3 className="text-lg font-bold mb-4">Advanced Pattern Configuration</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Function Code
              </label>
              <div className="bg-yellow-50 p-3 rounded mb-2 text-sm">
                <strong>Important:</strong> You must define a function named <code>generateData</code> that takes
                parameters <code>n</code> and <code>noiseLevel</code> and returns an array of objects with <code>x</code> and <code>y</code> properties.
                You can use the <code>jStat</code> library for statistical functions.
              </div>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono"
                rows={12}
                value={functionCode}
                onChange={(e) => setFunctionCode(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Difficulty Progression
              </label>
              <div className="bg-yellow-50 p-3 rounded mb-2 text-sm">
                <strong>Important:</strong> Define a function named <code>updateNoiseLevel</code> that takes
                the current noise level as input and returns the new noise level for the next round.
              </div>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono"
                rows={6}
                value={noiseStepCode}
                onChange={(e) => setNoiseStepCode(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:shadow-outline transition-colors"
          >
            Start Game
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameSetup;