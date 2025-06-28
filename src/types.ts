/**
 * Type definitions for Apophenia game.
 * * This module defines the core type system for the entire application, including:
 * - Game configuration types
 * - Data structure types
 * - State management types
 * - Data collection and analytics types
 * * These types facilitate the implementation of visual inference protocols based on
 * the research of Wickham et al. (2010) and Buja et al. (2009), which established
 * formal methods for statistical inference with visualizations.
 */

// Game configuration types
/**
 * Method used for data generation.
 * Currently only 'function' is supported, which uses custom JavaScript functions.
 */
export type Method = 'function';

/**
 * Game protocol/mode selection.
 * - 'rorschach': Training mode where users learn to recognize random patterns
 * - 'lineup': Main game where users identify the true pattern among decoys
 */
export type Protocol = 'rorschach' | 'lineup';

/**
 * Configuration for the function-based data generation method.
 * * @property {string} code - JavaScript code defining the data generation function
 * @property {string} [noiseStepCode] - JavaScript code defining how noise increases between rounds
 * @property {number} [initialNoiseLevel] - Starting noise level for the game
 */
export interface FunctionConfig {
  code: string;
  noiseStepCode?: string; // New field for noise step function
  initialNoiseLevel?: number; // Initial noise level
}

/**
 * Complete game configuration object.
 * * @property {Method} method - Data generation method
 * @property {number} n - Number of plots to display
 * @property {number} r - Number of data points per plot
 * @property {FunctionConfig} [funcConfig] - Function-based configuration settings
 */
export interface GameConfig {
  method: Method;
  n: number; // number of samples to generate
  r: number; // number of observations per sample
  funcConfig?: FunctionConfig;
}

/**
 * Current state of the game.
 * * @property {string} stage - Current stage of the game workflow
 * @property {GameConfig|null} config - Game configuration settings
 * @property {Protocol|null} protocol - Selected game protocol
 * @property {number} score - Current player score (correct identifications)
 * @property {number} roundsPlayed - Total rounds played
 * @property {number} currentNoiseLevel - Current difficulty level
 * @property {number|null} currentTruePos - Position of the true pattern in current round
 */
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
/**
 * Single data point with x and y coordinates.
 */
export interface DataPoint {
  x: number;
  y: number;
}

/**
 * A dataset consisting of multiple data points.
 */
export type Dataset = DataPoint[];

/**
 * Plot data structure representing a single visualization.
 * * @property {Dataset} data - Array of data points to be plotted
 * @property {number} index - Position index of this plot in the display grid
 * @property {boolean} [isTrue] - Whether this plot contains the true pattern
 */
export interface PlotData {
  data: Dataset;
  index: number;
  isTrue?: boolean;
}

// Tracking game setup information
/**
 * Captures the initial game configuration for analytics.
 * * @property {number} n - Number of plots
 * @property {number} r - Data points per plot
 * @property {number} initialNoiseLevel - Initial difficulty
 * @property {Method} method - Data generation method
 * @property {FunctionConfig} [funcConfig] - Function configuration if applicable
 * @property {number} timestamp - When the game was started
 */
export type GameSetupData = {
  n: number;                    // Number of plots
  r: number;                    // Data points per plot
  initialNoiseLevel: number;    // Initial difficulty
  method: Method;               // Currently only 'function' is supported
  funcConfig?: FunctionConfig;  // User-defined function configuration
  timestamp: number;            // When the game was started
};

// Tracking Rorschach protocol usage (practice)
/**
 * Tracks player behavior during the Rorschach protocol.
 * * @property {number} sessionsCount - Number of Rorschach screens viewed
 * @property {number} totalViewTime - Total time spent in Rorschach protocol (ms)
 * @property {number} regenerateCount - Number of times user generated new plots
 * @property {Array} datasetViewed - Each Rorschach screen viewed with timestamps
 */
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
/**
 * Data collected for each round of the Lineup protocol.
 * * @property {number} round - Round number
 * @property {number} noiseLevel - Current noise level
 * @property {number} truePos - Position of the true pattern (1-indexed)
 * @property {PlotData[]} datasets - All plots shown in this lineup
 * @property {number|null} userSelection - User's selection (1-indexed)
 * @property {boolean} correct - Whether selection was correct
 * @property {number} responseTime - Time taken to respond (ms)
 * @property {number} timestamp - When this round occurred
 */
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
/**
 * Aggregated data for the entire Lineup protocol gameplay.
 * * @property {LineupRound[]} rounds - Data for each round played
 * @property {number} finalScore - Final score achieved
 * @property {number} finalNoiseLevel - Highest noise level reached
 * @property {number} roundsCompleted - Number of rounds completed
 */
export type LineupData = {
  rounds: LineupRound[];        // Data for each round played
  finalScore: number;           // Final score achieved
  finalNoiseLevel: number;      // Highest noise level reached
  roundsCompleted: number;      // Number of rounds completed
};

// Complete session data structure
/**
 * Complete analytics data structure for a game session.
 * * Contains all data collected during gameplay for research and analysis.
 * This data structure is aligned with protocols described in Wickham et al. (2010)
 * for measuring human perceptual ability in statistical graphics tasks.
 * * @property {string} sessionId - Unique ID for this game session
 * @property {string} [userId] - Optional user ID if authentication is used
 * @property {GameSetupData} setupData - Game configuration
 * @property {RorschachData} rorschachData - Data from Rorschach protocol
 * @property {LineupData} lineupData - Data from Lineup protocol
 * @property {number} startTime - Session start timestamp
 * @property {number} endTime - Session end timestamp
 * @property {string} [userAgent] - Browser/device info
 * @property {string} version - App version
 */
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