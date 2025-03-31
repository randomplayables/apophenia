// Game configuration types
export type Method = 'function' | 'distribution';
export type Protocol = 'rorschach' | 'lineup';
export type Distribution = 'beta' | 'cauchy' | 'chisq' | 'exp' | 'f' | 'gamma' | 'geom' | 'lnorm' | 'logis' | 'nbinom' | 'binom' | 'norm' | 'pois' | 't' | 'unif' | 'weibull';

export interface DistributionConfig {
  type: Distribution;
  params: Record<string, number>;
}

export interface FunctionConfig {
  code: string;
}

export interface GameConfig {
  method: Method;
  n: number; // number of samples to generate
  r: number; // number of observations per sample
  distConfig?: DistributionConfig;
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