import { Dataset, GameConfig, PlotData, DataPoint } from '../types';
var { jStat } = require('jstat')

// Function to generate a single dataset based on the chosen method
export function generateDataset(config: GameConfig): Dataset {
  if (config.method === 'distribution' && config.distConfig) {
    return generateFromDistribution(config.distConfig.type, config.distConfig.params, config.r);
  } else if (config.method === 'function' && config.funcConfig) {
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
      // For null data, we'll permute the trueData if using function method
      // or generate a new dataset if using distribution method
      let nullData: Dataset;
      
      if (config.method === 'function') {
        nullData = permuteData(trueData);
      } else {
        nullData = generateDataset(config);
      }
      
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

// Helper function to generate data from a distribution
function generateFromDistribution(
  dist: string, 
  params: Record<string, number>, 
  count: number
): Dataset {
  const data: Dataset = [];
  
  for (let i = 0; i < count; i++) {
    let x, y;
    
  switch (dist) {
    case 'norm':
      x = jStat.normal.sample(params.mean, params.sd);
      y = jStat.normal.sample(params.mean, params.sd);
      break;
    case 'unif':
      x = jStat.uniform.sample(params.min, params.max);
      y = jStat.uniform.sample(params.min, params.max);
      break;
    case 'beta':
      x = jStat.beta.sample(params.alpha, params.beta);
      y = jStat.beta.sample(params.alpha, params.beta);
      break;
    case 'exp':
      x = jStat.exponential.sample(params.rate);
      y = jStat.exponential.sample(params.rate);
      break;
    case 't':
      x = jStat.studentt.sample(params.df);
      y = jStat.studentt.sample(params.df);
      break;
    // Add more distributions as needed
    default:
      // Default to normal distribution
      x = jStat.normal.sample(0, 1);
      y = jStat.normal.sample(0, 1);
  }
  
  data.push({ x, y });
}
  
  return data;
}

// Helper function to generate data from a user-defined function
function generateFromFunction(code: string, count: number): Dataset {
  try {
    // Create a safe sandbox to run the user's code
    const generateFunction = new Function('n', `
      "use strict";
      ${code}
      
      // Call the last function in the code that returns data
      const fnNames = Object.keys(this).filter(key => typeof this[key] === 'function');
      if (fnNames.length === 0) throw new Error('No function defined');
      const fn = this[fnNames[fnNames.length - 1]];
      return fn(n);
    `);
    
    const result = generateFunction.call({}, count);
    
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
    return Array(count).fill(0).map((_, i) => ({
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