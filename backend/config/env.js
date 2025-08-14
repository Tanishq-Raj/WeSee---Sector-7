/**
 * Environment configuration
 */

const env = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Token configuration
  DEFAULT_CONVERSION_RATE: 1, // 1 USDT = 1 GT
  
  // Match configuration
  DEFAULT_MATCH_TYPE: 'STANDARD',
  BONUS_MATCH_ENABLED: true,
  TOURNAMENT_ENABLED: false,
};

module.exports = env;