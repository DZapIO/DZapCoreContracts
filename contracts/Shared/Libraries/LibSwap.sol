// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../Libraries/LibAsset.sol";
import { SwapExecutionData } from "../Types.sol";
import { SwapCallFailed, SlippageTooHigh } from "../Errors.sol";

/// @title DZap LibSwap
/// @notice This library contains helpers for doing swap
library LibSwap {
    function swap(
        address _user,
        address _recipient,
        address _from,
        address _to,
        uint256 _fromAmount,
        uint256 _minToAmount,
        SwapExecutionData memory _swapExecutionData,
        bool _withoutRevert
    ) internal returns (uint256 returnToAmount) {
        address recipient = _swapExecutionData.isDirectTransfer ? _recipient : address(this);
        uint256 initialToBalance = LibAsset.getBalance(_to, recipient);
        uint256 nativeValue;

        if (LibAsset.isNativeToken(_from)) {
            nativeValue = _fromAmount;
        } else {
            LibAsset.maxApproveERC20(_from, _swapExecutionData.approveTo, _fromAmount);
        }

        (bool success, bytes memory res) = _swapExecutionData.callTo.call{ value: nativeValue }(_swapExecutionData.swapCallData);

        if (!success) {
            if (_withoutRevert) {
                LibAsset.transferToken(_from, _user, _fromAmount);
                return (0);
            }
            revert SwapCallFailed(_swapExecutionData.callTo, bytes4(_swapExecutionData.swapCallData), res);
        }

        returnToAmount = LibAsset.getBalance(_to, recipient) - initialToBalance;
        if (returnToAmount < _minToAmount) revert SlippageTooHigh(_minToAmount, returnToAmount);
        if (!_swapExecutionData.isDirectTransfer && _recipient != address(this)) LibAsset.transferToken(_to, _recipient, returnToAmount);
    }
}
