import { useState, useEffect } from 'react';
import { GameConfig } from '../types';
import { generateRorschachData } from '../utils/dataGenerator';
import PlotGrid from './PlotGrid.tsx';

interface RorschachProtocolProps {
  config: GameConfig;
  onContinue: () => void;
}

const RorschachProtocol: React.FC<RorschachProtocolProps> = ({ config, onContinue }) => {
  const [datasets, setDatasets] = useState(generateRorschachData(config));
  const [showInfo, setShowInfo] = useState(true);

  // Regenerate datasets when config changes
  useEffect(() => {
    setDatasets(generateRorschachData(config));
  }, [config]);

  const regenerateData = () => {
    setDatasets(generateRorschachData(config));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Rorschach Protocol</h2>
      
      {showInfo && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-bold text-lg mb-2">How to use the Rorschach Protocol</h3>
          <p className="mb-2">
            The Rorschach protocol helps you calibrate your perception of random data. All plots are generated 
            from random data - try to notice the patterns that appear just by chance.
          </p>
          <p className="mb-2">
            Look for features that stand out to you. Are there clusters? Outliers? Trends? These can all appear 
            in random data, and it's important to recognize them before trying to spot real patterns.
          </p>
          <p>
            Spend some time examining these plots, then click "Generate New Plots" to see more examples, 
            or "Continue to Lineup" when you're ready to move on.
          </p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
            onClick={() => setShowInfo(false)}
          >
            Hide Info
          </button>
        </div>
      )}
      
      <PlotGrid datasets={datasets} onSelect={() => {}} />
      
      <div className="flex justify-center mt-6 space-x-4">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={regenerateData}
        >
          Generate New Plots
        </button>
        <button 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={onContinue}
        >
          Continue to Lineup
        </button>
        {!showInfo && (
          <button 
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setShowInfo(true)}
          >
            Show Info
          </button>
        )}
      </div>
    </div>
  );
};

export default RorschachProtocol;