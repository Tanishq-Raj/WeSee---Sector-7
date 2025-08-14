// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./GameToken.sol";

/**
 * @title TokenStore
 * @dev Contract for purchasing Game Tokens (GT) using USDT
 * Uses a fixed conversion rate of 1 USDT = 1 GT
 */
contract TokenStore is Ownable, Pausable, ReentrancyGuard {
    // The Game Token contract
    GameToken public gameToken;
    
    // The USDT token contract
    IERC20 public usdtToken;
    
    // Conversion rate: 1 USDT = 1 GT (fixed rate)
    // Using 1e6 for USDT (6 decimals) and 1e18 for GT (18 decimals)
    uint256 public constant USDT_DECIMALS = 1e6;
    uint256 public constant GT_DECIMALS = 1e18;
    uint256 public constant RATE_MULTIPLIER = GT_DECIMALS / USDT_DECIMALS; // 1e12
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 usdtAmount, uint256 gtAmount);
    
    /**
     * @dev Constructor sets the GameToken and USDT token addresses
     * @param _gameToken Address of the GameToken contract
     * @param _usdtToken Address of the USDT token contract
     */
    constructor(address _gameToken, address _usdtToken) {
        require(_gameToken != address(0), "Invalid GameToken address");
        require(_usdtToken != address(0), "Invalid USDT address");
        
        gameToken = GameToken(_gameToken);
        usdtToken = IERC20(_usdtToken);
    }
    
    /**
     * @dev Purchase Game Tokens using USDT
     * @param usdtAmount Amount of USDT to spend (in USDT decimals)
     */
    function purchaseTokens(uint256 usdtAmount) external whenNotPaused nonReentrant {
        require(usdtAmount > 0, "Amount must be greater than 0");
        
        // Calculate GT amount based on fixed rate
        // 1 USDT (1e6) = 1 GT (1e18)
        uint256 gtAmount = usdtAmount * RATE_MULTIPLIER;
        
        // Transfer USDT from buyer to this contract
        require(usdtToken.transferFrom(msg.sender, address(this), usdtAmount), "USDT transfer failed");
        
        // Mint new GT tokens to the buyer
        gameToken.mint(msg.sender, gtAmount);
        
        emit TokensPurchased(msg.sender, usdtAmount, gtAmount);
    }
    
    /**
     * @dev Withdraw USDT from the contract (owner only)
     * @param amount Amount of USDT to withdraw
     * @param to Address to send the USDT to
     */
    function withdrawUSDT(uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Cannot withdraw to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= usdtToken.balanceOf(address(this)), "Insufficient balance");
        
        require(usdtToken.transfer(to, amount), "USDT transfer failed");
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}