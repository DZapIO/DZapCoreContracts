// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { SwapData } from "../Types.sol";

import { LibBytes } from "../Libraries/LibBytes.sol";
import { LibAsset } from "../Libraries/LibAsset.sol";
import { LibFees } from "../Libraries/LibFees.sol";
import { LibUtil } from "../Libraries/LibUtil.sol";
import { LibBytes } from "../Libraries/LibBytes.sol";
import { LibAllowList } from "../Libraries/LibAllowList.sol";
import { LibSwap } from "../Libraries/LibSwap.sol";

import { ContractCallNotAllowed, SlippageTooHigh, ZeroAddress, SwapCallFailed, ZeroAddress, NoSwapFromZeroBalance, InvalidContract } from "../Errors.sol";

/// @title Swapper
/// @notice Abstract contract to provide swap functionality
contract Swapper {
    error PartialSwap(uint256 leftOverAmount);

    event SwappedTokens(bytes32 transactionId, address dex, address fromAssetId, address toAssetId, uint256 fromAmount, uint256 toAmount, uint256 leftoverFromAmount, uint256 timestamp);

    /* ========= INTERNAL ========= */

    /// @dev Refunds any excess native asset sent to the contract after the main function
    /// @notice Refunds any excess native asset sent to the contract after the main function
    /// @param _refundee Address to send refunds to
    modifier refundExcessNative(address _refundee) {
        uint256 initialBalance = address(this).balance - msg.value;
        _;
        uint256 finalBalance = address(this).balance;

        if (finalBalance > initialBalance) LibAsset.transferToken(LibAsset._NATIVE_TOKEN, _refundee, finalBalance - initialBalance);
    }

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
