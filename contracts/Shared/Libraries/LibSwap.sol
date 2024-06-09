// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../Libraries/LibAsset.sol";

import { SwapData } from "../Types.sol";

import { SwapCallFailed, SlippageTooHigh } from "../Errors.sol";

/// @title LibPermit
/// @notice This library contains helpers for doing swap
library LibSwap {
    function swap(SwapData calldata _swapData, uint256 _totalTokenFees, bool _withoutRevert) internal returns (uint256 leftoverFromAmount, uint256 returnToAmount) {
        uint256 fromAmount = _swapData.fromAmount - _totalTokenFees;
        uint256 initialFromBalance = LibAsset.getOwnBalance(_swapData.from) - fromAmount;
        uint256 initialToBalance = LibAsset.getOwnBalance(_swapData.to);
        uint256 nativeValue;

        if (LibAsset.isNativeToken(_swapData.from)) {
            nativeValue = fromAmount;
        } else {
            LibAsset.approveERC20(_swapData.from, _swapData.approveTo, fromAmount);
        }

        (bool success, bytes memory res) = _swapData.callTo.call{ value: nativeValue }(_swapData.swapCallData);

        if (!success) {
            if (_withoutRevert) {
                return (0, 0);
            }
            revert SwapCallFailed(res);
        }

        returnToAmount = LibAsset.getOwnBalance(_swapData.to) - initialToBalance;

        if (returnToAmount < _swapData.minToAmount) revert SlippageTooHigh(_swapData.minToAmount, returnToAmount);

        if (LibAsset.getOwnBalance(_swapData.from) > initialFromBalance) {
            leftoverFromAmount = LibAsset.getOwnBalance(_swapData.from) - initialFromBalance;
        }
    }
}
