// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { SwapData } from "../Types.sol";

import { LibAsset } from "../Libraries/LibAsset.sol";
import { LibUtil } from "../Libraries/LibUtil.sol";
import { InvalidContract, NoSwapFromZeroBalance, SwapCallFailed, SlippageTooHigh } from "../Errors.sol";

/// @title LibPermit
/// @notice This library contains helpers for doing swap
library LibSwap {
    function swap(
        SwapData calldata _swapData,
        uint256 _totalTokenFees,
        bool _withoutRevert
    ) internal returns (uint256 leftoverFromAmount, uint256 returnToAmount) {
        if (!LibAsset.isContract(_swapData.callTo)) revert InvalidContract();
        if (_swapData.fromAmount == 0) revert NoSwapFromZeroBalance();

        uint256 fromAmount = _swapData.fromAmount - _totalTokenFees;

        uint256 initialFromBalance = LibAsset.getOwnBalance(_swapData.from);
        uint256 initialToBalance = LibAsset.getOwnBalance(_swapData.to);
        uint256 nativeValue;

        if (LibAsset.isNativeToken(_swapData.from)) {
            nativeValue = fromAmount;
        } else {
            LibAsset.approveERC20(
                _swapData.from,
                _swapData.approveTo,
                fromAmount
            );
        }

        (bool success, bytes memory res) = _swapData.callTo.call{
            value: nativeValue
        }(_swapData.swapCallData);

        if (!success) {
            if (_withoutRevert) {
                return (0, 0);
            }
            LibUtil.getRevertMsg(res);
            revert SwapCallFailed(res);
        }

        returnToAmount =
            LibAsset.getOwnBalance(_swapData.to) -
            initialToBalance;

        if (returnToAmount < _swapData.minToAmount)
            revert SlippageTooHigh(_swapData.minToAmount, returnToAmount);

        leftoverFromAmount =
            LibAsset.getOwnBalance(_swapData.from) -
            (initialFromBalance - fromAmount);
    }
}
