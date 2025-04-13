/**
 * useApopheniaData hook for Apophenia game.
 * 
 * Custom hook that manages all data collection and session tracking for the game.
 * It records detailed information about the game setup, player interactions during
 * the Rorschach protocol (practice phase), lineup rounds (main game), and final results.
 * 
 * This data can be used for research purposes to study how players perceive patterns
 * in randomized data versus actual patterns with varying levels of noise.
 * 
 * @returns {Object} Collection of functions and data for tracking game sessions
 * @returns {ApopheniaSessionData} returns.sessionData - Current session data object
 * @returns {Function} returns.recordSetup - Function to record initial game configuration
 * @returns {Function} returns.startRorschachSession - Function to record start of Rorschach phase
 * @returns {Function} returns.recordRorschachRegenerate - Function to record when new Rorschach plots are generated
 * @returns {Function} returns.endRorschachSession - Function to record end of Rorschach phase
 * @returns {Function} returns.startLineupRound - Function to record start of a lineup round
 * @returns {Function} returns.recordLineupSelection - Function to record player selection in a round
 * @returns {Function} returns.recordGameEnd - Function to record final game results
 * @returns {Function} returns.saveDataToServer - Function to save session data to server (placeholder)
 * @returns {Function} returns.resetSessionData - Function to reset the session data for a new game
 */
import { useState, useRef } from 'react';

import { 
  GameConfig, 
  PlotData, 
  GameSetupData, 
  ApopheniaSessionData
} from '../types';

// Utility function to generate a simple UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useApopheniaData = () => {  
  // Get user agent info
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  
  // Initialize the session data
  const [sessionData, setSessionData] = useState<ApopheniaSessionData>(createInitialSessionData());
  // Function to create a fresh session data object
  function createInitialSessionData(): ApopheniaSessionData {
    return {
      sessionId: generateUUID(), // Generate a new UUID for each session
      setupData: null as unknown as GameSetupData, // Will be set when game starts
      rorschachData: {
        sessionsCount: 0,
        totalViewTime: 0,
        regenerateCount: 0,
        datasetViewed: []
      },
      lineupData: {
        rounds: [],
        finalScore: 0,
        finalNoiseLevel: 0,
        roundsCompleted: 0
      },
      startTime: Date.now(),
      endTime: 0,
      userAgent,
      version: '1.0.0' // App version
    };
  }

    // Reset session data (new function)
    const resetSessionData = () => {
      setSessionData(createInitialSessionData());
    };

  // Track Rorschach state
  const rorschachStartTime = useRef<number | null>(null);
  
  // Track Lineup state
  const lineupRoundStartTime = useRef<number | null>(null);
  
  // Record setup data
  const recordSetup = (config: GameConfig) => {
    setSessionData(prev => ({
      ...prev,
      setupData: {
        n: config.n,
        r: config.r,
        initialNoiseLevel: config.funcConfig?.initialNoiseLevel || 0.5,
        method: config.method,
        funcConfig: config.funcConfig,
        timestamp: Date.now()
      }
    }));
  };
  
  // Record start of Rorschach session
  const startRorschachSession = (datasets: PlotData[]) => {
    rorschachStartTime.current = Date.now();
    // Check if any dataset is marked as true data
    const hasRealData = datasets.some(dataset => dataset.isTrue === true);
    
    setSessionData(prev => ({
      ...prev,
      rorschachData: {
        ...prev.rorschachData,
        sessionsCount: prev.rorschachData.sessionsCount + 1,
        datasetViewed: [
          ...prev.rorschachData.datasetViewed,
          {
            timestamp: Date.now(),
            datasets,
            viewDuration: 0, // Will update when session ends
            hasRealData
          }
        ]
      }
    }));
  };
  
  // Record regeneration of Rorschach plots
  const recordRorschachRegenerate = (datasets: PlotData[]) => {
    // Check if any dataset is marked as true data
    const hasRealData = datasets.some(dataset => dataset.isTrue === true);
    
    setSessionData(prev => ({
      ...prev,
      rorschachData: {
        ...prev.rorschachData,
        regenerateCount: prev.rorschachData.regenerateCount + 1,
        datasetViewed: [
          ...prev.rorschachData.datasetViewed,
          {
            timestamp: Date.now(),
            datasets,
            viewDuration: 0, // We'll treat this as an instant action
            hasRealData
          }
        ]
      }
    }));
  };
  
  // Record end of Rorschach session
  const endRorschachSession = () => {
    if (rorschachStartTime.current) {
      const duration = Date.now() - rorschachStartTime.current;
      
      setSessionData(prev => {
        // Get the last dataset entry
        const datasetViewed = [...prev.rorschachData.datasetViewed];
        const lastIndex = datasetViewed.length - 1;
        
        if (lastIndex >= 0) {
          datasetViewed[lastIndex] = {
            ...datasetViewed[lastIndex],
            viewDuration: duration
          };
        }
        
        return {
          ...prev,
          rorschachData: {
            ...prev.rorschachData,
            totalViewTime: prev.rorschachData.totalViewTime + duration,
            datasetViewed
          }
        };
      });
      
      rorschachStartTime.current = null;
    }
  };
  
  // Record start of a Lineup round
  const startLineupRound = (
    round: number, 
    noiseLevel: number, 
    truePos: number, 
    datasets: PlotData[]
  ) => {
    lineupRoundStartTime.current = Date.now();
    
    // Store the round data but mark it as incomplete
    setSessionData(prev => ({
      ...prev,
      lineupData: {
        ...prev.lineupData,
        rounds: [
          ...prev.lineupData.rounds,
          {
            round,
            noiseLevel,
            truePos,
            datasets,
            userSelection: null,
            correct: false,
            responseTime: 0,
            timestamp: Date.now()
          }
        ]
      }
    }));
  };
  
  // Record user selection in a Lineup round
  const recordLineupSelection = (selection: number, correct: boolean) => {
    if (lineupRoundStartTime.current) {
      const responseTime = Date.now() - lineupRoundStartTime.current;
      
      setSessionData(prev => {
        // Update the latest round with the user's selection
        const rounds = [...prev.lineupData.rounds];
        const lastIndex = rounds.length - 1;
        
        if (lastIndex >= 0) {
          rounds[lastIndex] = {
            ...rounds[lastIndex],
            userSelection: selection,
            correct,
            responseTime
          };
        }
        
        return {
          ...prev,
          lineupData: {
            ...prev.lineupData,
            rounds,
            roundsCompleted: prev.lineupData.roundsCompleted + 1
          }
        };
      });
      
      lineupRoundStartTime.current = null;
    }
  };
  
  // Record end of game
  const recordGameEnd = (score: number, finalNoiseLevel: number) => {
    setSessionData(prev => ({
      ...prev,
      lineupData: {
        ...prev.lineupData,
        finalScore: score,
        finalNoiseLevel
      },
      endTime: Date.now()
    }));
    
    // Here you would typically send the data to your server/database
    console.log('Game session data:', sessionData);
    
    // In a real implementation, you'd add code to send the data to your server
    // Example: saveDataToServer(sessionData);
  };
  
  // Function to send data to a server
  const saveDataToServer = async () => {
    try {
      /* 
      const response = await fetch('https://your-api-endpoint.com/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save data');
      }
      
      const result = await response.json();
      console.log('Data saved successfully:', result);
      */
      console.log('Data would be saved to server:', sessionData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  
  return {
    sessionData,
    recordSetup,
    startRorschachSession,
    recordRorschachRegenerate,
    endRorschachSession,
    startLineupRound,
    recordLineupSelection,
    recordGameEnd,
    saveDataToServer,
    resetSessionData 
  };
};