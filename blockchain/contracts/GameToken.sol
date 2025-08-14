// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title GameToken
 * @dev ERC20 token for the TriX gaming platform
 * Only TokenStore can mint new tokens
 */
contract GameToken is ERC20, Ownable, Pausable {
    address public tokenStore;
    
    /**
     * @dev Constructor that gives the msg.sender all of the initial supply.
     */
    constructor() ERC20("Game Token", "GT") {
        // No initial supply - tokens are minted by TokenStore only
    }
    
    /**
     * @dev Set the TokenStore address that has permission to mint tokens
     * @param _tokenStore Address of the TokenStore contract
     */
    function setTokenStore(address _tokenStore) external onlyOwner {
        require(_tokenStore != address(0), "Invalid TokenStore address");
        tokenStore = _tokenStore;
    }
    
    /**
     * @dev Mint new tokens. Can only be called by the TokenStore contract.
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external whenNotPaused {
        require(msg.sender == tokenStore, "Only TokenStore can mint");
        require(to != address(0), "Cannot mint to zero address");
        _mint(to, amount);
    }
    
    /**
     * @dev Pause token transfers and minting
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers and minting
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer function to ensure the contract is not paused
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom function to ensure the contract is not paused
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
}