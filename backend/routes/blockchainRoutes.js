/**
 * Blockchain Routes
 * API endpoints for blockchain interactions
 */

const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');

/**
 * @route   GET /api/blockchain/balance/:address
 * @desc    Get player's Game Token balance
 * @access  Public
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate Ethereum address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid Ethereum address format' });
    }
    
    const result = await blockchainService.getPlayerBalance(address);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in balance endpoint:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/blockchain/match/:matchId
 * @desc    Get match status from blockchain
 * @access  Public
 */
router.get('/match/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    
    if (!matchId) {
      return res.status(400).json({ success: false, message: 'Match ID is required' });
    }
    
    const result = await blockchainService.getMatchStatus(matchId);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in match status endpoint:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/blockchain/match/result
 * @desc    Submit match result to blockchain
 * @access  Private (should be restricted to game server only)
 */
router.post('/match/result', async (req, res) => {
  try {
    const { matchId, winnerAddress } = req.body;
    
    // Validate required fields
    if (!matchId || !winnerAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Match ID and winner address are required' 
      });
    }
    
    // Validate Ethereum address format
    if (!winnerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Ethereum address format for winner' 
      });
    }
    
    const result = await blockchainService.submitMatchResult(matchId, winnerAddress);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in submit match result endpoint:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/blockchain/transaction/:txHash
 * @desc    Verify transaction status
 * @access  Public
 */
router.get('/transaction/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    
    // Validate transaction hash format
    if (!txHash || !txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid transaction hash format' 
      });
    }
    
    const result = await blockchainService.verifyTransaction(txHash);
    return res.json(result);
  } catch (error) {
    console.error('Error in transaction verification endpoint:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;