// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./MessageTransmitter.sol";

/**
 * @title TokenMessenger
 * @notice Facilitates cross-chain USDC transfers via burn/mint
 * @dev Simplified CCTP TokenMessenger for testnet demonstration
 */
contract TokenMessenger is Ownable, Pausable {
    // Message transmitter for cross-chain messaging
    MessageTransmitter public messageTransmitter;

    // Local USDC token
    IERC20 public localToken;

    // Remote TokenMessenger contracts on other chains
    mapping(uint32 => bytes32) public remoteTokenMessengers;

    // Events
    event DepositForBurn(
        uint64 indexed nonce,
        address indexed burnToken,
        uint256 amount,
        address indexed depositor,
        bytes32 mintRecipient,
        uint32 destinationDomain,
        bytes32 destinationTokenMessenger,
        bytes32 destinationCaller
    );

    event MintAndWithdraw(
        address indexed mintRecipient,
        uint256 amount,
        address indexed mintToken
    );

    /**
     * @notice Constructor
     * @param _messageTransmitter Address of MessageTransmitter
     * @param _localToken Address of local USDC token
     */
    constructor(
        address _messageTransmitter,
        address _localToken
    ) Ownable(msg.sender) {
        require(_messageTransmitter != address(0), "Invalid message transmitter");
        require(_localToken != address(0), "Invalid local token");

        messageTransmitter = MessageTransmitter(_messageTransmitter);
        localToken = IERC20(_localToken);
    }

    /**
     * @notice Deposit and burn tokens to send cross-chain
     * @param amount Amount of tokens to burn
     * @param destinationDomain Destination domain identifier
     * @param mintRecipient Recipient address on destination chain (as bytes32)
     * @param burnToken Address of token to burn (must be localToken)
     * @return nonce Reserved nonce
     */
    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken
    ) external whenNotPaused returns (uint64) {
        return _depositForBurn(
            amount,
            destinationDomain,
            mintRecipient,
            burnToken,
            bytes32(0) // no destination caller restriction
        );
    }

    /**
     * @notice Deposit and burn tokens with destination caller
     * @param amount Amount of tokens to burn
     * @param destinationDomain Destination domain identifier
     * @param mintRecipient Recipient address on destination chain
     * @param burnToken Address of token to burn
     * @param destinationCaller Authorized caller on destination domain
     * @return nonce Reserved nonce
     */
    function depositForBurnWithCaller(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken,
        bytes32 destinationCaller
    ) external whenNotPaused returns (uint64) {
        return _depositForBurn(
            amount,
            destinationDomain,
            mintRecipient,
            burnToken,
            destinationCaller
        );
    }

    /**
     * @notice Internal deposit for burn logic
     */
    function _depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken,
        bytes32 destinationCaller
    ) internal returns (uint64) {
        require(amount > 0, "Amount must be > 0");
        require(burnToken == address(localToken), "Invalid burn token");
        require(mintRecipient != bytes32(0), "Invalid mint recipient");

        bytes32 remoteMessenger = remoteTokenMessengers[destinationDomain];
        require(remoteMessenger != bytes32(0), "Remote messenger not configured");

        // Transfer tokens from user to this contract
        require(
            localToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Burn the tokens (requires MockUSDC to have burn function)
        // In production USDC, TokenMessenger has minter role
        // For testing, we just hold the tokens (simulating burn)

        // Format burn message
        bytes memory burnMessage = _formatBurnMessage(
            0, // version
            bytes32(uint256(uint160(burnToken))),
            mintRecipient,
            amount,
            bytes32(uint256(uint160(msg.sender)))
        );

        // Send message via MessageTransmitter
        uint64 nonce = messageTransmitter.sendMessage(
            destinationDomain,
            remoteMessenger,
            burnMessage
        );

        emit DepositForBurn(
            nonce,
            burnToken,
            amount,
            msg.sender,
            mintRecipient,
            destinationDomain,
            remoteMessenger,
            destinationCaller
        );

        return nonce;
    }

    /**
     * @notice Handle incoming message to mint tokens
     * @param remoteDomain Domain of remote chain
     * @param sender Sender address on remote chain
     * @param messageBody Message body bytes
     */
    function handleReceiveMessage(
        uint32 remoteDomain,
        bytes32 sender,
        bytes calldata messageBody
    ) external returns (bool) {
        require(msg.sender == address(messageTransmitter), "Only MessageTransmitter");
        require(sender == remoteTokenMessengers[remoteDomain], "Invalid remote sender");

        // Parse burn message
        (
            ,
            ,
            bytes32 mintRecipientBytes,
            uint256 amount,
        ) = _parseBurnMessage(messageBody);

        address mintRecipient = address(uint160(uint256(mintRecipientBytes)));

        // Mint tokens (transfer from this contract in our simplified version)
        require(
            localToken.transfer(mintRecipient, amount),
            "Mint transfer failed"
        );

        emit MintAndWithdraw(mintRecipient, amount, address(localToken));

        return true;
    }

    /**
     * @notice Format burn message
     */
    function _formatBurnMessage(
        uint32 version,
        bytes32 burnToken,
        bytes32 mintRecipient,
        uint256 amount,
        bytes32 messageSender
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(
            version,
            burnToken,
            mintRecipient,
            amount,
            messageSender
        );
    }

    /**
     * @notice Parse burn message
     */
    function _parseBurnMessage(bytes calldata message)
        internal
        pure
        returns (
            uint32 version,
            bytes32 burnToken,
            bytes32 mintRecipient,
            uint256 amount,
            bytes32 messageSender
        )
    {
        version = uint32(bytes4(message[0:4]));
        burnToken = bytes32(message[4:36]);
        mintRecipient = bytes32(message[36:68]);
        amount = uint256(bytes32(message[68:100]));
        messageSender = bytes32(message[100:132]);
    }

    /**
     * @notice Add remote TokenMessenger for a domain
     * @param domain Remote domain identifier
     * @param tokenMessenger Remote TokenMessenger address (as bytes32)
     */
    function addRemoteTokenMessenger(
        uint32 domain,
        bytes32 tokenMessenger
    ) external onlyOwner {
        require(tokenMessenger != bytes32(0), "Invalid token messenger");
        remoteTokenMessengers[domain] = tokenMessenger;
    }

    /**
     * @notice Remove remote TokenMessenger
     * @param domain Remote domain identifier
     */
    function removeRemoteTokenMessenger(uint32 domain) external onlyOwner {
        delete remoteTokenMessengers[domain];
    }

    /**
     * @notice Pause deposits
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause deposits
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Recover tokens sent by mistake
     * @param token Token address
     * @param to Recipient address
     * @param amount Amount to recover
     */
    function rescueERC20(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        IERC20(token).transfer(to, amount);
    }
}
