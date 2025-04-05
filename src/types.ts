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

// Tracking game setup information
export type GameSetupData = {
  n: number;                    // Number of plots
  r: number;                    // Data points per plot
  initialNoiseLevel: number;    // Initial difficulty
  method: Method;               // Currently only 'function' is supported
  funcConfig?: FunctionConfig;  // User-defined function configuration
  timestamp: number;            // When the game was started
};

// Tracking Rorschach protocol usage (practice)
export type RorschachData = {
  sessionsCount: number;        // Number of Rorschach screens viewed
  totalViewTime: number;        // Total time spent in Rorschach protocol (ms)
  regenerateCount: number;      // Number of times user generated new plots
  datasetViewed: Array<{        // Each Rorschach screen viewed
    timestamp: number;          // When viewed
    datasets: PlotData[];       // Plots shown
    viewDuration: number;       // Time spent viewing (ms)
    hasRealData: boolean;       // Whether any plot contained real data
  }>;
};

// Tracking detailed information for each Lineup round
export type LineupRound = {
  round: number;                // Round number
  noiseLevel: number;           // Current noise level
  truePos: number;              // Position of the true pattern (1-indexed)
  datasets: PlotData[];         // All plots shown in this lineup
  userSelection: number | null; // User's selection (1-indexed)
  correct: boolean;             // Whether selection was correct
  responseTime: number;         // Time taken to respond (ms)
  timestamp: number;            // When this round occurred
};

// Tracking overall Lineup protocol results
export type LineupData = {
  rounds: LineupRound[];        // Data for each round played
  finalScore: number;           // Final score achieved
  finalNoiseLevel: number;      // Highest noise level reached
  roundsCompleted: number;      // Number of rounds completed
};

// Complete session data structure
export type ApopheniaSessionData = {
  sessionId: string;            // Unique ID for this game session
  userId?: string;              // Optional user ID if authentication is used
  setupData: GameSetupData;     // Game configuration
  rorschachData: RorschachData; // Data from Rorschach protocol
  lineupData: LineupData;       // Data from Lineup protocol
  startTime: number;            // Session start timestamp
  endTime: number;              // Session end timestamp
  userAgent?: string;           // Browser/device info
  version: string;              // App version
};