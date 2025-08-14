const React = require('react');
const { createContext, useState, useContext, useEffect } = React;

// Create the wallet context
const WalletContext = createContext();

// Custom hook to use the wallet context
function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Provider component that wraps the app and makes wallet data available to any child component
function WalletProvider({ children }) {
  // Initialize state with default values or from localStorage if available
  const [gtBalance, setGtBalance] = useState(() => {
    const savedBalance = localStorage.getItem('gtBalance');
    return savedBalance ? parseInt(savedBalance, 10) : 50; // Default GT balance
  });
  
  const [usdtBalance, setUsdtBalance] = useState(() => {
    const savedBalance = localStorage.getItem('usdtBalance');
    return savedBalance ? parseInt(savedBalance, 10) : 100; // Default USDT balance
  });
  
  const [purchaseHistory, setPurchaseHistory] = useState(() => {
    const savedHistory = localStorage.getItem('purchaseHistory');
    return savedHistory ? JSON.parse(savedHistory) : [
      {
        date: '2023-06-14',
        amount: '20 GT',
        price: '20 USDT',
        paymentMethod: 'USDT Balance',
        status: 'Complete'
      },
      {
        date: '2023-06-10',
        amount: '5 GT',
        price: '5 USDT',
        paymentMethod: 'USDT Balance',
        status: 'Complete'
      },
      {
        date: '2023-06-05',
        amount: '10 GT',
        price: '10 USDT',
        paymentMethod: 'Credit Card',
        status: 'Complete'
      }
    ];
  });
  
  // Save to localStorage whenever balances change
  useEffect(() => {
    localStorage.setItem('gtBalance', gtBalance.toString());
    localStorage.setItem('usdtBalance', usdtBalance.toString());
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
  }, [gtBalance, usdtBalance, purchaseHistory]);
  
  // Function to buy GT with USDT
  const buyGT = (amount, paymentMethod) => {
    if (amount <= 0) {
      throw new Error('Please enter a valid amount');
    }
    
    if (paymentMethod === 'usdt' && amount > usdtBalance) {
      throw new Error('Insufficient USDT balance');
    }
    
    // Create new purchase history entry
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const newPurchase = {
      date: formattedDate,
      amount: `${amount} GT`,
      price: `${amount} USDT`,
      paymentMethod: paymentMethod === 'usdt' ? 'USDT Balance' : 'Credit Card',
      status: 'Complete'
    };
    
    // Update balances and history
    setGtBalance(prevBalance => prevBalance + amount);
    if (paymentMethod === 'usdt') {
      setUsdtBalance(prevBalance => prevBalance - amount);
    }
    setPurchaseHistory(prevHistory => [newPurchase, ...prevHistory]);
    
    return newPurchase;
  };
  
  // Function to stake GT for matches
  const stakeGT = (amount, matchId) => {
    if (amount <= 0) {
      throw new Error('Please enter a valid amount');
    }
    
    if (amount > gtBalance) {
      throw new Error('Insufficient GT balance');
    }
    
    // Create new transaction history entry
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const newTransaction = {
      date: formattedDate,
      amount: `${amount} GT`,
      type: 'Match Stake',
      matchId: matchId || 'New Match',
      status: 'Complete'
    };
    
    // Update balance and history
    setGtBalance(prevBalance => prevBalance - amount);
    setPurchaseHistory(prevHistory => [newTransaction, ...prevHistory]);
    
    return newTransaction;
  };
  
  // Function to add GT (for rewards, etc.)
  const addGT = (amount) => {
    if (amount <= 0) {
      throw new Error('Please enter a valid amount');
    }
    
    setGtBalance(prevBalance => prevBalance + amount);
    return true;
  };
  
  // Value object that will be passed to consumers
  const value = {
    gtBalance,
    usdtBalance,
    purchaseHistory,
    buyGT,
    stakeGT,
    addGT,
    setGtBalance,
    setUsdtBalance,
    setPurchaseHistory
  };
  
  return React.createElement(
    WalletContext.Provider,
    { value },
    children
  );
}

module.exports = {
  WalletProvider,
  useWallet
};