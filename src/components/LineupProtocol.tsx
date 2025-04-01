
import { useState, useEffect } from 'react';
import { GameConfig } from '../types';
import { generateLineupData } from '../utils/dataGenerator';
import PlotGrid from './PlotGrid';

interface LineupProtocolProps {
  config: GameConfig;
  truePos: number;
  round: number;
  totalRounds: number;
  onSelection: (position: number) => void;
}

const LineupProtocol: React.FC<LineupProtocolProps> = ({ 
  config, 
  truePos, 
  round, 
  totalRounds,
  onSelection 
}) => {
  const [datasets, setDatasets] = useState(generateLineupData(config, truePos));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  // Regenerate datasets when config or truePos changes
  useEffect(() => {
    setDatasets(generateLineupData(config, truePos));
    setSelectedIndex(null);
  }, [config, truePos]);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex !== null) {
      onSelection(selectedIndex);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lineup Protocol</h2>
        <div className="text-lg font-semibold">
          Round {round} of {totalRounds}
        </div>
      </div>
      
      {showInfo && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-bold text-lg mb-2">How to Play the Lineup</h3>
          <p className="mb-2">
            One of these plots shows real data, while the others show random data following the null hypothesis.
          </p>
          <p className="mb-2">
            Your task is to identify which plot contains the real data pattern. Click on a plot to select it,
            then click "Submit Selection" to confirm.
          </p>
          <p>
            If you correctly identify the plot with real data, you'll earn a point!
          </p>
          <button 
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
            onClick={() => setShowInfo(false)}
          >
            Hide Info
          </button>
        </div>
      )}
      
      <PlotGrid 
        datasets={datasets} 
        onSelect={handleSelect} 
        selectedIndex={selectedIndex} 
      />
      
      <div className="flex justify-center mt-6 space-x-4">
        <button 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSubmit}
          disabled={selectedIndex === null}
        >
          Submit Selection
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

export default LineupProtocol;