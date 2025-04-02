import { useState } from 'react';
import { GameConfig } from '../types';

interface GameSetupProps {
  onSubmit: (config: GameConfig) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onSubmit }) => {
  const [n, setN] = useState<number>(9);
  const [r, setR] = useState<number>(100);
  const [functionCode, setFunctionCode] = useState<string>(
    `// Define a function named generateData that returns an array of {x, y} points
  // You can use the jStat library for statistical functions
  function generateData(n) {
    const data = [];
    
    // Create a linear relationship with some noise
    for (let i = 0; i < n; i++) {
      // Using jStat to generate x values from normal distribution
      const x = jStat.normal.sample(0, 1);
      
      // y is a function of x plus some noise
      // 2x + 1 with normal noise
      const y = 2 * x + 1 + jStat.normal.sample(0, 0.5);
      
      data.push({ x, y });
    }
    
    return data;
  }

  // The function MUST be named generateData
  // It takes n as a parameter (number of points to generate)
  // And returns an array of objects with x and y properties
  `
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const config: GameConfig = {
      method: 'function',
      n,
      r,
      funcConfig: { code: functionCode }
    };
    
    onSubmit(config);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Game Setup</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Number of samples (n)
            </label>
            <input
              type="number"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={n}
              min={4}
              max={20}
              onChange={(e) => setN(parseInt(e.target.value))}
            />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Observations per sample (r)
            </label>
            <input
              type="number"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={r}
              min={10}
              max={1000}
              onChange={(e) => setR(parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Function Code
          </label>
          <div className="bg-yellow-50 p-3 rounded mb-2 text-sm">
            <strong>Important:</strong> You must define a function named <code>generateData</code> that takes
            a parameter <code>n</code> and returns an array of objects with <code>x</code> and <code>y</code> properties.
            You can use the <code>jStat</code> library for statistical functions.
          </div>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono"
            rows={15}
            value={functionCode}
            onChange={(e) => setFunctionCode(e.target.value)}
          />
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Start Game
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameSetup;