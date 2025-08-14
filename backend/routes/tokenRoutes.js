/**
 * Token Routes
 * API endpoints for token operations
 */

const express = require('express');
const router = express.Router();
const tokenService = require('../services/tokenService');

/**
 * @route   GET /api/tokens/balance/:userId
 * @desc    Get user token balances
 * @access  Public
 */
router.get('/balance/:userId', (req, res) => {
  const { userId } = req.params;
  const balances = tokenService.getUserBalances(userId);
  res.json({
    success: true,
    data: balances,
  });
});

/**
 * @route   POST /api/tokens/convert
 * @desc    Convert USDT to GT
 * @access  Public
 */
router.post('/convert', (req, res) => {
  const { userId, usdtAmount } = req.body;

  if (!userId || !usdtAmount) {
    return res.status(400).json({
      success: false,
      message: 'User ID and USDT amount are required',
    });
  }

  const result = tokenService.convertUsdtToGt(userId, parseFloat(usdtAmount));
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

/**
 * @route   POST /api/tokens/add-usdt
 * @desc    Add USDT to user balance (for testing/development)
 * @access  Public
 */
router.post('/add-usdt', (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({
      success: false,
      message: 'User ID and amount are required',
    });
  }

  const result = tokenService.addUsdt(userId, parseFloat(amount));
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

/**
 * @route   GET /api/tokens/rates
 * @desc    Get current conversion rates
 * @access  Public
 */
router.get('/rates', (req, res) => {
  const { CONVERSION_RATES } = require('../utils/constants');
  res.json({
    success: true,
    data: CONVERSION_RATES,
  });
});

module.exports = router;