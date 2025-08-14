import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import GameTokenABI from '../contracts/GameToken.json';
import PlayGameABI from '../contracts/PlayGame.json';

const GameMatches = () => {
  const [account, setAccount] = useState('');
  const [gameTokenBalance, setGameTokenBalance] = useState('0');
  const [stakeAmount, setStakeAmount] = useState('');
  const [matchIdToJoin, setMatchIdToJoin] = useState('');
  const [availableMatches, setAvailableMatches] = useState([]);
  const [userMatches, setUserMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const gameTokenAddress = process.env.REACT_APP_GAME_TOKEN_ADDRESS || '';
  const playGameAddress = process.env.REACT_APP_PLAY_GAME_ADDRESS || '';

  useEffect(() => {
    const getAccount = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) return;

        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error getting account:', error);
      }
    };

    getAccount();
  }, []);

  useEffect(() => {
    if (account) {
      loadBlockchainData();
    }
  }, [account]);

  const loadBlockchainData = async () => {
    if (!account || !gameTokenAddress || !playGameAddress) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError('Please install MetaMask!');
        setIsLoading(false);
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      
      // Create contract instances
      const gameToken = new ethers.Contract(
        gameTokenAddress,
        GameTokenABI.abi,
        provider
      );
      
      const playGame = new ethers.Contract(
        playGameAddress,
        PlayGameABI.abi,
        provider
      );

      // Get token balance
      const balance = await gameToken.balanceOf(account);
      setGameTokenBalance(ethers.utils.formatUnits(balance, 18));

      // Load matches
      await loadMatches(playGame, provider);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setError('Error loading blockchain data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMatches = async (playGame, provider) => {
    try {
      const matchCount = await playGame.matchCount();
      const availableMatchesArray = [];
      const userMatchesArray = [];
      
      // Check the last 20 matches (or fewer if there aren't that many)
      const startIdx = Math.max(1, matchCount.toNumber() - 19);
      const endIdx = matchCount.toNumber();
      
      for (let i = startIdx; i <= endIdx; i++) {
        const match = await playGame.getMatch(i);
        const matchData = {
          id: i,
          creator: match.creator,
          opponent: match.opponent,
          stakeAmount: ethers.utils.formatUnits(match.stakeAmount, 18),
          status: match.status,
          winner: match.winner
        };
        
        // Status: 0 = CREATED, 1 = ACTIVE, 2 = COMPLETED, 3 = CANCELLED
        
        // Add to available matches if it's in CREATED status and not created by current user
        if (match.status === 0 && match.creator.toLowerCase() !== account.toLowerCase()) {
          availableMatchesArray.push(matchData);
        }
        
        // Add to user matches if user is creator or opponent
        if (match.creator.toLowerCase() === account.toLowerCase() || 
            match.opponent.toLowerCase() === account.toLowerCase()) {
          userMatchesArray.push(matchData);
        }
      }
      
      setAvailableMatches(availableMatchesArray);
      setUserMatches(userMatchesArray);
    } catch (error) {
      console.error('Error loading matches:', error);
      throw error;
    }
  };

  const createMatch = async () => {
    if (!stakeAmount || isNaN(stakeAmount) || parseFloat(stakeAmount) <= 0) {
      setError('Please enter a valid stake amount');
      return;
    }

    if (parseFloat(stakeAmount) > parseFloat(gameTokenBalance)) {
      setError('Insufficient Game Token balance');
      return;
    }

    setError('');
    setSuccess('');
    setIsCreating(true);

    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError('Please install MetaMask!');
        setIsCreating(false);
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      // Create contract instances with signer
      const gameToken = new ethers.Contract(
        gameTokenAddress,
        GameTokenABI.abi,
        signer
      );
      
      const playGame = new ethers.Contract(
        playGameAddress,
        PlayGameABI.abi,
        signer
      );

      // Convert stake amount to wei
      const stakeAmountWei = ethers.utils.parseUnits(stakeAmount, 18);

      // First approve PlayGame to spend Game Tokens
      console.log(`Approving ${stakeAmount} GT for staking...`);
      const approveTx = await gameToken.approve(playGameAddress, stakeAmountWei);
      await approveTx.wait();
      console.log('Approval successful');

      // Then create match
      console.log(`Creating match with ${stakeAmount} GT stake...`);
      const createTx = await playGame.createMatch(stakeAmountWei);
      const receipt = await createTx.wait();
      
      // Find the MatchCreated event to get the matchId
      const matchCreatedEvent = receipt.events.find(event => event.event === 'MatchCreated');
      const matchId = matchCreatedEvent.args.matchId.toString();
      
      setSuccess(`Successfully created match #${matchId} with ${stakeAmount} GT stake!`);
      console.log('Match creation successful');
      
      // Clear input field and reload data
      setStakeAmount('');
      await loadBlockchainData();
    } catch (error) {
      console.error('Error creating match:', error);
      setError(`Error creating match: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const joinMatch = async (matchId) => {
    if (!matchId) {
      setError('Please enter a valid match ID');
      return;
    }

    setError('');
    setSuccess('');
    setIsJoining(true);

    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError('Please install MetaMask!');
        setIsJoining(false);
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      // Create contract instances with signer
      const gameToken = new ethers.Contract(
        gameTokenAddress,
        GameTokenABI.abi,
        signer
      );
      
      const playGame = new ethers.Contract(
        playGameAddress,
        PlayGameABI.abi,
        signer
      );

      // Get match details to check stake amount
      const match = await playGame.getMatch(matchId);
      const stakeAmountWei = match.stakeAmount;
      const stakeAmountFormatted = ethers.utils.formatUnits(stakeAmountWei, 18);

      // Check if user has enough balance
      const balance = await gameToken.balanceOf(account);
      if (balance.lt(stakeAmountWei)) {
        setError(`Insufficient balance. You need ${stakeAmountFormatted} GT to join this match.`);
        setIsJoining(false);
        return;
      }

      // First approve PlayGame to spend Game Tokens
      console.log(`Approving ${stakeAmountFormatted} GT for staking...`);
      const approveTx = await gameToken.approve(playGameAddress, stakeAmountWei);
      await approveTx.wait();
      console.log('Approval successful');

      // Then join match
      console.log(`Joining match #${matchId}...`);
      const joinTx = await playGame.joinMatch(matchId);
      await joinTx.wait();
      
      setSuccess(`Successfully joined match #${matchId} with ${stakeAmountFormatted} GT stake!`);
      console.log('Match joining successful');
      
      // Clear input field and reload data
      setMatchIdToJoin('');
      await loadBlockchainData();
    } catch (error) {
      console.error('Error joining match:', error);
      setError(`Error joining match: ${error.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  const cancelMatch = async (matchId) => {
    setError('');
    setSuccess('');

    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError('Please install MetaMask!');
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      // Create PlayGame contract instance with signer
      const playGame = new ethers.Contract(
        playGameAddress,
        PlayGameABI.abi,
        signer
      );

      // Cancel match
      console.log(`Cancelling match #${matchId}...`);
      const cancelTx = await playGame.cancelMatch(matchId);
      await cancelTx.wait();
      
      setSuccess(`Successfully cancelled match #${matchId}!`);
      console.log('Match cancellation successful');
      
      // Reload data
      await loadBlockchainData();
    } catch (error) {
      console.error('Error cancelling match:', error);
      setError(`Error cancelling match: ${error.message}`);
    }
  };

  const getStatusText = (status) => {
    switch (parseInt(status)) {
      case 0: return 'Created';
      case 1: return 'Active';
      case 2: return 'Completed';
      case 3: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const refreshData = () => {
    loadBlockchainData();
  };

  return (
    <div className="game-matches">
      <h2>Game Matches</h2>
      
      <div className="user-info">
        <p><strong>Game Token Balance:</strong> {gameTokenBalance} GT</p>
        <button onClick={refreshData} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="create-match">
        <h3>Create a New Match</h3>
        <div className="form-group">
          <label htmlFor="stakeAmount">Stake Amount (GT):</label>
          <input
            type="number"
            id="stakeAmount"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Enter stake amount"
            disabled={isCreating}
          />
        </div>
        <button 
          onClick={createMatch} 
          disabled={isCreating || !account || !stakeAmount}
        >
          {isCreating ? 'Creating...' : 'Create Match'}
        </button>
      </div>

      <div className="join-match">
        <h3>Join a Match</h3>
        <div className="form-group">
          <label htmlFor="matchIdToJoin">Match ID:</label>
          <input
            type="number"
            id="matchIdToJoin"
            value={matchIdToJoin}
            onChange={(e) => setMatchIdToJoin(e.target.value)}
            placeholder="Enter match ID"
            disabled={isJoining}
          />
        </div>
        <button 
          onClick={() => joinMatch(matchIdToJoin)} 
          disabled={isJoining || !account || !matchIdToJoin}
        >
          {isJoining ? 'Joining...' : 'Join Match'}
        </button>
      </div>

      <div className="available-matches">
        <h3>Available Matches</h3>
        {availableMatches.length === 0 ? (
          <p>No available matches found</p>
        ) : (
          <ul>
            {availableMatches.map(match => (
              <li key={match.id}>
                Match #{match.id} - Stake: {match.stakeAmount} GT - 
                Creator: {match.creator.substring(0, 6)}...{match.creator.substring(38)}
                <button 
                  onClick={() => joinMatch(match.id)}
                  disabled={isJoining}
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="user-matches">
        <h3>Your Matches</h3>
        {userMatches.length === 0 ? (
          <p>You haven't created or joined any matches yet</p>
        ) : (
          <ul>
            {userMatches.map(match => (
              <li key={match.id}>
                Match #{match.id} - Stake: {match.stakeAmount} GT - 
                Status: {getStatusText(match.status)}
                {match.status === 0 && match.creator.toLowerCase() === account.toLowerCase() && (
                  <button onClick={() => cancelMatch(match.id)}>Cancel</button>
                )}
                {match.status === 2 && (
                  <span className="winner">
                    Winner: {match.winner.substring(0, 6)}...{match.winner.substring(38)}
                    {match.winner.toLowerCase() === account.toLowerCase() && ' (You)'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="instructions">
        <h3>How to Play:</h3>
        <ol>
          <li><strong>Create a Match:</strong> Enter a stake amount and click "Create Match"</li>
          <li><strong>Join a Match:</strong> Enter a match ID or select from available matches</li>
          <li><strong>Play the Game:</strong> Once matched, play the game through the TriX platform</li>
          <li><strong>Results:</strong> Match results will be submitted by the platform and winners will receive their rewards automatically</li>
        </ol>
        <p><strong>Note:</strong> Make sure you have enough Game Tokens for the stake amount.</p>
      </div>
    </div>
  );
};

export default GameMatches;