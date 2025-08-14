# TriX Blockchain Game Integration

This repository contains the integration of a Tic-Tac-Toe game with blockchain technology, allowing players to stake tokens, play matches, and receive payouts based on game results.

## Project Structure

### `contracts/`

Updated smart contracts with Round 2 integration logic and deployment scripts:

- **GameToken.sol**: ERC20 token used for in-game transactions
- **TokenStore.sol**: Manages the purchase of Game Tokens using USDT
- **PlayGame.sol**: Handles match staking and winner payouts

### `api/`

Backend Express application with API endpoints:

- **Buy Tokens**: Purchase Game Tokens with USDT
- **Stake Tokens**: Stake tokens for a match
- **Commit Result**: Submit game results and distribute rewards

### `web/`

Game frontend with integrated TriX API and matchmaking logic.

### `game_source/`

Source code of the Tic-Tac-Toe game modified with blockchain integration.

### `tools/leaderboard.js`

Event listener for game results and API to fetch the leaderboard.

## Game Selection

For this integration, I selected a **Tic-Tac-Toe** game. The original source repository can be found at the root of this project in the `tic-tac-toe-master` directory.

## Matchmaking Flow

1. Player 1 purchases Game Tokens using USDT
2. Player 1 creates a match and stakes tokens
3. Player 2 joins the match and stakes tokens
4. Both players play the Tic-Tac-Toe game
5. The winner is determined based on game rules
6. The winner receives their stake plus the opponent's stake (minus platform fee)
7. Results are recorded on the blockchain

## Local Setup Instructions

### Prerequisites

- Node.js and npm installed
- MetaMask or another Web3 wallet
- Access to a testnet (Sepolia, Goerli, etc.) or local blockchain
- Test ETH and USDT on the chosen network

### Smart Contracts Deployment

1. Navigate to the blockchain directory:
   ```bash
   cd blockchain
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`

4. Deploy the contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
   or for testnet:
   ```bash
   npx hardhat run scripts/deploy-testnet.js --network testnet
   ```

5. Note the deployed contract addresses for configuration

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the `.env` file with the deployed contract addresses

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the `.env` file with the deployed contract addresses

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Blockchain Transaction Proof Links

- GameToken Contract: [Link to Etherscan]
- TokenStore Contract: [Link to Etherscan]
- PlayGame Contract: [Link to Etherscan]
- Example Buy Transaction: [Link to Etherscan]
- Example Stake Transaction: [Link to Etherscan]
- Example Payout Transaction: [Link to Etherscan]

## Live Demo

- **Video Demo**: [Link to Video Demo]
- **Live Vercel Link**: [Link to Vercel Deployment]

## GitHub Repository

- **Repository Link**: [Link to GitHub Repository]

## Contact

For any questions or issues, please contact:

- **Name**: [Your Name]
- **Department**: [Your Department]
- **Section**: [Your Section]
- **Email**: [Your Email]