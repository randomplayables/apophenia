import { Dataset, GameConfig, PlotData } from '../types';
import { jStat } from 'jstat';

// Function to generate a single dataset based on the user-defined function
export function generateDataset(config: GameConfig): Dataset {
  if (config.method === 'function' && config.funcConfig) {
    return generateFromFunction(config.funcConfig.code, config.r);
  }
  
  throw new Error('Invalid configuration');
}

// Generate multiple datasets for the lineup/rorschach protocols
export function generateLineupData(config: GameConfig, truePos: number): PlotData[] {
  const datasets: PlotData[] = [];
  
  // Generate the true dataset first
  const trueData = generateDataset(config);
  
  // Generate n-1 null datasets
  for (let i = 1; i <= config.n; i++) {
    if (i === truePos) {
      datasets.push({
        data: trueData,
        index: i,
        isTrue: true
      });
    } else {
      // For null data, we'll permute the trueData
      const nullData = permuteData(trueData);
      
      datasets.push({
        data: nullData,
        index: i,
        isTrue: false
      });
    }
  }
  
  return datasets;
}

export function generateRorschachData(config: GameConfig, includeTrueData: boolean = false, truePos?: number): PlotData[] {
  const datasets: PlotData[] = [];
  let numNullDatasets = includeTrueData ? config.n - 1 : config.n;
  
  // Generate the null datasets
  for (let i = 1; i <= numNullDatasets; i++) {
    datasets.push({
      data: generateDataset(config),
      index: i,
      isTrue: false
    });
  }
  
  // Add the true dataset if requested
  if (includeTrueData && truePos !== undefined) {
    const trueData = generateDataset(config);
    datasets.splice(truePos - 1, 0, {
      data: trueData,
      index: truePos,
      isTrue: true
    });
  }
  
  return datasets;
}

// Helper function to generate data from a user-defined function
function generateFromFunction(code: string, count: number): Dataset {
  try {
    // Prefix the jStat library to the user code
    const fullCode = `
      ${code}
    `;
    
    // Create a function that returns whatever the provided code returns
    const generateFunction = new Function('n', 'jStat', `
      "use strict";
      ${fullCode}
      
      // Try to find a function named generateData first (common convention)
      if (typeof generateData === 'function') {
        return generateData(n);
      }
      
      // Otherwise look for any function defined in the code
      const definedFunctions = [];
      for (const key in this) {
        if (typeof this[key] === 'function' && this[key].toString().includes('function')) {
          definedFunctions.push(this[key]);
        }
      }
      
      // If we found any functions, use the last one
      if (definedFunctions.length > 0) {
        return definedFunctions[definedFunctions.length - 1](n);
      }
      
      // If we're here, try to evaluate the code directly
      // This handles anonymous function expressions
      const directFunction = (function() { 
        return eval(code); 
      })();
      
      if (typeof directFunction === 'function') {
        return directFunction(n);
      }
      
      throw new Error('No function defined or found in the provided code');
    `);
    
    // Pass jStat to the user function
    const result = generateFunction.call({}, count, jStat);
    
    // Validate the result
    if (!Array.isArray(result)) {
      throw new Error('Function must return an array');
    }
    
    // Ensure each item has x and y properties
    return result.map((item: any, index: number) => {
      if (typeof item !== 'object' || item === null) {
        throw new Error(`Item at index ${index} is not an object`);
      }
      
      if (typeof item.x !== 'number' || typeof item.y !== 'number') {
        throw new Error(`Item at index ${index} is missing x or y coordinates`);
      }
      
      return { x: item.x, y: item.y };
    });
  } catch (error) {
    console.error('Error generating data from function:', error);
    // Return some default data in case of error
    return Array(count).fill(0).map((_, _i) => ({
      x: Math.random() * 10,
      y: Math.random() * 10
    }));
  }
}

// Helper function to permute data (for the function method null hypothesis)
function permuteData(data: Dataset): Dataset {
  // Clone the data
  const clonedData = [...data];
  
  // Shuffle the y values while keeping x values in place
  const yValues = clonedData.map(point => point.y);
  shuffleArray(yValues);
  
  // Recombine
  return clonedData.map((point, i) => ({
    x: point.x,
    y: yValues[i]
  }));
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}