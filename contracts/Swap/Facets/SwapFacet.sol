// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";

import { PermitBatchTransferFrom } from "../../Shared/Interfaces/IPermit2.sol";
import { ISwapFacet } from "../Interfaces/ISwapFacet.sol";

import { Swapper } from "../../Shared/Helpers/Swapper.sol";
import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";
import { Pausable } from "../../Shared/Helpers/Pausable.sol";
import { ReentrancyGuard } from "../../Shared/Helpers/ReentrancyGuard.sol";

import { SwapData, SwapExecutionData, InputToken } from "../../Shared/Types.sol";

/// @title DZap Swap Facet
/// @notice Provides functionality for swapping through ANY APPROVED DEX
/// @dev Uses calldata to execute APPROVED arbitrary methods on DEXs
contract SwapFacet is ISwapFacet, Swapper, RefundNative, Pausable, ReentrancyGuard {
    /* ========= EXTERNAL ========= */

    /// @inheritdoc ISwapFacet
    function swap(
        bytes calldata _transactionId,
        bytes calldata _tokenApprovalData,
        SwapData calldata _swapData,
        SwapExecutionData calldata _swapExecutionData
    ) external payable refundExcessNative(msg.sender) whenNotPaused nonReentrant {
        if (!LibAsset.isNativeToken(_swapData.from)) {
            LibAsset.deposit(msg.sender, _swapData.from, _swapData.fromAmount, _tokenApprovalData);
        }

        _executeSwap(_transactionId, msg.sender, _swapData, _swapExecutionData, false);
    }

    /// @inheritdoc ISwapFacet
    function swap(
        bytes calldata _transactionId,
        InputToken[] calldata _inputTokens,
        SwapData[] calldata _swapData,
        SwapExecutionData[] calldata _swapExecutionData,
        bool withoutRevert
    ) external payable refundExcessNative(msg.sender) whenNotPaused nonReentrant {
        LibAsset.depositBatch(msg.sender, _inputTokens);

        _executeSwaps(_transactionId, msg.sender, _swapData, _swapExecutionData, withoutRevert);
    }

    /// @inheritdoc ISwapFacet
    function swap(
        bytes calldata _transactionId,
        bytes calldata _batchDepositSignature,
        PermitBatchTransferFrom calldata _tokenDepositDetails,
        SwapData[] calldata _swapData,
        SwapExecutionData[] calldata _swapExecutionData,
        bool withoutRevert
    ) external payable refundExcessNative(msg.sender) whenNotPaused nonReentrant {
        LibAsset.depositBatch(msg.sender, _tokenDepositDetails, _batchDepositSignature);

        _executeSwaps(_transactionId, msg.sender, _swapData, _swapExecutionData, withoutRevert);
    }
}
