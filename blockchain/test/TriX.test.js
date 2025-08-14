const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('TriX Gaming Platform', function () {
  let GameToken, TokenStore, PlayGame, MockUSDT;
  let gameToken, tokenStore, playGame, mockUSDT;
  let owner, player1, player2, apiGateway;

  const USDT_DECIMALS = 6;
  const GT_DECIMALS = 18;
  const RATE_MULTIPLIER = Math.pow(10, GT_DECIMALS - USDT_DECIMALS);

  beforeEach(async function () {
    // Get contract factories
    GameToken = await ethers.getContractFactory('GameToken');
    TokenStore = await ethers.getContractFactory('TokenStore');
    PlayGame = await ethers.getContractFactory('PlayGame');
    MockUSDT = await ethers.getContractFactory('ERC20');

    // Get signers
    [owner, player1, player2, apiGateway] = await ethers.getSigners();

    // Deploy contracts
    gameToken = await GameToken.deploy();
    mockUSDT = await MockUSDT.deploy('Tether USD', 'USDT');
    tokenStore = await TokenStore.deploy(gameToken.address, mockUSDT.address);
    playGame = await PlayGame.deploy(gameToken.address);

    // Setup
    await gameToken.setTokenStore(tokenStore.address);
    await playGame.setApiGateway(apiGateway.address);

    // Mint USDT to players
    const usdtAmount = ethers.utils.parseUnits('1000', USDT_DECIMALS);
    await mockUSDT.mint(player1.address, usdtAmount);
    await mockUSDT.mint(player2.address, usdtAmount);

    // Approve TokenStore to spend USDT
    await mockUSDT.connect(player1).approve(tokenStore.address, usdtAmount);
    await mockUSDT.connect(player2).approve(tokenStore.address, usdtAmount);
  });

  describe('Token Purchase', function () {
    it('Should allow players to purchase GT with USDT', async function () {
      const usdtAmount = ethers.utils.parseUnits('100', USDT_DECIMALS);
      const expectedGtAmount = usdtAmount.mul(RATE_MULTIPLIER);

      await tokenStore.connect(player1).purchaseTokens(usdtAmount);

      expect(await gameToken.balanceOf(player1.address)).to.equal(expectedGtAmount);
      expect(await mockUSDT.balanceOf(tokenStore.address)).to.equal(usdtAmount);
    });
  });

  describe('Match Creation and Joining', function () {
    beforeEach(async function () {
      // Purchase GT for both players
      const usdtAmount = ethers.utils.parseUnits('100', USDT_DECIMALS);
      await tokenStore.connect(player1).purchaseTokens(usdtAmount);
      await tokenStore.connect(player2).purchaseTokens(usdtAmount);

      // Approve PlayGame to spend GT
      const gtAmount = ethers.utils.parseEther('100');
      await gameToken.connect(player1).approve(playGame.address, gtAmount);
      await gameToken.connect(player2).approve(playGame.address, gtAmount);
    });

    it('Should allow a player to create a match', async function () {
      const matchId = 'match1';
      const stakeAmount = ethers.utils.parseEther('10');

      await playGame.connect(player1).createMatch(matchId, stakeAmount);

      const match = await playGame.matches(matchId);
      expect(match.player1).to.equal(player1.address);
      expect(match.stakeAmount).to.equal(stakeAmount);
      expect(match.isComplete).to.be.false;
    });

    it('Should allow a second player to join a match', async function () {
      const matchId = 'match1';
      const stakeAmount = ethers.utils.parseEther('10');

      await playGame.connect(player1).createMatch(matchId, stakeAmount);
      await playGame.connect(player2).joinMatch(matchId);

      const match = await playGame.matches(matchId);
      expect(match.player1).to.equal(player1.address);
      expect(match.player2).to.equal(player2.address);
      expect(match.isComplete).to.be.false;
    });
  });

  describe('Match Results and Payouts', function () {
    const matchId = 'match1';
    const stakeAmount = ethers.utils.parseEther('10');

    beforeEach(async function () {
      // Purchase GT for both players
      const usdtAmount = ethers.utils.parseUnits('100', USDT_DECIMALS);
      await tokenStore.connect(player1).purchaseTokens(usdtAmount);
      await tokenStore.connect(player2).purchaseTokens(usdtAmount);

      // Approve PlayGame to spend GT
      const gtAmount = ethers.utils.parseEther('100');
      await gameToken.connect(player1).approve(playGame.address, gtAmount);
      await gameToken.connect(player2).approve(playGame.address, gtAmount);

      // Create and join match
      await playGame.connect(player1).createMatch(matchId, stakeAmount);
      await playGame.connect(player2).joinMatch(matchId);
    });

    it('Should allow API Gateway to submit match results', async function () {
      // Record balances before payout
      const player1BalanceBefore = await gameToken.balanceOf(player1.address);
      const player2BalanceBefore = await gameToken.balanceOf(player2.address);

      // Submit result with player1 as winner
      await playGame.connect(apiGateway).submitMatchResult(matchId, player1.address);

      // Check match status
      const match = await playGame.matches(matchId);
      expect(match.isComplete).to.be.true;
      expect(match.winner).to.equal(player1.address);

      // Check balances after payout
      const player1BalanceAfter = await gameToken.balanceOf(player1.address);
      const player2BalanceAfter = await gameToken.balanceOf(player2.address);

      // Player1 should have received both stakes
      expect(player1BalanceAfter.sub(player1BalanceBefore)).to.equal(stakeAmount.mul(2));
      // Player2's balance should remain unchanged
      expect(player2BalanceAfter).to.equal(player2BalanceBefore);
    });

    it('Should not allow non-API Gateway to submit results', async function () {
      await expect(
        playGame.connect(player1).submitMatchResult(matchId, player1.address)
      ).to.be.revertedWith('Only API Gateway can submit results');
    });
  });

  describe('Emergency Functions', function () {
    const matchId = 'match1';
    const stakeAmount = ethers.utils.parseEther('10');

    beforeEach(async function () {
      // Purchase GT for both players
      const usdtAmount = ethers.utils.parseUnits('100', USDT_DECIMALS);
      await tokenStore.connect(player1).purchaseTokens(usdtAmount);
      await tokenStore.connect(player2).purchaseTokens(usdtAmount);

      // Approve PlayGame to spend GT
      const gtAmount = ethers.utils.parseEther('100');
      await gameToken.connect(player1).approve(playGame.address, gtAmount);
      await gameToken.connect(player2).approve(playGame.address, gtAmount);

      // Create match
      await playGame.connect(player1).createMatch(matchId, stakeAmount);
    });

    it('Should allow match creator to cancel match before second player joins', async function () {
      const balanceBefore = await gameToken.balanceOf(player1.address);

      await playGame.connect(player1).cancelMatch(matchId);

      const balanceAfter = await gameToken.balanceOf(player1.address);
      expect(balanceAfter.sub(balanceBefore)).to.equal(stakeAmount);

      // Match should be deleted
      const match = await playGame.matches(matchId);
      expect(match.player1).to.equal(ethers.constants.AddressZero);
    });

    it('Should allow owner to emergency refund stakes', async function () {
      // Player2 joins the match
      await playGame.connect(player2).joinMatch(matchId);

      // Record balances before refund
      const player1BalanceBefore = await gameToken.balanceOf(player1.address);
      const player2BalanceBefore = await gameToken.balanceOf(player2.address);

      // Owner performs emergency refund
      await playGame.connect(owner).emergencyRefund(matchId);

      // Check balances after refund
      const player1BalanceAfter = await gameToken.balanceOf(player1.address);
      const player2BalanceAfter = await gameToken.balanceOf(player2.address);

      // Both players should have received their stakes back
      expect(player1BalanceAfter.sub(player1BalanceBefore)).to.equal(stakeAmount);
      expect(player2BalanceAfter.sub(player2BalanceBefore)).to.equal(stakeAmount);

      // Match should be marked as complete
      const match = await playGame.matches(matchId);
      expect(match.isComplete).to.be.true;
    });
  });
});