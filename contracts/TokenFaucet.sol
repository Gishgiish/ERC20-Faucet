// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// TokenFaucet contract inherits from ERC-20 and uses ReentrancyGuard
contract TokenFaucet is ERC20, ReentrancyGuard {
    using Math for uint256;

    // Address of the contract owner
    address public owner;
    // Maximum amount of tokens a user can request
    uint256 public requestLimit;
    // Cooldown period between token requests for each user
    uint256 public requestCooldown;
    // Mapping to store the timestamp of the last token request for each user
    mapping(address => uint256) public lastRequestTimestamp;

    // Event emitted when tokens are requested
    event TokensRequested(address indexed recipient, uint256 amount);

    // Modifier to restrict access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    // Modifier to check if a user can request tokens
    modifier canRequestTokens() {
        // Check if the cooldown period has elapsed since the last request
        require(
            block.timestamp - (lastRequestTimestamp[msg.sender]) >=
                requestCooldown,
            "Cooldown not elapsed"
        );
        // Check if the faucet has enough tokens to fulfill the request
        require(
            balanceOf(address(this)) >= requestLimit,
            "Not enough tokens in the faucet"
        );
        _;
    }

    // Constructor to initialize the contract with initial supply, request limit, and cooldown period
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        uint256 _requestLimit,
        uint256 _requestCooldown
    ) ERC20(_name, _symbol) {
        // Mint initial supply to the contract owner
        _mint(msg.sender, _initialSupply);
        // Set the contract owner
        owner = msg.sender;
        // Set the request limit
        requestLimit = _requestLimit;
        _requestLimit < _initialSupply;
        // Set the request cooldown period
        requestCooldown = _requestCooldown;
    }

    // Function for users to request tokens from the faucet
    function requestTokens() external canRequestTokens nonReentrant {
        // Transfer tokens from the faucet to the user
        _transfer(address(this), msg.sender, requestLimit);
        // Update the last request timestamp for the user
        lastRequestTimestamp[msg.sender] = block.timestamp;
        // Emit an event indicating the tokens were requested
        emit TokensRequested(msg.sender, requestLimit);
    }

    // Function for the owner to set a new request limit
    function setRequestLimit(uint256 _newLimit) external onlyOwner {
        requestLimit = _newLimit;
    }

    // Function for the owner to set a new request cooldown period
    function setRequestCooldown(uint256 _newCooldown) external onlyOwner {
        requestCooldown = _newCooldown;
    }
}
