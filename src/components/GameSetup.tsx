import { useState } from 'react';
import { GameConfig, Method, Distribution } from '../types';

interface GameSetupProps {
  onSubmit: (config: GameConfig) => void;
}

const distributions: Distribution[] = [
  'beta', 'cauchy', 'chisq', 'exp', 'f', 'gamma', 'geom', 
  'lnorm', 'logis', 'nbinom', 'binom', 'norm', 'pois', 
  't', 'unif', 'weibull'
];

// Default parameters for each distribution
const defaultParams: Record<Distribution, Record<string, number>> = {
  beta: { alpha: 2, beta: 2 },
  cauchy: { location: 0, scale: 1 },
  chisq: { df: 1 },
  exp: { rate: 1 },
  f: { df1: 1, df2: 1 },
  gamma: { shape: 1, rate: 1 },
  geom: { prob: 0.5 },
  lnorm: { meanlog: 0, sdlog: 1 },
  logis: { location: 0, scale: 1 },
  nbinom: { size: 10, prob: 0.5 },
  binom: { size: 10, prob: 0.5 },
  norm: { mean: 0, sd: 1 },
  pois: { lambda: 1 },
  t: { df: 1 },
  unif: { min: 0, max: 1 },
  weibull: { shape: 1, scale: 1 }
};

const GameSetup: React.FC<GameSetupProps> = ({ onSubmit }) => {
  const [method, setMethod] = useState<Method>('distribution');
  const [n, setN] = useState<number>(9);
  const [r, setR] = useState<number>(100);
  const [selectedDist, setSelectedDist] = useState<Distribution>('norm');
  const [distParams, setDistParams] = useState<Record<string, number>>(defaultParams.norm);
  const [functionCode, setFunctionCode] = useState<string>(
    `// Write a function that returns an array of {x, y} points
// Example:
function generateData(n) {
  const data = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 10;
    const y = 2 * x + 1 + (Math.random() - 0.5) * 2;
    data.push({ x, y });
  }
  return data;
}`
  );

  const handleDistChange = (dist: Distribution) => {
    setSelectedDist(dist);
    setDistParams(defaultParams[dist]);
  };

  const handleParamChange = (param: string, value: string) => {
    setDistParams({
      ...distParams,
      [param]: parseFloat(value)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const config: GameConfig = {
      method,
      n,
      r,
      ...(method === 'distribution' 
          ? { distConfig: { type: selectedDist, params: distParams } } 
          : { funcConfig: { code: functionCode } })
    };
    
    onSubmit(config);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Game Setup</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Method
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={method === 'distribution'}
                onChange={() => setMethod('distribution')}
              />
              <span className="ml-2">Distribution</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                checked={method === 'function'}
                onChange={() => setMethod('function')}
              />
              <span className="ml-2">Function</span>
            </label>
          </div>
        </div>
        
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
        
        {method === 'distribution' ? (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Distribution
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedDist}
              onChange={(e) => handleDistChange(e.target.value as Distribution)}
            >
              {distributions.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
            
            <div className="mt-4">
              <h3 className="font-bold mb-2">Parameters</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(distParams).map(([param, value]) => (
                  <div key={param}>
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      {param}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={value}
                      onChange={(e) => handleParamChange(param, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Function Code
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono"
              rows={10}
              value={functionCode}
              onChange={(e) => setFunctionCode(e.target.value)}
            />
          </div>
        )}
        
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