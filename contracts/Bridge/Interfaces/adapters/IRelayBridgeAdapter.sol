// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
 * @notice Data structure for Relay bridge operations
 * @param amountIn Amount of tokens to bridge
 * @param requestId Unique identifier for the relay request
 */
struct RelayData {
    uint256 amountIn;
    bytes32 requestId;
}

/**
 * @title IRelayBridgeAdapter
 * @author DZap
 */
interface IRelayBridgeAdapter {
    /* ========= EVENT ========= */

    event RelayBridgeTransferStarted(
        bytes32 indexed transactionId,
        address indexed user,
        bytes reciever,
        address from,
        bytes to,
        RelayData relayData,
        uint256 destinationChainId,
        bytes destinationCalldata
    );

    /* ========= VIEW ========= */

    /**
     * @notice Returns Relay protocol addresses
     * @return receiver Address that receives bridged tokens
     * @return solver Address of the Relay solver for this chain
     */
    function getRelayAddress() external view returns (address receiver, address solver);

    /* ========= EXTERNAL ========= */

    /**
     * @notice Executes bridge transfer through Relay protocol
     * @param _transactionId DZap transaction identifier
     * @param _user User address for tracking and events
     * @param _updateAmountIn Whether to update amount based on previous operation
     * @param _from Source token address to bridge
     * @param _destinationChainId Target chain ID
     * @param _receiver Encoded receiver address on destination
     * @param _to Encoded destination token address
     * @param _destinationCalldata Optional calldata for destination execution
     * @param _relayData Relay-specific configuration and request data
     */
    function bridgeViaRelay(
        bytes32 _transactionId,
        address _user,
        bool _updateAmountIn,
        address _from,
        uint256 _destinationChainId,
        bytes calldata _receiver,
        bytes calldata _to,
        bytes calldata _destinationCalldata,
        RelayData memory _relayData
    ) external payable;
}
