/**
 * Blockchain Integration Helper
 * 
 * This file provides utility functions to integrate blockchain functionality
 * into your existing frontend application.
 */

import { ethers } from 'ethers';
import GameTokenABI from './contracts/GameToken.json';
import TokenStoreABI from './contracts/TokenStore.json';
import PlayGameABI from './contracts/PlayGame.json';

// Contract addresses from environment variables
const CONTRACT_ADDRESSES = {
  gameToken: process.env.REACT_APP_GAME_TOKEN_ADDRESS || '',
  tokenStore: process.env.REACT_APP_TOKEN_STORE_ADDRESS || '',
  playGame: process.env.REACT_APP_PLAY_GAME_ADDRESS || '',
  usdt: process.env.REACT_APP_USDT_ADDRESS || ''
};

/**
 * Initialize Web3 provider and signer
 * @returns {Object} Provider and signer objects
 */
export const initializeWeb3 = async () => {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install it to use this application.');
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    
    // Get network information
    const network = await provider.getNetwork();
    
    return { provider, signer, account, network };
  } catch (error) {
    console.error('Error initializing Web3:', error);
    throw error;
  }
};

/**
 * Initialize contract instances
 * @param {Object} provider - Ethers.js provider
 * @param {Object} signer - Ethers.js signer (optional, for transactions)
 * @returns {Object} Contract instances
 */
export const initializeContracts = (provider, signer = null) => {
  try {
    // Validate contract addresses
    if (!CONTRACT_ADDRESSES.gameToken || !CONTRACT_ADDRESSES.tokenStore || 
        !CONTRACT_ADDRESSES.playGame || !CONTRACT_ADDRESSES.usdt) {
      throw new Error('Contract addresses not configured');
    }

    // Create contract instances
    const connectionAccount = signer || provider;
    
    const gameToken = new ethers.Contract(
      CONTRACT_ADDRESSES.gameToken,
      GameTokenABI.abi,
      connectionAccount
    );
    
    const tokenStore = new ethers.Contract(
      CONTRACT_ADDRESSES.tokenStore,
      TokenStoreABI.abi,
      connectionAccount
    );
    
    const playGame = new ethers.Contract(
      CONTRACT_ADDRESSES.playGame,
      PlayGameABI.abi,
      connectionAccount
    );
    
    // Minimal USDT ABI for basic functions
    const usdt = new ethers.Contract(
      CONTRACT_ADDRESSES.usdt,
      [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function approve(address spender, uint256 amount) returns (bool)'
      ],
      connectionAccount
    );
    
    return { gameToken, tokenStore, playGame, usdt };
  } catch (error) {
    console.error('Error initializing contracts:', error);
    throw error;
  }
};

/**
 * Get token balances for an account
 * @param {string} account - Ethereum address
 * @returns {Object} Token balances
 */
export const getTokenBalances = async (account) => {
  try {
    const { provider } = await initializeWeb3();
    const { gameToken, usdt } = initializeContracts(provider);
    
    // Get token balances
    const gtBalance = await gameToken.balanceOf(account);
    const usdtBalanceRaw = await usdt.balanceOf(account);
    const usdtDecimals = await usdt.decimals();
    
    return {
      gameToken: ethers.utils.formatUnits(gtBalance, 18),
      usdt: ethers.utils.formatUnits(usdtBalanceRaw, usdtDecimals)
    };
  } catch (error) {
    console.error('Error getting token balances:', error);
    throw error;
  }
};

/**
 * Purchase Game Tokens with USDT
 * @param {string} usdtAmount - Amount of USDT to spend
 * @returns {Object} Transaction receipt
 */
export const purchaseTokens = async (usdtAmount) => {
  try {
    const { signer } = await initializeWeb3();
    const { tokenStore, usdt } = initializeContracts(null, signer);
    
    // Get USDT decimals
    const usdtDecimals = await usdt.decimals();
    
    // Convert USDT amount to wei
    const usdtAmountWei = ethers.utils.parseUnits(usdtAmount, usdtDecimals);

    // First approve TokenStore to spend USDT
    console.log(`Approving ${usdtAmount} USDT...`);
    const approveTx = await usdt.approve(CONTRACT_ADDRESSES.tokenStore, usdtAmountWei);
    await approveTx.wait();
    console.log('Approval successful');

    // Then purchase tokens
    console.log(`Purchasing tokens with ${usdtAmount} USDT...`);
    const purchaseTx = await tokenStore.purchaseTokens(usdtAmountWei);
    const receipt = await purchaseTx.wait();
    
    return receipt;
  } catch (error) {
    console.error('Error purchasing tokens:', error);
    throw error;
  }
};

/**
 * Create a new match
 * @param {string} stakeAmount - Amount of Game Tokens to stake
 * @returns {Object} Transaction receipt and match ID
 */
export const createMatch = async (stakeAmount) => {
  try {
    const { signer } = await initializeWeb3();
    const { gameToken, playGame } = initializeContracts(null, signer);
    
    // Convert stake amount to wei
    const stakeAmountWei = ethers.utils.parseUnits(stakeAmount, 18);

    // First approve PlayGame to spend Game Tokens
    console.log(`Approving ${stakeAmount} GT for staking...`);
    const approveTx = await gameToken.approve(CONTRACT_ADDRESSES.playGame, stakeAmountWei);
    await approveTx.wait();
    console.log('Approval successful');

    // Then create match
    console.log(`Creating match with ${stakeAmount} GT stake...`);
    const createTx = await playGame.createMatch(stakeAmountWei);
    const receipt = await createTx.wait();
    
    // Find the MatchCreated event to get the matchId
    const matchCreatedEvent = receipt.events.find(event => event.event === 'MatchCreated');
    const matchId = matchCreatedEvent.args.matchId.toString();
    
    return { receipt, matchId };
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

/**
 * Join an existing match
 * @param {string} matchId - ID of the match to join
 * @returns {Object} Transaction receipt
 */
export const joinMatch = async (matchId) => {
  try {
    const { signer } = await initializeWeb3();
    const { gameToken, playGame } = initializeContracts(null, signer);
    
    // Get match details to check stake amount
    const match = await playGame.getMatch(matchId);
    const stakeAmountWei = match.stakeAmount;
    const stakeAmountFormatted = ethers.utils.formatUnits(stakeAmountWei, 18);

    // First approve PlayGame to spend Game Tokens
    console.log(`Approving ${stakeAmountFormatted} GT for staking...`);
    const approveTx = await gameToken.approve(CONTRACT_ADDRESSES.playGame, stakeAmountWei);
    await approveTx.wait();
    console.log('Approval successful');

    // Then join match
    console.log(`Joining match #${matchId}...`);
    const joinTx = await playGame.joinMatch(matchId);
    const receipt = await joinTx.wait();
    
    return receipt;
  } catch (error) {
    console.error('Error joining match:', error);
    throw error;
  }
};

/**
 * Get match details
 * @param {string} matchId - ID of the match
 * @returns {Object} Match details
 */
export const getMatchDetails = async (matchId) => {
  try {
    const { provider } = await initializeWeb3();
    const { playGame } = initializeContracts(provider);
    
    const match = await playGame.getMatch(matchId);
    
    return {
      id: matchId,
      creator: match.creator,
      opponent: match.opponent,
      stakeAmount: ethers.utils.formatUnits(match.stakeAmount, 18),
      status: parseInt(match.status),
      winner: match.winner
    };
  } catch (error) {
    console.error('Error getting match details:', error);
    throw error;
  }
};

/**
 * Get available matches that can be joined
 * @returns {Array} List of available matches
 */
export const getAvailableMatches = async () => {
  try {
    const { provider } = await initializeWeb3();
    const { playGame } = initializeContracts(provider);
    
    const matchCount = await playGame.matchCount();
    const matches = [];
    
    // Check the last 20 matches (or fewer if there aren't that many)
    const startIdx = Math.max(1, matchCount.toNumber() - 19);
    const endIdx = matchCount.toNumber();
    
    for (let i = startIdx; i <= endIdx; i++) {
      const match = await playGame.getMatch(i);
      
      // Only include matches that are in CREATED status (0)
      if (match.status === 0) {
        matches.push({
          id: i,
          creator: match.creator,
          opponent: match.opponent,
          stakeAmount: ethers.utils.formatUnits(match.stakeAmount, 18),
          status: parseInt(match.status)
        });
      }
    }
    
    return matches;
  } catch (error) {
    console.error('Error getting available matches:', error);
    throw error;
  }
};

/**
 * Get matches for a specific user
 * @param {string} account - Ethereum address
 * @returns {Array} List of user's matches
 */
export const getUserMatches = async (account) => {
  try {
    const { provider } = await initializeWeb3();
    const { playGame } = initializeContracts(provider);
    
    const matchCount = await playGame.matchCount();
    const matches = [];
    
    // Check the last 20 matches (or fewer if there aren't that many)
    const startIdx = Math.max(1, matchCount.toNumber() - 19);
    const endIdx = matchCount.toNumber();
    
    for (let i = startIdx; i <= endIdx; i++) {
      const match = await playGame.getMatch(i);
      
      // Include matches where the user is creator or opponent
      if (match.creator.toLowerCase() === account.toLowerCase() || 
          match.opponent.toLowerCase() === account.toLowerCase()) {
        matches.push({
          id: i,
          creator: match.creator,
          opponent: match.opponent,
          stakeAmount: ethers.utils.formatUnits(match.stakeAmount, 18),
          status: parseInt(match.status),
          isCreator: match.creator.toLowerCase() === account.toLowerCase()
        });
      }
    }
    
    return matches;
  } catch (error) {
    console.error('Error getting user matches:', error);
    throw error;
  }
};

/**
 * Get active matches for an account
 * @param {string} account - Ethereum address
 * @returns {Array} List of active matches
 */
export const getActiveMatches = async (account) => {
  try {
    const { provider } = await initializeWeb3();
    const { playGame } = initializeContracts(provider);
    
    const matchCount = await playGame.matchCount();
    const matches = [];
    
    // Check the last 10 matches (or fewer if there aren't that many)
    const startIdx = Math.max(1, matchCount.toNumber() - 9);
    const endIdx = matchCount.toNumber();
    
    for (let i = startIdx; i <= endIdx; i++) {
      const match = await playGame.getMatch(i);
      
      // Only include matches that involve the account and are active
      if ((match.creator.toLowerCase() === account.toLowerCase() || 
           match.opponent.toLowerCase() === account.toLowerCase()) &&
          match.status === 1) { // 1 = ACTIVE status
        matches.push({
          id: i,
          creator: match.creator,
          opponent: match.opponent,
          stakeAmount: ethers.utils.formatUnits(match.stakeAmount, 18),
          status: match.status,
          isCreator: match.creator.toLowerCase() === account.toLowerCase()
        });
      }
    }
    
    return matches;
  } catch (error) {
    console.error('Error getting active matches:', error);
    throw error;
  }
};

/**
 * Verify contract relationships
 * @returns {boolean} Whether contracts are properly connected
 */
export const verifyContracts = async () => {
  try {
    const { provider } = await initializeWeb3();
    const { gameToken, tokenStore, playGame } = initializeContracts(provider);
    
    // Verify contract relationships
    const tokenStoreFromGameToken = await gameToken.tokenStore();
    const gameTokenFromTokenStore = await tokenStore.gameToken();
    const gameTokenFromPlayGame = await playGame.gameToken();
    
    const relationshipsValid = 
      tokenStoreFromGameToken.toLowerCase() === CONTRACT_ADDRESSES.tokenStore.toLowerCase() &&
      gameTokenFromTokenStore.toLowerCase() === CONTRACT_ADDRESSES.gameToken.toLowerCase() &&
      gameTokenFromPlayGame.toLowerCase() === CONTRACT_ADDRESSES.gameToken.toLowerCase();
    
    return relationshipsValid;
  } catch (error) {
    console.error('Error verifying contracts:', error);
    throw error;
  }
};

/**
 * Listen for blockchain events
 * @param {Function} callback - Function to call when events are received
 * @returns {Array} Event listeners that can be used to unsubscribe
 */
export const listenForEvents = (callback) => {
  try {
    const { provider } = initializeWeb3();
    const { gameToken, tokenStore, playGame } = initializeContracts(provider);
    
    // Listen for token purchase events
    const tokensPurchasedListener = tokenStore.on('TokensPurchased', (buyer, usdtAmount, gameTokenAmount, event) => {
      callback({
        type: 'TokensPurchased',
        buyer,
        usdtAmount: ethers.utils.formatUnits(usdtAmount, 6), // Assuming USDT has 6 decimals
        gameTokenAmount: ethers.utils.formatUnits(gameTokenAmount, 18),
        event
      });
    });
    
    // Listen for match events
    const matchCreatedListener = playGame.on('MatchCreated', (matchId, creator, stakeAmount, event) => {
      callback({
        type: 'MatchCreated',
        matchId: matchId.toString(),
        creator,
        stakeAmount: ethers.utils.formatUnits(stakeAmount, 18),
        event
      });
    });
    
    const matchJoinedListener = playGame.on('MatchJoined', (matchId, player, event) => {
      callback({
        type: 'MatchJoined',
        matchId: matchId.toString(),
        player,
        event
      });
    });
    
    const matchResultListener = playGame.on('MatchResult', (matchId, winner, reward, event) => {
      callback({
        type: 'MatchResult',
        matchId: matchId.toString(),
        winner,
        reward: ethers.utils.formatUnits(reward, 18),
        event
      });
    });
    
    return [
      tokensPurchasedListener,
      matchCreatedListener,
      matchJoinedListener,
      matchResultListener
    ];
  } catch (error) {
    console.error('Error setting up event listeners:', error);
    throw error;
  }
};

/**
 * Get Game Token balance for an account
 * @param {string} account - Ethereum address
 * @returns {string} Game Token balance
 */
export const getGameTokenBalance = async (account) => {
  try {
    const { provider } = await initializeWeb3();
    const { gameToken } = initializeContracts(provider);
    
    const balance = await gameToken.balanceOf(account);
    return ethers.utils.formatUnits(balance, 18);
  } catch (error) {
    console.error('Error getting Game Token balance:', error);
    throw error;
  }
};

/**
 * Check if contracts are deployed and accessible
 * @returns {boolean} Whether contracts are accessible
 */
export const checkContractsAccessible = async () => {
  try {
    const { provider } = await initializeWeb3();
    const { gameToken, tokenStore, playGame } = initializeContracts(provider);
    
    // Try to call view functions on each contract
    const [gtName, gtSymbol, tsGameToken, pgGameToken] = await Promise.all([
      gameToken.name(),
      gameToken.symbol(),
      tokenStore.gameToken(),
      playGame.gameToken()
    ]);
    
    return {
      accessible: true,
      gameToken: {
        name: gtName,
        symbol: gtSymbol
      },
      relationships: {
        tokenStoreHasGameToken: tsGameToken.toLowerCase() === CONTRACT_ADDRESSES.gameToken.toLowerCase(),
        playGameHasGameToken: pgGameToken.toLowerCase() === CONTRACT_ADDRESSES.gameToken.toLowerCase()
      }
    };
  } catch (error) {
    console.error('Error checking contracts accessibility:', error);
    return {
      accessible: false,
      error: error.message
    };
  }
};