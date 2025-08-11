// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAllowList } from "../Libraries/LibAllowList.sol";
import { LibAsset } from "../Libraries/LibAsset.sol";
import { LibSwap } from "../Libraries/LibSwap.sol";

import { SwapData, SwapExecutionData, SwapInfo, BridgeSwapData } from "../Types.sol";
import { DexNotWhitelised, NullAddrIsNotAValidRecipient, NoSwapFromZeroAmount } from "../Errors.sol";

/// @title DZap Swapper
/// @notice Abstract contract to provide swap functionality
abstract contract Swapper {
    /* ========= EVENTS ========= */

    event DZapTokenSwapped(bytes indexed transactionId, address indexed sender, SwapInfo swapInfo);
    event DZapBatchTokenSwapped(bytes indexed transactionId, address indexed sender, SwapInfo[] swapInfo);

    /* ========= INTERNAL ========= */

    /// @notice Validates the swap data
    function _validateSwapData(address _recipient, uint256 _fromAmount, SwapExecutionData memory _swapExecutionData) internal view {
        if (!LibAllowList.isDexWhitelisted(_swapExecutionData.callTo)) revert DexNotWhitelised(_swapExecutionData.callTo);
        if (_recipient == address(0)) revert NullAddrIsNotAValidRecipient();
        if (_fromAmount == 0) revert NoSwapFromZeroAmount();
    }

    /// @notice Executes a swap
    function _executeSwap(
        bytes memory _transactionId,
        address _user,
        SwapData memory _swapData,
        SwapExecutionData memory _swapExecutionData,
        bool _withoutRevert
    ) internal {
        _validateSwapData(_swapData.recipient, _swapData.fromAmount, _swapExecutionData);
        uint256 returnToAmount = LibSwap.swap(
            _user,
            _swapData.recipient,
            _swapData.from,
            _swapData.to,
            _swapData.fromAmount,
            _swapData.minToAmount,
            _swapExecutionData,
            _withoutRevert
        );

        emit DZapTokenSwapped(
            _transactionId,
            _user,
            SwapInfo(
                _swapExecutionData.dex,
                _swapExecutionData.callTo,
                _swapData.recipient,
                _swapData.from,
                _swapData.to,
                _swapData.fromAmount,
                returnToAmount
            )
        );
    }

    /// @notice Executes multiple swaps
    function _executeSwaps(
        bytes memory _transactionId,
        address _user,
        SwapData[] memory _swapData,
        SwapExecutionData[] memory _swapExecutionData,
        bool _withoutRevert
    ) internal {
        uint256 length = _swapData.length;
        uint256 i;
        SwapInfo[] memory swapInfo = new SwapInfo[](length);
        uint256 returnToAmount;

        for (i; i < length; ) {
            SwapData memory swapData = _swapData[i];
            SwapExecutionData memory swapExecutionData = _swapExecutionData[i];

            _validateSwapData(swapData.recipient, swapData.fromAmount, swapExecutionData);
            returnToAmount = LibSwap.swap(
                _user,
                swapData.recipient,
                swapData.from,
                swapData.to,
                swapData.fromAmount,
                swapData.minToAmount,
                swapExecutionData,
                _withoutRevert
            );

            swapInfo[i] = SwapInfo(
                swapExecutionData.dex,
                swapExecutionData.callTo,
                swapData.recipient,
                swapData.from,
                swapData.to,
                swapData.fromAmount,
                returnToAmount
            );
            unchecked {
                ++i;
            }
        }

        if (length > 0) emit DZapBatchTokenSwapped(_transactionId, _user, swapInfo);
    }

    /// @notice Executes a bridge swap
    /// @dev Sweep dust if full return amount is not going to be used in bridge
    function _executeBridgeSwap(
        bytes memory _transactionId,
        address _user,
        BridgeSwapData memory _swapData,
        SwapExecutionData memory _swapExecutionData,
        bool _withoutRevert
    ) internal {
        _validateSwapData(_swapData.recipient, _swapData.fromAmount, _swapExecutionData);
        uint256 returnToAmount = LibSwap.swap(
            _user,
            _swapData.recipient,
            _swapData.from,
            _swapData.to,
            _swapData.fromAmount,
            _swapData.minToAmount,
            _swapExecutionData,
            _withoutRevert
        );

        // sweep dust
        if (_swapData.recipient == address(this) && !_swapData.updateBridgeInAmount) {
            LibAsset.transferToken(_swapData.to, _user, returnToAmount - _swapData.minToAmount);
        }

        emit DZapTokenSwapped(
            _transactionId,
            _user,
            SwapInfo(
                _swapExecutionData.dex,
                _swapExecutionData.callTo,
                _swapData.recipient,
                _swapData.from,
                _swapData.to,
                _swapData.fromAmount,
                returnToAmount
            )
        );
    }

    /// @notice Executes multiple bridge swaps
    /// @dev Sweep dust if full return amount is not going to be used in bridge
    function _executeBridgeSwaps(
        bytes memory _transactionId,
        address _user,
        BridgeSwapData[] memory _swapData,
        SwapExecutionData[] memory _swapExecutionData,
        bool _withoutRevert
    ) internal {
        uint256 length = _swapData.length;
        uint256 i;
        SwapInfo[] memory swapInfo = new SwapInfo[](length);
        uint256 returnToAmount;

        for (i; i < length; ) {
            BridgeSwapData memory swapData = _swapData[i];
            SwapExecutionData memory swapExecutionData = _swapExecutionData[i];

            _validateSwapData(swapData.recipient, swapData.fromAmount, swapExecutionData);
            returnToAmount = LibSwap.swap(
                _user,
                swapData.recipient,
                swapData.from,
                swapData.to,
                swapData.fromAmount,
                swapData.minToAmount,
                swapExecutionData,
                _withoutRevert
            );

            if (swapData.recipient == address(this) && !swapData.updateBridgeInAmount) {
                LibAsset.transferToken(swapData.to, _user, returnToAmount - swapData.minToAmount);
            }

            swapInfo[i] = SwapInfo(
                swapExecutionData.dex,
                swapExecutionData.callTo,
                swapData.recipient,
                swapData.from,
                swapData.to,
                swapData.fromAmount,
                returnToAmount
            );
            unchecked {
                ++i;
            }
        }

        if (length > 0) emit DZapBatchTokenSwapped(_transactionId, _user, swapInfo);
    }
}
