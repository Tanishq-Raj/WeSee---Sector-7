import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import BlockchainStatus from './components/BlockchainStatus';
import TokenPurchase from './components/TokenPurchase';
import GameMatches from './components/GameMatches';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>TriX Gaming Platform</h1>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/blockchain">Blockchain Status</Link>
              </li>
              <li>
                <Link to="/tokens">Purchase Tokens</Link>
              </li>
              <li>
                <Link to="/matches">Game Matches</Link>
              </li>
            </ul>
          </nav>
        </header>

        <main>
          <Switch>
            <Route path="/blockchain">
              <BlockchainStatus />
            </Route>
            <Route path="/tokens">
              <TokenPurchase />
            </Route>
            <Route path="/matches">
              <GameMatches />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </main>

        <footer>
          <p>&copy; {new Date().getFullYear()} TriX Gaming Platform. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="home">
      <h2>Welcome to TriX Gaming Platform</h2>
      <p>A decentralized gaming platform powered by blockchain technology</p>
      
      <div className="features">
        <div className="feature">
          <h3>Game Tokens</h3>
          <p>Purchase Game Tokens (GT) using USDT at a 1:1 rate</p>
          <Link to="/tokens" className="btn">Buy Tokens</Link>
        </div>
        
        <div className="feature">
          <h3>Play Matches</h3>
          <p>Create or join matches and stake your tokens</p>
          <Link to="/matches" className="btn">Play Now</Link>
        </div>
        
        <div className="feature">
          <h3>Blockchain Status</h3>
          <p>Check your account balance and verify contracts</p>
          <Link to="/blockchain" className="btn">View Status</Link>
        </div>
      </div>
      
      <div className="blockchain-info">
        <h3>Blockchain Integration</h3>
        <p>TriX Gaming Platform is built on Ethereum blockchain technology, providing:</p>
        <ul>
          <li>Secure token transactions</li>
          <li>Transparent match results</li>
          <li>Fair reward distribution</li>
          <li>Immutable game history</li>
        </ul>
      </div>
    </div>
  );
}

export default App;