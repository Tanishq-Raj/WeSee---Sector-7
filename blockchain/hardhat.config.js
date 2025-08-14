/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');

// Load environment variables if present
try {
  require('dotenv').config();
} catch (error) {
  console.log('No .env file found');
}

const PRIVATE_KEY = process.env.PRIVATE_KEY || '0000000000000000000000000000000000000000000000000000000000000000';

module.exports = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    testnet: {
      url: process.env.TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [PRIVATE_KEY],
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      gasPrice: 5000000000,
      accounts: [PRIVATE_KEY],
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 20000,
  },
};