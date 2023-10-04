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

import { ContractCallNotAllowed, NoSwapFromZeroBalance, SlippageTooHigh, ZeroAddress, SwapCallFailed, ZeroAddress } from "../Errors.sol";

/// @title Swapper
/// @notice Abstract contract to provide swap functionality
contract Swapper {
    error PartialSwap(uint256 leftOverAmount);

    event SwappedTokens(
        bytes32 transactionId,
        address dex,
        address fromAssetId,
        address toAssetId,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 leftoverFromAmount,
        uint256 timestamp
    );

    /* ========= INTERNAL ========= */

    /// @dev Refunds any excess native asset sent to the contract after the main function
    /// @notice Refunds any excess native asset sent to the contract after the main function
    /// @param _refundee Address to send refunds to
    modifier refundExcessNative(address _refundee) {
        if (_refundee == address(0)) revert ZeroAddress();
        uint256 initialBalance = address(this).balance - msg.value;
        _;

        uint256 finalBalance = address(this).balance;

        uint256 excess = finalBalance > initialBalance
            ? finalBalance - initialBalance
            : 0;
        if (excess > 0) {
            LibAsset.transferToken(LibAsset._NATIVE_TOKEN, _refundee, excess);
        }
    }

    /* ========= INTERNAL ========= */

    function _executeSwaps(
        SwapData calldata _swapData,
        uint256 _totalTokenFees,
        bool _withoutRevert
    ) internal returns (uint256 leftoverFromAmount, uint256 returnToAmount) {
        if (
            !((LibAsset.isNativeToken(_swapData.from) ||
                LibAllowList.contractIsAllowed(_swapData.approveTo)) &&
                LibAllowList.contractIsAllowed(_swapData.callTo) &&
                LibAllowList.selectorIsAllowed(
                    _swapData.callTo,
                    LibBytes.getFirst4Bytes(_swapData.swapCallData)
                ))
        ) revert ContractCallNotAllowed();

        (leftoverFromAmount, returnToAmount) = LibSwap.swap(
            _swapData,
            _totalTokenFees,
            _withoutRevert
        );
    }
}
