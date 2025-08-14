# TriX Blockchain Contracts

This directory contains the smart contracts for the TriX gaming platform, a blockchain-based incentive and reward distribution system designed for PvP (Player vs Player) gaming.

## Overview

TriX enables:
- Trustless match staking between two players
- Transparent and secure transfer of staked tokens to the winner
- Easy purchase of in-game tokens using USDT

## Smart Contracts

### GameToken.sol
- ERC-20 compliant token used for staking in matches
- Only the TokenStore contract can mint new tokens
- Includes pause functionality for emergency situations

### TokenStore.sol
- Accepts USDT payments and mints corresponding GT tokens
- Uses a fixed conversion rate: 1 USDT = 1 GT
- Includes security features like reentrancy protection

### PlayGame.sol
- Handles match creation, joining, and result submission
- Escrows GT stakes from both players
- Transfers the entire staked amount to the winner
- Includes emergency refund functionality

## Economic Model

- Token Purchase Rate: 1 GT = $1.00 USDT
- Match Stakes: Both players stake the same amount of GT
- Winner Payout: Winner receives 100% of the total staked amount

## Deployment

1. Deploy GameToken.sol
2. Deploy TokenStore.sol with the GameToken address and USDT token address
3. Call setTokenStore() on GameToken with the TokenStore address
4. Deploy PlayGame.sol with the GameToken address
5. Set up the API Gateway address in PlayGame using setApiGateway()

## Security Features

- Access control for minting and result submission
- Reentrancy protection on fund transfers
- Emergency pause functionality in all contracts
- Owner-only administrative functions

## Development

### Prerequisites

- Node.js and npm
- Hardhat or Truffle
- OpenZeppelin Contracts

### Installation

```bash
npm install
```

### Testing

```bash
npm test
```

### Deployment

```bash
npm run deploy
```