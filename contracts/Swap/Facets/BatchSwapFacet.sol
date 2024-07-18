// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibSwap } from "../../Shared/Libraries/LibSwap.sol";

import { IBatchSwapFacet } from "../Interfaces/IBatchSwapFacet.sol";

import { Swapper } from "../../Shared/Helpers/Swapper.sol";
import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { SwapData, SwapInfo, FeeType, FeeInfo } from "../../Shared/Types.sol";
import { ZeroAddress, SwapCallFailed, ContractCallNotAllowed, IntegratorNotAllowed, InvalidAmount, AllSwapsFailed } from "../../Shared/ErrorsNew.sol";

contract BatchSwapFacet is IBatchSwapFacet, Swapper, RefundNative {
    function batchSwap(bytes32 _transactionId, address _integrator, address _recipient, SwapData[] calldata _data, bool[] calldata _isDirectTransfer) external payable refundExcessNative(msg.sender) {
        if (_recipient == address(0)) revert ZeroAddress();
        if (!LibFees.isIntegratorAllowed(_integrator)) revert IntegratorNotAllowed();

        uint256 length = _data.length;
        SwapInfo[] memory swapInfo = new SwapInfo[](length);

        for (uint256 i = 0; i < length; ) {
            SwapData memory swapData = _data[i];
            bool isDirectTransfer = _isDirectTransfer[i];

            if (!LibAsset.isNativeToken(swapData.from)) {
                LibAsset.permitAndTransferFromErc20(swapData.from, msg.sender, address(this), swapData.fromAmount, _data[i].permit);
            }

            (uint256 leftoverFromAmount, uint256 returnToAmount) = isDirectTransfer ? _executeSwaps(_data[i], _recipient, false) : _executeSwaps(_data[i], 0, false);

            if (leftoverFromAmount != 0 && !LibAsset.isNativeToken(swapData.from)) LibAsset.transferToken(swapData.from, msg.sender, leftoverFromAmount);
            if (!isDirectTransfer) LibAsset.transferToken(swapData.to, _recipient, returnToAmount);

            swapInfo[i] = SwapInfo(swapData.callTo, swapData.from, swapData.to, swapData.fromAmount, leftoverFromAmount, returnToAmount);
            unchecked {
                ++i;
            }
        }

        emit MultiSwapped(_transactionId, _integrator, msg.sender, _recipient, swapInfo);
    }
}
