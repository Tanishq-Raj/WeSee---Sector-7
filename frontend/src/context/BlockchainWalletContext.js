import React, { createContext, useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  getGameTokenBalance, 
  approveUSDTSpending, 
  purchaseGameTokens,
  createMatch,
  joinMatch,
  submitMatchResult
} from '../blockchain-integration';

// Create the blockchain wallet context
const BlockchainWalletContext = createContext();

// Custom hook to use the blockchain wallet context
export function useBlockchainWallet() {
  const context = useContext(BlockchainWalletContext);
  if (!context) {
    throw new Error('useBlockchainWallet must be used within a BlockchainWalletProvider');
  }
  return context;
}

// Provider component that wraps the app and makes blockchain wallet data available
export function BlockchainWalletProvider({ children }) {
  // State for wallet connection
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [networkName, setNetworkName] = useState('');
  
  // State for token balances
  const [gtBalance, setGtBalance] = useState('0');
  const [usdtBalance, setUsdtBalance] = useState('0');
  
  // State for transaction history
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  
  // State for errors and loading
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Connect wallet
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Get network information
        const provider = new ethers.providers.Web3Provider(ethereum);
        const network = await provider.getNetwork();
        setNetworkName(network.name);
        
        // Load balances
        await refreshBalances(accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(`Error connecting wallet: ${error.message}`);
    }
  };

  // Refresh balances
  const refreshBalances = async (address) => {
    try {
      const balance = await getGameTokenBalance(address);
      setGtBalance(balance);
    } catch (error) {
      console.error('Error refreshing balances:', error);
      setError(`Error refreshing balances: ${error.message}`);
    }
  };

  // Purchase GT tokens with USDT
  const purchaseGT = async (usdtAmount) => {
    setIsLoading(true);
    try {
      // First approve USDT spending
      await approveUSDTSpending(usdtAmount);
      
      // Then purchase GT tokens
      const txHash = await purchaseGameTokens(usdtAmount);
      
      // Add to purchase history
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      setPurchaseHistory([
        {
          date: formattedDate,
          amount: `${usdtAmount} GT`,
          price: `${usdtAmount} USDT`,
          paymentMethod: 'USDT Balance',
          status: 'Complete',
          txHash
        },
        ...purchaseHistory
      ]);
      
      // Refresh balances
      await refreshBalances(account);
      
      return txHash;
    } catch (error) {
      console.error('Error purchasing GT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Stake GT tokens for a match
  const stakeGT = async (amount, matchId) => {
    setIsLoading(true);
    try {
      // If creating a new match
      if (matchId === 'New Match') {
        const newMatchId = await createMatch(amount);
        await refreshBalances(account);
        return newMatchId;
      } 
      // If joining an existing match
      else {
        await joinMatch(matchId);
        await refreshBalances(account);
        return matchId;
      }
    } catch (error) {
      console.error('Error staking GT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add GT tokens (for testing)
  const addGT = async (amount) => {
    // This is just a mock function for the frontend
    // In a real app, tokens would be received from the blockchain
    setGtBalance((parseFloat(gtBalance) + parseFloat(amount)).toString());
  };

  // Submit match result
  const submitResult = async (matchId, winner) => {
    setIsLoading(true);
    try {
      await submitMatchResult(matchId, winner);
      await refreshBalances(account);
    } catch (error) {
      console.error('Error submitting result:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for account changes
  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        refreshBalances(accounts[0]);
      } else {
        setAccount('');
        setIsConnected(false);
        setGtBalance('0');
        setUsdtBalance('0');
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  // Check if wallet is already connected on load
  useEffect(() => {
    const checkConnection = async () => {
      const { ethereum } = window;
      if (!ethereum) return;

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        // Get network information
        const provider = new ethers.providers.Web3Provider(ethereum);
        const network = await provider.getNetwork();
        setNetworkName(network.name);
        
        // Load balances
        await refreshBalances(accounts[0]);
      }
    };

    checkConnection();
  }, []);

  // Context value
  const value = {
    account,
    isConnected,
    networkName,
    gtBalance,
    usdtBalance,
    purchaseHistory,
    matchHistory,
    error,
    isLoading,
    connectWallet,
    refreshBalances,
    purchaseGT,
    stakeGT,
    addGT,
    submitResult
  };

  return (
    <BlockchainWalletContext.Provider value={value}>
      {children}
    </BlockchainWalletContext.Provider>
  );
}