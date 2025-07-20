// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { PermitBatchTransferFrom } from "../../Shared/Interfaces/IPermit2.sol";
import { SwapData, SwapExecutionData, InputToken } from "../../Shared/Types.sol";

interface ISwapFacet {
    /* ========= EXTERNAL ========= */

    function swap(
        bytes calldata _transactionId,
        bytes calldata _tokenApprovalData,
        SwapData calldata _swapData,
        SwapExecutionData calldata _swapExecutionData
    ) external payable;

    function swap(
        bytes calldata _transactionId,
        InputToken[] calldata _inputTokens,
        SwapData[] calldata _swapData,
        SwapExecutionData[] calldata _swapExecutionData,
        bool withoutRevert
    ) external payable;

    function swap(
        bytes calldata _transactionId,
        bytes calldata _batchDepositSignature,
        PermitBatchTransferFrom calldata _tokenDepositDetails,
        SwapData[] calldata _swapData,
        SwapExecutionData[] calldata _swapExecutionData,
        bool withoutRevert
    ) external payable;
}
