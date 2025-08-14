# TriX Backend API Documentation

## Base URL

```
http://localhost:5000/api
```

## Overview

The TriX Gaming Platform API provides endpoints for token management, match handling, and blockchain interactions.

## Token Endpoints

### Get User Balances

```
GET /tokens/balance/:userId
```

Returns the GT and USDT balances for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "gt": 25,
    "usdt": 100
  }
}
```

### Convert USDT to GT

```
POST /tokens/convert
```

Converts USDT to GT at the current exchange rate (1 USDT = 1 GT).

**Request Body:**
```json
{
  "userId": "user123",
  "usdtAmount": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversion successful",
  "data": {
    "convertedAmount": 10,
    "newBalances": {
      "gt": 35,
      "usdt": 90
    }
  }
}
```

### Add USDT (Development Only)

```
POST /tokens/add-usdt
```

Adds USDT to a user's balance (for testing purposes).

**Request Body:**
```json
{
  "userId": "user123",
  "amount": 50
}
```

**Response:**
```json
{
  "success": true,
  "message": "USDT added successfully",
  "data": {
    "newBalances": {
      "gt": 35,
      "usdt": 140
    }
  }
}
```

### Get Conversion Rates

```
GET /tokens/rates
```

Returns the current token conversion rates.

**Response:**
```json
{
  "success": true,
  "data": {
    "usdtToGt": 1
  }
}
```

## Blockchain Endpoints

### Get Player Balance

```
GET /blockchain/balance/:address
```

Returns the Game Token balance for a blockchain address.

**Response:**
```json
{
  "success": true,
  "balance": "100.0",
  "rawBalance": "100000000000000000000"
}
```

### Get Match Status from Blockchain

```
GET /blockchain/match/:matchId
```

Returns the current status of a match from the blockchain.

**Response:**
```json
{
  "success": true,
  "matchData": {
    "matchId": "match123",
    "player1": "0x123...",
    "player2": "0x456...",
    "stakeAmount": "10.0",
    "rawStakeAmount": "10000000000000000000",
    "isComplete": false,
    "winner": "0x000..."
  }
}
```

### Submit Match Result to Blockchain

```
POST /blockchain/match/result
```

Submits the result of a match to the blockchain.

**Request Body:**
```json
{
  "matchId": "match123",
  "winnerAddress": "0x123..."
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x123..."
}
```

### Verify Transaction Status

```
GET /blockchain/transaction/:txHash
```

Verifies the status of a blockchain transaction.

**Response:**
```json
{
  "success": true,
  "confirmed": true,
  "confirmations": 5,
  "requiredConfirmations": 3
}
```

## Match Endpoints

### Get All Matches

```
GET /matches
```

Returns all matches in the system.

### Get Match by ID

```
GET /matches/:matchId
```

Returns details for a specific match.

### Get Matches for Player

```
GET /matches/player/:playerId
```

Returns all matches that a player is participating in.

### Create Match

```
POST /matches/create
```

Creates a new match with the specified stake amount.

**Request Body:**
```json
{
  "creatorId": "user123",
  "stakeAmount": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Match created successfully",
  "data": {
    "match": {
      "id": "match-uuid",
      "creatorId": "user123",
      "stakeAmount": 5,
      "players": ["user123"],
      "stakes": {},
      "status": "created",
      "createdAt": "2023-06-01T12:00:00.000Z",
      "winner": null
    }
  }
}
```

### Join Match

```
POST /matches/join
```

Joins an existing match.

**Request Body:**
```json
{
  "matchId": "match-uuid",
  "playerId": "user456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Joined match successfully",
  "data": {
    "match": {
      "id": "match-uuid",
      "creatorId": "user123",
      "stakeAmount": 5,
      "players": ["user123", "user456"],
      "stakes": {},
      "status": "ready",
      "createdAt": "2023-06-01T12:00:00.000Z",
      "winner": null
    }
  }
}
```

### Stake Tokens

```
POST /matches/stake
```

Stakes tokens for a match.

**Request Body:**
```json
{
  "matchId": "match-uuid",
  "playerId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tokens staked successfully",
  "data": {
    "match": {
      "id": "match-uuid",
      "creatorId": "user123",
      "stakeAmount": 5,
      "players": ["user123", "user456"],
      "stakes": {"user123": 5},
      "status": "ready",
      "createdAt": "2023-06-01T12:00:00.000Z",
      "winner": null
    },
    "playerBalance": 30
  }
}
```

### Complete Match

```
POST /matches/complete
```

Completes a match and distributes rewards to the winner.

**Request Body:**
```json
{
  "matchId": "match-uuid",
  "winnerId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Match completed successfully",
  "data": {
    "match": {
      "id": "match-uuid",
      "creatorId": "user123",
      "stakeAmount": 5,
      "players": ["user123", "user456"],
      "stakes": {"user123": 5, "user456": 5},
      "status": "completed",
      "createdAt": "2023-06-01T12:00:00.000Z",
      "completedAt": "2023-06-01T13:00:00.000Z",
      "winner": "user123"
    },
    "reward": 10,
    "winnerBalance": 40
  }
}
```