// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev A mock USDT token for testing purposes
 */
contract MockUSDT is ERC20, Ownable {
    /**
     * @dev Constructor that gives the msg.sender all of the initial supply.
     */
    constructor() ERC20("Mock USDT", "USDT") {
        // Initial supply is 0
    }

    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address to, uint256 amount) public onlyOwner returns (bool) {
        _mint(to, amount);
        return true;
    }

    /**
     * @dev Function to get some test tokens
     * @param amount The amount of tokens to request (max 1000 tokens)
     */
    function faucet(uint256 amount) external {
        require(amount <= 1000 * 10**18, "MockUSDT: Cannot request more than 1000 tokens");
        _mint(msg.sender, amount);
    }
}