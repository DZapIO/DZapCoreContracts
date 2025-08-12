// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
 * @title IDirectTransferAdapter
 * @author DZap
 */
interface IDirectTransferAdapter {
    /* ========= EXTERNAL ========= */

    /**
     * @notice Executes direct token transfer to another chain
     * @dev Simple transfer mechanism for tokens that exist natively on both
     *      source and destination chains.
     *
     * @param _transactionId DZap transaction identifier
     * @param _user User address for tracking and events
     * @param _updateAmountIn Whether to use dynamic amount from previous operation
     * @param _from Source token address to transfer
     * @param _transferTo Token deposit address
     * @param _amountIn Amount of tokens to transfer
     * @param _destinationChainId Target blockchain chain ID
     * @param _bridge Bridge/transfer protocol identifier
     * @param _receiver Encoded receiver address on destination chain
     * @param _to Encoded destination token address
     * @param _destinationCalldata Optional calldata for destination execution
     */
    function bridgeViaTransfer(
        bytes32 _transactionId,
        address _user,
        bool _updateAmountIn,
        address _from,
        address _transferTo,
        uint256 _amountIn,
        uint256 _destinationChainId,
        string calldata _bridge,
        bytes calldata _receiver,
        bytes calldata _to,
        bytes calldata _destinationCalldata
    ) external payable;
}
