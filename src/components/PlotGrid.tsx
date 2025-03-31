import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { PlotData } from '../types';

interface PlotGridProps {
  datasets: PlotData[];
  onSelect: (index: number) => void;
  selectedIndex?: number | null;
}

const PlotGrid: React.FC<PlotGridProps> = ({ datasets, onSelect, selectedIndex = null }) => {
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
      {datasets.map((dataset) => (
        <div 
          key={dataset.index}
          className={`border rounded-lg overflow-hidden relative cursor-pointer ${
            selectedIndex === dataset.index ? 'border-4 border-blue-500' : 'hover:border-gray-400'
          }`}
          onClick={() => onSelect(dataset.index)}
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
      ))}
    </div>
  );
};

export default PlotGrid;