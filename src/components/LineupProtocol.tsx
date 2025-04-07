import { useState, useEffect } from 'react';
import { GameConfig, PlotData } from '../types';
import { generateLineupData } from '../utils/dataGenerator';
import PlotGrid from './PlotGrid';

interface LineupProtocolProps {
  config: GameConfig;
  truePos: number;
  round: number;
  noiseLevel: number;
  onSelection: (position: number) => void;
  onLineupStart?: (round: number, noiseLevel: number, truePos: number, datasets: PlotData[]) => void;
}

const LineupProtocol: React.FC<LineupProtocolProps> = ({ 
  config, 
  truePos, 
  round,
  noiseLevel,
  onSelection,
  onLineupStart
}) => {
  const [datasets, setDatasets] = useState<PlotData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  // Record the start of a new lineup round when datasets change
  useEffect(() => {
    const newDatasets = generateLineupData(config, truePos, noiseLevel);
    setDatasets(newDatasets);
    if (onLineupStart) {
      onLineupStart(round, noiseLevel, truePos, newDatasets);
    }
    setSelectedIndex(null);
  }, [config, truePos, noiseLevel, round]);


  // Modified selection handler:
  // First click selects the plot; second click (on the same plot) confirms it.
  const handleSelect = (index: number) => {
    if (selectedIndex === index) {
      // Confirm the selection if clicked again
      onSelection(index);
    } else {
      setSelectedIndex(index);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lineup Protocol</h2>
        <div className="text-lg font-semibold">
          Round {round} | Noise Level: {noiseLevel.toFixed(2)}
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
            then click the same plot again to confirm your selection.
          </p>
          <p>
            Each time you correctly identify the pattern, the difficulty increases!
            Keep going until you make a mistake - your final score will be how many rounds you survived.
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
      
      {/* Removed the separate "Submit Selection" button */}
      {!showInfo && (
        <div className="flex justify-center mt-6">
          <button 
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setShowInfo(true)}
          >
            Show Info
          </button>
        </div>
      )}
    </div>
  );
};

export default LineupProtocol;