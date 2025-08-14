/**
 * Constants and utility functions
 */

// Match status constants
const MATCH_STATUS = {
  CREATED: 'created',      // Match created, waiting for players
  READY: 'ready',          // Both players joined, waiting for start
  IN_PROGRESS: 'in_progress', // Match is in progress
  COMPLETED: 'completed',  // Match completed, winner determined
  CANCELLED: 'cancelled',  // Match cancelled
};

// Blockchain constants
const BLOCKCHAIN = {
  REQUIRED_CONFIRMATIONS: 3, // Number of confirmations required for a transaction to be considered final
  GAS_LIMIT: 3000000,        // Default gas limit for transactions
  GAS_PRICE: 5000000000,     // Default gas price in wei (5 gwei)
  RETRY_ATTEMPTS: 3,         // Number of retry attempts for failed transactions
  RETRY_DELAY: 5000,         // Delay between retry attempts in milliseconds
};

// Token conversion rates
const CONVERSION_RATES = {
  USDT_TO_GT: 1, // 1 USDT = 1 GT
};

// Reward multipliers for different match types
const REWARD_MULTIPLIERS = {
  STANDARD: 1.0,  // Winner gets 100% of the total stake
  BONUS: 1.1,     // Winner gets 110% of the total stake (10% bonus from platform)
  TOURNAMENT: 1.5 // Tournament matches have 50% bonus rewards
};

// Maximum stake limits
const STAKE_LIMITS = {
  MIN: 1,   // Minimum stake amount in GT
  MAX: 1000 // Maximum stake amount in GT
};

// Utility function to validate stake amount
const isValidStakeAmount = (amount) => {
  return amount >= STAKE_LIMITS.MIN && amount <= STAKE_LIMITS.MAX;
};

// Utility function to calculate rewards based on match type and stake
const calculateReward = (totalStake, matchType = 'STANDARD') => {
  const multiplier = REWARD_MULTIPLIERS[matchType] || REWARD_MULTIPLIERS.STANDARD;
  return totalStake * multiplier;
};

module.exports = {
  MATCH_STATUS,
  BLOCKCHAIN,
  CONVERSION_RATES,
  REWARD_MULTIPLIERS,
  STAKE_LIMITS,
  isValidStakeAmount,
  calculateReward
};