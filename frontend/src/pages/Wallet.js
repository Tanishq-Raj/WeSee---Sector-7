const React = require('react');
const { useNavigate } = require('react-router-dom');
const { useState } = React;
const { useWallet } = require('../context/WalletContext');
require('./Wallet.css');

function Wallet() {
  const navigate = useNavigate();
  
  // Get wallet data from context
  const { gtBalance, usdtBalance, setGtBalance, setUsdtBalance, purchaseHistory } = useWallet();
  
  const handleWithdraw = () => {
    const amount = prompt('Enter amount to withdraw:', '10');
    if (amount && Number(amount) > 0 && Number(amount) <= gtBalance) {
      alert(`Withdrawing ${amount} GT to your connected wallet...`);
      setGtBalance(gtBalance - Number(amount));
    } else if (amount) {
      alert('Invalid amount or insufficient balance');
    }
  };
  
  const handleSwap = () => {
    const amount = prompt('Enter GT amount to swap to USDT:', '10');
    if (amount && Number(amount) > 0 && Number(amount) <= gtBalance) {
      alert(`Swapping ${amount} GT to ${amount} USDT...`);
      setGtBalance(gtBalance - Number(amount));
      setUsdtBalance(usdtBalance + Number(amount));
    } else if (amount) {
      alert('Invalid amount or insufficient balance');
    }
  };
  
  const handleStake = () => {
    const amount = prompt('Enter GT amount to stake:', '10');
    if (amount && Number(amount) > 0 && Number(amount) <= gtBalance) {
      alert(`Staking ${amount} GT. Estimated rewards: ${Number(amount) * 0.05} GT per day.`);
      setGtBalance(gtBalance - Number(amount));
    } else if (amount) {
      alert('Invalid amount or insufficient balance');
    }
  };
  
  const handleClaim = () => {
    const rewardAmount = 5; // Sample reward amount
    alert(`Claiming ${rewardAmount} GT rewards...`);
    setGtBalance(gtBalance + rewardAmount);
  };
  return React.createElement(
    'div',
    { className: 'wallet-container' },
    // Header section
    React.createElement(
      'div',
      { className: 'wallet-header' },
      React.createElement('h1', null, 'Your Wallet'),
      React.createElement('p', { className: 'subtitle' }, 'Manage your tokens and transactions')
    ),
    // Balance section
    React.createElement(
      'div',
      { className: 'wallet-section balance-section' },
      React.createElement('h2', null, React.createElement('span', { style: { marginRight: '8px' } }, '💰'), 'Balance Overview'),
      React.createElement(
        'div',
        { className: 'balance-cards' },
        // GT Balance Card
        React.createElement(
          'div',
          { className: 'balance-card' },
          React.createElement('h3', null, 'Game Token (GT)'),
          React.createElement('div', { className: 'balance-amount' }, `${gtBalance} GT`),
          React.createElement('p', { className: 'balance-value' }, 'Value: $25.00 USD'),
          React.createElement('button', { className: 'button', onClick: () => navigate('/buy-gt') }, 'Buy More GT')
        ),
        // USDT Balance Card
        React.createElement(
          'div',
          { className: 'balance-card' },
          React.createElement('h3', null, 'USDT'),
          React.createElement('div', { className: 'balance-amount' }, `${usdtBalance} USDT`),
          React.createElement('p', { className: 'balance-value' }, 'Value: $100.00 USD'),
          React.createElement('button', { className: 'button', onClick: () => {
            const amount = prompt('Enter USDT amount to deposit:', '10');
            if (amount && Number(amount) > 0) {
              alert(`Depositing ${amount} USDT to your wallet...`);
              setUsdtBalance(usdtBalance + Number(amount));
            }
          } }, 'Deposit USDT')
        )
      )
    ),
    // Actions section
    React.createElement(
      'div',
      { className: 'wallet-section actions-section' },
      React.createElement('h2', null, React.createElement('span', { style: { marginRight: '8px' } }, '⚡'), 'Quick Actions'),
      React.createElement(
        'div',
        { className: 'action-buttons' },
        React.createElement('button', { className: 'button action-button', onClick: handleWithdraw }, '💸 Withdraw'),
        React.createElement('button', { className: 'button action-button', onClick: handleSwap }, '🔄 Swap Tokens'),
        React.createElement('button', { className: 'button action-button', onClick: handleStake }, '📌 Stake Tokens'),
        React.createElement('button', { className: 'button action-button', onClick: handleClaim }, '🏅 Claim Rewards')
      )
    ),
    // Transactions section
    React.createElement(
      'div',
      { className: 'wallet-section transactions-section' },
      React.createElement('h2', null, React.createElement('span', { style: { marginRight: '8px' } }, '📜'), 'Recent Transactions'),
      React.createElement(
        'div',
        { style: { overflowX: 'auto' } },
        React.createElement(
          'table',
          { className: 'transactions-table' },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              null,
              React.createElement('th', null, 'Date'),
              React.createElement('th', null, 'Type'),
              React.createElement('th', null, 'Amount'),
              React.createElement('th', null, 'Status'),
              React.createElement('th', null, 'Details')
            )
          ),
          React.createElement(
            'tbody',
            null,
            purchaseHistory.length > 0 ? purchaseHistory.map((transaction, index) => 
              React.createElement(
                'tr',
                { key: index },
                React.createElement('td', null, transaction.date),
                React.createElement('td', null, transaction.type || (transaction.paymentMethod ? 'Purchase' : 'Match Stake')),
                React.createElement('td', { className: transaction.type === 'Purchase' || transaction.paymentMethod ? 'amount-negative' : 'amount-positive' }, 
                  transaction.type === 'Purchase' || transaction.paymentMethod ? `-${transaction.amount} USDT` : `-${transaction.amount} GT`
                ),
                React.createElement('td', { className: 'status-complete' }, transaction.status || 'Complete'),
                React.createElement('td', null, React.createElement('button', { className: 'button-small', onClick: () => {
                  const details = transaction.matchId 
                    ? `Transaction details: Match stake of ${transaction.amount} GT for match ${transaction.matchId}` 
                    : `Transaction details: Purchase of ${transaction.amount} GT using ${transaction.paymentMethod}`;
                  alert(details);
                }}, 'View'))
              )
            ) : React.createElement(
              'tr',
              null,
              React.createElement('td', { colSpan: 5, style: { textAlign: 'center', padding: '1rem' } }, 'No transaction history available')
            ),
            React.createElement(
              'tr',
              null,
              React.createElement('td', null, '2023-06-14'),
              React.createElement('td', null, 'Token Purchase'),
              React.createElement('td', { className: 'amount-positive' }, '+20 GT'),
              React.createElement('td', { className: 'status-complete' }, 'Complete'),
              React.createElement('td', null, React.createElement('button', { className: 'button-small', onClick: () => alert('Transaction details: Token purchase of 20 GT') }, 'View'))
            ),
            React.createElement(
              'tr',
              null,
              React.createElement('td', null, '2023-06-12'),
              React.createElement('td', null, 'Deposit'),
              React.createElement('td', { className: 'amount-positive' }, '+100 USDT'),
              React.createElement('td', { className: 'status-complete' }, 'Complete'),
              React.createElement('td', null, React.createElement('button', { className: 'button-small', onClick: () => alert('Transaction details: Deposit of 100 USDT from external wallet') }, 'View'))
            )
          )
        )
      ),
      React.createElement('div', { style: { textAlign: 'center', marginTop: '1.5rem' } },
        React.createElement('button', { 
          className: 'button secondary', 
          style: { 
            padding: '0.8rem 1.5rem',
            width: '220px'
          },
          onClick: () => alert('Full transaction history will be available soon.')
        }, 'View All Transactions')
      )
    )
  );
}

module.exports = Wallet;