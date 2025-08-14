const React = require('react');
const { useState, useEffect } = require('react');
const { useNavigate } = require('react-router-dom');
const { useWallet } = require('../context/WalletContext');
require('./Dashboard.css');

function Dashboard() {
  // Get wallet data from context
  const { purchaseHistory, gtBalance, usdtBalance, setGtBalance, setUsdtBalance } = useWallet();
  // State for wallet connection
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [error, setError] = useState('');
  // Use context values directly instead of local state
  const blockchainGtBalance = gtBalance;
  const blockchainUsdtBalance = usdtBalance;
  
  const tokenRate = { gt: 1, usdt: 1.00 };
  const navigate = useNavigate();
  const recentMatches = [
    { id: 'M12345', playerA: '0x1234...', playerB: '0x5678...', stake: 1, winner: '0x1234...', date: '2023-07-15' },
    { id: 'M12346', playerA: '0x1234...', playerB: '0x9876...', stake: 2, winner: '0x9876...', date: '2023-07-14' },
    { id: 'M12347', playerA: '0x5432...', playerB: '0x1234...', stake: 5, winner: '0x5432...', date: '2023-07-13' },
  ];
  
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
        const networkId = await ethereum.request({ method: 'eth_chainId' });
        const networkNames = {
          '0x1': 'Ethereum Mainnet',
          '0x3': 'Ropsten Testnet',
          '0x4': 'Rinkeby Testnet',
          '0x5': 'Goerli Testnet',
          '0x2a': 'Kovan Testnet',
          '0x89': 'Polygon Mainnet',
          '0x13881': 'Mumbai Testnet'
        };
        setNetworkName(networkNames[networkId] || `Chain ID: ${parseInt(networkId, 16)}`);
        
        // Note: We're now using the context values directly, no need to update them here
        // The WalletContext is already managing the balances
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
      const networkId = await ethereum.request({ method: 'eth_chainId' });
      const networkNames = {
        '0x1': 'Ethereum Mainnet',
        '0x3': 'Ropsten Testnet',
        '0x4': 'Rinkeby Testnet',
        '0x5': 'Goerli Testnet',
        '0x2a': 'Kovan Testnet',
        '0x89': 'Polygon Mainnet',
        '0x13881': 'Mumbai Testnet'
      };
      setNetworkName(networkNames[networkId] || `Chain ID: ${parseInt(networkId, 16)}`);
      
      // Note: We're now using the context values directly, no need to update them here
      // The WalletContext is already managing the balances
    } catch (error) {
      console.error(error);
      setError('Error connecting to wallet');
    }
  };

  // Mock function for loading contract data - using static values instead of blockchain calls
  const loadContractData = async (account, provider) => {
    try {
      // Using mock data instead of actual blockchain calls
      console.log('Using mock data for wallet balances');
      
      // Note: We're now using the context values directly, no need to update them here
      // The WalletContext is already managing the balances
    } catch (error) {
      console.error('Error loading mock data:', error);
      setError('Error loading wallet data');
    }
  };
  
  return React.createElement(
    'div',
    { className: 'dashboard-container', style: { backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' } },
    // Header section
    React.createElement(
      'div',
      { className: 'dashboard-header', style: { background: 'linear-gradient(135deg, #2c3e50, #4a69bd)', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' } },
      React.createElement('h1', { style: { fontSize: '2.8rem', fontWeight: 'bold', marginBottom: '1rem', color: '#ffffff', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' } }, 'TriX Gaming Dashboard'),
      React.createElement('p', { className: 'subtitle', style: { fontSize: '1.3rem', marginBottom: '1.5rem', color: 'rgba(255, 255, 255, 0.9)' } }, 'Blockchain-based PvP Gaming Incentive System'),
      error && React.createElement('div', { className: 'error-message', style: { backgroundColor: 'rgba(231, 76, 60, 0.2)', border: '1px solid rgba(231, 76, 60, 0.5)', padding: '12px', borderRadius: '8px' } }, error),
      !isConnected ? 
        React.createElement('button', { 
          className: 'button', 
          style: { 
            marginTop: '1.5rem', 
            width: '220px', 
            padding: '1rem 1.5rem',
            fontSize: '1.1rem',
            borderRadius: '30px',
            fontWeight: 'bold',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)',
            transition: 'all 0.3s ease'
          },
          onClick: connectWallet
        }, '🔗 Connect Wallet') :
        React.createElement('div', { className: 'wallet-connected', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '12px', backdropFilter: 'blur(5px)' } },
          React.createElement('p', { className: 'account-info', style: { fontSize: '1.1rem', padding: '12px 20px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '30px', color: 'white', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' } }, 
            React.createElement('span', { style: { fontWeight: 'bold', marginRight: '8px' } }, 'Connected:'),
            React.createElement('span', { className: 'account-address', style: { fontSize: '1.2rem', color: '#3498db', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '4px 8px', borderRadius: '6px' } }, 
              `${account.substring(0, 6)}...${account.substring(38)}`
            ),
            React.createElement('span', { style: { margin: '0 8px', color: 'rgba(255, 255, 255, 0.8)' } }, 'on'),
            React.createElement('span', { className: 'network-name', style: { fontSize: '1.1rem', color: '#2ecc71', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '4px 8px', borderRadius: '6px' } }, networkName)
          ),
          React.createElement('div', { className: 'metamask-balance', style: { backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginTop: '5px', width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center' } },
              React.createElement('img', { src: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg', alt: 'MetaMask', style: { height: '28px', marginRight: '10px', verticalAlign: 'middle' } }),
              React.createElement('span', { style: { fontWeight: 'bold', color: '#E2761B', fontSize: '1.1rem' } }, 'MetaMask Balance:')
            ),
            React.createElement('div', { style: { fontWeight: 'bold', fontSize: '1.2rem', color: '#2c3e50' } }, `${blockchainUsdtBalance} USDT / ${blockchainGtBalance} GT`)
          )
        )
    ),
    
    // Stats overview
    React.createElement(
      'div',
      { className: 'stats-grid', style: { gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.8rem' } },
      // Token info card
      React.createElement(
        'div',
        { className: 'stat-card', style: { background: 'white', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)', borderRadius: '16px', border: 'none' } },
        React.createElement('h2', { style: { fontSize: '1.6rem', color: '#2c3e50', display: 'flex', alignItems: 'center', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px', marginBottom: '15px' } }, 
          React.createElement('span', { style: { marginRight: '12px', fontSize: '1.8rem', backgroundColor: '#f1f2f6', padding: '8px', borderRadius: '12px' } }, '💰'), 
          'Game Token (GT)'
        ),
        React.createElement('div', { className: 'token-rate', style: { marginTop: '15px', backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '12px', textAlign: 'center', boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.05)' } }, 
          React.createElement('span', { className: 'rate-value', style: { fontSize: '1.4rem', fontWeight: 'bold', color: '#1565c0' } }, '1 GT = $1.00 USDT')
        ),
        React.createElement('div', { style: { flex: 1, margin: '20px 0' } }),
        React.createElement('button', { className: 'button', style: { width: '100%', padding: '14px', fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#1565c0', color: 'white', border: 'none', borderRadius: '10px', boxShadow: '0 4px 10px rgba(21, 101, 192, 0.3)', transition: 'all 0.3s ease' }, onClick: () => navigate('/buy-gt') }, '💲 Purchase Tokens')
      ),
      
      // Wallet balance card
      React.createElement(
        'div',
        { className: 'stat-card', style: { background: 'white', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)', borderRadius: '16px', border: 'none' } },
        React.createElement('h2', { style: { fontSize: '1.6rem', color: '#2c3e50', display: 'flex', alignItems: 'center', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px', marginBottom: '15px' } }, 
          React.createElement('span', { style: { marginRight: '12px', fontSize: '1.8rem', backgroundColor: '#f1f2f6', padding: '8px', borderRadius: '12px' } }, '👛'), 
          'Your Wallet'
        ),
        React.createElement('div', { className: 'balance-info', style: { marginTop: '15px', padding: '5px' } },
          React.createElement('div', { className: 'balance-item', style: { display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '10px', marginBottom: '12px', boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.03)' } },
            React.createElement('span', { className: 'balance-label', style: { fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' } }, 'GT Balance:'),
            React.createElement('span', { className: 'balance-value', style: { fontSize: '1.3rem', color: '#2e7d32', fontWeight: 'bold' } }, `${blockchainGtBalance} GT`)
          ),
          React.createElement('div', { className: 'balance-item', style: { display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '10px', marginBottom: '12px', boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.03)' } },
            React.createElement('span', { className: 'balance-label', style: { fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' } }, 'USDT Balance:'),
            React.createElement('span', { className: 'balance-value', style: { fontSize: '1.3rem', color: '#1565c0', fontWeight: 'bold' } }, `${blockchainUsdtBalance} USDT`)
          ),
          isConnected && React.createElement('div', { className: 'balance-item', style: { textAlign: 'center', marginTop: '12px', fontSize: '0.95rem', color: '#2c3e50', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '8px' } },
            React.createElement('span', null, '✓ Blockchain balances synced with MetaMask')
          )
        ),
        React.createElement('div', { style: { flex: 1 } }),
        React.createElement('button', { className: 'button secondary', style: { width: '100%', marginTop: '1rem', padding: '14px', fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#4a69bd', color: 'white', border: 'none', borderRadius: '10px', boxShadow: '0 4px 10px rgba(74, 105, 189, 0.3)', transition: 'all 0.3s ease' }, onClick: () => navigate('/wallet') }, '📊 View Transactions')
      ),
      
      // Match stats card
      React.createElement(
        'div',
        { className: 'stat-card', style: { background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.18)' } },
        React.createElement('h2', { style: { fontSize: '1.6rem', color: '#2c3e50', display: 'flex', alignItems: 'center', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px', marginBottom: '15px' } }, 
          React.createElement('span', { style: { marginRight: '12px', fontSize: '1.8rem', backgroundColor: '#f1f2f6', padding: '8px', borderRadius: '12px' } }, '🏆'), 
          'Your Stats'
        ),
        React.createElement('div', { className: 'stats-info', style: { marginTop: '15px' } },
          React.createElement('div', { className: 'stats-item', style: { display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#fff8e1', borderRadius: '10px', marginBottom: '12px', boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.03)' } },
            React.createElement('span', { className: 'stats-label', style: { fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' } }, 'Matches Played:'),
            React.createElement('span', { className: 'stats-value', style: { fontSize: '1.3rem', color: '#ff9800', fontWeight: 'bold' } }, '42')
          ),
          React.createElement('div', { className: 'stats-item', style: { display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '10px', marginBottom: '12px', boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.03)' } },
            React.createElement('span', { className: 'stats-label', style: { fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' } }, 'Wins:'),
            React.createElement('span', { className: 'stats-value', style: { fontSize: '1.3rem', color: '#9c27b0', fontWeight: 'bold' } }, '28')
          ),
          React.createElement('div', { className: 'stats-item', style: { display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '10px', marginBottom: '12px', boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.03)' } },
            React.createElement('span', { className: 'stats-label', style: { fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' } }, 'Win Rate:'),
            React.createElement('span', { className: 'stats-value', style: { fontSize: '1.3rem', color: '#2e7d32', fontWeight: 'bold' } }, '67%')
          ),
          React.createElement('div', { className: 'stats-item', style: { display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '10px', marginBottom: '12px', boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.03)' } },
            React.createElement('span', { className: 'stats-label', style: { fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' } }, 'Total Earnings:'),
            React.createElement('span', { className: 'stats-value', style: { fontSize: '1.3rem', color: '#1565c0', fontWeight: 'bold' } }, '120 GT')
          )
        ),
        React.createElement('div', { style: { flex: 1 } }),
        React.createElement('button', { className: 'button secondary', style: { width: '100%', marginTop: '1rem', padding: '14px', fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '10px', boxShadow: '0 4px 10px rgba(255, 152, 0, 0.3)', transition: 'all 0.3s ease' }, onClick: () => navigate('/matches') }, '🎮 Play Matches')
      ),
      
      // Quick actions card
      React.createElement(
        'div',
        { className: 'stat-card', style: { background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.18)' } },
        React.createElement('h2', { style: { fontSize: '1.6rem', color: '#2c3e50', display: 'flex', alignItems: 'center', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px', marginBottom: '15px' } }, 
          React.createElement('span', { style: { marginRight: '12px', fontSize: '1.8rem', backgroundColor: '#f1f2f6', padding: '8px', borderRadius: '12px' } }, '⚡'), 
          'Quick Actions'
        ),
        React.createElement('div', { className: 'action-buttons', style: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' } },
          React.createElement('button', { className: 'button', style: { padding: '14px', fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '10px', boxShadow: '0 4px 10px rgba(255, 152, 0, 0.3)', transition: 'all 0.3s ease' }, onClick: () => navigate('/matches') }, '🎮 Start New Match'),
          React.createElement('button', { className: 'button secondary', style: { padding: '14px', fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#4a69bd', color: 'white', border: 'none', borderRadius: '10px', boxShadow: '0 4px 10px rgba(74, 105, 189, 0.3)', transition: 'all 0.3s ease' }, onClick: () => navigate('/matches') }, '📜 View Match History'),
          React.createElement('button', { className: 'button secondary', style: { padding: '14px', fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '10px', boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)', transition: 'all 0.3s ease' }, onClick: () => navigate('/wallet') }, '💸 Withdraw Tokens')
        )
      )
    ),
    
    // Transaction history section
    React.createElement(
      'div',
      { className: 'transaction-history-section', style: { background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.18)', padding: '25px', marginTop: '30px', maxWidth: '1400px', marginLeft: 'auto', marginRight: 'auto' } },
      React.createElement('h2', { style: { fontSize: '1.6rem', color: '#2c3e50', display: 'flex', alignItems: 'center', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px', marginBottom: '20px' } }, 
        React.createElement('span', { style: { marginRight: '12px', fontSize: '1.8rem', backgroundColor: '#f1f2f6', padding: '8px', borderRadius: '12px' } }, '💼'), 
        'Recent Transactions'
      ),
      React.createElement(
        'div',
        { className: 'transaction-table-container', style: { overflowX: 'auto', marginBottom: '1.5rem' } },
        React.createElement(
          'table',
          { className: 'matches-table', style: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' } },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              { style: { backgroundColor: '#f8f9fa', borderRadius: '10px' } },
              React.createElement('th', { style: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontWeight: 'bold', borderBottom: '2px solid #f1f2f6' } }, 'Date'),
              React.createElement('th', { style: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontWeight: 'bold', borderBottom: '2px solid #f1f2f6' } }, 'Type'),
              React.createElement('th', { style: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontWeight: 'bold', borderBottom: '2px solid #f1f2f6' } }, 'Amount'),
              React.createElement('th', { style: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontWeight: 'bold', borderBottom: '2px solid #f1f2f6' } }, 'Details'),
              React.createElement('th', { style: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontWeight: 'bold', borderBottom: '2px solid #f1f2f6' } }, 'Status')
            )
          ),
          React.createElement(
            'tbody',
            null,
            purchaseHistory.length > 0 ? purchaseHistory.map((transaction, index) => 
              React.createElement(
                'tr',
                { key: index, style: { backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' } },
                React.createElement('td', { style: { padding: '15px', borderRadius: index === 0 ? '10px 0 0 10px' : '0' } }, transaction.date),
                React.createElement('td', { style: { padding: '15px' } }, transaction.type || (transaction.paymentMethod ? 'Purchase' : 'Match Stake')),
                React.createElement('td', { style: { padding: '15px', fontWeight: 'bold', color: transaction.amount.includes('-') ? '#e74c3c' : '#2e7d32' } }, transaction.amount),
                React.createElement('td', { style: { padding: '15px' } }, transaction.matchId || transaction.paymentMethod || '-'),
                React.createElement('td', { style: { padding: '15px', color: transaction.status === 'Completed' ? '#2e7d32' : (transaction.status === 'Pending' ? '#f39c12' : '#e74c3c') } }, transaction.status)
              )
            ) : React.createElement(
              'tr',
              null,
              React.createElement('td', { colSpan: 5, style: { textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '10px', color: '#7f8c8d' } }, 'No transaction history available')
            )
          )
        )
      )
    ),
    
    // Recent matches section
    React.createElement(
      'div',
      { className: 'recent-matches-section', style: { background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.18)', padding: '25px', marginTop: '30px', maxWidth: '1400px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '30px' } },
      React.createElement('h2', { style: { fontSize: '1.6rem', color: '#2c3e50', display: 'flex', alignItems: 'center', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px', marginBottom: '20px' } }, 
        React.createElement('span', { style: { marginRight: '12px', fontSize: '1.8rem', backgroundColor: '#f1f2f6', padding: '8px', borderRadius: '12px' } }, '🎮'), 
        'Recent Matches'
      ),
      React.createElement(
        'div',
        { className: 'matches-table-container', style: { overflowX: 'auto', marginBottom: '1rem' } },
        React.createElement(
          'table',
          { className: 'matches-table', style: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' } },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              { style: { backgroundColor: '#f8f9fa', borderRadius: '10px' } },
              React.createElement('th', { style: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontWeight: 'bold', borderBottom: '2px solid #f1f2f6' } }, 'Match ID'),
              React.createElement('th', { style: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontWeight: 'bold', borderBottom: '2px solid #f1f2f6' } }, 'Player A'),
              React.createElement('th', { style: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontWeight: 'bold', borderBottom: '2px solid #f1f2f6' } }, 'Player B'),
              React.createElement('th', { style: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontWeight: 'bold', borderBottom: '2px solid #f1f2f6' } }, 'Stake (GT)'),
              React.createElement('th', { style: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontWeight: 'bold', borderBottom: '2px solid #f1f2f6' } }, 'Winner'),
              React.createElement('th', { style: { padding: '15px', textAlign: 'left', color: '#2c3e50', fontWeight: 'bold', borderBottom: '2px solid #f1f2f6' } }, 'Date')
            )
          ),
          React.createElement(
            'tbody',
            null,
            recentMatches.length > 0 ? recentMatches.map((match, index) => 
              React.createElement(
                'tr',
                { key: index, style: { backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' } },
                React.createElement('td', { style: { padding: '15px', borderRadius: index === 0 ? '10px 0 0 10px' : '0' } }, match.id),
                React.createElement('td', { style: { padding: '15px' } }, match.playerA),
                React.createElement('td', { style: { padding: '15px' } }, match.playerB),
                React.createElement('td', { style: { padding: '15px', fontWeight: 'bold', color: '#1565c0' } }, match.stake),
                React.createElement('td', { style: { padding: '15px' } }, match.winner === match.playerA ? 
                  React.createElement('span', { style: { color: '#6e8efb', fontWeight: 'bold' } }, match.winner) : 
                  React.createElement('span', { style: { color: '#a777e3', fontWeight: 'bold' } }, match.winner)
                ),
                React.createElement('td', { style: { padding: '15px' } }, match.date)
              )
            ) : React.createElement(
              'tr',
              null,
              React.createElement('td', { colSpan: 6, style: { textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '10px', color: '#7f8c8d' } }, 'No recent matches available')
            )
          )
        )
      ),
      React.createElement('div', { style: { textAlign: 'center' } },
        React.createElement('button', { 
          className: 'button secondary', 
          style: { 
            marginTop: '0.5rem',
            padding: '0.8rem 1.5rem',
            width: '220px',
            backgroundColor: '#a777e3',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(167, 119, 227, 0.2)',
            transition: 'all 0.2s ease'
          },
          onClick: () => navigate('/matches')
        }, 'View All Matches')
      )
    ),
    
    // System overview section
    React.createElement(
      'div',
      { className: 'system-overview-section', style: { background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.18)', padding: '25px', marginTop: '30px', maxWidth: '1400px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '30px' } },
      React.createElement('h2', { style: { fontSize: '1.6rem', color: '#2c3e50', display: 'flex', alignItems: 'center', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px', marginBottom: '20px' } }, 
        React.createElement('span', { style: { marginRight: '12px', fontSize: '1.8rem', backgroundColor: '#f1f2f6', padding: '8px', borderRadius: '12px' } }, '⚙️'), 
        'System Overview'
      ),
      React.createElement(
        'div',
        { className: 'overview-cards', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '15px' } },
        // TokenStore card
        React.createElement(
          'div',
          { className: 'overview-card', style: { cursor: 'pointer', transition: 'transform 0.2s', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', border: '1px solid rgba(255, 255, 255, 0.2)' }, onClick: () => alert('TokenStore: Accepts USDT for GT purchases. The entry point for players to acquire game tokens.') },
          React.createElement('h3', { style: { fontSize: '1.3rem', color: '#2c3e50', marginBottom: '10px', display: 'flex', alignItems: 'center' } }, React.createElement('span', { style: { marginRight: '10px', color: '#6e8efb', fontSize: '1.5rem' } }, '💱'), 'TokenStore'),
          React.createElement('p', { style: { color: '#4a5568', fontSize: '0.95rem', marginBottom: '15px' } }, 'Accepts USDT for GT purchases. The entry point for players to acquire game tokens.'),
          React.createElement('div', { className: 'system-card-footer', style: { marginTop: 'auto' } },
            React.createElement('span', { className: 'status active', style: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' } }, '● Active')
          )
        ),
        // GameToken card
        React.createElement(
          'div',
          { className: 'overview-card', style: { cursor: 'pointer', transition: 'transform 0.2s', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', border: '1px solid rgba(255, 255, 255, 0.2)' }, onClick: () => alert('GameToken (GT): ERC-20 token representing the in-game stake currency. Minted only by TokenStore.') },
          React.createElement('h3', { style: { fontSize: '1.3rem', color: '#2c3e50', marginBottom: '10px', display: 'flex', alignItems: 'center' } }, React.createElement('span', { style: { marginRight: '10px', color: '#6e8efb', fontSize: '1.5rem' } }, '🪙'), 'GameToken (GT)'),
          React.createElement('p', { style: { color: '#4a5568', fontSize: '0.95rem', marginBottom: '15px' } }, 'ERC-20 token representing the in-game stake currency. Minted only by TokenStore.'),
          React.createElement('div', { className: 'system-card-footer', style: { marginTop: 'auto' } },
            React.createElement('span', { className: 'status active', style: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' } }, '● Active')
          )
        ),
        // PlayGame card
        React.createElement(
          'div',
          { className: 'overview-card', style: { cursor: 'pointer', transition: 'transform 0.2s', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', border: '1px solid rgba(255, 255, 255, 0.2)' }, onClick: () => alert('PlayGame: Escrows GT stakes for matches, processes results, and releases winnings to winners.') },
          React.createElement('h3', { style: { fontSize: '1.3rem', color: '#2c3e50', marginBottom: '10px', display: 'flex', alignItems: 'center' } }, React.createElement('span', { style: { marginRight: '10px', color: '#a777e3', fontSize: '1.5rem' } }, '🎲'), 'PlayGame'),
          React.createElement('p', { style: { color: '#4a5568', fontSize: '0.95rem', marginBottom: '15px' } }, 'Escrows GT stakes for matches, processes results, and releases winnings to winners.'),
          React.createElement('div', { className: 'system-card-footer', style: { marginTop: 'auto' } },
            React.createElement('span', { className: 'status active', style: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' } }, '● Active')
          )
        ),
        // API Gateway card
        React.createElement(
          'div',
          { className: 'overview-card', style: { cursor: 'pointer', transition: 'transform 0.2s', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', border: '1px solid rgba(255, 255, 255, 0.2)' }, onClick: () => alert('API Gateway: Off-chain interface between the game server and blockchain smart contracts.') },
          React.createElement('h3', { style: { fontSize: '1.3rem', color: '#2c3e50', marginBottom: '10px', display: 'flex', alignItems: 'center' } }, React.createElement('span', { style: { marginRight: '10px', color: '#4fc3f7', fontSize: '1.5rem' } }, '🔌'), 'API Gateway'),
          React.createElement('p', { style: { color: '#4a5568', fontSize: '0.95rem', marginBottom: '15px' } }, 'Off-chain interface between the game server and blockchain smart contracts.'),
          React.createElement('div', { className: 'system-card-footer', style: { marginTop: 'auto' } },
            React.createElement('span', { className: 'status active', style: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' } }, '● Active')
          )
        )
      ),
      React.createElement('div', { style: { textAlign: 'center', marginTop: '1.5rem' } },
        React.createElement('button', { 
          className: 'button', 
          style: { 
            padding: '0.8rem 1.5rem',
            width: '280px',
            backgroundColor: '#6e8efb',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(110, 142, 251, 0.2)',
            transition: 'all 0.2s ease'
          },
          onClick: () => window.open('https://example.com/trix-docs', '_blank')
        }, 'View Technical Documentation')
      )
    )
  );
}

module.exports = Dashboard;