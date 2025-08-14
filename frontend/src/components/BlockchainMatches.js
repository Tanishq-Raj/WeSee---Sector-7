const React = require('react');
const { useState, useEffect } = React;
const { useNavigate } = require('react-router-dom');
const { ethers } = require('ethers');
const { useWallet } = require('../context/WalletContext');
const BlockchainTicTacToeMatch = require('./BlockchainTicTacToeMatch');
const { 
  getAvailableMatches, 
  getUserMatches, 
  createMatch, 
  joinMatch, 
  getGameTokenBalance 
} = require('../blockchain-integration');
require('../pages/Matches.css');

function BlockchainMatches() {
  const navigate = useNavigate();
  const { gtBalance, stakeGT, addGT } = useWallet();
  
  // Blockchain state
  const [account, setAccount] = useState('');
  const [availableMatches, setAvailableMatches] = useState([]);
  const [userMatches, setUserMatches] = useState([]);
  const [actualGtBalance, setActualGtBalance] = useState('0');
  
  // UI state
  const [joinedMatches, setJoinedMatches] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(5);
  const [selectedGame, setSelectedGame] = useState('');
  const [currentMatch, setCurrentMatch] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [matchIdToJoin, setMatchIdToJoin] = useState('');

  useEffect(() => {
    const getAccount = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) {
          setMessage({ text: 'Please install MetaMask!', type: 'error' });
          return;
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setMessage({ text: 'Please connect your wallet', type: 'error' });
        }
      } catch (error) {
        console.error('Error getting account:', error);
        setMessage({ text: `Error connecting wallet: ${error.message}`, type: 'error' });
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
    if (!account) return;
    
    setIsLoading(true);
    try {
      // Get GT balance from blockchain
      const balance = await getGameTokenBalance(account);
      setActualGtBalance(balance);
      
      // Get available matches
      const available = await getAvailableMatches();
      setAvailableMatches(available);
      
      // Get user's matches
      const userMatchList = await getUserMatches(account);
      setUserMatches(userMatchList);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setMessage({ text: `Error loading blockchain data: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!account) {
      setMessage({ text: 'Please connect your wallet first', type: 'error' });
      return;
    }
    
    if (parseFloat(actualGtBalance) < stakeAmount) {
      setMessage({ text: 'Insufficient GT balance to create this match', type: 'error' });
      return;
    }
    
    setIsCreating(true);
    try {
      // Create match on blockchain
      const matchId = await createMatch(stakeAmount);
      
      // Set current match data and navigate to game
      setCurrentMatch({
        id: matchId,
        stakeAmount: stakeAmount,
        gameType: 'Tic Tac Toe'
      });
      setSelectedGame('TicTacToe');
      setShowModal(false);
      
      setMessage({ text: `Successfully created match #${matchId}. Staked ${stakeAmount} GT tokens.`, type: 'success' });
    } catch (error) {
      console.error('Error creating match:', error);
      setMessage({ text: `Error creating match: ${error.message}`, type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMatch = async (matchId, stakeAmount) => {
    if (!account) {
      setMessage({ text: 'Please connect your wallet first', type: 'error' });
      return;
    }
    
    if (parseFloat(actualGtBalance) < stakeAmount) {
      setMessage({ text: 'Insufficient GT balance to join this match', type: 'error' });
      return;
    }
    
    setIsJoining(true);
    try {
      // Join match on blockchain
      await joinMatch(matchId);
      
      setJoinedMatches([...joinedMatches, matchId]);
      
      // Set current match data and navigate to game
      setCurrentMatch({
        id: matchId,
        stakeAmount: stakeAmount,
        gameType: 'Tic Tac Toe'
      });
      setSelectedGame('TicTacToe');
      
      setMessage({ text: `Successfully joined match #${matchId}. Staked ${stakeAmount} GT tokens.`, type: 'success' });
    } catch (error) {
      console.error('Error joining match:', error);
      setMessage({ text: `Error joining match: ${error.message}`, type: 'error' });
    } finally {
      setIsJoining(false);
    }
  };

  const handleMatchComplete = async (matchId, result) => {
    // Add the match to history
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const newMatch = {
      date: formattedDate,
      game: currentMatch?.gameType || 'Tic Tac Toe',
      opponent: 'Player 2',
      result: result === 'draw' ? 'Draw' : (result === 'X' ? 'Win' : 'Loss'),
      reward: result === 'draw' ? '0 GT' : (result === 'X' ? `${currentMatch?.stakeAmount * 2} GT` : '0 GT')
    };
    
    setMatchHistory([newMatch, ...matchHistory]);
    
    // Reset the game selection
    setSelectedGame('');
    setCurrentMatch(null);
    
    // Refresh blockchain data
    await loadBlockchainData();
  };

  // Message display component
  const messageDisplay = message.text ? (
    <div
      className={`message-popup ${message.type}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '10px 20px',
        borderRadius: '4px',
        backgroundColor: message.type === 'success' ? '#4CAF50' : '#f44336',
        color: 'white',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}
    >
      {message.text}
    </div>
  ) : null;

  // Modal component for creating a match
  const modalComponent = showModal ? (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '300px'
        }}
      >
        <h3>Create New Match</h3>
        <p>Stake Amount (GT)</p>
        <input
          type="number"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(Number(e.target.value))}
          min={1}
          max={actualGtBalance}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => setShowModal(false)}
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateMatch}
            disabled={isCreating}
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#6e8efb',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {isCreating ? 'Creating...' : 'Create Match'}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // Render based on selected game
  if (selectedGame === 'TicTacToe' && currentMatch) {
    return (
      <BlockchainTicTacToeMatch
        match={currentMatch}
        onMatchComplete={handleMatchComplete}
      />
    );
  }
  
  return (
    <div className="matches-container">
      {messageDisplay}
      {modalComponent}
      {/* Header section */}
      <div className="matches-header">
        <h1>TriX Gaming Matches</h1>
        <p className="subtitle">View and join PvP matches</p>
        <div style={{ marginTop: '20px' }}>
          <p>Connected Account: {account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Not connected'}</p>
          <p>GT Balance: {actualGtBalance} GT</p>
          <button 
            className="button"
            onClick={() => setShowModal(true)}
            disabled={!account}
          >
            Create New Match
          </button>
        </div>
      </div>
      
      {/* Matches list section */}
      <div className="matches-section">
        <h2><span style={{ marginRight: '8px' }}>🎮</span>Available Matches</h2>
        <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
          <table className="matches-table">
            <thead>
              <tr>
                <th>Match ID</th>
                <th>Game</th>
                <th>Stakes</th>
                <th>Creator</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>Loading matches...</td>
                </tr>
              ) : availableMatches.length > 0 ? (
                availableMatches.map(match => (
                  <tr key={match.id}>
                    <td>{match.id}</td>
                    <td>Tic Tac Toe</td>
                    <td>{match.stakeAmount} GT</td>
                    <td>{`${match.creator.substring(0, 6)}...${match.creator.substring(38)}`}</td>
                    <td className="status-open">Open</td>
                    <td>
                      <button 
                        className="button" 
                        onClick={() => handleJoinMatch(match.id, match.stakeAmount)}
                        disabled={isJoining || match.creator.toLowerCase() === account.toLowerCase()}
                      >
                        {isJoining ? 'Joining...' : 'Join Match'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No available matches found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* User's matches section */}
      <div className="matches-section">
        <h2><span style={{ marginRight: '8px' }}>🏆</span>Your Matches</h2>
        <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
          <table className="matches-table">
            <thead>
              <tr>
                <th>Match ID</th>
                <th>Game</th>
                <th>Stakes</th>
                <th>Opponent</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>Loading your matches...</td>
                </tr>
              ) : userMatches.length > 0 ? (
                userMatches.map(match => (
                  <tr key={match.id}>
                    <td>{match.id}</td>
                    <td>Tic Tac Toe</td>
                    <td>{match.stakeAmount} GT</td>
                    <td>
                      {match.opponent !== ethers.constants.AddressZero 
                        ? `${match.opponent.substring(0, 6)}...${match.opponent.substring(38)}` 
                        : 'Waiting for opponent'}
                    </td>
                    <td className={match.status === 0 ? 'status-open' : match.status === 1 ? 'status-full' : 'status-completed'}>
                      {match.status === 0 ? 'Open' : match.status === 1 ? 'In Progress' : 'Completed'}
                    </td>
                    <td>
                      {match.status === 0 && (
                        <button className="button" disabled>Waiting</button>
                      )}
                      {match.status === 1 && (
                        <button 
                          className="button"
                          onClick={() => {
                            setCurrentMatch({
                              id: match.id,
                              stakeAmount: match.stakeAmount,
                              gameType: 'Tic Tac Toe'
                            });
                            setSelectedGame('TicTacToe');
                          }}
                        >
                          Play
                        </button>
                      )}
                      {match.status === 2 && (
                        <button className="button" disabled>Completed</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>You haven't created or joined any matches yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Match history section */}
      <div className="matches-section">
        <h2><span style={{ marginRight: '8px' }}>📜</span>Your Match History</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="matches-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Game</th>
                <th>Opponent</th>
                <th>Result</th>
                <th>Reward</th>
              </tr>
            </thead>
            <tbody>
              {matchHistory.length > 0 ? 
                matchHistory.map((match, index) => (
                  <tr key={`history-${index}`}>
                    <td>{match.date}</td>
                    <td>{match.game}</td>
                    <td>{match.opponent}</td>
                    <td className={`result-${match.result.toLowerCase()}`}>{match.result}</td>
                    <td>{match.reward}</td>
                  </tr>
                )) : 
                // Default history if no matches played yet
                [
                  <tr key="default-1">
                    <td>2023-06-15</td>
                    <td>Crypto Clash</td>
                    <td>Player B</td>
                    <td className="result-win">Win</td>
                    <td>10 GT</td>
                  </tr>,
                  <tr key="default-2">
                    <td>2023-06-14</td>
                    <td>Token Tactics</td>
                    <td>Player C</td>
                    <td className="result-win">Win</td>
                    <td>20 GT</td>
                  </tr>,
                  <tr key="default-3">
                    <td>2023-06-12</td>
                    <td>Blockchain Battle</td>
                    <td>Player D</td>
                    <td className="result-loss">Loss</td>
                    <td>0 GT</td>
                  </tr>
                ]
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

module.exports = BlockchainMatches;