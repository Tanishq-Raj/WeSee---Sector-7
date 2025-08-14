# TriX Blockchain Integration Guide

This guide provides step-by-step instructions for integrating the blockchain components into the existing TriX application.

## Prerequisites

- Node.js and npm installed
- MetaMask or another Web3 wallet
- Access to a testnet (Sepolia, Goerli, etc.) or local blockchain
- Test ETH and USDT on the chosen network

## Step 1: Deploy Smart Contracts

1. Navigate to the blockchain directory:
   ```bash
   cd D:\wesee\blockchain
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   PRIVATE_KEY=your_private_key_here
   TESTNET_RPC_URL=your_testnet_rpc_url_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here (optional)
   ```

4. Deploy the contracts to a testnet:
   ```bash
   npx hardhat run scripts/deploy-testnet.js --network testnet
   ```

5. Note the deployed contract addresses from the console output.

## Step 2: Configure Backend

1. Navigate to the backend directory:
   ```bash
   cd D:\wesee\backend
   ```

2. Update the `.env` file with the blockchain configuration:
   ```
   # Blockchain Configuration
   BLOCKCHAIN_RPC_URL=your_testnet_rpc_url_here
   API_GATEWAY_PRIVATE_KEY=your_private_key_here
   GAME_TOKEN_ADDRESS=deployed_game_token_address
   TOKEN_STORE_ADDRESS=deployed_token_store_address
   PLAY_GAME_ADDRESS=deployed_play_game_address
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

## Step 3: Configure Frontend

1. Navigate to the frontend directory:
   ```bash
   cd D:\wesee\frontend
   ```

2. Create a `.env` file with the following content:
   ```
   REACT_APP_BLOCKCHAIN_RPC_URL=your_testnet_rpc_url_here
   REACT_APP_GAME_TOKEN_ADDRESS=deployed_game_token_address
   REACT_APP_TOKEN_STORE_ADDRESS=deployed_token_store_address
   REACT_APP_PLAY_GAME_ADDRESS=deployed_play_game_address
   REACT_APP_USDT_ADDRESS=deployed_usdt_address
   REACT_APP_NETWORK_ID=testnet_network_id
   REACT_APP_NETWORK_NAME=testnet_network_name
   ```

3. Start the frontend application:
   ```bash
   npm start
   ```

## Step 4: Integrate Components

### Backend Integration

The blockchain integration is already set up in the backend with the following components:

- `blockchainService.js`: Service for interacting with the blockchain
- `blockchainRoutes.js`: API endpoints for blockchain interactions

The server is configured to initialize the blockchain service on startup.

### Frontend Integration

To integrate the blockchain components into your frontend application:

1. Import the blockchain components in your main application file:

   ```javascript
   // In src/App.js or your main component
   import BlockchainStatus from './components/BlockchainStatus';
   import TokenPurchase from './components/TokenPurchase';
   import GameMatches from './components/GameMatches';
   ```

2. Add the components to your routes:

   ```javascript
   // In your routing configuration
   <Route path="/blockchain" element={<BlockchainStatus />} />
   <Route path="/purchase-tokens" element={<TokenPurchase />} />
   <Route path="/matches" element={<GameMatches />} />
   ```

3. Add navigation links to your menu:

   ```javascript
   <Link to="/blockchain">Blockchain Status</Link>
   <Link to="/purchase-tokens">Purchase Tokens</Link>
   <Link to="/matches">Game Matches</Link>
   ```

4. Alternatively, you can use the provided `App.blockchain.js` as a standalone application:

   ```bash
   # Create a build of the blockchain frontend
   npm run build
   ```

## Step 5: Test the Integration

1. Run the test script to verify the blockchain integration:

   ```bash
   cd D:\wesee
   node test-blockchain-integration.js
   ```

2. Manually test the frontend components:

   - Connect your wallet using the BlockchainStatus component
   - Purchase Game Tokens using the TokenPurchase component
   - Create and join matches using the GameMatches component

3. Verify contract relationships using the BlockchainStatus component.

## Step 6: Troubleshooting

If you encounter issues with the blockchain integration, check the following:

1. Contract addresses in the `.env` files
2. Network configuration in MetaMask
3. Backend logs for API errors
4. Browser console for frontend errors
5. Transaction status on Etherscan

For more detailed troubleshooting, refer to the [VERIFICATION_GUIDE.md](./VERIFICATION_GUIDE.md) file.

## Next Steps

After successfully integrating the blockchain components, you can:

1. Customize the UI to match your application's design
2. Add additional features such as transaction history
3. Implement more advanced blockchain functionality
4. Deploy to a production environment

## Resources

- [Blockchain README](./BLOCKCHAIN_README.md): Overview of the blockchain integration
- [Verification Guide](./VERIFICATION_GUIDE.md): Guide for verifying the blockchain integration
- [Smart Contract Documentation](./blockchain/README.md): Documentation for the smart contracts
- [API Documentation](./backend/API.md): Documentation for the API endpoints