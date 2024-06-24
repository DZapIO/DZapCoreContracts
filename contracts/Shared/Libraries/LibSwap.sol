// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../Libraries/LibAsset.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { SwapData } from "../Types.sol";

import { SwapCallFailed, SlippageTooLow } from "../ErrorsNew.sol";

/// @title LibSwap
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
        if (returnToAmount < _swapData.minToAmount) revert SlippageTooLow(_swapData.minToAmount, returnToAmount);

        uint256 finalFromBalance = LibAsset.getOwnBalance(_swapData.from);
        if (finalFromBalance > initialFromBalance) {
            leftoverFromAmount = finalFromBalance - initialFromBalance;
        }
    }

    function swapDirectTransfer(SwapData calldata _swapData, address _recipient, bool _withoutRevert) internal returns (uint256 leftoverFromAmount, uint256 returnToAmount) {
        uint256 initialFromBalance = LibAsset.getOwnBalance(_swapData.from) - _swapData.fromAmount;
        uint256 initialToBalance = LibAsset.getBalance(_swapData.to, _recipient);
        uint256 nativeValue;

        if (LibAsset.isNativeToken(_swapData.from)) {
            nativeValue = _swapData.fromAmount;
        } else {
            LibAsset.approveERC20(_swapData.from, _swapData.approveTo, _swapData.fromAmount);
        }

        (bool success, bytes memory res) = _swapData.callTo.call{ value: nativeValue }(_swapData.swapCallData);

        if (!success) {
            if (_withoutRevert) {
                return (0, 0);
            }
            revert SwapCallFailed(res);
        }

        returnToAmount = LibAsset.getBalance(_swapData.to, _recipient) - initialToBalance;
        if (returnToAmount < _swapData.minToAmount) {
            revert SlippageTooLow(_swapData.minToAmount, returnToAmount);
        }

        uint256 finalFromBalance = LibAsset.getOwnBalance(_swapData.from);
        if (finalFromBalance > initialFromBalance) {
            leftoverFromAmount = finalFromBalance - initialFromBalance;
        }
    }

    function swapErc20ToErc20(SwapData calldata _swapData, address _recipient) internal returns (uint256 leftoverFromAmount, uint256 returnToAmount) {
        uint256 initialFromBalance = IERC20(_swapData.from).balanceOf(address(this)) - _swapData.fromAmount;
        uint256 initialToBalance = IERC20(_swapData.to).balanceOf(_recipient);

        LibAsset.approveERC20(_swapData.from, _swapData.approveTo, _swapData.fromAmount);

        (bool success, bytes memory res) = _swapData.callTo.call(_swapData.swapCallData);

        if (!success) revert SwapCallFailed(res);

        returnToAmount = IERC20(_swapData.to).balanceOf(_recipient) - initialToBalance;
        if (returnToAmount < _swapData.minToAmount) {
            revert SlippageTooLow(_swapData.minToAmount, returnToAmount);
        }

        uint256 finalFromBalance = LibAsset.getOwnBalance(_swapData.from);
        if (finalFromBalance > initialFromBalance) {
            leftoverFromAmount = finalFromBalance - initialFromBalance;
        }
    }

    function swapErc20ToNative(SwapData calldata _swapData, address _recipient) internal returns (uint256 leftoverFromAmount, uint256 returnToAmount) {
        uint256 initialFromBalance = IERC20(_swapData.from).balanceOf(address(this)) - _swapData.fromAmount;
        uint256 initialToBalance = _recipient.balance;

        LibAsset.approveERC20(_swapData.from, _swapData.approveTo, _swapData.fromAmount);

        (bool success, bytes memory res) = _swapData.callTo.call(_swapData.swapCallData);

        if (!success) revert SwapCallFailed(res);

        returnToAmount = _recipient.balance - initialToBalance;
        if (returnToAmount < _swapData.minToAmount) {
            revert SlippageTooLow(_swapData.minToAmount, returnToAmount);
        }

        uint256 finalFromBalance = LibAsset.getOwnBalance(_swapData.from);
        if (finalFromBalance > initialFromBalance) {
            leftoverFromAmount = finalFromBalance - initialFromBalance;
        }
    }

    function swapNativeToErc20(SwapData calldata _swapData, address _recipient) internal returns (uint256 leftoverFromAmount, uint256 returnToAmount) {
        uint256 initialFromBalance = address(this).balance - _swapData.fromAmount;
        uint256 initialToBalance = IERC20(_swapData.to).balanceOf(_recipient);

        (bool success, bytes memory res) = _swapData.callTo.call{ value: _swapData.fromAmount }(_swapData.swapCallData);

        if (!success) revert SwapCallFailed(res);

        returnToAmount = IERC20(_swapData.to).balanceOf(_recipient) - initialToBalance;
        if (returnToAmount < _swapData.minToAmount) {
            revert SlippageTooLow(_swapData.minToAmount, returnToAmount);
        }

        uint256 finalFromBalance = address(this).balance;
        if (finalFromBalance > initialFromBalance) {
            leftoverFromAmount = finalFromBalance - initialFromBalance;
        }
    }
}
