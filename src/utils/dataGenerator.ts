import { Dataset, GameConfig, PlotData } from '../types';
import { jStat } from 'jstat';

// Function to generate a single dataset based on the user-defined function
export function generateDataset(config: GameConfig, noiseLevel: number): Dataset {
  if (config.method === 'function' && config.funcConfig) {
    return generateFromFunction(config.funcConfig.code, config.r, noiseLevel);
  }
  
  throw new Error('Invalid configuration');
}

// Generate multiple datasets for the lineup/rorschach protocols
export function generateLineupData(config: GameConfig, truePos: number, noiseLevel: number): PlotData[] {
  const datasets: PlotData[] = [];
  
  // Generate the true dataset first
  const trueData = generateDataset(config, noiseLevel);
  
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

export function generateRorschachData(config: GameConfig, p: number = 0.1): PlotData[] {
  const initialNoiseLevel = config.funcConfig?.initialNoiseLevel || 0.5;
  const datasets: PlotData[] = [];
  
  // Generate the true dataset first
  const trueData = generateDataset(config, initialNoiseLevel);
  
  // Determine if we should show the true data
  const showTrue = Math.random() < p;
  let n = config.n;
  
  if (showTrue) {
    n = n - 1;
  }
  
  // Generate n null datasets by permuting the true data
  for (let i = 1; i <= n; i++) {
    datasets.push({
      data: permuteData(trueData),
      index: i,
      isTrue: false
    });
  }
  
  // Add the true dataset if we decided to show it
  if (showTrue) {
    const truePos = Math.floor(Math.random() * (n + 1)) + 1;
    const pos = truePos - 1;
    
    datasets.splice(pos, 0, {
      data: trueData,
      index: truePos,
      isTrue: true
    });
    
    // Reindex to ensure sequential indices
    datasets.forEach((dataset, idx) => {
      dataset.index = idx + 1;
    });
    
    console.log(`True data in position ${truePos}`);
  }
  
  return datasets;
}

// Helper function to update the noise level based on the user-defined function
export function updateNoiseLevel(config: GameConfig, currentLevel: number): number {
  if (config.method === 'function' && config.funcConfig && config.funcConfig.noiseStepCode) {
    try {
      const updateFunction = new Function('currentLevel', `
        "use strict";
        ${config.funcConfig.noiseStepCode}
        
        return updateNoiseLevel(currentLevel);
      `);
      
      return updateFunction(currentLevel);
    } catch (error) {
      console.error('Error updating noise level:', error);
      // Fallback: increase by 10%
      return currentLevel * 1.1;
    }
  }
  
  // Default behavior if no noise step function is provided
  return currentLevel + 0.1;
}

// Helper function to generate data from a user-defined function
function generateFromFunction(code: string, count: number, noiseLevel: number): Dataset {
  try {
    // Prefix the jStat library to the user code
    const fullCode = `
      ${code}
    `;
    
    // Create a function that returns whatever the provided code returns
    const generateFunction = new Function('n', 'noiseLevel', 'jStat', `
      "use strict";
      ${fullCode}
      
      // Try to find a function named generateData first (common convention)
      if (typeof generateData === 'function') {
        return generateData(n, noiseLevel);
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
        return definedFunctions[definedFunctions.length - 1](n, noiseLevel);
      }
      
      // If we're here, try to evaluate the code directly
      // This handles anonymous function expressions
      const directFunction = (function() { 
        return eval(code); 
      })();
      
      if (typeof directFunction === 'function') {
        return directFunction(n, noiseLevel);
      }
      
      throw new Error('No function defined or found in the provided code');
    `);
    
    // Pass jStat to the user function
    const result = generateFunction.call({}, count, noiseLevel, jStat);
    
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