/**
 * Token Service
 * Handles token conversion and balance management
 */

const { CONVERSION_RATES } = require('../utils/constants');

// In-memory database for development
const users = {};

/**
 * Get user balances
 * @param {string} userId - User ID
 * @returns {Object} User balances
 */
const getUserBalances = (userId) => {
  if (!users[userId]) {
    // Initialize new user with zero balances
    users[userId] = {
      gt: 0,
      usdt: 0,
    };
  }
  return users[userId];
};

/**
 * Convert USDT to GT
 * @param {string} userId - User ID
 * @param {number} usdtAmount - Amount of USDT to convert
 * @returns {Object} Result of conversion
 */
const convertUsdtToGt = (userId, usdtAmount) => {
  // Validate input
  if (!userId || !usdtAmount || usdtAmount <= 0) {
    return { success: false, message: 'Invalid input parameters' };
  }

  // Get user balances
  const userBalances = getUserBalances(userId);

  // Check if user has enough USDT
  if (userBalances.usdt < usdtAmount) {
    return { success: false, message: 'Insufficient USDT balance' };
  }

  // Calculate GT amount based on conversion rate
  const gtAmount = usdtAmount * CONVERSION_RATES.USDT_TO_GT;

  // Update balances
  userBalances.usdt -= usdtAmount;
  userBalances.gt += gtAmount;

  return {
    success: true,
    message: 'Conversion successful',
    data: {
      convertedAmount: gtAmount,
      newBalances: {
        gt: userBalances.gt,
        usdt: userBalances.usdt,
      },
    },
  };
};

/**
 * Add USDT to user balance (for testing/development)
 * @param {string} userId - User ID
 * @param {number} amount - Amount to add
 * @returns {Object} Updated balances
 */
const addUsdt = (userId, amount) => {
  if (!userId || !amount || amount <= 0) {
    return { success: false, message: 'Invalid input parameters' };
  }

  const userBalances = getUserBalances(userId);
  userBalances.usdt += amount;

  return {
    success: true,
    message: 'USDT added successfully',
    data: {
      newBalances: {
        gt: userBalances.gt,
        usdt: userBalances.usdt,
      },
    },
  };
};

module.exports = {
  getUserBalances,
  convertUsdtToGt,
  addUsdt,
};