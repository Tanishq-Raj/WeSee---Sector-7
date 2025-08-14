/**
 * Match Service
 * Handles match creation, staking, and winner payouts
 */

const { v4: uuidv4 } = require('uuid');
const tokenService = require('./tokenService');
const { 
  MATCH_STATUS, 
  STAKE_LIMITS, 
  isValidStakeAmount, 
  calculateReward 
} = require('../utils/constants');

// In-memory database for development
const matches = {};

/**
 * Create a new match
 * @param {string} creatorId - ID of the player creating the match
 * @param {number} stakeAmount - Amount of GT to stake
 * @returns {Object} Created match
 */
const createMatch = (creatorId, stakeAmount) => {
  // Validate input
  if (!creatorId || !stakeAmount) {
    return { success: false, message: 'Invalid input parameters' };
  }
  
  // Validate stake amount
  if (!isValidStakeAmount(stakeAmount)) {
    return { 
      success: false, 
      message: `Stake amount must be between ${STAKE_LIMITS.MIN} and ${STAKE_LIMITS.MAX} GT` 
    };
  }

  // Check if creator has enough GT balance
  const creatorBalance = tokenService.getUserBalances(creatorId);
  if (creatorBalance.gt < stakeAmount) {
    return { success: false, message: 'Insufficient GT balance' };
  }

  // Generate unique match ID
  const matchId = uuidv4();

  // Create match object
  const match = {
    id: matchId,
    creatorId,
    stakeAmount,
    players: [creatorId], // Creator is the first player
    stakes: {}, // Will hold staked amounts by player
    status: MATCH_STATUS.CREATED,
    createdAt: new Date().toISOString(),
    winner: null,
  };

  // Store match
  matches[matchId] = match;

  return {
    success: true,
    message: 'Match created successfully',
    data: { match },
  };
};

/**
 * Join an existing match
 * @param {string} matchId - ID of the match to join
 * @param {string} playerId - ID of the player joining
 * @returns {Object} Updated match
 */
const joinMatch = (matchId, playerId) => {
  // Validate input
  if (!matchId || !playerId) {
    return { success: false, message: 'Invalid input parameters' };
  }

  // Check if match exists
  const match = matches[matchId];
  if (!match) {
    return { success: false, message: 'Match not found' };
  }

  // Check if match is in a joinable state
  if (match.status !== MATCH_STATUS.CREATED) {
    return { success: false, message: `Match cannot be joined (status: ${match.status})` };
  }

  // Check if player is already in the match
  if (match.players.includes(playerId)) {
    return { success: false, message: 'Player already in match' };
  }

  // Check if match is full (2 players max)
  if (match.players.length >= 2) {
    return { success: false, message: 'Match is full' };
  }

  // Check if player has enough GT balance
  const playerBalance = tokenService.getUserBalances(playerId);
  if (playerBalance.gt < match.stakeAmount) {
    return { success: false, message: 'Insufficient GT balance' };
  }

  // Add player to match
  match.players.push(playerId);

  // Update match status if full
  if (match.players.length === 2) {
    match.status = MATCH_STATUS.READY;
  }

  return {
    success: true,
    message: 'Joined match successfully',
    data: { match },
  };
};

/**
 * Stake tokens for a match
 * @param {string} matchId - ID of the match
 * @param {string} playerId - ID of the player staking
 * @returns {Object} Result of staking
 */
const stakeTokens = (matchId, playerId) => {
  // Validate input
  if (!matchId || !playerId) {
    return { success: false, message: 'Invalid input parameters' };
  }

  // Check if match exists
  const match = matches[matchId];
  if (!match) {
    return { success: false, message: 'Match not found' };
  }

  // Check if player is in the match
  if (!match.players.includes(playerId)) {
    return { success: false, message: 'Player not in match' };
  }

  // Check if player has already staked
  if (match.stakes[playerId]) {
    return { success: false, message: 'Player has already staked' };
  }

  // Get player balance
  const playerBalances = tokenService.getUserBalances(playerId);
  
  // Check if player has enough GT
  if (playerBalances.gt < match.stakeAmount) {
    return { success: false, message: 'Insufficient GT balance' };
  }

  // Deduct stake from player balance
  playerBalances.gt -= match.stakeAmount;

  // Record stake
  match.stakes[playerId] = match.stakeAmount;

  // Check if all players have staked
  const allStaked = match.players.every(player => match.stakes[player]);
  if (allStaked && match.players.length === 2) {
    match.status = MATCH_STATUS.IN_PROGRESS;
  }

  return {
    success: true,
    message: 'Tokens staked successfully',
    data: {
      match,
      playerBalance: playerBalances.gt,
    },
  };
};

/**
 * Complete a match and distribute rewards
 * @param {string} matchId - ID of the match
 * @param {string} winnerId - ID of the winning player
 * @returns {Object} Result of match completion
 */
const completeMatch = (matchId, winnerId) => {
  // Validate input
  if (!matchId || !winnerId) {
    return { success: false, message: 'Invalid input parameters' };
  }

  // Check if match exists
  const match = matches[matchId];
  if (!match) {
    return { success: false, message: 'Match not found' };
  }

  // Check if match is in progress
  if (match.status !== MATCH_STATUS.IN_PROGRESS) {
    return { success: false, message: `Match is not in progress (status: ${match.status})` };
  }

  // Check if winner is a player in the match
  if (!match.players.includes(winnerId)) {
    return { success: false, message: 'Winner is not a player in this match' };
  }

  // Calculate total stake (sum of all stakes)
  const totalStake = Object.values(match.stakes).reduce((sum, stake) => sum + stake, 0);
  
  // Calculate reward with potential bonus (default is standard match type)
  const reward = calculateReward(totalStake, match.matchType || 'STANDARD');

  // Update winner's balance
  const winnerBalances = tokenService.getUserBalances(winnerId);
  winnerBalances.gt += reward;

  // Update match status and winner
  match.status = MATCH_STATUS.COMPLETED;
  match.winner = winnerId;
  match.completedAt = new Date().toISOString();

  return {
    success: true,
    message: 'Match completed successfully',
    data: {
      match,
      reward,
      totalStake,
      winnerBalance: winnerBalances.gt,
    },
  };
};

/**
 * Get all matches
 * @returns {Array} List of all matches
 */
const getAllMatches = () => {
  return Object.values(matches);
};

/**
 * Get match by ID
 * @param {string} matchId - ID of the match
 * @returns {Object} Match object
 */
const getMatchById = (matchId) => {
  return matches[matchId];
};

/**
 * Get matches for a player
 * @param {string} playerId - ID of the player
 * @returns {Array} List of matches for the player
 */
const getMatchesByPlayer = (playerId) => {
  return Object.values(matches).filter(match => match.players.includes(playerId));
};

module.exports = {
  createMatch,
  joinMatch,
  stakeTokens,
  completeMatch,
  getAllMatches,
  getMatchById,
  getMatchesByPlayer,
};