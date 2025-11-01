// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MessageTransmitter
 * @notice Handles cross-chain message transmission and attestation
 * @dev Simplified CCTP MessageTransmitter for testnet demonstration
 */
contract MessageTransmitter is Ownable, Pausable {
    // Domain identifier for this chain
    uint32 public immutable localDomain;

    // Nonce for messages sent from this domain
    uint64 private nextAvailableNonce;

    // Track used nonces to prevent replay attacks
    mapping(bytes32 => bool) public usedNonces;

    // Attester address for message verification
    address public attester;

    // Events
    event MessageSent(bytes message);
    event MessageReceived(
        address indexed caller,
        uint32 sourceDomain,
        uint64 nonce,
        bytes32 sender,
        bytes messageBody
    );

    /**
     * @notice Constructor
     * @param _localDomain Domain identifier for this chain
     */
    constructor(uint32 _localDomain) Ownable(msg.sender) {
        localDomain = _localDomain;
        nextAvailableNonce = 0;
        attester = msg.sender; // Owner is initial attester
    }

    /**
     * @notice Send a message to a destination domain
     * @param destinationDomain Domain of destination chain
     * @param recipient Address of message recipient on destination domain
     * @param messageBody Raw bytes content of message
     * @return nonce Reserved nonce
     */
    function sendMessage(
        uint32 destinationDomain,
        bytes32 recipient,
        bytes calldata messageBody
    ) external whenNotPaused returns (uint64) {
        uint64 nonce = nextAvailableNonce++;

        bytes memory message = _formatMessage(
            0, // version
            localDomain,
            destinationDomain,
            nonce,
            bytes32(uint256(uint160(msg.sender))),
            recipient,
            messageBody
        );

        emit MessageSent(message);
        return nonce;
    }

    /**
     * @notice Receive a cross-chain message
     * @param message The message bytes
     * @param attestation Attestation from Circle (simplified as signature)
     */
    function receiveMessage(
        bytes memory message,
        bytes calldata attestation
    ) external whenNotPaused returns (bool) {
        // Verify message hasn't been processed
        bytes32 messageHash = keccak256(message);
        bytes32 nonceId = _hashSourceAndNonce(
            _getSourceDomain(message),
            _getNonce(message)
        );

        require(!usedNonces[nonceId], "Message already received");

        // Verify attestation (simplified - just check it's from attester)
        require(_verifyAttestation(messageHash, attestation), "Invalid attestation");

        // Mark nonce as used
        usedNonces[nonceId] = true;

        // Emit event
        emit MessageReceived(
            msg.sender,
            _getSourceDomain(message),
            _getNonce(message),
            _getSender(message),
            _getMessageBody(message)
        );

        return true;
    }

    /**
     * @notice Format a message
     */
    function _formatMessage(
        uint32 version,
        uint32 sourceDomain,
        uint32 destinationDomain,
        uint64 nonce,
        bytes32 sender,
        bytes32 recipient,
        bytes memory messageBody
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(
            version,
            sourceDomain,
            destinationDomain,
            nonce,
            sender,
            recipient,
            messageBody
        );
    }

    /**
     * @notice Verify attestation signature (simplified)
     */
    function _verifyAttestation(
        bytes32 messageHash,
        bytes memory signature
    ) internal view returns (bool) {
        // In production, this would verify the Circle attestation signature
        // For testnet, we just check signature length
        return signature.length > 0;
    }

    /**
     * @notice Extract source domain from message
     */
    function _getSourceDomain(bytes memory message) internal pure returns (uint32) {
        bytes4 domainBytes;
        assembly {
            domainBytes := mload(add(message, 36)) // 32 (length) + 4 (offset)
        }
        return uint32(domainBytes);
    }

    /**
     * @notice Extract nonce from message
     */
    function _getNonce(bytes memory message) internal pure returns (uint64) {
        bytes8 nonceBytes;
        assembly {
            nonceBytes := mload(add(message, 44)) // 32 + 12
        }
        return uint64(nonceBytes);
    }

    /**
     * @notice Extract sender from message
     */
    function _getSender(bytes memory message) internal pure returns (bytes32) {
        bytes32 sender;
        assembly {
            sender := mload(add(message, 52)) // 32 + 20
        }
        return sender;
    }

    /**
     * @notice Extract message body from message
     */
    function _getMessageBody(bytes memory message) internal pure returns (bytes memory) {
        uint256 bodyStart = 84; // After all headers
        bytes memory body = new bytes(message.length - bodyStart);
        for (uint256 i = 0; i < body.length; i++) {
            body[i] = message[bodyStart + i];
        }
        return body;
    }

    /**
     * @notice Hash source and nonce for replay protection
     */
    function _hashSourceAndNonce(
        uint32 sourceDomain,
        uint64 nonce
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(sourceDomain, nonce));
    }

    /**
     * @notice Set attester address
     * @param _attester New attester address
     */
    function setAttester(address _attester) external onlyOwner {
        require(_attester != address(0), "Invalid attester");
        attester = _attester;
    }

    /**
     * @notice Pause message transmission
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause message transmission
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
