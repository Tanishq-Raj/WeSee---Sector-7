# TriX Blockchain Integration Verification Guide

This guide will help you verify that the blockchain integration is working properly across the frontend, backend, and smart contracts.

## Prerequisites

1. Smart contracts deployed to a blockchain network (local, testnet, or mainnet)
2. Backend server running with blockchain service configured
3. Frontend application running with blockchain components integrated
4. MetaMask or another Web3 wallet installed in your browser

## 1. Smart Contract Verification

### Using the Verification Script

We've provided a verification script that tests the basic functionality of the contracts:

```bash
# Navigate to the blockchain directory
cd D:\wesee\blockchain

# Install dependencies if not already installed
npm install

# Run the verification script with contract addresses
npx hardhat run scripts/verify-contracts.js --network <network>
```

Alternatively, you can set the contract addresses in the `.env` file:

```
GAME_TOKEN_ADDRESS=0x...
TOKEN_STORE_ADDRESS=0x...
PLAY_GAME_ADDRESS=0x...
USDT_ADDRESS=0x...
```

### Manual Verification Steps

1. **Verify Contract Relationships**:
   - Check that GameToken has the correct TokenStore address
   - Check that TokenStore has the correct GameToken address
   - Check that PlayGame has the correct GameToken address

2. **Test Token Purchase**:
   - Approve USDT spending for TokenStore
   - Purchase Game Tokens
   - Verify Game Token balance increased

3. **Test Match Creation and Gameplay**:
   - Create a match with a stake
   - Join the match with another account
   - Submit match result (using API Gateway account)
   - Verify winner received the reward

## 2. Backend Integration Verification

### API Endpoint Testing

Test the following API endpoints to verify backend integration:

1. **Get Player Balance**:
   ```
   GET /api/blockchain/balance/:address
   ```
   This should return the player's Game Token balance.

2. **Get Match Status**:
   ```
   GET /api/blockchain/match/:matchId
   ```
   This should return the match details from the blockchain.

3. **Submit Match Result**:
   ```
   POST /api/blockchain/match/result
   {
     "matchId": "1",
     "winner": "0x..."
   }
   ```
   This should submit the match result to the blockchain.

4. **Verify Transaction**:
   ```
   GET /api/blockchain/transaction/:txHash
   ```
   This should return the status of a blockchain transaction.

### Using Postman or Curl

You can use Postman or curl to test these endpoints:

```bash
# Get player balance
curl -X GET http://localhost:3001/api/blockchain/balance/0x123...

# Get match status
curl -X GET http://localhost:3001/api/blockchain/match/1

# Submit match result
curl -X POST http://localhost:3001/api/blockchain/match/result \
  -H "Content-Type: application/json" \
  -d '{"matchId": "1", "winner": "0x123..."}'

# Verify transaction
curl -X GET http://localhost:3001/api/blockchain/transaction/0xabc...
```

## 3. Frontend Integration Verification

### Using the BlockchainStatus Component

The `BlockchainStatus` component includes a "Verify Contracts" button that checks contract relationships:

1. Navigate to the Blockchain Status page
2. Connect your wallet
3. Click the "Verify Contracts" button
4. Check the alert message for verification results

### Testing Token Purchase

1. Navigate to the Purchase Tokens page
2. Connect your wallet
3. Enter a USDT amount to purchase
4. Click "Purchase Tokens"
5. Approve the USDT spending in MetaMask
6. Confirm the token purchase transaction
7. Verify that your Game Token balance increased

### Testing Match Creation and Joining

1. Navigate to the Game Matches page
2. Connect your wallet
3. Create a match by entering a stake amount
4. Switch to another account in MetaMask
5. Join the match you created
6. Verify that the match appears in "Your Matches" section

## 4. End-to-End Testing

For a complete end-to-end test:

1. Purchase Game Tokens using the frontend
2. Create a match using the frontend
3. Join the match with another account
4. Use the backend API to submit the match result
5. Verify that the winner received the reward

## Troubleshooting

### Contract Issues

- **Transaction Reverted**: Check that you have sufficient token balance and that contracts are not paused
- **Permission Denied**: Verify that you're using the correct account for owner/API Gateway functions

### Backend Issues

- **Connection Error**: Check that the RPC URL is correct in the `.env` file
- **API Gateway Error**: Verify that the API Gateway private key is correct

### Frontend Issues

- **Contract Not Found**: Check that contract addresses are correctly set in the `.env` file
- **MetaMask Error**: Ensure you're connected to the correct network

## Contract Addresses

Keep track of your deployed contract addresses:

- GameToken: `0x...`
- TokenStore: `0x...`
- PlayGame: `0x...`
- USDT: `0x...`

## Network Information

- Network: `Ethereum/Testnet/Local`
- RPC URL: `https://...`
- Chain ID: `1/5/1337`

---

By following this guide, you should be able to verify that the blockchain integration is working properly across all components of the TriX gaming platform.