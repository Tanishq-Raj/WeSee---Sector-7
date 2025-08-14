const React = require('react');
const { useState, useEffect } = React;
const { ethers } = require('ethers');
const TokenStoreABI = require('../contracts/TokenStore.json');

const TokenPurchase = () => {
  const [account, setAccount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [estimatedGT, setEstimatedGT] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const tokenStoreAddress = process.env.REACT_APP_TOKEN_STORE_ADDRESS || '';
  const usdtAddress = process.env.REACT_APP_USDT_ADDRESS || '';

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
    // Update estimated GT whenever USDT amount changes
    if (usdtAmount && !isNaN(usdtAmount) && parseFloat(usdtAmount) > 0) {
      // 1:1 conversion rate as per the contract
      setEstimatedGT(usdtAmount);
    } else {
      setEstimatedGT('0');
    }
  }, [usdtAmount]);

  const purchaseTokens = async () => {
    if (!usdtAmount || isNaN(usdtAmount) || parseFloat(usdtAmount) <= 0) {
      setError('Please enter a valid USDT amount');
      return;
    }

    if (!tokenStoreAddress || !usdtAddress) {
      setError('Contract addresses not configured');
      return;
    }

    setError('');
    setSuccess('');
    setIsProcessing(true);
    setTxHash('');

    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError('Please install MetaMask!');
        setIsProcessing(false);
        return;
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
      const usdtAmountWei = ethers.utils.parseUnits(usdtAmount, usdtDecimals);

      // First approve TokenStore to spend USDT
      console.log(`Approving ${usdtAmount} USDT...`);
      const approveTx = await usdt.approve(tokenStoreAddress, usdtAmountWei);
      await approveTx.wait();
      console.log('Approval successful');

      // Then purchase tokens
      console.log(`Purchasing tokens with ${usdtAmount} USDT...`);
      const purchaseTx = await tokenStore.purchaseTokens(usdtAmountWei);
      const receipt = await purchaseTx.wait();
      
      setTxHash(receipt.transactionHash);
      setSuccess(`Successfully purchased ${usdtAmount} Game Tokens!`);
      console.log('Purchase successful');
      
      // Clear input field
      setUsdtAmount('');
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      setError(`Error purchasing tokens: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="token-purchase">
      <h2>Purchase Game Tokens</h2>
      <p>Exchange your USDT for Game Tokens at a 1:1 rate</p>

      <div className="purchase-form">
        <div className="form-group">
          <label htmlFor="usdtAmount">USDT Amount:</label>
          <input
            type="number"
            id="usdtAmount"
            value={usdtAmount}
            onChange={(e) => setUsdtAmount(e.target.value)}
            placeholder="Enter USDT amount"
            disabled={isProcessing}
          />
        </div>

        <div className="estimated-tokens">
          <p>Estimated Game Tokens: <strong>{estimatedGT} GT</strong></p>
        </div>

        <button 
          onClick={purchaseTokens} 
          disabled={isProcessing || !account || !usdtAmount}
        >
          {isProcessing ? 'Processing...' : 'Purchase Tokens'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {txHash && (
        <div className="transaction-info">
          <p>Transaction Hash: <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash}</a></p>
        </div>
      )}

      <div className="instructions">
        <h3>How to Purchase Game Tokens:</h3>
        <ol>
          <li>Enter the amount of USDT you want to exchange for Game Tokens</li>
          <li>Click "Purchase Tokens"</li>
          <li>Approve the USDT spending in your wallet</li>
          <li>Confirm the token purchase transaction</li>
          <li>Wait for the transaction to be mined</li>
        </ol>
        <p><strong>Note:</strong> Make sure you have enough USDT in your wallet and some ETH for gas fees.</p>
      </div>
    </div>
  );
};

module.exports = TokenPurchase;