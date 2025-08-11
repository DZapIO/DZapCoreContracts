// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { IBridge } from "../../Shared/Interfaces/IBridge.sol";
import { PermitBatchTransferFrom } from "../../Shared/Interfaces/IPermit2.sol";
import { InputToken, BridgeSwapData, SwapExecutionData, AdapterInfo } from "../../Shared/Types.sol";

interface IBridgeFacet is IBridge {
    /* ========= EXTERNAL ========= */

    /// @notice Bridges tokens to another chain
    /// @param _transactionId The transaction ID
    /// @param _feeData The fee data
    /// @param _feeVerificationSignature The fee verification signature
    /// @param _deadline The deadline of fee signature
    /// @param _intputTokens Input tokens needed for bridge
    /// @param _adapterInfo The adapter info
    function bridge(
        bytes calldata _transactionId,
        bytes calldata _feeData,
        bytes calldata _feeVerificationSignature,
        uint256 _deadline,
        InputToken calldata _intputTokens,
        AdapterInfo calldata _adapterInfo
    ) external payable;

    /// @notice Bridges tokens to another chain.
    /// @dev To use the full token amount obtained after a swap for bridging:
    ///      - Set `updateBridgeInAmount` to true in the swap parameters.
    ///      - Also set `_updateAmountIn` to true in the adapter info.
    ///      This ensures the bridge receives the exact amount output from the swap.
    /// @param _transactionId The transaction ID
    /// @param _feeData The fee data
    /// @param _feeVerificationSignature The fee verification signature
    /// @param _deadline The deadline of fee signature of fee signature
    /// @param _intputTokens Input tokens needed for swaps and bridge
    /// @param _swapData The swap data
    /// @param _swapExecutionData The swap execution data
    /// @param _adapterInfo The adapter info
    function bridge(
        bytes calldata _transactionId,
        bytes calldata _feeData,
        bytes calldata _feeVerificationSignature,
        uint256 _deadline,
        InputToken calldata _intputTokens,
        BridgeSwapData memory _swapData,
        SwapExecutionData memory _swapExecutionData,
        AdapterInfo calldata _adapterInfo
    ) external payable;

    /// @notice Bridges multiple tokens to another chain.
    /// @dev To use the full token amount obtained after a swap for bridging:
    ///      - Set `updateBridgeInAmount` to true in the swap parameters.
    ///      - Also set `_updateAmountIn` to true in the adapter info.
    ///      This ensures the bridge receives the exact amount output from the swap.
    /// @param _transactionId The transaction ID
    /// @param _feeData The fee data
    /// @param _feeVerificationSignature The fee verification signature
    /// @param _deadline The deadline of fee signature
    /// @param _intputTokens Input tokens needed for swaps and bridge
    /// @param _swapData The swap data
    /// @param _swapExecutionData The swap execution data
    /// @param _adapterInfo The adapter info
    function bridge(
        bytes calldata _transactionId,
        bytes calldata _feeData,
        bytes calldata _feeVerificationSignature,
        uint256 _deadline,
        InputToken[] calldata _intputTokens,
        BridgeSwapData[] memory _swapData,
        SwapExecutionData[] memory _swapExecutionData,
        AdapterInfo[] calldata _adapterInfo
    ) external payable;

    /// @notice Bridges multiple tokens to another chain.
    /// @dev To use the full token amount obtained after a swap for bridging:
    ///      - Set `updateBridgeInAmount` to true in the swap parameters.
    ///      - Also set `_updateAmountIn` to true in the adapter info.
    ///      This ensures the bridge receives the exact amount output from the swap.
    /// @param _transactionId The transaction ID
    /// @param _feeData The fee data
    /// @param _feeVerificationSignature The fee verification signature
    /// @param _batchDepositSignature Permit2 batchWitnessTransferFrom signature
    /// @param _deadline The deadline of fee signature
    /// @param _tokenDepositDetails The token deposit details
    /// @param _swapData The swap data
    /// @param _swapExecutionData The swap execution data
    /// @param _adapterInfo The adapter info
    function bridge(
        bytes calldata _transactionId,
        bytes calldata _feeData,
        bytes calldata _feeVerificationSignature,
        bytes calldata _batchDepositSignature,
        uint256 _deadline,
        PermitBatchTransferFrom calldata _tokenDepositDetails,
        BridgeSwapData[] memory _swapData,
        SwapExecutionData[] memory _swapExecutionData,
        AdapterInfo[] calldata _adapterInfo
    ) external payable;
}
