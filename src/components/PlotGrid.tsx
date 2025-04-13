/**
 * PlotGrid component for Apophenia game.
 * 
 * Renders a responsive grid of scatter plots using Plotly.js. Each plot displays
 * a dataset of x-y points and handles user interaction through clicks. The component
 * visually indicates selected and confirmed plots through colored borders.
 * 
 * The grid layout automatically adjusts based on the number of plots, organizing them
 * into a 2x2, 3x3, or 4x4 grid as appropriate.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {PlotData[]} props.datasets - Array of data objects containing the points to plot
 * @param {Function} props.onSelect - Callback function triggered when a plot is clicked
 * @param {number|null} [props.selectedIndex] - Optional index of the currently selected plot
 * @param {Object|null} [props.confirmedSelection] - Optional object containing the confirmed selection info
 * @param {number} props.confirmedSelection.index - Index of the confirmed plot
 * @param {boolean} props.confirmedSelection.correct - Whether the confirmed selection was correct
 * @returns {JSX.Element} Rendered grid of scatter plots
 */
import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { PlotData } from '../types';

interface PlotGridProps {
  datasets: PlotData[];
  onSelect: (index: number) => void;
  selectedIndex?: number | null;
  confirmedSelection?: { index: number, correct: boolean } | null;
}

const PlotGrid: React.FC<PlotGridProps> = ({ datasets, onSelect, selectedIndex = null, confirmedSelection = null }) => {
  const [gridCols, setGridCols] = useState(3);

  // Adjust grid columns based on number of datasets
  useEffect(() => {
    if (datasets.length <= 4) {
      setGridCols(2);
    } else if (datasets.length <= 9) {
      setGridCols(3);
    } else {
      setGridCols(4);
    }
  }, [datasets.length]);

  return (
    <div 
      className="grid gap-4" 
      style={{ 
        gridTemplateColumns: `repeat(${gridCols}, 1fr)` 
      }}
    >
      {datasets.map((dataset) => {
        const isSelected = selectedIndex === dataset.index;
        const isConfirmed = confirmedSelection && confirmedSelection.index === dataset.index;
        const borderClass = isConfirmed
          ? (confirmedSelection!.correct ? 'border-4 border-green-500' : 'border-4 border-red-500')
          : (isSelected ? 'border-4 border-blue-500' : 'hover:border-gray-400');
        return (
          <div 
            key={dataset.index}
            className={`border rounded-lg overflow-hidden relative cursor-pointer ${borderClass}`}
            onClick={() => { if (!confirmedSelection) onSelect(dataset.index); }}
          >
            <div className="absolute top-2 left-2 z-10 bg-white bg-opacity-80 px-2 py-1 rounded font-bold">
              {dataset.index}
            </div>
            <Plot
              data={[
                {
                  x: dataset.data.map(point => point.x),
                  y: dataset.data.map(point => point.y),
                  type: 'scatter',
                  mode: 'markers',
                  marker: { 
                    color: 'rgba(31, 119, 180, 0.8)',
                    size: 6
                  }
                }
              ]}
              layout={{
                margin: { t: 10, r: 10, b: 40, l: 40 },
                height: 250,
                width: 250,
                showlegend: false,
                xaxis: {
                  title: 'X',
                  zeroline: false
                },
                yaxis: {
                  title: 'Y',
                  zeroline: false
                }
              }}
              config={{
                displayModeBar: false,
                responsive: true
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PlotGrid;