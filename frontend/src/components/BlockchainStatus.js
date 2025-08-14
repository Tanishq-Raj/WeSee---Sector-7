const React = require('react');
const { useState, useEffect } = React;
const { ethers } = require('ethers');
const GameTokenABI = require('../contracts/GameToken.json');
const TokenStoreABI = require('../contracts/TokenStore.json');
const PlayGameABI = require('../contracts/PlayGame.json');

const BlockchainStatus = () => {
  const [account, setAccount] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [gameTokenBalance, setGameTokenBalance] = useState('0');
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [activeMatches, setActiveMatches] = useState([]);
  const [contractAddresses, setContractAddresses] = useState({
    gameToken: process.env.REACT_APP_GAME_TOKEN_ADDRESS || '',
    tokenStore: process.env.REACT_APP_TOKEN_STORE_ADDRESS || '',
    playGame: process.env.REACT_APP_PLAY_GAME_ADDRESS || '',
    usdt: process.env.REACT_APP_USDT_ADDRESS || ''
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setAccount(account);
        setIsConnected(true);
        
        // Get network information
        const provider = new ethers.providers.Web3Provider(ethereum);
        const network = await provider.getNetwork();
        setNetworkName(network.name);
        
        // Load contract data
        await loadContractData(account, provider);
      } else {
        setError('No authorized account found');
      }
    } catch (error) {
      console.error(error);
      setError('Error connecting to wallet');
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);
      setError('');
      
      // Get network information
      const provider = new ethers.providers.Web3Provider(ethereum);
      const network = await provider.getNetwork();
      setNetworkName(network.name);
      
      // Load contract data
      await loadContractData(accounts[0], provider);
    } catch (error) {
      console.error(error);
      setError('Error connecting to wallet');
    }
  };

  const loadContractData = async (account, provider) => {
    try {
      // Check if contract addresses are available
      if (!contractAddresses.gameToken || !contractAddresses.tokenStore || 
          !contractAddresses.playGame || !contractAddresses.usdt) {
        setError('Contract addresses not configured');
        return;
      }

      // Create contract instances
      const gameToken = new ethers.Contract(
        contractAddresses.gameToken,
        GameTokenABI.abi,
        provider
      );
      
      const tokenStore = new ethers.Contract(
        contractAddresses.tokenStore,
        TokenStoreABI.abi,
        provider
      );
      
      const playGame = new ethers.Contract(
        contractAddresses.playGame,
        PlayGameABI.abi,
        provider
      );
      
      const usdt = new ethers.Contract(
        contractAddresses.usdt,
        [
          // Minimal IERC20 ABI for balance checking
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)'
        ],
        provider
      );

      // Get token balances
      const gtBalance = await gameToken.balanceOf(account);
      const usdtBalanceRaw = await usdt.balanceOf(account);
      const usdtDecimals = await usdt.decimals();
      
      setGameTokenBalance(ethers.utils.formatUnits(gtBalance, 18));
      setUsdtBalance(ethers.utils.formatUnits(usdtBalanceRaw, usdtDecimals));

      // Get active matches
      await loadActiveMatches(playGame, account);
    } catch (error) {
      console.error('Error loading contract data:', error);
      setError('Error loading blockchain data');
    }
  };

  const loadActiveMatches = async (playGame, account) => {
    try {
      const matchCount = await playGame.matchCount();
      const matches = [];
      
      // Check the last 10 matches (or fewer if there aren't that many)
      const startIdx = Math.max(1, matchCount.toNumber() - 9);
      const endIdx = matchCount.toNumber();
      
      for (let i = startIdx; i <= endIdx; i++) {
        const match = await playGame.getMatch(i);
        
        // Only include matches that involve the current user and are active
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
      
      setActiveMatches(matches);
    } catch (error) {
      console.error('Error loading active matches:', error);
    }
  };

  const verifyContracts = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;
      
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      
      // Create contract instances with signer
      const gameToken = new ethers.Contract(
        contractAddresses.gameToken,
        GameTokenABI.abi,
        signer
      );
      
      const tokenStore = new ethers.Contract(
        contractAddresses.tokenStore,
        TokenStoreABI.abi,
        signer
      );
      
      const playGame = new ethers.Contract(
        contractAddresses.playGame,
        PlayGameABI.abi,
        signer
      );
      
      // Verify contract relationships
      const tokenStoreFromGameToken = await gameToken.tokenStore();
      const gameTokenFromTokenStore = await tokenStore.gameToken();
      const gameTokenFromPlayGame = await playGame.gameToken();
      
      const relationshipsValid = 
        tokenStoreFromGameToken.toLowerCase() === contractAddresses.tokenStore.toLowerCase() &&
        gameTokenFromTokenStore.toLowerCase() === contractAddresses.gameToken.toLowerCase() &&
        gameTokenFromPlayGame.toLowerCase() === contractAddresses.gameToken.toLowerCase();
      
      if (relationshipsValid) {
        alert('Contract verification successful! All contract relationships are valid.');
      } else {
        alert('Contract verification failed! Contract relationships are invalid.');
      }
    } catch (error) {
      console.error('Error verifying contracts:', error);
      alert(`Error verifying contracts: ${error.message}`);
    }
  };

  return (
    <div className="blockchain-status">
      <h2>Blockchain Status</h2>
      
      {error && <div className="error">{error}</div>}
      
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div className="blockchain-info">
          <p><strong>Account:</strong> {account}</p>
          <p><strong>Network:</strong> {networkName}</p>
          <p><strong>Game Token Balance:</strong> {gameTokenBalance} GT</p>
          <p><strong>USDT Balance:</strong> {usdtBalance} USDT</p>
          
          <div className="contract-verification">
            <h3>Contract Verification</h3>
            <p>Verify that the contracts are properly connected:</p>
            <button onClick={verifyContracts}>Verify Contracts</button>
          </div>
          
          {activeMatches.length > 0 && (
            <div className="active-matches">
              <h3>Your Active Matches</h3>
              <ul>
                {activeMatches.map(match => (
                  <li key={match.id}>
                    Match #{match.id} - Stake: {match.stakeAmount} GT
                    {match.isCreator 
                      ? ` (Waiting for opponent)`
                      : ` (You joined ${match.creator.substring(0, 6)}...${match.creator.substring(38)})`
                    }
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

module.exports = BlockchainStatus;