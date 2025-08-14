/**
 * Blockchain Game Utilities
 * 
 * This file provides utility functions for integrating blockchain functionality
 * with the Tic Tac Toe game.
 */

import { ethers } from 'ethers';
import { 
  createMatch, 
  joinMatch, 
  getMatchDetails, 
  submitMatchResult,
  listenForEvents
} from '../blockchain-integration';

/**
 * Create a new match on the blockchain
 * @param {number} stakeAmount - Amount of GT tokens to stake
 * @returns {Promise<string>} - Match ID
 */
export const createGameMatch = async (stakeAmount) => {
  try {
    const matchId = await createMatch(stakeAmount);
    return matchId;
  } catch (error) {
    console.error('Error creating game match:', error);
    throw error;
  }
};

/**
 * Join an existing match on the blockchain
 * @param {string} matchId - ID of the match to join
 * @returns {Promise<void>}
 */
export const joinGameMatch = async (matchId) => {
  try {
    await joinMatch(matchId);
  } catch (error) {
    console.error('Error joining game match:', error);
    throw error;
  }
};

/**
 * Get match details from the blockchain
 * @param {string} matchId - ID of the match
 * @returns {Promise<Object>} - Match details
 */
export const getGameMatchDetails = async (matchId) => {
  try {
    const details = await getMatchDetails(matchId);
    return details;
  } catch (error) {
    console.error('Error getting game match details:', error);
    throw error;
  }
};

/**
 * Submit match result to the blockchain
 * @param {string} matchId - ID of the match
 * @param {string} result - Result of the match ('X', 'O', or 'draw')
 * @param {Object} matchDetails - Match details from blockchain
 * @returns {Promise<void>}
 */
export const submitGameResult = async (matchId, result, matchDetails) => {
  try {
    let winnerAddress;
    
    if (result === 'draw') {
      // In case of draw, no winner
      winnerAddress = ethers.constants.AddressZero;
    } else if (result === 'X') {
      // Assuming player X is the match creator
      winnerAddress = matchDetails?.creator || ethers.constants.AddressZero;
    } else {
      // Assuming player O is the opponent
      winnerAddress = matchDetails?.opponent || ethers.constants.AddressZero;
    }
    
    await submitMatchResult(matchId, winnerAddress);
  } catch (error) {
    console.error('Error submitting game result:', error);
    throw error;
  }
};

/**
 * Set up event listeners for blockchain events
 * @param {Function} callback - Function to call when events are received
 * @returns {Array} - Event listeners that can be used to unsubscribe
 */
export const setupGameEventListeners = (callback) => {
  try {
    return listenForEvents((event) => {
      // Process the event based on its type
      switch (event.type) {
        case 'MatchCreated':
          callback({
            type: 'match_created',
            matchId: event.matchId,
            creator: event.creator,
            stakeAmount: event.stakeAmount
          });
          break;
        case 'MatchJoined':
          callback({
            type: 'match_joined',
            matchId: event.matchId,
            player: event.player
          });
          break;
        case 'MatchResult':
          callback({
            type: 'match_result',
            matchId: event.matchId,
            winner: event.winner,
            reward: event.reward
          });
          break;
        default:
          // Ignore other events
          break;
      }
    });
  } catch (error) {
    console.error('Error setting up game event listeners:', error);
    return [];
  }
};