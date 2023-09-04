// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { SwapData } from "../Types.sol";

import { LibBytes } from "../Libraries/LibBytes.sol";
import { LibAsset } from "../Libraries/LibAsset.sol";
import { LibFees } from "../Libraries/LibFees.sol";
import { LibUtil } from "../Libraries/LibUtil.sol";
import { LibBytes } from "../Libraries/LibBytes.sol";
import { LibAllowList } from "../Libraries/LibAllowList.sol";

import { ContractCallNotAllowed, NoSwapFromZeroBalance, SlippageTooHigh, ZeroAddress, SwapCallFailed, ZeroAddress } from "../Errors.sol";

// import "hardhat/console.sol";

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
            // console.log("refundExcessNative", excess);
            LibAsset.transferToken(LibAsset._NATIVE_TOKEN, _refundee, excess);
        }
    }

    /* ========= INTERNAL ========= */

    function _executeSwaps(
        SwapData calldata _swapData,
        uint256 _totalTokenFees,
        bool _withoutRevert
    ) internal returns (uint256 leftoverFromAmount, uint256 returnToAmount) {
        // console.log("---------_executeSwaps--------");
        if (
            !((LibAsset.isNativeToken(_swapData.from) ||
                LibAllowList.contractIsAllowed(_swapData.approveTo)) &&
                LibAllowList.contractIsAllowed(_swapData.callTo) &&
                LibAllowList.selectorIsAllowed(
                    _swapData.callTo,
                    LibBytes.getFirst4Bytes(_swapData.swapCallData)
                ))
        ) revert ContractCallNotAllowed();

        uint256 fromAmount = _swapData.fromAmount - _totalTokenFees;
        if (fromAmount == 0) revert NoSwapFromZeroBalance();
        uint256 nativeValue;

        uint256 initialFromBalance = LibAsset.getOwnBalance(_swapData.from);
        uint256 initialToBalance = LibAsset.getOwnBalance(_swapData.to);

        if (LibAsset.isNativeToken(_swapData.from)) {
            nativeValue = fromAmount;
        } else {
            LibAsset.approveERC20(
                _swapData.from,
                _swapData.approveTo,
                fromAmount
            );
        }

        // solhint-disable-next-line avoid-low-level-calls
        // console.log("nativeValue", nativeValue, _swapData.callTo);
        (bool success, bytes memory res) = _swapData.callTo.call{
            value: nativeValue
        }(_swapData.swapCallData);

        // console.log("success", success, res.length);

        if (!success) {
            if (_withoutRevert) {
                // console.log(
                //     "-------_executeSwaps with revert finished--------"
                // );
                return (0, 0);
            }
            // console.log(reason);
            LibUtil.getRevertMsg(res);
            revert SwapCallFailed(res);
        }

        // console.log(
        //     initialFromBalance,
        //     fromAmount,
        //     LibAsset.getOwnBalance(_swapData.from)
        // );

        leftoverFromAmount =
            LibAsset.getOwnBalance(_swapData.from) -
            (initialFromBalance - fromAmount);

        returnToAmount =
            LibAsset.getOwnBalance(_swapData.to) -
            initialToBalance;

        if (returnToAmount < _swapData.minToAmount)
            revert SlippageTooHigh(_swapData.minToAmount, returnToAmount);

        // console.log("---------_executeSwaps finished--------");
    }

    // function _executeSwaps(
    //     SwapData memory _swapData,
    //     uint256 _totalTokenFees,
    // ) internal returns (uint256 leftoverFromAmount, uint256 returnToAmount) {
    //     // console.log("---------_executeSwaps--------");
    //     if (
    //         !((LibAsset.isNativeToken(_swapData.from) ||
    //             LibAllowList.contractIsAllowed(_swapData.approveTo)) &&
    //             LibAllowList.contractIsAllowed(_swapData.callTo) &&
    //             LibAllowList.selectorIsAllowed(
    //                 _swapData.callTo,
    //                 LibBytes.getFirst4Bytes(_swapData.swapCallData)
    //             ))
    //     ) revert ContractCallNotAllowed();

    //     uint256 fromAmount = _swapData.fromAmount - _totalTokenFees;
    //     if (fromAmount == 0) revert NoSwapFromZeroBalance();
    //     uint256 nativeValue;

    //     uint256 initialFromBalance = LibAsset.getOwnBalance(_swapData.from);
    //     uint256 initialToBalance = LibAsset.getOwnBalance(_swapData.to);

    //     if (LibAsset.isNativeToken(_swapData.from)) {
    //         nativeValue = fromAmount;
    //     } else {
    //         LibAsset.approveERC20(
    //             _swapData.from,
    //             _swapData.approveTo,
    //             fromAmount
    //         );
    //     }

    //     // solhint-disable-next-line avoid-low-level-calls
    //     // console.log("nativeValue", nativeValue, _swapData.callTo);
    //     (bool success, bytes memory res) = _swapData.callTo.call{
    //         value: nativeValue
    //     }(_swapData.swapCallData);

    //     // console.log("success", success, res.length);

    //     if (!success) {
    //         if (_withoutRevert) {
    //             // console.log(
    //             //     "-------_executeSwaps with revert finished--------"
    //             // );
    //             return (0, 0);
    //         }
    //         // console.log(reason);
    //         LibUtil.getRevertMsg(res);
    //         revert SwapCallFailed(res);
    //     }

    //     // console.log(
    //     //     initialFromBalance,
    //     //     fromAmount,
    //     //     LibAsset.getOwnBalance(_swapData.from)
    //     // );

    //     leftoverFromAmount =
    //         LibAsset.getOwnBalance(_swapData.from) -
    //         (initialFromBalance - fromAmount);

    //     returnToAmount =
    //         LibAsset.getOwnBalance(_swapData.to) -
    //         initialToBalance;

    //     if (returnToAmount < _swapData.minToAmount)
    //         revert SlippageTooHigh(_swapData.minToAmount, returnToAmount);

    //     // console.log("---------_executeSwaps finished--------");
    // }

    // function _executeSwaps(
    //     SwapData calldata _swapData,
    //     uint256 _minAmount
    // ) internal returns (uint256 leftoverFromAmount, uint256 returnToAmount) {
    //     if (
    //         !((LibAsset.isNativeToken(_swapData.from) ||
    //             LibAllowList.contractIsAllowed(_swapData.approveTo)) &&
    //             LibAllowList.contractIsAllowed(_swapData.callTo) &&
    //             LibAllowList.selectorIsAllowed(
    //                 _swapData.callTo,
    //                 LibBytes.getFirst4Bytes(_swapData.swapCallData)
    //             ))
    //     ) revert ContractCallNotAllowed();

    //     uint256 fromAmount = _swapData.fromAmount;

    //     if (fromAmount == 0) revert NoSwapFromZeroBalance();

    //     uint256 nativeValue = LibAsset.isNativeToken(_swapData.from)
    //         ? fromAmount
    //         : 0;

    //     uint256 initialFromBalance = LibAsset.getOwnBalance(_swapData.from);
    //     uint256 initialToBalance = LibAsset.getOwnBalance(_swapData.to);
    //     if (nativeValue == 0) {
    //         LibAsset.approveERC20(
    //             _swapData.from,
    //             _swapData.approveTo,
    //             fromAmount
    //         );
    //     }

    //     // solhint-disable-next-line avoid-low-level-calls
    //     (bool success, bytes memory res) = _swapData.callTo.call{
    //         value: nativeValue
    //     }(_swapData.swapCallData);

    //     if (!success) {
    //         LibUtil.getRevertMsg(res);
    //         revert SwapCallFailed(res);
    //     }

    //     leftoverFromAmount =
    //         LibAsset.getOwnBalance(_swapData.from) -
    //         (initialFromBalance - fromAmount);
    //     if (leftoverFromAmount > 0)
    //         LibAsset.transferToken(
    //             _swapData.from,
    //             msg.sender,
    //             leftoverFromAmount
    //         );

    //     // if (leftoverFromAmount > 0) revert PartialSwap(leftoverFromAmount);

    //     returnToAmount =
    //         LibAsset.getOwnBalance(_swapData.to) -
    //         initialToBalance;

    //     if (
    //         returnToAmount < _swapData.minToAmount ||
    //         returnToAmount < _minAmount
    //     ) revert SlippageTooHigh(returnToAmount);

    //     // emit SwappedTokens(
    //     //     transactionId,
    //     //     _swapData.callTo,
    //     //     _swapData.to,
    //     //     _swapData.from,
    //     //     _swapData.fromAmount,
    //     //     leftoverFromAmount,
    //     //     returnToAmount,
    //     //     block.timestamp
    //     // );
    // }
}
