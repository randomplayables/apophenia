// Game configuration types
export type Method = 'function';
export type Protocol = 'rorschach' | 'lineup';

export interface FunctionConfig {
  code: string;
}

export interface GameConfig {
  method: Method;
  n: number; // number of samples to generate
  r: number; // number of observations per sample
  funcConfig?: FunctionConfig;
}

// Game state types
export interface GameState {
  stage: 'setup' | 'protocol-selection' | 'rorschach' | 'lineup' | 'results';
  config: GameConfig | null;
  protocol: Protocol | null;
  score: number;
  roundsPlayed: number;
  totalRounds: number;
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