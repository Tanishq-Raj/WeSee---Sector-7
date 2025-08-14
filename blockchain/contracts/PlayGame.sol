// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./GameToken.sol";

/**
 * @title PlayGame
 * @dev Contract for handling match staking and winner payouts
 */
contract PlayGame is Ownable, Pausable, ReentrancyGuard {
    // The Game Token contract
    GameToken public gameToken;
    
    // API Gateway address that can submit match results
    address public apiGateway;
    
    // Match data structure
    struct Match {
        string matchId;
        address player1;
        address player2;
        uint256 stakeAmount;
        bool isComplete;
        address winner;
    }
    
    // Mapping from match ID to Match data
    mapping(string => Match) public matches;
    
    // Events
    event MatchCreated(string matchId, address player1, address player2, uint256 stakeAmount);
    event PlayerJoined(string matchId, address player);
    event MatchComplete(string matchId, address winner, uint256 payout);
    
    /**
     * @dev Constructor sets the GameToken address
     * @param _gameToken Address of the GameToken contract
     */
    constructor(address _gameToken) {
        require(_gameToken != address(0), "Invalid GameToken address");
        gameToken = GameToken(_gameToken);
    }
    
    /**
     * @dev Set the API Gateway address that can submit match results
     * @param _apiGateway Address of the API Gateway
     */
    function setApiGateway(address _apiGateway) external onlyOwner {
        require(_apiGateway != address(0), "Invalid API Gateway address");
        apiGateway = _apiGateway;
    }
    
    /**
     * @dev Create a new match with the first player
     * @param matchId Unique identifier for the match
     * @param stakeAmount Amount of GT to stake
     */
    function createMatch(string calldata matchId, uint256 stakeAmount) external whenNotPaused nonReentrant {
        require(bytes(matchId).length > 0, "Match ID cannot be empty");
        require(stakeAmount > 0, "Stake amount must be greater than 0");
        require(matches[matchId].player1 == address(0), "Match ID already exists");
        
        // Check if player has enough GT and transfer to this contract
        require(gameToken.balanceOf(msg.sender) >= stakeAmount, "Insufficient GT balance");
        require(gameToken.transferFrom(msg.sender, address(this), stakeAmount), "GT transfer failed");
        
        // Create new match with first player
        matches[matchId] = Match({
            matchId: matchId,
            player1: msg.sender,
            player2: address(0),
            stakeAmount: stakeAmount,
            isComplete: false,
            winner: address(0)
        });
        
        emit MatchCreated(matchId, msg.sender, address(0), stakeAmount);
    }
    
    /**
     * @dev Second player joins an existing match
     * @param matchId Identifier of the match to join
     */
    function joinMatch(string calldata matchId) external whenNotPaused nonReentrant {
        Match storage match_ = matches[matchId];
        
        require(match_.player1 != address(0), "Match does not exist");
        require(match_.player2 == address(0), "Match already has two players");
        require(match_.player1 != msg.sender, "Cannot join your own match");
        require(!match_.isComplete, "Match is already complete");
        
        uint256 stakeAmount = match_.stakeAmount;
        
        // Check if player has enough GT and transfer to this contract
        require(gameToken.balanceOf(msg.sender) >= stakeAmount, "Insufficient GT balance");
        require(gameToken.transferFrom(msg.sender, address(this), stakeAmount), "GT transfer failed");
        
        // Add second player to the match
        match_.player2 = msg.sender;
        
        emit PlayerJoined(matchId, msg.sender);
    }
    
    /**
     * @dev Submit match result (only callable by API Gateway)
     * @param matchId Identifier of the completed match
     * @param winner Address of the winning player
     */
    function submitMatchResult(string calldata matchId, address winner) external whenNotPaused nonReentrant {
        require(msg.sender == apiGateway, "Only API Gateway can submit results");
        
        Match storage match_ = matches[matchId];
        
        require(match_.player1 != address(0), "Match does not exist");
        require(match_.player2 != address(0), "Match does not have two players");
        require(!match_.isComplete, "Match is already complete");
        require(winner == match_.player1 || winner == match_.player2, "Winner must be a match player");
        
        // Mark match as complete
        match_.isComplete = true;
        match_.winner = winner;
        
        // Calculate total payout (both players' stakes)
        uint256 totalPayout = match_.stakeAmount * 2;
        
        // Transfer total staked amount to winner
        require(gameToken.transfer(winner, totalPayout), "GT transfer failed");
        
        emit MatchComplete(matchId, winner, totalPayout);
    }
    
    /**
     * @dev Cancel a match that hasn't been joined by a second player yet
     * @param matchId Identifier of the match to cancel
     */
    function cancelMatch(string calldata matchId) external nonReentrant {
        Match storage match_ = matches[matchId];
        
        require(match_.player1 == msg.sender, "Only match creator can cancel");
        require(match_.player2 == address(0), "Cannot cancel match with two players");
        require(!match_.isComplete, "Match is already complete");
        
        // Refund stake to player1
        uint256 refundAmount = match_.stakeAmount;
        require(gameToken.transfer(match_.player1, refundAmount), "GT transfer failed");
        
        // Mark match as complete with no winner
        match_.isComplete = true;
        
        // Clean up match data
        delete matches[matchId];
    }
    
    /**
     * @dev Emergency function to refund stakes for a match (owner only)
     * @param matchId Identifier of the match to refund
     */
    function emergencyRefund(string calldata matchId) external onlyOwner nonReentrant {
        Match storage match_ = matches[matchId];
        
        require(match_.player1 != address(0), "Match does not exist");
        require(!match_.isComplete, "Match is already complete");
        
        // Mark match as complete
        match_.isComplete = true;
        
        // Refund stake to player1
        if (match_.player1 != address(0)) {
            require(gameToken.transfer(match_.player1, match_.stakeAmount), "GT transfer to player1 failed");
        }
        
        // Refund stake to player2 if they joined
        if (match_.player2 != address(0)) {
            require(gameToken.transfer(match_.player2, match_.stakeAmount), "GT transfer to player2 failed");
        }
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