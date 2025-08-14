const React = require('react');
const { useState, useEffect } = React;
const { useNavigate } = require('react-router-dom');
const { ethers } = require('ethers');
const { useWallet } = require('../context/WalletContext');
const TicTacToe = require('./TicTacToe');
const PlayGameABI = require('../contracts/PlayGame.json');
const GameTokenABI = require('../contracts/GameToken.json');
const { getMatchDetails, submitMatchResult } = require('../blockchain-integration');

function BlockchainTicTacToeMatch({ match, onMatchComplete }) {
  const navigate = useNavigate();
  const { gtBalance } = useWallet();
  const [message, setMessage] = useState({ text: '', type: '' });
  const [matchDetails, setMatchDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [account, setAccount] = useState('');
  
  const playGameAddress = process.env.REACT_APP_PLAY_GAME_ADDRESS || '';
  const gameTokenAddress = process.env.REACT_APP_GAME_TOKEN_ADDRESS || '';

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
    // Load match details from blockchain if we have a match ID
    if (match?.id && account) {
      loadMatchDetails();
    }
  }, [match?.id, account]);

  const loadMatchDetails = async () => {
    try {
      // Get match details from blockchain
      const details = await getMatchDetails(match.id);
      setMatchDetails(details);
    } catch (error) {
      console.error('Error loading match details:', error);
      setMessage({
        text: `Error loading match details: ${error.message}`,
        type: 'error'
      });
    }
  };

  // Handle game end
  const handleGameEnd = async (result) => {
    if (!match?.id) {
      // Handle practice game (no blockchain interaction)
      setMessage({ 
        text: result === 'draw' 
          ? 'Game ended in a draw!' 
          : `Player ${result} wins the match!`, 
        type: 'success' 
      });
      
      // Call the onMatchComplete callback
      if (onMatchComplete) {
        onMatchComplete(match?.id || 'practice', result);
      }
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
        navigate('/matches');
      }, 5000);
      return;
    }
    
    // Handle blockchain match
    setIsSubmitting(true);
    try {
      // Determine winner address
      let winnerAddress = null;
      if (result === 'draw') {
        // In case of draw, no winner
        winnerAddress = ethers.constants.AddressZero;
      } else if (result === 'X') {
        // Assuming player X is the match creator
        winnerAddress = matchDetails?.creator || account;
      } else {
        // Assuming player O is the opponent
        winnerAddress = matchDetails?.opponent || ethers.constants.AddressZero;
      }
      
      // Submit match result to blockchain
      await submitMatchResult(match.id, winnerAddress);
      
      setMessage({ 
        text: result === 'draw' 
          ? 'Game ended in a draw! Result submitted to blockchain.' 
          : `Player ${result} wins the match! Result submitted to blockchain.`, 
        type: 'success' 
      });
      
      // Call the onMatchComplete callback
      if (onMatchComplete) {
        onMatchComplete(match.id, result);
      }
    } catch (error) {
      console.error('Error submitting match result:', error);
      setMessage({
        text: `Error submitting match result: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
        navigate('/matches');
      }, 5000);
    }
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
  
  return (
    <div className="match-container">
      {messageDisplay}
      <div className="match-details">
        <h2>Match Details</h2>
        <p>Match ID: {match?.id || 'Practice'}</p>
        <p>Stake: {match?.stakeAmount || 0} GT</p>
        <p>Your Balance: {gtBalance} GT</p>
        {matchDetails && (
          <>
            <p>Creator: {matchDetails.creator.substring(0, 6)}...{matchDetails.creator.substring(38)}</p>
            {matchDetails.opponent !== ethers.constants.AddressZero && (
              <p>Opponent: {matchDetails.opponent.substring(0, 6)}...{matchDetails.opponent.substring(38)}</p>
            )}
            <p>Status: {matchDetails.status === 0 ? 'Open' : matchDetails.status === 1 ? 'In Progress' : 'Completed'}</p>
          </>
        )}
        <button 
          className="button"
          onClick={() => navigate('/matches')}
        >
          Back to Matches
        </button>
      </div>
      <TicTacToe
        matchId={match?.id}
        stakeAmount={match?.stakeAmount || 0}
        onGameEnd={handleGameEnd}
      />
    </div>
  );
}

module.exports = BlockchainTicTacToeMatch;