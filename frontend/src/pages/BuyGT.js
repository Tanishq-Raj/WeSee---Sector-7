const React = require('react');
const { useNavigate } = require('react-router-dom');
const { useState, useEffect } = React;
const { useWallet } = require('../context/WalletContext');
const { ethers } = require('ethers');
const TokenStoreABI = require('../contracts/TokenStore.json');
require('./BuyGT.css');

function BuyGT() {
  const navigate = useNavigate();
  const { gtBalance, usdtBalance, purchaseHistory, buyGT } = useWallet();
  
  // Local state for purchase functionality
  const [purchaseAmount, setPurchaseAmount] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('usdt');
  const [message, setMessage] = useState({ text: '', type: '' }); // type can be 'success' or 'error'
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [account, setAccount] = useState('');
  
  // Contract addresses
  const tokenStoreAddress = process.env.REACT_APP_TOKEN_STORE_ADDRESS || '';
  const usdtAddress = process.env.REACT_APP_USDT_ADDRESS || '';
  
  // Get connected wallet account
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
  // Purchase history is now managed by WalletContext
  
  const handleAmountChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setPurchaseAmount(value);
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  // Handle purchase button click
  const handlePurchase = async () => {
    // Clear previous messages
    setMessage({ text: '', type: '' });
    
    try {
      if (paymentMethod === 'card') {
        // Use the mock wallet functionality for credit card payments
        const purchase = buyGT(parseInt(purchaseAmount), paymentMethod);
        
        // Show success message
        setMessage({
          text: `Successfully purchased ${purchaseAmount} GT tokens with credit card!`,
          type: 'success'
        });
        
        // Reset purchase amount
        setPurchaseAmount(10);
      } else if (paymentMethod === 'usdt') {
        // Use blockchain functionality for USDT payments
        await purchaseWithBlockchain();
      }
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
    } catch (error) {
      // Show error message
      setMessage({
        text: error.message,
        type: 'error'
      });
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
    }
  };
  
  // Purchase tokens using blockchain
  const purchaseWithBlockchain = async () => {
    if (!purchaseAmount || isNaN(purchaseAmount) || parseFloat(purchaseAmount) <= 0) {
      throw new Error('Please enter a valid amount');
    }

    if (!tokenStoreAddress || !usdtAddress) {
      throw new Error('Contract addresses not configured');
    }

    setIsProcessing(true);
    setTxHash('');

    try {
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error('Please install MetaMask!');
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      // Create USDT contract instance (minimal ABI for approve function)
      const usdt = new ethers.Contract(
        usdtAddress,
        [
          'function approve(address spender, uint256 amount) returns (bool)',
          'function decimals() view returns (uint8)'
        ],
        signer
      );

      // Create TokenStore contract instance
      const tokenStore = new ethers.Contract(
        tokenStoreAddress,
        TokenStoreABI.abi,
        signer
      );

      // Get USDT decimals
      const usdtDecimals = await usdt.decimals();
      
      // Convert USDT amount to wei
      const usdtAmountWei = ethers.utils.parseUnits(purchaseAmount.toString(), usdtDecimals);

      // First approve TokenStore to spend USDT
      console.log(`Approving ${purchaseAmount} USDT...`);
      const approveTx = await usdt.approve(tokenStoreAddress, usdtAmountWei);
      await approveTx.wait();
      console.log('Approval successful');

      // Then purchase tokens
      console.log(`Purchasing tokens with ${purchaseAmount} USDT...`);
      const purchaseTx = await tokenStore.purchaseTokens(usdtAmountWei);
      const receipt = await purchaseTx.wait();
      
      setTxHash(receipt.transactionHash);
      
      // Call the buyGT function to update the UI state
      buyGT(parseInt(purchaseAmount), paymentMethod);
      
      setMessage({
        text: `Successfully purchased ${purchaseAmount} Game Tokens with USDT!`,
        type: 'success'
      });
      
      // Reset purchase amount
      setPurchaseAmount(10);
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      throw new Error(`Error purchasing tokens: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  return React.createElement(
    'div',
    { className: 'buy-gt-container' },
    // Message display (success or error)
    message.text && React.createElement(
      'div',
      { 
        className: `message ${message.type}-message`,
        style: {
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: message.type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
          minWidth: '300px',
          fontWeight: '500'
        }
      },
      message.text
    ),
    // Header section
    React.createElement(
      'div',
      { className: 'buygt-header', style: { marginBottom: '30px', textAlign: 'center' } },
      React.createElement('h1', { style: { color: '#333', fontSize: '2.2rem', marginBottom: '10px' } }, 'Buy Game Tokens'),
      React.createElement('p', { className: 'subtitle', style: { fontSize: '1.1rem', color: '#666' } }, 'Purchase GT tokens to use in matches and earn rewards')
    ),
    // Exchange rate section
    React.createElement(
      'div',
      { className: 'buygt-section rate-section', style: { background: 'linear-gradient(135deg, #f0f4ff, #e6f0ff)', padding: '20px', borderRadius: '10px', marginBottom: '30px' } },
      React.createElement('h2', null, React.createElement('span', { style: { marginRight: '8px' } }, '💱'), 'Current Exchange Rate'),
      React.createElement(
        'div',
        { className: 'exchange-rate', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        React.createElement('div', { className: 'rate-value', style: { fontWeight: '700', fontSize: '1.2rem', color: '#4a6cf7' } }, '1 GT = $1.00 USDT'),
        React.createElement('p', { className: 'rate-update', style: { color: '#666', fontSize: '0.9rem' } }, 'Last updated: 5 minutes ago')
      )
    ),
    // Main content wrapper with two-column layout
    React.createElement(
      'div',
      { className: 'buygt-content-wrapper' },
      
      // Left column - Purchase section with two-column layout
      React.createElement(
        'div',
        { className: 'buygt-section purchase-section', style: { display: 'flex', gap: '30px', flex: '1' } },
        React.createElement('h2', null, React.createElement('span', { style: { marginRight: '8px' } }, '🛒'), 'Purchase Tokens'),
        React.createElement(
          'div',
          { 
            className: 'purchase-form card-shadow', 
            style: { 
              flex: '1', 
              backgroundColor: 'white', 
              padding: '25px', 
              borderRadius: '10px', 
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)' 
            } 
          },
        // Amount input with improved styling
          React.createElement(
            'div',
            { className: 'form-group' },
            React.createElement('label', { htmlFor: 'amount', className: 'form-label' }, 'Amount to Purchase (GT)'),
            React.createElement('div', { 
              className: 'input-with-icon',
              style: {
                position: 'relative',
                marginBottom: '8px'
              }
            },
              React.createElement('span', { 
                className: 'input-icon',
                style: {
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#4a6cf7',
                  fontSize: '1.2rem'
                }
              }, '🪙'),
              React.createElement('input', { 
                type: 'number', 
                id: 'amount', 
                className: 'form-input enhanced',
                placeholder: 'Enter amount',
                min: '1',
                step: '1',
                value: purchaseAmount,
                onChange: handleAmountChange,
                style: {
                  padding: '15px 15px 15px 45px',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxShadow: 'none'
                }
              })
            ),
            React.createElement('div', { 
              className: 'input-note',
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                color: '#666',
                marginTop: '8px'
              }
            }, 
              React.createElement('span', { style: { fontWeight: 'bold' } }, 'Minimum:'), ' 1 GT', 
              React.createElement('span', { style: { marginLeft: '15px', fontWeight: '600', color: '#333' } }, 'Current Balance:'), ` ${gtBalance} GT`
            )
          ),
        // Payment method with card-style selection
          React.createElement(
            'div',
            { className: 'form-group' },
            React.createElement('label', { className: 'form-label' }, 'Payment Method'),
            React.createElement(
              'div',
              { className: 'payment-method-cards' },
              // USDT Payment Card
              React.createElement(
                'div',
                { 
                  className: `payment-card ${paymentMethod === 'usdt' ? 'selected' : ''}`,
                  onClick: () => handlePaymentMethodChange('usdt')
                },
                React.createElement('input', {
                  type: 'radio',
                  id: 'usdt',
                  name: 'paymentMethod',
                  value: 'usdt',
                  checked: paymentMethod === 'usdt',
                  onChange: () => handlePaymentMethodChange('usdt'),
                  className: 'payment-radio'
                }),
                React.createElement(
                  'div',
                  { className: 'payment-card-header' },
                  React.createElement(
                    'div',
                    { className: 'payment-card-icon' },
                    '₮' // USDT symbol
                  ),
                  React.createElement('div', { className: 'payment-card-title' }, 'USDT')
                ),
                React.createElement(
                  'div',
                  { className: 'payment-card-balance' },
                  'Available: ',
                  React.createElement('span', null, `${usdtBalance} USDT`)
                )
              ),
              // Credit/Debit Card Payment Card
              React.createElement(
                'div',
                { 
                  className: `payment-card ${paymentMethod === 'card' ? 'selected' : ''}`,
                  onClick: () => handlePaymentMethodChange('card')
                },
                React.createElement('input', {
                  type: 'radio',
                  id: 'card',
                  name: 'paymentMethod',
                  value: 'card',
                  checked: paymentMethod === 'card',
                  onChange: () => handlePaymentMethodChange('card'),
                  className: 'payment-radio'
                }),
                React.createElement(
                  'div',
                  { className: 'payment-card-header' },
                  React.createElement(
                    'div',
                    { className: 'payment-card-icon' },
                    '💳' // Card emoji
                  ),
                  React.createElement('div', { className: 'payment-card-title' }, 'Credit/Debit Card')
                ),
                React.createElement(
                  'div',
                  { className: 'payment-card-balance' },
                  'Secure payment via Stripe'
                )
              )
            )
          ),
        // Summary with improved styling
          React.createElement(
            'div',
            { className: 'purchase-summary-container' },
            React.createElement('h3', { className: 'summary-title' }, 'Order Summary'),
            React.createElement(
              'div',
              { className: 'purchase-summary' },
              React.createElement('div', { className: 'summary-row' },
                React.createElement('span', null, 'Amount:'),
                React.createElement('span', { className: 'summary-value' }, `${purchaseAmount} GT`)
              ),
              React.createElement('div', { className: 'summary-row' },
                React.createElement('span', null, 'Price:'),
                React.createElement('span', { className: 'summary-value' }, `${purchaseAmount} USDT`)
              ),
              React.createElement('div', { className: 'summary-row' },
                React.createElement('span', null, 'Fee:'),
                React.createElement('span', { className: 'summary-value' }, '0 USDT')
              ),
              React.createElement('div', { className: 'summary-divider' }),
              React.createElement('div', { className: 'summary-row total' },
                React.createElement('span', null, 'Total:'),
                React.createElement('span', { className: 'summary-value total-value' }, `${purchaseAmount} USDT`)
              )
            ),
            // Purchase button with improved styling
            React.createElement('button', { 
              className: 'button purchase-button',
              onClick: handlePurchase,
              disabled: isProcessing || purchaseAmount <= 0 || (paymentMethod === 'usdt' && purchaseAmount > usdtBalance),
              style: {
                width: '100%',
                padding: '15px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginTop: '20px',
                background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
                opacity: (isProcessing || purchaseAmount <= 0 || (paymentMethod === 'usdt' && purchaseAmount > usdtBalance)) ? 0.6 : 1
              }
            }, isProcessing ? 'Processing...' : 'Purchase Tokens'),
            
            // Transaction hash display if available
            txHash && React.createElement(
              'div',
              { 
                className: 'transaction-info',
                style: {
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }
              },
              React.createElement('p', null, 'Transaction Hash: ',
                React.createElement(
                  'a',
                  {
                    href: `https://etherscan.io/tx/${txHash}`,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    style: { color: '#4a6cf7', wordBreak: 'break-all' }
                  },
                  txHash
                )
              )
            )
          )
      )
    ),
    // Purchase history with improved styling
    React.createElement(
      'div',
      { 
        className: 'buygt-section history-section',
        style: {
          marginTop: '40px',
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
        }
      },
      React.createElement('h2', { 
        style: {
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          color: '#333',
          fontSize: '1.5rem'
        }
      }, 
        React.createElement('span', { style: { marginRight: '10px' } }, '📜'),
        'Purchase History'
      ),
      React.createElement(
        'div',
        { className: 'table-responsive', style: { overflowX: 'auto' } },
        React.createElement(
          'table',
          { 
            className: 'history-table',
            style: {
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0',
              fontSize: '0.95rem'
            }
          },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              null,
              React.createElement('th', { style: { textAlign: 'left', padding: '12px 15px', borderBottom: '2px solid #eaeaea', color: '#555' } }, 'Date'),
              React.createElement('th', { style: { textAlign: 'left', padding: '12px 15px', borderBottom: '2px solid #eaeaea', color: '#555' } }, 'Amount'),
              React.createElement('th', { style: { textAlign: 'left', padding: '12px 15px', borderBottom: '2px solid #eaeaea', color: '#555' } }, 'Price'),
              React.createElement('th', { style: { textAlign: 'left', padding: '12px 15px', borderBottom: '2px solid #eaeaea', color: '#555' } }, 'Payment Method'),
              React.createElement('th', { style: { textAlign: 'left', padding: '12px 15px', borderBottom: '2px solid #eaeaea', color: '#555' } }, 'Status')
            )
          ),
          React.createElement(
            'tbody',
            null,
            purchaseHistory.length > 0 ? 
              purchaseHistory
                .filter(purchase => purchase.paymentMethod) // Only show purchases, not match stakes
                .map((purchase, index) => 
                  React.createElement(
                    'tr',
                    { 
                      key: index,
                      style: {
                        backgroundColor: index % 2 === 0 ? '#f9fafc' : 'white'
                      }
                    },
                    React.createElement('td', { style: { padding: '15px', borderBottom: '1px solid #eaeaea' } }, purchase.date),
                    React.createElement('td', { style: { padding: '15px', borderBottom: '1px solid #eaeaea', fontWeight: '600' } }, purchase.amount),
                    React.createElement('td', { style: { padding: '15px', borderBottom: '1px solid #eaeaea' } }, purchase.price || purchase.amount),
                    React.createElement('td', { style: { padding: '15px', borderBottom: '1px solid #eaeaea' } }, purchase.paymentMethod),
                    React.createElement('td', { 
                      style: { 
                        padding: '15px', 
                        borderBottom: '1px solid #eaeaea',
                        color: (purchase.status || 'complete').toLowerCase() === 'complete' ? '#10b981' : 
                               (purchase.status || 'complete').toLowerCase() === 'pending' ? '#f59e0b' : '#ef4444',
                        fontWeight: '600'
                      } 
                    }, purchase.status || 'Complete')
                  )
                ) : 
              React.createElement(
                'tr',
                null,
                React.createElement(
                  'td', 
                  { 
                    colSpan: 5, 
                    style: { 
                      textAlign: 'center', 
                      padding: '30px',
                      color: '#666',
                      backgroundColor: '#f9fafc',
                      border: '1px dashed #ddd'
                    } 
                  }, 
                  'No purchase history available'
                )
              )
            )
          )
        )
      )
    )
  );
}

module.exports = BuyGT;