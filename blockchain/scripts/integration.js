/**
 * This script demonstrates how the backend API can interact with the blockchain contracts
 */

const { ethers } = require('hardhat');

// Contract ABIs (these would be imported from build artifacts in a real application)
const GameTokenABI = require('../artifacts/contracts/GameToken.sol/GameToken.json').abi;
const PlayGameABI = require('../artifacts/contracts/PlayGame.sol/PlayGame.json').abi;

// Example integration functions
async function initializeContracts(provider) {
  // In a real application, these addresses would be loaded from environment variables
  const gameTokenAddress = process.env.GAME_TOKEN_ADDRESS;
  const playGameAddress = process.env.PLAY_GAME_ADDRESS;
  
  // Connect to the contracts
  const gameToken = new ethers.Contract(gameTokenAddress, GameTokenABI, provider);
  const playGame = new ethers.Contract(playGameAddress, PlayGameABI, provider);
  
  return { gameToken, playGame };
}

// API Gateway functions
async function submitMatchResult(matchId, winnerAddress) {
  try {
    // In a real application, this would use a wallet with the API Gateway private key
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const apiGatewaySigner = new ethers.Wallet(process.env.API_GATEWAY_PRIVATE_KEY, provider);
    
    const { playGame } = await initializeContracts(provider);
    
    // Connect with the API Gateway signer
    const playGameWithSigner = playGame.connect(apiGatewaySigner);
    
    // Submit the match result
    const tx = await playGameWithSigner.submitMatchResult(matchId, winnerAddress);
    await tx.wait();
    
    console.log(`Match result submitted successfully. Transaction hash: ${tx.hash}`);
    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error('Error submitting match result:', error);
    return { success: false, error: error.message };
  }
}

// Example of how to check player balances
async function getPlayerBalance(playerAddress) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const { gameToken } = await initializeContracts(provider);
    
    const balance = await gameToken.balanceOf(playerAddress);
    const formattedBalance = ethers.utils.formatEther(balance);
    
    console.log(`Player ${playerAddress} has ${formattedBalance} GT`);
    return { success: true, balance: formattedBalance };
  } catch (error) {
    console.error('Error getting player balance:', error);
    return { success: false, error: error.message };
  }
}

// Example of how to check match status
async function getMatchStatus(matchId) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const { playGame } = await initializeContracts(provider);
    
    const match = await playGame.matches(matchId);
    
    return {
      success: true,
      matchData: {
        matchId,
        player1: match.player1,
        player2: match.player2,
        stakeAmount: ethers.utils.formatEther(match.stakeAmount),
        isComplete: match.isComplete,
        winner: match.winner
      }
    };
  } catch (error) {
    console.error('Error getting match status:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  submitMatchResult,
  getPlayerBalance,
  getMatchStatus
};