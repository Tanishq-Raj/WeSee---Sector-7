/**
 * Contract Verification Script
 * 
 * This script helps verify that the deployed contracts are working properly
 * by testing basic functionality like token purchases, match creation, and payouts.
 */

const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("Starting contract verification...");
  
  // Get signers
  const [owner, player1, player2] = await ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("Player 1 address:", player1.address);
  console.log("Player 2 address:", player2.address);
  
  // Get contract addresses from environment or command line
  const gameTokenAddress = process.env.GAME_TOKEN_ADDRESS || process.argv[2];
  const tokenStoreAddress = process.env.TOKEN_STORE_ADDRESS || process.argv[3];
  const playGameAddress = process.env.PLAY_GAME_ADDRESS || process.argv[4];
  const usdtAddress = process.env.USDT_ADDRESS || process.argv[5];
  
  if (!gameTokenAddress || !tokenStoreAddress || !playGameAddress || !usdtAddress) {
    console.error("Missing contract addresses. Please provide them as environment variables or command line arguments.");
    process.exit(1);
  }
  
  console.log("Using the following contract addresses:");
  console.log("- GameToken:", gameTokenAddress);
  console.log("- TokenStore:", tokenStoreAddress);
  console.log("- PlayGame:", playGameAddress);
  console.log("- USDT:", usdtAddress);
  
  // Get contract instances
  const GameToken = await ethers.getContractFactory("GameToken");
  const TokenStore = await ethers.getContractFactory("TokenStore");
  const PlayGame = await ethers.getContractFactory("PlayGame");
  const USDT = await ethers.getContractFactory("IERC20");
  
  const gameToken = GameToken.attach(gameTokenAddress);
  const tokenStore = TokenStore.attach(tokenStoreAddress);
  const playGame = PlayGame.attach(playGameAddress);
  const usdt = USDT.attach(usdtAddress);
  
  // Verify contract relationships
  console.log("\nVerifying contract relationships...");
  const tokenStoreFromGameToken = await gameToken.tokenStore();
  console.log("TokenStore address from GameToken:", tokenStoreFromGameToken);
  console.log("Expected TokenStore address:", tokenStoreAddress);
  console.log("Relationship correct:", tokenStoreFromGameToken.toLowerCase() === tokenStoreAddress.toLowerCase());
  
  const gameTokenFromTokenStore = await tokenStore.gameToken();
  console.log("GameToken address from TokenStore:", gameTokenFromTokenStore);
  console.log("Expected GameToken address:", gameTokenAddress);
  console.log("Relationship correct:", gameTokenFromTokenStore.toLowerCase() === gameTokenAddress.toLowerCase());
  
  const gameTokenFromPlayGame = await playGame.gameToken();
  console.log("GameToken address from PlayGame:", gameTokenFromPlayGame);
  console.log("Expected GameToken address:", gameTokenAddress);
  console.log("Relationship correct:", gameTokenFromPlayGame.toLowerCase() === gameTokenAddress.toLowerCase());
  
  // Check token balances
  console.log("\nChecking initial token balances...");
  const initialGameTokenBalance1 = await gameToken.balanceOf(player1.address);
  const initialGameTokenBalance2 = await gameToken.balanceOf(player2.address);
  console.log("Player 1 initial GT balance:", ethers.utils.formatUnits(initialGameTokenBalance1, 18));
  console.log("Player 2 initial GT balance:", ethers.utils.formatUnits(initialGameTokenBalance2, 18));
  
  // Test token purchase (if on local network)
  try {
    console.log("\nTesting token purchase (this will only work on local networks with mock USDT)...");
    
    // For local testing, we need to mint some USDT to players
    // This will fail on real networks, which is expected
    try {
      const MockUSDT = await ethers.getContractFactory("MockUSDT");
      const mockUsdt = MockUSDT.attach(usdtAddress);
      await mockUsdt.mint(player1.address, ethers.utils.parseUnits("100", 6));
      await mockUsdt.mint(player2.address, ethers.utils.parseUnits("100", 6));
      console.log("Minted 100 USDT to each player");
    } catch (error) {
      console.log("Could not mint USDT (expected on real networks):", error.message);
      console.log("Please ensure players have USDT balance for testing.");
    }
    
    // Check USDT balances
    const usdtBalance1 = await usdt.balanceOf(player1.address);
    const usdtBalance2 = await usdt.balanceOf(player2.address);
    console.log("Player 1 USDT balance:", ethers.utils.formatUnits(usdtBalance1, 6));
    console.log("Player 2 USDT balance:", ethers.utils.formatUnits(usdtBalance2, 6));
    
    if (usdtBalance1.gt(0) && usdtBalance2.gt(0)) {
      // Approve and purchase tokens
      const purchaseAmount = ethers.utils.parseUnits("10", 6); // 10 USDT
      
      await usdt.connect(player1).approve(tokenStoreAddress, purchaseAmount);
      console.log("Player 1 approved TokenStore to spend 10 USDT");
      
      await tokenStore.connect(player1).purchaseTokens(purchaseAmount);
      console.log("Player 1 purchased tokens");
      
      await usdt.connect(player2).approve(tokenStoreAddress, purchaseAmount);
      console.log("Player 2 approved TokenStore to spend 10 USDT");
      
      await tokenStore.connect(player2).purchaseTokens(purchaseAmount);
      console.log("Player 2 purchased tokens");
      
      // Check updated balances
      const updatedGameTokenBalance1 = await gameToken.balanceOf(player1.address);
      const updatedGameTokenBalance2 = await gameToken.balanceOf(player2.address);
      console.log("Player 1 updated GT balance:", ethers.utils.formatUnits(updatedGameTokenBalance1, 18));
      console.log("Player 2 updated GT balance:", ethers.utils.formatUnits(updatedGameTokenBalance2, 18));
      
      console.log("Token purchase test successful!");
    } else {
      console.log("Skipping token purchase test due to insufficient USDT balance");
    }
  } catch (error) {
    console.error("Error during token purchase test:", error.message);
  }
  
  // Test match creation and gameplay
  try {
    console.log("\nTesting match creation and gameplay...");
    
    // Check if players have enough Game Tokens
    const gtBalance1 = await gameToken.balanceOf(player1.address);
    const gtBalance2 = await gameToken.balanceOf(player2.address);
    
    if (gtBalance1.lt(ethers.utils.parseUnits("5", 18)) || gtBalance2.lt(ethers.utils.parseUnits("5", 18))) {
      console.log("Insufficient GT balance for match testing. Please ensure players have at least 5 GT each.");
    } else {
      // Approve PlayGame contract to spend tokens
      const stakeAmount = ethers.utils.parseUnits("5", 18); // 5 GT
      
      await gameToken.connect(player1).approve(playGameAddress, stakeAmount);
      console.log("Player 1 approved PlayGame to spend 5 GT");
      
      await gameToken.connect(player2).approve(playGameAddress, stakeAmount);
      console.log("Player 2 approved PlayGame to spend 5 GT");
      
      // Create match
      const createTx = await playGame.connect(player1).createMatch(stakeAmount);
      const createReceipt = await createTx.wait();
      
      // Find the MatchCreated event to get the matchId
      const matchCreatedEvent = createReceipt.events.find(event => event.event === 'MatchCreated');
      const matchId = matchCreatedEvent.args.matchId;
      
      console.log("Match created with ID:", matchId.toString());
      
      // Check match details
      const matchBefore = await playGame.getMatch(matchId);
      console.log("Match details before joining:", {
        creator: matchBefore.creator,
        opponent: matchBefore.opponent,
        stakeAmount: ethers.utils.formatUnits(matchBefore.stakeAmount, 18),
        status: matchBefore.status,
        winner: matchBefore.winner
      });
      
      // Join match
      await playGame.connect(player2).joinMatch(matchId);
      console.log("Player 2 joined the match");
      
      // Check updated match details
      const matchAfterJoin = await playGame.getMatch(matchId);
      console.log("Match details after joining:", {
        creator: matchAfterJoin.creator,
        opponent: matchAfterJoin.opponent,
        stakeAmount: ethers.utils.formatUnits(matchAfterJoin.stakeAmount, 18),
        status: matchAfterJoin.status,
        winner: matchAfterJoin.winner
      });
      
      // Submit match result (only API Gateway can do this on mainnet)
      // For testing, we'll use the owner account which should have the API Gateway role
      try {
        await playGame.connect(owner).submitResult(matchId, player1.address);
        console.log("Match result submitted: Player 1 wins");
        
        // Check final match details
        const matchAfterResult = await playGame.getMatch(matchId);
        console.log("Match details after result:", {
          creator: matchAfterResult.creator,
          opponent: matchAfterResult.opponent,
          stakeAmount: ethers.utils.formatUnits(matchAfterResult.stakeAmount, 18),
          status: matchAfterResult.status,
          winner: matchAfterResult.winner
        });
        
        // Check final balances
        const finalBalance1 = await gameToken.balanceOf(player1.address);
        const finalBalance2 = await gameToken.balanceOf(player2.address);
        console.log("Player 1 final GT balance:", ethers.utils.formatUnits(finalBalance1, 18));
        console.log("Player 2 final GT balance:", ethers.utils.formatUnits(finalBalance2, 18));
        
        console.log("Match gameplay test successful!");
      } catch (error) {
        console.error("Error submitting match result:", error.message);
        console.log("This is expected if the owner account is not set as the API Gateway.");
      }
    }
  } catch (error) {
    console.error("Error during match gameplay test:", error.message);
  }
  
  console.log("\nContract verification completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });