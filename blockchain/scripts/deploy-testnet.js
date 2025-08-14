/**
 * TriX Blockchain Testnet Deployment Script
 * 
 * This script deploys the TriX blockchain contracts to a testnet network.
 * It handles the deployment of GameToken, TokenStore, and PlayGame contracts,
 * and sets up the relationships between them.
 * 
 * Usage:
 * 1. Configure .env file with PRIVATE_KEY and TESTNET_RPC_URL
 * 2. Run: npx hardhat run scripts/deploy-testnet.js --network testnet
 */

const hre = require("hardhat");

async function main() {
  console.log("Deploying TriX contracts to testnet...");

  // Get the network
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${network.name} (${network.chainId})`);

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${hre.ethers.utils.formatEther(balance)} ETH`);
  
  if (balance.eq(0)) {
    console.error("Error: Deployer account has no ETH. Please fund your account before deployment.");
    return;
  }

  // For testnet, we'll deploy a mock USDT token
  console.log("\nDeploying MockUSDT...");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();
  await mockUSDT.deployed();
  console.log(`MockUSDT deployed to: ${mockUSDT.address}`);

  // Deploy GameToken
  console.log("\nDeploying GameToken...");
  const GameToken = await hre.ethers.getContractFactory("GameToken");
  const gameToken = await GameToken.deploy();
  await gameToken.deployed();
  console.log(`GameToken deployed to: ${gameToken.address}`);

  // Deploy TokenStore with GameToken and MockUSDT addresses
  console.log("\nDeploying TokenStore...");
  const TokenStore = await hre.ethers.getContractFactory("TokenStore");
  const tokenStore = await TokenStore.deploy(gameToken.address, mockUSDT.address);
  await tokenStore.deployed();
  console.log(`TokenStore deployed to: ${tokenStore.address}`);

  // Set TokenStore as minter in GameToken
  console.log("\nSetting TokenStore as minter in GameToken...");
  const setMinterTx = await gameToken.setMinter(tokenStore.address);
  await setMinterTx.wait();
  console.log(`TokenStore set as minter in GameToken`);

  // Deploy PlayGame with GameToken address
  console.log("\nDeploying PlayGame...");
  const PlayGame = await hre.ethers.getContractFactory("PlayGame");
  const playGame = await PlayGame.deploy(gameToken.address);
  await playGame.deployed();
  console.log(`PlayGame deployed to: ${playGame.address}`);

  // Mint some MockUSDT to the deployer for testing
  console.log("\nMinting MockUSDT to deployer for testing...");
  const mintAmount = hre.ethers.utils.parseEther("1000");
  const mintTx = await mockUSDT.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log(`Minted ${hre.ethers.utils.formatEther(mintAmount)} MockUSDT to ${deployer.address}`);

  // Approve TokenStore to spend MockUSDT
  console.log("\nApproving TokenStore to spend MockUSDT...");
  const approveTx = await mockUSDT.approve(tokenStore.address, mintAmount);
  await approveTx.wait();
  console.log(`Approved TokenStore to spend MockUSDT`);

  // Buy some GameTokens for testing
  console.log("\nBuying GameTokens for testing...");
  const buyAmount = hre.ethers.utils.parseEther("100");
  const buyTx = await tokenStore.buyTokens(buyAmount);
  await buyTx.wait();
  console.log(`Bought ${hre.ethers.utils.formatEther(buyAmount)} GameTokens`);

  // Verify contracts on Etherscan if API key is available
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\nVerifying contracts on Etherscan...");
    
    console.log("Waiting for block confirmations...");
    // Wait for 5 block confirmations to ensure contracts are mined
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    try {
      console.log("Verifying MockUSDT...");
      await hre.run("verify:verify", {
        address: mockUSDT.address,
        constructorArguments: [],
      });
      
      console.log("Verifying GameToken...");
      await hre.run("verify:verify", {
        address: gameToken.address,
        constructorArguments: [],
      });
      
      console.log("Verifying TokenStore...");
      await hre.run("verify:verify", {
        address: tokenStore.address,
        constructorArguments: [gameToken.address, mockUSDT.address],
      });
      
      console.log("Verifying PlayGame...");
      await hre.run("verify:verify", {
        address: playGame.address,
        constructorArguments: [gameToken.address],
      });
      
      console.log("All contracts verified on Etherscan!");
    } catch (error) {
      console.error("Error verifying contracts:", error);
    }
  }

  // Print summary
  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`MockUSDT: ${mockUSDT.address}`);
  console.log(`GameToken: ${gameToken.address}`);
  console.log(`TokenStore: ${tokenStore.address}`);
  console.log(`PlayGame: ${playGame.address}`);
  console.log("\nUpdate your .env files with these addresses.");
  
  // Generate .env content for easy copying
  console.log("\n=== .env Configuration ===");
  console.log(`# Blockchain Configuration`);
  console.log(`BLOCKCHAIN_RPC_URL=${process.env.TESTNET_RPC_URL}`);
  console.log(`USDT_ADDRESS=${mockUSDT.address}`);
  console.log(`GAME_TOKEN_ADDRESS=${gameToken.address}`);
  console.log(`TOKEN_STORE_ADDRESS=${tokenStore.address}`);
  console.log(`PLAY_GAME_ADDRESS=${playGame.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });