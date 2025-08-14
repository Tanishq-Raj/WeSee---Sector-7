import Web3 from 'web3';
import GameTokenABI from '../contracts/GameToken.json';
import TokenStoreABI from '../contracts/TokenStore.json';
import PlayGameABI from '../contracts/PlayGame.json';

class BlockchainService {
  constructor() {
    this.web3 = null;
    this.gameToken = null;
    this.tokenStore = null;
    this.playGame = null;
    this.accounts = [];
    this.networkId = null;
    this.initialized = false;
  }

  /**
   * Initialize Web3 and contract instances
   */
  async init() {
    try {
      // Check if Web3 is injected by MetaMask
      if (window.ethereum) {
        this.web3 = new Web3(window.ethereum);
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          console.error('User denied account access');
          return false;
        }
      } 
      // Legacy dapp browsers
      else if (window.web3) {
        this.web3 = new Web3(window.web3.currentProvider);
      } 
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        const provider = new Web3.providers.HttpProvider('http://localhost:8545');
        this.web3 = new Web3(provider);
      }

      // Get network ID
      this.networkId = await this.web3.eth.net.getId();
      
      // Get accounts
      this.accounts = await this.web3.eth.getAccounts();
      
      // Initialize contract instances
      await this.initContracts();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing blockchain service:', error);
      return false;
    }
  }

  /**
   * Initialize contract instances
   */
  async initContracts() {
    try {
      // Fetch contract addresses from backend
      const response = await fetch('/api/blockchain/contracts');
      const { gameTokenAddress, tokenStoreAddress, playGameAddress } = await response.json();
      
      // Initialize contract instances
      this.gameToken = new this.web3.eth.Contract(GameTokenABI, gameTokenAddress);
      this.tokenStore = new this.web3.eth.Contract(TokenStoreABI, tokenStoreAddress);
      this.playGame = new this.web3.eth.Contract(PlayGameABI, playGameAddress);
      
      return true;
    } catch (error) {
      console.error('Error initializing contracts:', error);
      return false;
    }
  }

  /**
   * Get current account
   */
  getCurrentAccount() {
    return this.accounts[0];
  }

  /**
   * Get player's Game Token balance
   */
  async getBalance(address) {
    try {
      if (!this.initialized) await this.init();
      
      const balance = await this.gameToken.methods.balanceOf(address).call();
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Purchase Game Tokens with USDT
   */
  async purchaseTokens(usdtAmount) {
    try {
      if (!this.initialized) await this.init();
      
      const account = this.getCurrentAccount();
      
      // First approve USDT transfer
      // Note: In a real app, you'd need to get the USDT contract address and ABI
      const usdtContract = new this.web3.eth.Contract([
        {
          "constant": false,
          "inputs": [
            { "name": "_spender", "type": "address" },
            { "name": "_value", "type": "uint256" }
          ],
          "name": "approve",
          "outputs": [{ "name": "", "type": "bool" }],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ], process.env.REACT_APP_USDT_ADDRESS);
      
      await usdtContract.methods.approve(
        this.tokenStore._address, 
        usdtAmount
      ).send({ from: account });
      
      // Then purchase tokens
      const tx = await this.tokenStore.methods.purchaseTokens(usdtAmount)
        .send({ from: account });
      
      return tx;
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      throw error;
    }
  }

  /**
   * Create a new match
   */
  async createMatch(matchId, stakeAmount) {
    try {
      if (!this.initialized) await this.init();
      
      const account = this.getCurrentAccount();
      const stakeAmountWei = this.web3.utils.toWei(stakeAmount.toString(), 'ether');
      
      // First approve GT transfer
      await this.gameToken.methods.approve(
        this.playGame._address, 
        stakeAmountWei
      ).send({ from: account });
      
      // Then create match
      const tx = await this.playGame.methods.createMatch(matchId, stakeAmountWei)
        .send({ from: account });
      
      return tx;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  }

  /**
   * Join an existing match
   */
  async joinMatch(matchId) {
    try {
      if (!this.initialized) await this.init();
      
      const account = this.getCurrentAccount();
      
      // Get match details to know stake amount
      const match = await this.playGame.methods.matches(matchId).call();
      
      // Approve GT transfer
      await this.gameToken.methods.approve(
        this.playGame._address, 
        match.stakeAmount
      ).send({ from: account });
      
      // Join match
      const tx = await this.playGame.methods.joinMatch(matchId)
        .send({ from: account });
      
      return tx;
    } catch (error) {
      console.error('Error joining match:', error);
      throw error;
    }
  }

  /**
   * Get match details
   */
  async getMatchDetails(matchId) {
    try {
      if (!this.initialized) await this.init();
      
      const match = await this.playGame.methods.matches(matchId).call();
      
      return {
        matchId,
        player1: match.player1,
        player2: match.player2,
        stakeAmount: this.web3.utils.fromWei(match.stakeAmount, 'ether'),
        isComplete: match.isComplete,
        winner: match.winner
      };
    } catch (error) {
      console.error('Error getting match details:', error);
      throw error;
    }
  }

  /**
   * Verify if contracts are working properly
   */
  async verifyContracts() {
    try {
      if (!this.initialized) await this.init();
      
      const account = this.getCurrentAccount();
      const results = {};
      
      // Verify GameToken contract
      try {
        const name = await this.gameToken.methods.name().call();
        const symbol = await this.gameToken.methods.symbol().call();
        const decimals = await this.gameToken.methods.decimals().call();
        
        results.gameToken = {
          success: true,
          name,
          symbol,
          decimals: parseInt(decimals),
          message: 'GameToken contract is working properly'
        };
      } catch (error) {
        results.gameToken = {
          success: false,
          message: `GameToken contract error: ${error.message}`
        };
      }
      
      // Verify TokenStore contract
      try {
        const gameTokenAddress = await this.tokenStore.methods.gameToken().call();
        const usdtTokenAddress = await this.tokenStore.methods.usdtToken().call();
        
        results.tokenStore = {
          success: true,
          gameTokenAddress,
          usdtTokenAddress,
          message: 'TokenStore contract is working properly'
        };
      } catch (error) {
        results.tokenStore = {
          success: false,
          message: `TokenStore contract error: ${error.message}`
        };
      }
      
      // Verify PlayGame contract
      try {
        const gameTokenAddress = await this.playGame.methods.gameToken().call();
        const apiGateway = await this.playGame.methods.apiGateway().call();
        
        results.playGame = {
          success: true,
          gameTokenAddress,
          apiGateway,
          message: 'PlayGame contract is working properly'
        };
      } catch (error) {
        results.playGame = {
          success: false,
          message: `PlayGame contract error: ${error.message}`
        };
      }
      
      return results;
    } catch (error) {
      console.error('Error verifying contracts:', error);
      throw error;
    }
  }
}

export default new BlockchainService();