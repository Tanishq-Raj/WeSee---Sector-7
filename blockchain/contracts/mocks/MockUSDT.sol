// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token for testing purposes
 */
contract MockUSDT is ERC20, Ownable {
    uint8 private _decimals = 6; // USDT has 6 decimals

    constructor() ERC20("Tether USD", "USDT") {}

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint new tokens (for testing only)
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}