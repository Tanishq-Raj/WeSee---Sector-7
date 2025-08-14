/**
 * Match Routes
 * API endpoints for match operations
 */

const express = require('express');
const router = express.Router();
const matchService = require('../services/matchService');

/**
 * @route   GET /api/matches
 * @desc    Get all matches
 * @access  Public
 */
router.get('/', (req, res) => {
  const matches = matchService.getAllMatches();
  res.json({
    success: true,
    data: matches,
  });
});

/**
 * @route   GET /api/matches/:matchId
 * @desc    Get match by ID
 * @access  Public
 */
router.get('/:matchId', (req, res) => {
  const { matchId } = req.params;
  const match = matchService.getMatchById(matchId);
  
  if (!match) {
    return res.status(404).json({
      success: false,
      message: 'Match not found',
    });
  }

  res.json({
    success: true,
    data: match,
  });
});

/**
 * @route   GET /api/matches/player/:playerId
 * @desc    Get matches for a player
 * @access  Public
 */
router.get('/player/:playerId', (req, res) => {
  const { playerId } = req.params;
  const matches = matchService.getMatchesByPlayer(playerId);
  
  res.json({
    success: true,
    data: matches,
  });
});

/**
 * @route   POST /api/matches/create
 * @desc    Create a new match
 * @access  Public
 */
router.post('/create', (req, res) => {
  const { creatorId, stakeAmount } = req.body;

  if (!creatorId || !stakeAmount) {
    return res.status(400).json({
      success: false,
      message: 'Creator ID and stake amount are required',
    });
  }

  const result = matchService.createMatch(creatorId, parseFloat(stakeAmount));
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
});

/**
 * @route   POST /api/matches/join
 * @desc    Join an existing match
 * @access  Public
 */
router.post('/join', (req, res) => {
  const { matchId, playerId } = req.body;

  if (!matchId || !playerId) {
    return res.status(400).json({
      success: false,
      message: 'Match ID and player ID are required',
    });
  }

  const result = matchService.joinMatch(matchId, playerId);
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

/**
 * @route   POST /api/matches/stake
 * @desc    Stake tokens for a match
 * @access  Public
 */
router.post('/stake', (req, res) => {
  const { matchId, playerId } = req.body;

  if (!matchId || !playerId) {
    return res.status(400).json({
      success: false,
      message: 'Match ID and player ID are required',
    });
  }

  const result = matchService.stakeTokens(matchId, playerId);
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

/**
 * @route   POST /api/matches/complete
 * @desc    Complete a match and distribute rewards
 * @access  Public
 */
router.post('/complete', (req, res) => {
  const { matchId, winnerId } = req.body;

  if (!matchId || !winnerId) {
    return res.status(400).json({
      success: false,
      message: 'Match ID and winner ID are required',
    });
  }

  const result = matchService.completeMatch(matchId, winnerId);
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

module.exports = router;