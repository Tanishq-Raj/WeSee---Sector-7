const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying TriX contracts...');

  // Get the contract factories
  const GameToken = await ethers.getContractFactory('GameToken');
  const TokenStore = await ethers.getContractFactory('TokenStore');
  const PlayGame = await ethers.getContractFactory('PlayGame');

  // Deploy GameToken
  console.log('Deploying GameToken...');
  const gameToken = await GameToken.deploy();
  await gameToken.deployed();
  console.log('GameToken deployed to:', gameToken.address);

  // For local testing, we'll deploy a mock USDT token
  // In production, you would use the actual USDT address on the network
  let usdtAddress;
  if (network.name === 'hardhat' || network.name === 'localhost') {
    console.log('Deploying Mock USDT for local testing...');
    const MockUSDT = await ethers.getContractFactory('ERC20');
    const mockUSDT = await MockUSDT.deploy('Tether USD', 'USDT');
    await mockUSDT.deployed();
    usdtAddress = mockUSDT.address;
    console.log('Mock USDT deployed to:', usdtAddress);

    // Mint some test USDT to the deployer
    const [deployer] = await ethers.getSigners();
    const mintAmount = ethers.utils.parseUnits('10000', 6); // USDT has 6 decimals
    await mockUSDT.mint(deployer.address, mintAmount);
    console.log('Minted test USDT to deployer');
  } else {
    // Use the actual USDT address for the network
    // These are example addresses and should be replaced with the actual ones
    const usdtAddresses = {
      testnet: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd', // BSC Testnet USDT
      mainnet: '0x55d398326f99059fF775485246999027B3197955', // BSC Mainnet USDT
    };
    usdtAddress = usdtAddresses[network.name] || usdtAddresses.testnet;
    console.log('Using existing USDT at:', usdtAddress);
  }

  // Deploy TokenStore with GameToken and USDT addresses
  console.log('Deploying TokenStore...');
  const tokenStore = await TokenStore.deploy(gameToken.address, usdtAddress);
  await tokenStore.deployed();
  console.log('TokenStore deployed to:', tokenStore.address);

  // Set TokenStore in GameToken
  console.log('Setting TokenStore in GameToken...');
  await gameToken.setTokenStore(tokenStore.address);
  console.log('TokenStore set in GameToken');

  // Deploy PlayGame with GameToken address
  console.log('Deploying PlayGame...');
  const playGame = await PlayGame.deploy(gameToken.address);
  await playGame.deployed();
  console.log('PlayGame deployed to:', playGame.address);

  // For demo purposes, set the deployer as the API Gateway
  // In production, this would be set to the actual API Gateway address
  const [deployer] = await ethers.getSigners();
  console.log('Setting API Gateway in PlayGame...');
  await playGame.setApiGateway(deployer.address);
  console.log('API Gateway set in PlayGame');

  console.log('\nDeployment complete!');
  console.log('\nContract Addresses:');
  console.log('GameToken:', gameToken.address);
  console.log('USDT:', usdtAddress);
  console.log('TokenStore:', tokenStore.address);
  console.log('PlayGame:', playGame.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });