/**
 * useApopheniaData hook for Apophenia game.
 * * Custom hook that manages all data collection and session tracking for the game.
 * It records detailed information about the game setup, player interactions during
 * the Rorschach protocol (practice phase), lineup rounds (main game), and final results.
 * * This data can be used for research purposes to study how players perceive patterns
 * in randomized data versus actual patterns with varying levels of noise.
 * * @returns {Object} Collection of functions and data for tracking game sessions
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
  LineupRound
} from '../types';
import { initGameSession, saveGameData } from '../services/apiService'; // Import the new service

export const useApopheniaData = () => {  
  const [, setGameSession] = useState<any>(null);

  const rorschachStartTime = useRef<number | null>(null);
  const lineupRoundStartTime = useRef<number | null>(null);
  
  const initializeSession = async () => {
    const session = await initGameSession();
    setGameSession(session);
    console.log("Apophenia session initialized:", session);
  };

  const recordSetup = (config: GameConfig) => {
    const setupData: GameSetupData = {
      n: config.n,
      r: config.r,
      initialNoiseLevel: config.funcConfig?.initialNoiseLevel || 0.5,
      method: config.method,
      funcConfig: config.funcConfig,
      timestamp: Date.now()
    };
    saveGameData('setup', setupData);
  };
  
  const startRorschachSession = (datasets: PlotData[]) => {
    rorschachStartTime.current = Date.now();
    const hasRealData = datasets.some(dataset => dataset.isTrue === true);
    
    const rorschachStartData = {
      event: 'start',
      timestamp: rorschachStartTime.current,
      datasets,
      hasRealData
    };
    saveGameData('rorschach', rorschachStartData);
  };
  
  const recordRorschachRegenerate = (datasets: PlotData[]) => {
    const hasRealData = datasets.some(dataset => dataset.isTrue === true);
    const regenerateData = {
      event: 'regenerate',
      timestamp: Date.now(),
      datasets,
      hasRealData
    };
    saveGameData('rorschach', regenerateData);
  };
  
  const endRorschachSession = () => {
    if (rorschachStartTime.current) {
      const duration = Date.now() - rorschachStartTime.current;
      const endData = {
        event: 'end',
        timestamp: Date.now(),
        duration
      };
      saveGameData('rorschach', endData);
      rorschachStartTime.current = null;
    }
  };
  
  const startLineupRound = (
    round: number, 
    noiseLevel: number, 
    truePos: number, 
    datasets: PlotData[]
  ) => {
    lineupRoundStartTime.current = Date.now();
    
    const lineupStartData = {
      event: 'start_round',
      round,
      noiseLevel,
      truePos,
      datasets,
      timestamp: lineupRoundStartTime.current
    };

    console.log("Lineup Round Started:", lineupStartData);
  };
  
  const recordLineupSelection = (
    round: number,
    noiseLevel: number,
    truePos: number,
    datasets: PlotData[],
    selection: number, 
    correct: boolean
  ) => {
    if (lineupRoundStartTime.current) {
      const responseTime = Date.now() - lineupRoundStartTime.current;
      
      const roundData: LineupRound = {
        round,
        noiseLevel,
        truePos,
        datasets,
        userSelection: selection,
        correct,
        responseTime,
        timestamp: lineupRoundStartTime.current
      };
      
      saveGameData(`round_${round}`, roundData);
      
      lineupRoundStartTime.current = null;
    }
  };
  
  const recordGameEnd = (score: number, finalNoiseLevel: number) => {
    const gameEndData = {
      finalScore: score,
      finalNoiseLevel,
      endTime: Date.now()
    };
    saveGameData('game_end', gameEndData);
    console.log('Game session ended. Final data:', gameEndData);
  };
  
  return {
    initializeSession,
    recordSetup,
    startRorschachSession,
    recordRorschachRegenerate,
    endRorschachSession,
    startLineupRound,
    recordLineupSelection,
    recordGameEnd,
  };
};