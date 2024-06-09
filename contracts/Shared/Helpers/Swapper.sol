// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { SwapData } from "../Types.sol";

import { LibAsset } from "../Libraries/LibAsset.sol";
import { LibAllowList } from "../Libraries/LibAllowList.sol";
import { LibSwap } from "../Libraries/LibSwap.sol";

import { ContractCallNotAllowed, SlippageTooHigh, ZeroAddress, SwapCallFailed, ZeroAddress, NoSwapFromZeroBalance, InvalidContract } from "../Errors.sol";

/// @title Swapper
/// @notice Abstract contract to provide swap functionality
abstract contract Swapper {
    /* ========= INTERNAL ========= */

    function _validateSwapData(SwapData calldata _swapData) internal view {
        if (!LibAllowList.contractIsAllowed(_swapData.callTo) || !LibAllowList.contractIsAllowed(_swapData.approveTo)) revert ContractCallNotAllowed();
        if (!LibAsset.isContract(_swapData.callTo)) revert InvalidContract();
        if (_swapData.fromAmount == 0) revert NoSwapFromZeroBalance();
    }

    function _executeSwaps(SwapData calldata _swapData, uint256 _totalTokenFees, bool _withoutRevert) internal returns (uint256 leftoverFromAmount, uint256 returnToAmount) {
        _validateSwapData(_swapData);

        (leftoverFromAmount, returnToAmount) = LibSwap.swap(_swapData, _totalTokenFees, _withoutRevert);
    }
}
