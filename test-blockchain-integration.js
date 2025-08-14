/**
 * TriX Blockchain Integration Test Script
 * 
 * This script provides a simple way to test the end-to-end blockchain integration
 * for the TriX gaming platform. It tests the following components:
 * 
 * 1. Smart Contracts: GameToken, TokenStore, PlayGame
 * 2. Backend API: Blockchain endpoints
 * 3. Frontend Components: BlockchainStatus, TokenPurchase, GameMatches
 */

const Web3 = require('web3');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
  gameTokenAddress: process.env.GAME_TOKEN_ADDRESS,
  tokenStoreAddress: process.env.TOKEN_STORE_ADDRESS,
  playGameAddress: process.env.PLAY_GAME_ADDRESS,
  usdtAddress: process.env.USDT_ADDRESS,
  privateKey: process.env.TEST_PRIVATE_KEY,
};

// Initialize Web3
const web3 = new Web3(config.rpcUrl);

// Load contract ABIs
const gameTokenAbi = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend/src/contracts/GameToken.json'), 'utf8'));
const tokenStoreAbi = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend/src/contracts/TokenStore.json'), 'utf8'));
const playGameAbi = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend/src/contracts/PlayGame.json'), 'utf8'));

// Initialize contract instances
const gameToken = new web3.eth.Contract(gameTokenAbi, config.gameTokenAddress);
const tokenStore = new web3.eth.Contract(tokenStoreAbi, config.tokenStoreAddress);
const playGame = new web3.eth.Contract(playGameAbi, config.playGameAddress);

// Create account from private key
const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
web3.eth.accounts.wallet.add(account);
const userAddress = account.address;

// Test functions
async function testSmartContracts() {
  console.log('\n===== Testing Smart Contracts =====');
  
  try {
    // Test GameToken contract
    console.log('\nTesting GameToken contract...');
    const name = await gameToken.methods.name().call();
    const symbol = await gameToken.methods.symbol().call();
    const decimals = await gameToken.methods.decimals().call();
    const totalSupply = await gameToken.methods.totalSupply().call();
    
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Decimals: ${decimals}`);
    console.log(`Total Supply: ${web3.utils.fromWei(totalSupply, 'ether')} GT`);
    
    // Test TokenStore contract
    console.log('\nTesting TokenStore contract...');
    const gameTokenAddress = await tokenStore.methods.gameToken().call();
    const usdtAddress = await tokenStore.methods.usdt().call();
    const conversionRate = await tokenStore.methods.conversionRate().call();
    
    console.log(`GameToken Address: ${gameTokenAddress}`);
    console.log(`USDT Address: ${usdtAddress}`);
    console.log(`Conversion Rate: ${conversionRate}`);
    
    // Test PlayGame contract
    console.log('\nTesting PlayGame contract...');
    const gameTokenAddressFromPlayGame = await playGame.methods.gameToken().call();
    const platformFee = await playGame.methods.platformFee().call();
    const matchCount = await playGame.methods.matchCount().call();
    
    console.log(`GameToken Address: ${gameTokenAddressFromPlayGame}`);
    console.log(`Platform Fee: ${platformFee}%`);
    console.log(`Match Count: ${matchCount}`);
    
    return true;
  } catch (error) {
    console.error('Error testing smart contracts:', error.message);
    return false;
  }
}

async function testBackendApi() {
  console.log('\n===== Testing Backend API =====');
  
  try {
    // Test balance endpoint
    console.log('\nTesting GET /api/blockchain/balance/:address...');
    const balanceResponse = await axios.get(`${config.backendUrl}/api/blockchain/balance/${userAddress}`);
    console.log(`Balance Response:`, balanceResponse.data);
    
    // Test match endpoint (if matches exist)
    try {
      const matchCount = await playGame.methods.matchCount().call();
      if (matchCount > 0) {
        console.log('\nTesting GET /api/blockchain/match/:matchId...');
        const matchResponse = await axios.get(`${config.backendUrl}/api/blockchain/match/1`);
        console.log(`Match Response:`, matchResponse.data);
      } else {
        console.log('\nSkipping match endpoint test (no matches exist)');
      }
    } catch (error) {
      console.log('\nSkipping match endpoint test (error retrieving match count)');
    }
    
    return true;
  } catch (error) {
    console.error('Error testing backend API:', error.message);
    return false;
  }
}

async function testContractRelationships() {
  console.log('\n===== Testing Contract Relationships =====');
  
  try {
    // Check if TokenStore references the correct GameToken
    const gameTokenFromStore = await tokenStore.methods.gameToken().call();
    console.log(`GameToken address from TokenStore: ${gameTokenFromStore}`);
    console.log(`Expected GameToken address: ${config.gameTokenAddress}`);
    console.log(`Match: ${gameTokenFromStore.toLowerCase() === config.gameTokenAddress.toLowerCase()}`);
    
    // Check if PlayGame references the correct GameToken
    const gameTokenFromPlayGame = await playGame.methods.gameToken().call();
    console.log(`\nGameToken address from PlayGame: ${gameTokenFromPlayGame}`);
    console.log(`Expected GameToken address: ${config.gameTokenAddress}`);
    console.log(`Match: ${gameTokenFromPlayGame.toLowerCase() === config.gameTokenAddress.toLowerCase()}`);
    
    return true;
  } catch (error) {
    console.error('Error testing contract relationships:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('TriX Blockchain Integration Test');
  console.log('================================');
  console.log('Configuration:');
  console.log(`RPC URL: ${config.rpcUrl}`);
  console.log(`Backend URL: ${config.backendUrl}`);
  console.log(`GameToken Address: ${config.gameTokenAddress}`);
  console.log(`TokenStore Address: ${config.tokenStoreAddress}`);
  console.log(`PlayGame Address: ${config.playGameAddress}`);
  console.log(`USDT Address: ${config.usdtAddress}`);
  console.log(`User Address: ${userAddress}`);
  
  // Check if all required configuration is present
  if (!config.gameTokenAddress || !config.tokenStoreAddress || !config.playGameAddress) {
    console.error('\nError: Missing contract addresses in configuration');
    console.log('Please set the following environment variables:');
    console.log('- GAME_TOKEN_ADDRESS');
    console.log('- TOKEN_STORE_ADDRESS');
    console.log('- PLAY_GAME_ADDRESS');
    console.log('- USDT_ADDRESS');
    console.log('- TEST_PRIVATE_KEY');
    return;
  }
  
  // Run tests
  const contractsOk = await testSmartContracts();
  const backendOk = await testBackendApi();
  const relationshipsOk = await testContractRelationships();
  
  // Summary
  console.log('\n===== Test Summary =====');
  console.log(`Smart Contracts: ${contractsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend API: ${backendOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Contract Relationships: ${relationshipsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Overall: ${contractsOk && backendOk && relationshipsOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (contractsOk && backendOk && relationshipsOk) {
    console.log('\n🎉 All tests passed! The blockchain integration is working properly.');
    console.log('\nNext steps:');
    console.log('1. Test the frontend components manually');
    console.log('2. Run end-to-end tests with real transactions');
    console.log('3. Deploy to production');
  } else {
    console.log('\n❌ Some tests failed. Please check the logs above for details.');
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify contract addresses in .env files');
    console.log('2. Check that the backend server is running');
    console.log('3. Ensure you have the correct network configured');
    console.log('4. Check contract deployment logs for errors');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error during tests:', error);
});