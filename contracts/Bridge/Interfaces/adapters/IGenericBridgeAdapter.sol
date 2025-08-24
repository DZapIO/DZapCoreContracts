// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
 * @title IRelayBridgeAdapter
 * @author DZap
 */
interface IGenericBridgeAdapter {
    /* ========= EXTERNAL ========= */

    /**
     * @notice Executes bridge through generic bridge protocols
     * @dev Flexible bridging method supporting most bridge protocols through
     *      standardized parameter mapping and calldata execution.
     *
     * @param _transactionId DZap transaction identifier
     * @param _user User address for tracking purposes
     * @param _maxAmountIn Maximum amount to bridge (swapOutAmount cap) - prevents bridging more than desired even if available
     *                      Examples:
     *                      - Balance: 14.9, Max: 10 → Use 10 (don't bridge more than max)
     *                      - Balance: 9.9, Max: 10 → Use 9.9 (bridge all available)
     * @param _from Source token address
     * @param _callTo Target contract for bridge execution
     * @param _approveTo Address that needs token approval (usually bridge contract)
     * @param _amountIn Amount of tokens to bridge
     * @param _offset Byte offset in calldata where amount should be updated
     * @param _extraNative Additional native tokens required for bridge
     * @param _destinationChainId Target blockchain chain ID
     * @param _bridge Bridge protocol identifier string
     * @param _receiver Encoded receiver address on destination
     * @param _to Encoded destination token address
     * @param _callData Encoded bridge execution calldata
     * @param _destinationCalldata Optional calldata for destination execution
     */
    function bridgeViaGeneric(
        bytes32 _transactionId,
        address _user,
        uint256 _maxAmountIn,
        address _from,
        address _callTo,
        address _approveTo,
        uint256 _amountIn,
        uint256 _offset,
        uint256 _extraNative,
        uint256 _destinationChainId,
        string calldata _bridge,
        bytes calldata _receiver,
        bytes calldata _to,
        bytes calldata _callData,
        bytes calldata _destinationCalldata
    ) external payable;
}
