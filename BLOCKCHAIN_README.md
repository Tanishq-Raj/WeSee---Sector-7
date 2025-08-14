# TriX Blockchain Integration

This document provides a comprehensive guide to the blockchain integration for the TriX gaming platform. The integration includes smart contracts, backend services, and frontend components.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Smart Contracts](#smart-contracts)
3. [Backend Integration](#backend-integration)
4. [Frontend Integration](#frontend-integration)
5. [Deployment Guide](#deployment-guide)
6. [Verification Guide](#verification-guide)
7. [Troubleshooting](#troubleshooting)

## Architecture Overview

The TriX blockchain integration consists of three main components:

1. **Smart Contracts**: Solidity contracts deployed on the Ethereum blockchain
2. **Backend Integration**: Node.js services that interact with the blockchain
3. **Frontend Integration**: React components that provide a user interface for blockchain interactions

![Architecture Diagram](https://mermaid.ink/img/pako:eNp1kU1PwzAMhv9KlBOgSf0BHCZtQkgcEBLixGVKXDdis6RJ1aaq-u9x261jgpzix6_fOPZJWGsJCrFzrXlhDw5bUjBaZ1pnSFrJnrRBBU_GdqRgb1oPCnrXWmQFO1KODFrUhIYUbKgLaPCIbGhtKHi3xNGHMfpHwcEF9GjJkYKjsyHEuNWuIQUb1-JkLnvXhBBjjDFu_Pf5_JIsy7IsX8iy_Mz_8-XyKs_zPM9fybL8yqdJOk3TNE2nZFn-5JMkmaRJkiQTsiwvc5Iko2QURdGILMvLfJQko2gYhuGQLMvLPAzDYRiEQRCQZXmZB0HQD_q9Xq9PlmXJfd_v-Z7neT2yLEvuep7nuq7rdr8AcMKXrw)

## Smart Contracts

The TriX platform uses three main smart contracts:

1. **GameToken.sol**: An ERC20 token used for in-game transactions
2. **TokenStore.sol**: Manages the purchase of Game Tokens using USDT
3. **PlayGame.sol**: Handles match staking and winner payouts

### Contract Relationships

- GameToken references TokenStore for minting permissions
- TokenStore references GameToken for minting tokens
- PlayGame references GameToken for transferring tokens

### Key Features

- **Token Purchase**: Users can buy Game Tokens with USDT at a 1:1 rate
- **Match Creation**: Players can create matches and stake tokens
- **Match Joining**: Other players can join matches by staking tokens
- **Result Submission**: Match results are submitted by an API Gateway
- **Winner Payout**: Winners receive their stake plus the opponent's stake (minus platform fee)

## Backend Integration

The backend integration is implemented in the following files:

- **blockchainService.js**: Service for interacting with the blockchain
- **blockchainRoutes.js**: API endpoints for blockchain interactions
- **constants.js**: Configuration constants for blockchain operations

### API Endpoints

- `GET /api/blockchain/balance/:address`: Get a player's Game Token balance
- `GET /api/blockchain/match/:matchId`: Get match details from the blockchain
- `POST /api/blockchain/match/result`: Submit match results to the blockchain
- `GET /api/blockchain/transaction/:txHash`: Verify transaction status

## Frontend Integration

The frontend integration includes the following components:

- **BlockchainStatus.js**: Displays blockchain status and contract verification
- **TokenPurchase.js**: Interface for purchasing Game Tokens with USDT
- **GameMatches.js**: Interface for creating and joining matches
- **blockchain-integration.js**: Utility functions for blockchain interactions

### Integration Steps

1. Import the necessary components in your application
2. Add the components to your routes
3. Configure the contract addresses in your `.env` file

## Deployment Guide

### Smart Contracts Deployment

1. Navigate to the blockchain directory:
   ```bash
   cd D:\wesee\blockchain
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the `.env` file with your private key and network URLs

4. Deploy the contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network <network>
   ```

5. Update the contract addresses in your backend and frontend `.env` files

### Backend Deployment

1. Navigate to the backend directory:
   ```bash
   cd D:\wesee\backend
   ```

2. Update the `.env` file with the contract addresses and API Gateway private key

3. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Deployment

1. Navigate to the frontend directory:
   ```bash
   cd D:\wesee\frontend
   ```

2. Update the `.env` file with the contract addresses

3. Start the frontend application:
   ```bash
   npm start
   ```

## Verification Guide

See the [VERIFICATION_GUIDE.md](./VERIFICATION_GUIDE.md) file for detailed instructions on how to verify that the blockchain integration is working properly.

## Troubleshooting

### Common Issues

1. **Contract Addresses Not Set**: Ensure that all contract addresses are correctly set in the `.env` files

2. **MetaMask Not Connected**: Make sure MetaMask is installed and connected to the correct network

3. **Insufficient Balance**: Check that you have sufficient USDT for token purchases and Game Tokens for match stakes

4. **Transaction Reverted**: Check the transaction details in Etherscan for error messages

5. **API Gateway Issues**: Verify that the API Gateway private key is correctly set in the backend `.env` file

### Debugging Tools

- Use the `verify-contracts.js` script to test contract functionality
- Check the browser console for frontend errors
- Check the backend logs for API errors
- Use Etherscan to verify transaction status and error messages

---

For more information, contact the TriX development team or refer to the smart contract documentation in the `blockchain` directory.