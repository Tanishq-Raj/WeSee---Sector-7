/**
 * Blockchain Service
 * Handles interaction between the backend API and blockchain contracts
 */

const ethers = require('ethers');
const constants = require('../utils/constants');

// Load contract ABIs
const GameTokenABI = require('../../blockchain/artifacts/contracts/GameToken.sol/GameToken.json').abi;
const PlayGameABI = require('../../blockchain/artifacts/contracts/PlayGame.sol/PlayGame.json').abi;
const TokenStoreABI = require('../../blockchain/artifacts/contracts/TokenStore.sol/TokenStore.json').abi;

// Initialize provider and contracts
const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const apiGatewaySigner = new ethers.Wallet(process.env.API_GATEWAY_PRIVATE_KEY, provider);

// Contract instances
let gameToken, playGame, tokenStore;

/**
 * Initialize blockchain contracts
 */
const initializeContracts = async () => {
  try {
    gameToken = new ethers.Contract(process.env.GAME_TOKEN_ADDRESS, GameTokenABI, provider);
    playGame = new ethers.Contract(process.env.PLAY_GAME_ADDRESS, PlayGameABI, provider);
    tokenStore = new ethers.Contract(process.env.TOKEN_STORE_ADDRESS, TokenStoreABI, provider);
    
    console.log('Blockchain contracts initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing blockchain contracts:', error);
    return false;
  }
};

/**
 * Submit match result to the blockchain
 * @param {string} matchId - Unique identifier for the match
 * @param {string} winnerAddress - Ethereum address of the winner
 * @returns {Object} Result of the transaction
 */
const submitMatchResult = async (matchId, winnerAddress) => {
  try {
    if (!playGame) await initializeContracts();
    
    // Connect with the API Gateway signer
    const playGameWithSigner = playGame.connect(apiGatewaySigner);
    
    // Submit the match result
    const tx = await playGameWithSigner.submitMatchResult(matchId, winnerAddress);
    const receipt = await tx.wait();
    
    console.log(`Match result submitted successfully. Transaction hash: ${tx.hash}`);
    return { success: true, transactionHash: tx.hash, receipt };
  } catch (error) {
    console.error('Error submitting match result:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get player's Game Token balance
 * @param {string} playerAddress - Ethereum address of the player
 * @returns {Object} Player's balance information
 */
const getPlayerBalance = async (playerAddress) => {
  try {
    if (!gameToken) await initializeContracts();
    
    const balance = await gameToken.balanceOf(playerAddress);
    const formattedBalance = ethers.utils.formatEther(balance);
    
    return { success: true, balance: formattedBalance, rawBalance: balance.toString() };
  } catch (error) {
    console.error('Error getting player balance:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get match status from the blockchain
 * @param {string} matchId - Unique identifier for the match
 * @returns {Object} Match status information
 */
const getMatchStatus = async (matchId) => {
  try {
    if (!playGame) await initializeContracts();
    
    const match = await playGame.matches(matchId);
    
    return {
      success: true,
      matchData: {
        matchId,
        player1: match.player1,
        player2: match.player2,
        stakeAmount: ethers.utils.formatEther(match.stakeAmount),
        rawStakeAmount: match.stakeAmount.toString(),
        isComplete: match.isComplete,
        winner: match.winner
      }
    };
  } catch (error) {
    console.error('Error getting match status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify if a transaction has been confirmed
 * @param {string} txHash - Transaction hash to verify
 * @returns {Object} Transaction confirmation status
 */
const verifyTransaction = async (txHash) => {
  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx) return { success: false, confirmed: false, message: 'Transaction not found' };
    
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) return { success: true, confirmed: false, message: 'Transaction pending' };
    
    const confirmations = tx.confirmations;
    const requiredConfirmations = constants.REQUIRED_CONFIRMATIONS || 3;
    
    return {
      success: true,
      confirmed: confirmations >= requiredConfirmations,
      confirmations,
      requiredConfirmations,
      receipt
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeContracts,
  submitMatchResult,
  getPlayerBalance,
  getMatchStatus,
  verifyTransaction
};