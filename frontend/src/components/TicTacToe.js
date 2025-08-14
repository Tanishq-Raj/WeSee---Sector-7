const React = require('react');
const { useState, useEffect } = React;
const { useWallet } = require('../context/WalletContext');
require('./TicTacToe.css');

function TicTacToe({ matchId, stakeAmount, onGameEnd }) {
  // Game state
  const [cells, setCells] = useState(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [gameStatus, setGameStatus] = useState(''); // For displaying game status
  const [gameOver, setGameOver] = useState(false);
  const [stats, setStats] = useState({ X: 0, O: 0, D: 0 });
  const { addGT } = useWallet();

  // Win combinations
  const winCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  // Initialize game
  useEffect(() => {
    setGameStatus(`${currentPlayer}'s turn`);
  }, [currentPlayer]);

  // Handle cell click
  const handleCellClick = (index) => {
    // If cell is already filled or game is over, do nothing
    if (cells[index] !== '' || gameOver) {
      return;
    }

    // Update cell
    const newCells = [...cells];
    newCells[index] = currentPlayer;
    setCells(newCells);

    // Check for winner
    checkWinner(newCells);
  };

  // Check for winner
  const checkWinner = (currentCells) => {
    let roundWon = false;

    // Check all win combinations
    for (let i = 0; i < winCombinations.length; i++) {
      const [a, b, c] = winCombinations[i];
      if (
        currentCells[a] &&
        currentCells[a] === currentCells[b] &&
        currentCells[b] === currentCells[c]
      ) {
        roundWon = true;
        break;
      }
    }

    // If there's a winner
    if (roundWon) {
      setWinner(currentPlayer);
      setGameStatus(`${currentPlayer} wins!`);
      setGameOver(true);
      setStats(prev => ({
        ...prev,
        [currentPlayer]: prev[currentPlayer] + 1
      }));
      
      // Call onGameEnd with the winner
      if (onGameEnd) {
        onGameEnd(currentPlayer);
        
        // Add reward to winner (in a real app, this would be handled by the backend)
        addGT(stakeAmount * 2);
      }
      return;
    }

    // Check for draw
    if (!currentCells.includes('')) {
      setGameStatus('Draw!');
      setGameOver(true);
      setStats(prev => ({
        ...prev,
        D: prev.D + 1
      }));
      
      // Call onGameEnd with draw result
      if (onGameEnd) {
        onGameEnd('draw');
      }
      return;
    }

    // Switch player
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  // Restart game
  const restartGame = () => {
    setCells(Array(9).fill(''));
    setCurrentPlayer('X');
    setWinner(null);
    setGameStatus(`X's turn`);
    setGameOver(false);
  };

  return React.createElement(
    'div',
    { className: 'tictactoe-container' },
    // Game info
    React.createElement(
      'div',
      { className: 'game-info' },
      React.createElement('h2', null, 'Tic Tac Toe'),
      React.createElement('p', null, `Match ID: ${matchId || 'Practice'}`),
      React.createElement('p', null, `Stake: ${stakeAmount || 0} GT`),
      React.createElement('p', { className: 'game-status' }, gameStatus)
    ),
    // Player stats
    React.createElement(
      'div',
      { className: 'player-cards' },
      React.createElement(
        'div',
        { className: 'player-card' },
        React.createElement('p', null, 'X wins:'),
        React.createElement('p', { className: 'x-win-count' }, stats.X)
      ),
      React.createElement(
        'div',
        { className: 'player-card' },
        React.createElement('p', null, 'Draws:'),
        React.createElement('p', { className: 'draw-count' }, stats.D)
      ),
      React.createElement(
        'div',
        { className: 'player-card' },
        React.createElement('p', null, 'O wins:'),
        React.createElement('p', { className: 'o-win-count' }, stats.O)
      )
    ),
    // Game board
    React.createElement(
      'div',
      { id: 'cellContainer', className: 'cell-container' },
      cells.map((cell, index) => 
        React.createElement(
          'div',
          { 
            key: index,
            className: `cell ${winner && cells[index] === winner ? 'win' : ''} ${gameOver && !winner ? 'draw' : ''}`,
            onClick: () => handleCellClick(index)
          },
          cell === 'X' ? 
            React.createElement('span', { className: 'cross' }, 'X') : 
            cell === 'O' ? 
              React.createElement('span', { className: 'circle' }, 'O') : 
              ''
        )
      )
    ),
    // Restart button
    React.createElement(
      'button',
      { 
        id: 'restartBtn', 
        className: 'restart-button',
        onClick: restartGame
      },
      'Restart'
    )
  );
}

module.exports = TicTacToe;