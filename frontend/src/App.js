const React = require('react');
const { Routes, Route, Link } = require('react-router-dom');
const Logo = require('./components/Logo');
const Footer = require('./components/Footer');
const Card = require('./components/Card');
const Hero = require('./components/Hero');
const { WalletProvider } = require('./context/WalletContext');
require('./App.css');

// Import pages
const Dashboard = require('./pages/Dashboard');
const Matches = require('./pages/Matches');
const Wallet = require('./pages/Wallet');
const BuyGT = require('./pages/BuyGT');
const TicTacToeMatch = require('./components/TicTacToeMatch');

// Import blockchain components
const BlockchainStatus = require('./components/BlockchainStatus');
const BlockchainMatches = require('./components/BlockchainMatches');
const BlockchainTicTacToeMatch = require('./components/BlockchainTicTacToeMatch');

function App() {
  return React.createElement(
    WalletProvider,
    null,
    React.createElement(
      'div',
      { className: 'App' },
    React.createElement(
      'header',
      { className: 'App-header' },
      React.createElement(
        'div', 
        { style: { display: 'flex', alignItems: 'center' } },
        React.createElement(Logo, null),
        React.createElement('h1', { style: { marginLeft: '10px' } }, 'WeSee')
      ),
      React.createElement(
        'div',
        { className: 'nav-links' },
        React.createElement(Link, { to: '/', className: 'nav-button' }, 'Dashboard'),
        React.createElement(Link, { to: '/matches', className: 'nav-button' }, 'Matches'),
        React.createElement(Link, { to: '/wallet', className: 'nav-button' }, 'Wallet'),
        React.createElement(Link, { to: '/buy-gt', className: 'nav-button' }, 'Buy GT'),
        React.createElement('button', { className: 'button' }, 'Sign In')
      )
    ),
    React.createElement(
      'main',
      { className: 'App-main' },
      React.createElement(
        Routes,
        null,
        React.createElement(Route, { 
          path: '/', 
          element: React.createElement(Dashboard, null)
        }),
        React.createElement(Route, {
          path: '/matches',
          element: React.createElement(Matches, null)
        }),
        React.createElement(Route, {
          path: '/wallet',
          element: React.createElement(Wallet, null)
        }),
        React.createElement(Route, {
          path: '/buy-gt',
          element: React.createElement(BuyGT, null)
        }),
        React.createElement(Route, {
          path: '/blockchain',
          element: React.createElement(Dashboard, null)
        }),
        React.createElement(Route, {
          path: '/match/:id',
          element: React.createElement(BlockchainTicTacToeMatch, null)
        }),
        React.createElement(Route, {
          path: '/home',
          element: React.createElement(
            'div',
            null,
            React.createElement(Hero, null),
            React.createElement('h2', { style: { marginBottom: '2rem', textAlign: 'left' } }, 'Discover what you love'),
            React.createElement(
              'div',
              { className: 'grid-container' },
              // Card 1
              React.createElement(Card, {
                title: 'Nature Exploration',
                description: 'Discover beautiful landscapes and natural wonders around the world.',
                buttonText: 'Explore'
              }),
              // Card 2
              React.createElement(Card, {
                title: 'Urban Adventures',
                description: 'Experience the vibrant life of cities and urban environments.',
                buttonText: 'Discover'
              }),
              // Card 3
              React.createElement(Card, {
                title: 'Cultural Experiences',
                description: 'Immerse yourself in diverse cultures and traditions from across the globe.',
                buttonText: 'Learn More'
              })
            )
          ) 
        })
      )
    ),
    React.createElement(Footer, null)
    )
  );
}

module.exports = { default: App };