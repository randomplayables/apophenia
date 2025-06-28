/**
 * API Service for connecting with the RandomPlayables platform (Apophenia version)
 * Handles session management and data storage.
 * NOTE: This is a placeholder for Apophenia. It currently logs to console
 * and does not make real API calls.
 */

const GAME_ID = 'apophenia'; // This should be managed by the platform in a real scenario

// Session storage keys
const SESSION_STORAGE_KEY = 'apopheniaGameSession';

/**
 * Initializes a game session. In this placeholder, it creates a local session.
 * @returns A promise resolving to the session information.
 */
export async function initGameSession() {
  // In a real implementation, this would fetch from '/api/game-session'
  const localSession = {
    sessionId: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    gameId: GAME_ID,
    // The version would typically come from the server response
  };
  
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(localSession));
  console.log("Initialized local game session:", localSession);
  return localSession;
}

/**
 * Saves game data. In this placeholder, it logs the data to the console.
 * @param eventName A string describing the event (e.g., 'setup', 'round_1', 'game_end')
 * @param eventData The data associated with the event.
 * @returns A promise resolving to the server's response or null if offline.
 */
export async function saveGameData(eventName: string, eventData: any) {
  const sessionString = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionString) {
    console.error('No active game session found for saving data.');
    return null;
  }
  const session = JSON.parse(sessionString);

  const dataToSave = {
    sessionId: session.sessionId,
    eventName: eventName,
    eventData: eventData,
    timestamp: new Date().toISOString()
  };

  // In a real implementation, this would post to '/api/game-data'
  console.log('Saving game data:', dataToSave);

  // Store in localStorage as a backup/log for local development
  const offlineData = JSON.parse(localStorage.getItem('apopheniaOfflineGameData') || '[]');
  offlineData.push(dataToSave);
  localStorage.setItem('apopheniaOfflineGameData', JSON.stringify(offlineData));

  return { success: true, offline: true, savedData: dataToSave };
}