// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { SwapData } from "../Types.sol";

import { LibAsset } from "../Libraries/LibAsset.sol";
import { LibUtil } from "../Libraries/LibUtil.sol";
import { InvalidContract, NoSwapFromZeroBalance, SwapCallFailed } from "../Errors.sol";

library LibSwap {
    event TokenSwapped(
        bytes32 transactionId,
        address callTo,
        address fromAssetId,
        address toAssetId,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 leftoverFromAmount,
        uint256 timestamp
    );

    function swap(
        bytes32 _transactionId,
        SwapData calldata _swapData
    ) external {
        if (!LibAsset.isContract(_swapData.callTo)) revert InvalidContract();
        if (_swapData.fromAmount == 0) revert NoSwapFromZeroBalance();

        uint256 initialFromBalance = LibAsset.getOwnBalance(_swapData.from);
        uint256 initialToBalance = LibAsset.getOwnBalance(_swapData.to);
        uint256 nativeValue;

        if (LibAsset.isNativeToken(_swapData.from)) {
            nativeValue = _swapData.fromAmount;
        } else {
            LibAsset.approveERC20(
                _swapData.from,
                _swapData.approveTo,
                _swapData.fromAmount
            );
        }

        (bool success, bytes memory res) = _swapData.callTo.call{
            value: nativeValue
        }(_swapData.swapCallData);

        uint256 leftoverFromAmount = LibAsset.getOwnBalance(_swapData.from) -
            (initialFromBalance - _swapData.fromAmount);

        uint256 returnToAmount = LibAsset.getOwnBalance(_swapData.to) -
            initialToBalance;

        if (!success) {
            LibUtil.getRevertMsg(res);
            revert SwapCallFailed(res);
        }

        emit TokenSwapped(
            _transactionId,
            _swapData.callTo,
            _swapData.from,
            _swapData.to,
            _swapData.fromAmount,
            returnToAmount,
            leftoverFromAmount,
            block.timestamp
        );
    }
}
