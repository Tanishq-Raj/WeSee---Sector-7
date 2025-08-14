const React = require('react');
const { useNavigate } = require('react-router-dom');
const { useState, useEffect } = React;
const { ethers } = require('ethers');
const { useWallet } = require('../context/WalletContext');
const TicTacToeMatch = require('../components/TicTacToeMatch');
const BlockchainTicTacToeMatch = require('../components/BlockchainTicTacToeMatch');
const { 
  getAvailableMatches, 
  getUserMatches, 
  createMatch, 
  joinMatch, 
  getGameTokenBalance 
} = require('../blockchain-integration');
require('./Matches.css');

function Matches() {
  const navigate = useNavigate();
  const { gtBalance, stakeGT } = useWallet();
  
  // Sample state for match joining functionality
  const [joinedMatches, setJoinedMatches] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' }); // For success/error messages
  const [showModal, setShowModal] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(5);
  const [selectedGame, setSelectedGame] = useState(''); // For tracking which game is selected
  const [currentMatch, setCurrentMatch] = useState(null); // For storing current match data
  const [matchHistory, setMatchHistory] = useState([]); // For storing match history
  
  // Blockchain state
  const [account, setAccount] = useState('');
  const [availableMatches, setAvailableMatches] = useState([]);
  const [userMatches, setUserMatches] = useState([]);
  const [actualGtBalance, setActualGtBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [useBlockchain, setUseBlockchain] = useState(false);
  
  // Connect to blockchain wallet
  useEffect(() => {
    const getAccount = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) return;

        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setUseBlockchain(true);
        }
      } catch (error) {
        console.error('Error getting account:', error);
      }
    };

    getAccount();
  }, []);

  // Load blockchain data when account is connected
  useEffect(() => {
    if (account) {
      loadBlockchainData();
    }
  }, [account]);

  // Load blockchain match data
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
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle joining a match (works with both mock and blockchain)
  const handleJoinMatch = async (gameId, stakeAmount) => {
    try {
      if (useBlockchain && typeof gameId === 'number') {
        // Blockchain match joining
        if (!account) {
          setMessage({ text: 'Please connect your wallet first', type: 'error' });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
          return;
        }
        
        if (parseFloat(actualGtBalance) < stakeAmount) {
          setMessage({ text: 'Insufficient GT balance to join this match', type: 'error' });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
          return;
        }
        
        setIsJoining(true);
        try {
          // Join match on blockchain
          await joinMatch(gameId);
          
          setJoinedMatches([...joinedMatches, gameId]);
          
          // Set current match data and navigate to game
          setCurrentMatch({
            id: gameId,
            stakeAmount: stakeAmount,
            gameType: 'Tic Tac Toe',
            blockchain: true
          });
          setSelectedGame('BlockchainTicTacToe');
          
          setMessage({ text: `Successfully joined match #${gameId}. Staked ${stakeAmount} GT tokens.`, type: 'success' });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } catch (error) {
          console.error('Error joining match:', error);
          setMessage({ text: `Error joining match: ${error.message}`, type: 'error' });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } finally {
          setIsJoining(false);
        }
      } else {
        // Mock match joining
        if (gtBalance < stakeAmount) {
          setMessage({ text: 'Insufficient GT balance to join this match', type: 'error' });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
          return;
        }
        
        // Stake GT tokens using the wallet context
        stakeGT(stakeAmount, gameId);
        setJoinedMatches([...joinedMatches, gameId]);
        
        // Set current match data and navigate to game if it's Tic Tac Toe
        if (gameId === 'Tic Tac Toe') {
          setCurrentMatch({
            id: `TicTacToe-${Date.now()}`,
            stakeAmount: stakeAmount,
            gameType: 'Tic Tac Toe',
            blockchain: false
          });
          setSelectedGame('TicTacToe');
        } else {
          setMessage({ text: `Successfully joined match for ${gameId}. Staked ${stakeAmount} GT tokens.`, type: 'success' });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        }
      }
    } catch (error) {
      setMessage({ text: `Error joining match: ${error.message}`, type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };
  // Handle creating a new match (works with both mock and blockchain)
  const handleCreateMatch = async () => {
    try {
      if (useBlockchain) {
        // Blockchain match creation
        if (!account) {
          setMessage({ text: 'Please connect your wallet first', type: 'error' });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
          return;
        }
        
        if (parseFloat(actualGtBalance) < stakeAmount) {
          setMessage({ text: 'Insufficient GT balance to create this match', type: 'error' });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
          return;
        }
        
        setIsCreating(true);
        try {
          // Create match on blockchain
          const { matchId } = await createMatch(stakeAmount.toString());
          
          // Set current match data and navigate to game
          setCurrentMatch({
            id: matchId,
            stakeAmount: stakeAmount,
            gameType: 'Tic Tac Toe',
            blockchain: true
          });
          setSelectedGame('BlockchainTicTacToe');
          setShowModal(false);
          
          setMessage({ text: `Successfully created match #${matchId}. Staked ${stakeAmount} GT tokens.`, type: 'success' });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } catch (error) {
          console.error('Error creating match:', error);
          setMessage({ text: `Error creating match: ${error.message}`, type: 'error' });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } finally {
          setIsCreating(false);
        }
      } else {
        // Mock match creation
        if (gtBalance < stakeAmount) {
          setMessage({ text: 'Insufficient GT balance to create this match', type: 'error' });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
          return;
        }
        
        // Stake GT tokens using the wallet context
        stakeGT(stakeAmount, 'New Match');
        
        // Create a new Tic Tac Toe match
        setCurrentMatch({
          id: `TicTacToe-${Date.now()}`,
          stakeAmount: stakeAmount,
          gameType: 'Tic Tac Toe',
          blockchain: false
        });
        setSelectedGame('TicTacToe');
        setShowModal(false);
      }
    } catch (error) {
      setMessage({ text: `Error creating match: ${error.message}`, type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };
  
  // Handle match completion
  const handleMatchComplete = (matchId, result) => {
    // In a real app, this would make an API call to update the match result
    setMessage({ 
      text: result === 'draw' 
        ? `Match ${matchId} ended in a draw!` 
        : `Match ${matchId} completed. Player ${result} wins!`, 
      type: 'success' 
    });
    
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
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
  };

  // Message display component
  const messageDisplay = message.text ? React.createElement(
    'div',
    { 
      className: `message-popup ${message.type}`,
      style: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '10px 20px',
        borderRadius: '4px',
        backgroundColor: message.type === 'success' ? '#4CAF50' : '#f44336',
        color: 'white',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }
    },
    message.text
  ) : null;
  
  // Modal component for creating a new match
  const modalComponent = showModal ? React.createElement(
    'div',
    {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001
      }
    },
    React.createElement(
      'div',
      {
        style: {
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '400px',
          maxWidth: '90%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }
      },
      React.createElement('h2', { style: { marginTop: 0 } }, 'Create New Match'),
      React.createElement('p', null, 'Enter the amount of GT tokens you wish to stake:'),
      React.createElement('input', {
        type: 'number',
        value: stakeAmount,
        onChange: (e) => setStakeAmount(Number(e.target.value)),
        min: 1,
        max: gtBalance,
        style: {
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }
      }),
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } },
        React.createElement('button', {
          onClick: () => setShowModal(false),
          style: {
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer'
          }
        }, 'Cancel'),
        React.createElement('button', {
          onClick: handleCreateMatch,
          style: {
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#6e8efb',
            color: 'white',
            cursor: 'pointer'
          }
        }, 'Create Match')
      )
    )
  ) : null;

  // Render based on selected game
  if (selectedGame === 'TicTacToe' && currentMatch && !currentMatch.blockchain) {
    return React.createElement(TicTacToeMatch, {
      match: currentMatch,
      onMatchComplete: handleMatchComplete
    });
  } else if (selectedGame === 'BlockchainTicTacToe' && currentMatch && currentMatch.blockchain) {
    return React.createElement(BlockchainTicTacToeMatch, {
      match: currentMatch,
      onMatchComplete: handleMatchComplete
    });
  }
  
  return React.createElement(
    'div',
    { className: 'matches-container' },
    messageDisplay,
    modalComponent,
    // Header section
    React.createElement(
      'div',
      { className: 'matches-header' },
      React.createElement('h1', null, 'TriX Gaming Matches'),
      React.createElement('p', { className: 'subtitle' }, 'View and join PvP matches')
    ),
    // Matches list section
    React.createElement(
      'div',
      { className: 'matches-section' },
      React.createElement('h2', null, React.createElement('span', { style: { marginRight: '8px' } }, '🎮'), 'Available Matches'),
      React.createElement(
        'div',
        { className: 'blockchain-toggle' },
        React.createElement(
          'button',
          { 
            className: `toggle-button ${useBlockchain ? 'active' : ''}`,
            onClick: () => {
              setUseBlockchain(true);
              if (account) loadBlockchainData();
            }
          },
          'Blockchain Matches'
        ),
        React.createElement(
          'button',
          { 
            className: `toggle-button ${!useBlockchain ? 'active' : ''}`,
            onClick: () => setUseBlockchain(false)
          },
          'Mock Matches'
        )
      ),
      React.createElement(
        'div',
        { style: { overflowX: 'auto', marginBottom: '1rem' } },
        React.createElement(
          'table',
          { className: 'matches-table' },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              null,
              useBlockchain ? React.createElement('th', null, 'Match ID') : null,
              React.createElement('th', null, 'Game'),
              React.createElement('th', null, 'Stakes'),
              useBlockchain ? React.createElement('th', null, 'Creator') : React.createElement('th', null, 'Players'),
              React.createElement('th', null, 'Status'),
              React.createElement('th', null, 'Action')
            )
          ),
          React.createElement(
            'tbody',
            null,
            useBlockchain ? (
              isLoading ? (
                React.createElement(
                  'tr',
                  null,
                  React.createElement('td', { colSpan: '6', style: { textAlign: 'center' } }, 'Loading matches...')
                )
              ) : availableMatches.length > 0 ? (
                availableMatches.map(match => (
                  React.createElement(
                    'tr',
                    { key: match.id },
                    React.createElement('td', null, match.id),
                    React.createElement('td', null, 'Tic Tac Toe'),
                    React.createElement('td', null, `${match.stakeAmount} GT`),
                    React.createElement('td', null, `${match.creator.substring(0, 6)}...${match.creator.substring(38)}`),
                    React.createElement('td', { className: 'status-open' }, 'Open'),
                    React.createElement('td', null, 
                      React.createElement('button', { 
                        className: 'button', 
                        onClick: () => handleJoinMatch(match.id, parseFloat(match.stakeAmount)),
                        disabled: isJoining || match.creator.toLowerCase() === account.toLowerCase()
                      }, 
                      isJoining ? 'Joining...' : 'Join Match')
                    )
                  )
                ))
              ) : (
                React.createElement(
                  'tr',
                  null,
                  React.createElement('td', { colSpan: '6', style: { textAlign: 'center' } }, 'No available matches found')
                )
              )
            ) : (
              // Mock matches
              [
                React.createElement(
                  'tr',
                  { key: 'mock-1' },
                  React.createElement('td', null, 'Tic Tac Toe'),
                  React.createElement('td', null, '5 GT'),
                  React.createElement('td', null, '1/2'),
                  React.createElement('td', { className: 'status-open' }, 'Open'),
                  React.createElement('td', null, React.createElement('button', { className: 'button', onClick: () => handleJoinMatch('Tic Tac Toe', 5) }, 'Join Match'))
                ),
                React.createElement(
                  'tr',
                  { key: 'mock-2' },
                  React.createElement('td', null, 'Crypto Clash'),
                  React.createElement('td', null, '5 GT'),
                  React.createElement('td', null, '1/2'),
                  React.createElement('td', { className: 'status-open' }, 'Open'),
                  React.createElement('td', null, React.createElement('button', { className: 'button', onClick: () => handleJoinMatch('Crypto Clash', 5) }, 'Join Match'))
                ),
                React.createElement(
                  'tr',
                  { key: 'mock-3' },
                  React.createElement('td', null, 'Token Tactics'),
                  React.createElement('td', null, '10 GT'),
                  React.createElement('td', null, '1/2'),
                  React.createElement('td', { className: 'status-open' }, 'Open'),
                  React.createElement('td', null, React.createElement('button', { className: 'button', onClick: () => handleJoinMatch('Token Tactics', 10) }, 'Join Match'))
                ),
                React.createElement(
                  'tr',
                  { key: 'mock-4' },
                  React.createElement('td', null, 'Blockchain Battle'),
                  React.createElement('td', null, '15 GT'),
                  React.createElement('td', null, '2/2'),
                  React.createElement('td', { className: 'status-full' }, 'Full'),
                  React.createElement('td', null, React.createElement('button', { className: 'button', disabled: true }, 'Full'))
                )
              ]
            )
          )
        )
      ),
      React.createElement('div', { style: { textAlign: 'center', marginTop: '1.5rem' } },
        React.createElement('button', { 
          className: 'button', 
          style: { 
            padding: '0.8rem 1.5rem',
            width: '220px'
          },
          onClick: () => setShowModal(true),
          disabled: useBlockchain && !account
        }, isCreating ? 'Creating...' : 'Create New Match')
      )
    ),
    // User's matches section (when using blockchain)
    useBlockchain ? React.createElement(
      'div',
      { className: 'matches-section' },
      React.createElement('h2', null, React.createElement('span', { style: { marginRight: '8px' } }, '🏆'), 'Your Matches'),
      React.createElement(
        'div',
        { style: { overflowX: 'auto', marginBottom: '1rem' } },
        React.createElement(
          'table',
          { className: 'matches-table' },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              null,
              React.createElement('th', null, 'Match ID'),
              React.createElement('th', null, 'Game'),
              React.createElement('th', null, 'Stakes'),
              React.createElement('th', null, 'Opponent'),
              React.createElement('th', null, 'Status'),
              React.createElement('th', null, 'Action')
            )
          ),
          React.createElement(
            'tbody',
            null,
            isLoading ? (
              React.createElement(
                'tr',
                null,
                React.createElement('td', { colSpan: '6', style: { textAlign: 'center' } }, 'Loading your matches...')
              )
            ) : userMatches.length > 0 ? (
              userMatches.map(match => (
                React.createElement(
                  'tr',
                  { key: match.id },
                  React.createElement('td', null, match.id),
                  React.createElement('td', null, 'Tic Tac Toe'),
                  React.createElement('td', null, `${match.stakeAmount} GT`),
                  React.createElement('td', null,
                    match.opponent !== ethers.constants.AddressZero 
                      ? `${match.opponent.substring(0, 6)}...${match.opponent.substring(38)}` 
                      : 'Waiting for opponent'
                  ),
                  React.createElement('td', { className: match.status === 0 ? 'status-open' : match.status === 1 ? 'status-full' : 'status-completed' },
                    match.status === 0 ? 'Open' : match.status === 1 ? 'In Progress' : 'Completed'
                  ),
                  React.createElement('td', null,
                    match.status === 0 && (
                      React.createElement('button', { className: 'button', disabled: true }, 'Waiting')
                    ),
                    match.status === 1 && (
                      React.createElement('button', { 
                        className: 'button',
                        onClick: () => {
                          setCurrentMatch({
                            id: match.id,
                            stakeAmount: parseFloat(match.stakeAmount),
                            gameType: 'Tic Tac Toe',
                            blockchain: true
                          });
                          setSelectedGame('BlockchainTicTacToe');
                        }
                      }, 'Play')
                    ),
                    match.status === 2 && (
                      React.createElement('button', { className: 'button', disabled: true }, 'Completed')
                    )
                  )
                )
              ))
            ) : (
              React.createElement(
                'tr',
                null,
                React.createElement('td', { colSpan: '6', style: { textAlign: 'center' } }, 'You have not created or joined any matches yet')
              )
            )
          )
        )
      )
    ) : null,
    
    // Match history section
    React.createElement(
      'div',
      { className: 'match-history-section' },
      React.createElement('h2', null, React.createElement('span', { style: { marginRight: '8px' } }, '📜'), 'Your Match History'),
      React.createElement(
        'div',
        { style: { overflowX: 'auto', marginBottom: '1rem' } },
        React.createElement(
          'table',
          { className: 'matches-table' },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              null,
              React.createElement('th', null, 'Date'),
              React.createElement('th', null, 'Game'),
              React.createElement('th', null, 'Opponent'),
              React.createElement('th', null, 'Result'),
              React.createElement('th', null, 'Reward')
            )
          ),
          React.createElement(
            'tbody',
            null,
            // Map through match history and render each match
            matchHistory.length > 0 ? 
              matchHistory.map((match, index) => 
                React.createElement(
                  'tr',
                  { key: index },
                  React.createElement('td', null, match.date),
                  React.createElement('td', null, match.game),
                  React.createElement('td', null, match.opponent),
                  React.createElement('td', { className: `result-${match.result.toLowerCase()}` }, match.result),
                  React.createElement('td', null, match.reward)
                )
              ) : 
              // Default history if no matches played yet
              [
                React.createElement(
                  'tr',
                  { key: 'default-1' },
                  React.createElement('td', null, '2023-06-15'),
                  React.createElement('td', null, 'Crypto Clash'),
                  React.createElement('td', null, 'Player B'),
                  React.createElement('td', { className: 'result-win' }, 'Win'),
                  React.createElement('td', null, '10 GT')
                ),
                React.createElement(
                  'tr',
                  { key: 'default-2' },
                  React.createElement('td', null, '2023-06-14'),
                  React.createElement('td', null, 'Token Tactics'),
                  React.createElement('td', null, 'Player C'),
                  React.createElement('td', { className: 'result-win' }, 'Win'),
                  React.createElement('td', null, '20 GT')
                ),
                React.createElement(
                  'tr',
                  { key: 'default-3' },
                  React.createElement('td', null, '2023-06-12'),
                  React.createElement('td', null, 'Blockchain Battle'),
                  React.createElement('td', null, 'Player D'),
                  React.createElement('td', { className: 'result-loss' }, 'Loss'),
                  React.createElement('td', null, '0 GT')
                )
              ]
          )
        )
      )
    )
  );
}

module.exports = Matches;