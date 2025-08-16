// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { PermitBatchTransferFrom } from "../../Shared/Interfaces/IPermit2.sol";
import { SwapData, SwapExecutionData, InputToken } from "../../Shared/Types.sol";

/**
 * @title ISwapFacet
 * @author DZap
 */
interface ISwapFacet {
    /* ========= EXTERNAL ========= */

    /**
     * @notice Executes a single token swap using traditional approvals
     * @dev Standard swap function for simple token exchanges.
     *      Most suitable for basic swap operations and testing.
     *
     * @param _transactionId Unique identifier for tracking and preventing replay
     * @param _integrator Address for integrator fee sharing (can be zero address)
     * @param _tokenApprovalData Encoded data for token transfer authorization (simple approval, eip2612 permit, permit2 transferFrom)
     * @param _swapData Swap configuration including tokens, amounts, and slippage
     * @param _swapExecutionData Target contract and calldata for swap execution
     */
    function swap(
        bytes32 _transactionId,
        address _integrator,
        bytes calldata _tokenApprovalData,
        SwapData calldata _swapData,
        SwapExecutionData calldata _swapExecutionData
    ) external payable;

    /**
     * @notice Executes multiple token swaps in a single transaction
     * @dev Enables atomic multi-token swaps with optional failure tolerance.
     *
     * @param _transactionId Unique identifier for the batch operation
     * @param _integrator Integrator address for fee distribution
     * @param _inputTokens Array of input token specifications
     * @param _swapData Array of swap configurations for each operation
     * @param _swapExecutionData Array of execution parameters for each swap
     * @param withoutRevert If true, failed swaps don't revert the entire transaction
     */
    function swap(
        bytes32 _transactionId,
        address _integrator,
        InputToken[] calldata _inputTokens,
        SwapData[] calldata _swapData,
        SwapExecutionData[] calldata _swapExecutionData,
        bool withoutRevert
    ) external payable;

    /**
     * @notice Executes batch swaps using Permit2 signature-based transfers
     * @dev Most gas-efficient method for multi-token swaps. Uses Permit2 for
     *      signature-based token transfers, eliminating individual approvals.
     *
     * @param _transactionId Unique identifier for the batch swap operation
     * @param _integrator Integrator address for fee sharing
     * @param _batchDepositSignature EIP-712 signature for Permit2 batch transfer
     * @param _tokenDepositDetails Permit2 batch transfer structure with witness
     * @param _swapData Array of swap configurations
     * @param _swapExecutionData Array of execution parameters
     * @param withoutRevert If true, individual swap failures don't revert transaction
     */
    function swap(
        bytes32 _transactionId,
        address _integrator,
        bytes calldata _batchDepositSignature,
        PermitBatchTransferFrom calldata _tokenDepositDetails,
        SwapData[] calldata _swapData,
        SwapExecutionData[] calldata _swapExecutionData,
        bool withoutRevert
    ) external payable;
}
