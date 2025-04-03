// Game configuration types
export type Method = 'function';
export type Protocol = 'rorschach' | 'lineup';

export interface FunctionConfig {
  code: string;
  noiseStepCode?: string; // New field for noise step function
  initialNoiseLevel?: number; // Initial noise level
}

export interface GameConfig {
  method: Method;
  n: number; // number of samples to generate
  r: number; // number of observations per sample
  funcConfig?: FunctionConfig;
}

export interface GameState {
  stage: 'setup' | 'protocol-selection' | 'rorschach' | 'lineup' | 'results';
  config: GameConfig | null;
  protocol: Protocol | null;
  score: number;
  roundsPlayed: number;
  currentNoiseLevel: number; // Track current noise level
  currentTruePos: number | null;
}

// Data types
export interface DataPoint {
  x: number;
  y: number;
}

export type Dataset = DataPoint[];

export interface PlotData {
  data: Dataset;
  index: number;
  isTrue?: boolean;
}