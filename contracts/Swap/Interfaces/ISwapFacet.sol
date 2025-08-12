// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { PermitBatchTransferFrom } from "../../Shared/Interfaces/IPermit2.sol";
import { SwapData, SwapExecutionData, InputToken } from "../../Shared/Types.sol";

interface ISwapFacet {
    /* ========= EXTERNAL ========= */

    /// @notice Swaps tokens
    /// @param _transactionId The transaction ID
    /// @param _integrator The integrator id
    /// @param _tokenApprovalData The token approval data
    /// @param _swapData The swap data
    /// @param _swapExecutionData The swap execution data
    function swap(
        bytes32 _transactionId,
        address _integrator,
        bytes calldata _tokenApprovalData,
        SwapData calldata _swapData,
        SwapExecutionData calldata _swapExecutionData
    ) external payable;

    /// @notice Swaps tokens
    /// @param _transactionId The transaction ID
    /// @param _inputTokens The input tokens
    /// @param _swapData The swap data
    /// @param _swapExecutionData The swap execution data
    /// @param withoutRevert Whether to revert on failure
    function swap(
        bytes32 _transactionId,
        address _integrator,
        InputToken[] calldata _inputTokens,
        SwapData[] calldata _swapData,
        SwapExecutionData[] calldata _swapExecutionData,
        bool withoutRevert
    ) external payable;

    /// @notice Swaps tokens
    /// @param _transactionId The transaction ID
    /// @param _batchDepositSignature Permit2 batchWitnessTransferFrom signature
    /// @param _tokenDepositDetails The token deposit details
    /// @param _swapData The swap data
    /// @param _swapExecutionData The swap execution data
    /// @param withoutRevert Whether to revert on failure
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
