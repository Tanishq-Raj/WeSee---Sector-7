const React = require('react');
const { useState, useEffect } = React;
const { useNavigate } = require('react-router-dom');
const { useWallet } = require('../context/WalletContext');
const TicTacToe = require('./TicTacToe');

function TicTacToeMatch({ match, onMatchComplete }) {
  const navigate = useNavigate();
  const { gtBalance } = useWallet();
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Handle game end
  const handleGameEnd = (result) => {
    // In a real app, this would make an API call to submit the match result
    setMessage({ 
      text: result === 'draw' 
        ? 'Game ended in a draw!' 
        : `Player ${result} wins the match!`, 
      type: 'success' 
    });
    
    // Call the onMatchComplete callback
    if (onMatchComplete) {
      onMatchComplete(match.id, result);
    }
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage({ text: '', type: '' });
      navigate('/matches');
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
  
  return React.createElement(
    'div',
    { className: 'match-container' },
    messageDisplay,
    React.createElement(
      'div',
      { className: 'match-details' },
      React.createElement('h2', null, 'Match Details'),
      React.createElement('p', null, `Match ID: ${match?.id || 'Practice'}`),
      React.createElement('p', null, `Stake: ${match?.stakeAmount || 0} GT`),
      React.createElement('p', null, `Your Balance: ${gtBalance} GT`),
      React.createElement('button', { 
        className: 'button',
        onClick: () => navigate('/matches')
      }, 'Back to Matches')
    ),
    React.createElement(TicTacToe, {
      matchId: match?.id,
      stakeAmount: match?.stakeAmount || 0,
      onGameEnd: handleGameEnd
    })
  );
}

module.exports = TicTacToeMatch;