# TriX Backend

This is the backend implementation for the TriX gaming platform, providing APIs for token conversion, match staking, and winner payouts.

## Core Functionalities

1. **Game Token (GT) Purchase**:
   - Players purchase GT using USDT via the TokenStore contract
   - Fixed conversion rate: 1 USDT = 1 GT

2. **Match Staking**:
   - Both players stake the same GT amount before a match starts
   - Stakes are held in escrow until the match result is received

3. **Winner Payout**:
   - Once the winner is confirmed, the smart contract transfers the entire staked amount to the winner
   - Different match types can have bonus rewards (Standard: 100%, Bonus: 110%, Tournament: 150%)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

### Running the Server

```bash
npm start
```

The server will start on port 5000 by default. You can access the API at http://localhost:5000/api.

## Implementation Details

The backend is implemented using Node.js and Express, with a simple in-memory database for development purposes.

### Token Conversion

- Fixed rate: 1 USDT = 1 GT
- Users can convert USDT to GT at any time

### Match Staking

- Players can create matches with a specified stake amount
- Both players must stake the same amount of GT
- Stakes are held in escrow until the match is completed

### Winner Payouts

- Standard matches: Winner receives 100% of the total stake
- Bonus matches: Winner receives 110% of the total stake (10% bonus from platform)
- Tournament matches: Winner receives 150% of the total stake (50% bonus from platform)