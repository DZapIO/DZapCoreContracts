// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibDiamond } from "../../Shared/Libraries/LibDiamond.sol";
import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";

import { ISwapFacet } from "../Interfaces/ISwapFacet.sol";

import { Swapper } from "../../Shared/Helpers/Swapper.sol";
import { ReentrancyGuard } from "../../Shared/Helpers/ReentrancyGuard.sol";

import { SwapData, SwapInfo, FeeType, IntegratorInfo } from "../../Shared/Types.sol";
import { ZeroAddress } from "../../Shared/Errors.sol";

// import "hardhat/console.sol";

contract SwapFacet is ISwapFacet, ReentrancyGuard, Swapper {
    /* ========= ERROR ========= */

    error AllSwapsFailed();

    /* ========= EXTERNAL ========= */

    function swap(
        bytes32 _transactionId,
        address _refundee,
        address _integrator,
        address _recipient,
        SwapData calldata _data
    ) external payable nonReentrant refundExcessNative(_refundee) {
        if (_recipient == address(0)) revert ZeroAddress();

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(
            _integrator,
            FeeType.SWAP,
            _data
        );

        (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(
            _data,
            totalFee,
            false
        );

        LibFees.accrueFixedNativeFees(
            _transactionId,
            _integrator,
            FeeType.SWAP
        );

        LibFees.accrueTokenFees(
            _transactionId,
            _integrator,
            FeeType.SWAP,
            _data.from,
            totalFee - dZapShare,
            dZapShare
        );

        if (leftoverFromAmount > 0)
            LibAsset.transferToken(_data.from, _refundee, leftoverFromAmount);

        LibAsset.transferToken(_data.to, _recipient, returnToAmount);

        emit Swapped(
            _transactionId,
            _integrator,
            msg.sender,
            _recipient,
            _refundee,
            SwapInfo(
                _data.callTo,
                _data.to,
                _data.from,
                _data.fromAmount,
                leftoverFromAmount,
                returnToAmount
            )
        );
    }

    function multiSwap(
        bytes32 _transactionId,
        address _refundee,
        address _integrator,
        address _recipient,
        SwapData[] calldata _data
    ) external payable nonReentrant refundExcessNative(_refundee) {
        if (_recipient == address(0)) revert ZeroAddress();

        uint256 length = _data.length;
        SwapInfo[] memory swapInfo = new SwapInfo[](length);

        for (uint256 i = 0; i < length; ++i) {
            (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(
                _integrator,
                FeeType.SWAP,
                _data[i]
            );

            (
                uint256 leftoverFromAmount,
                uint256 returnToAmount
            ) = _executeSwaps(_data[i], totalFee, false);

            LibFees.accrueTokenFees(
                _transactionId,
                _integrator,
                FeeType.SWAP,
                _data[i].from,
                totalFee - dZapShare,
                dZapShare
            );

            if (leftoverFromAmount > 0)
                LibAsset.transferToken(
                    _data[i].from,
                    _refundee,
                    leftoverFromAmount
                );

            LibAsset.transferToken(_data[i].to, _recipient, returnToAmount);

            swapInfo[i] = SwapInfo(
                _data[i].callTo,
                _data[i].to,
                _data[i].from,
                _data[i].fromAmount,
                leftoverFromAmount,
                returnToAmount
            );
        }

        LibFees.accrueFixedNativeFees(
            _transactionId,
            _integrator,
            FeeType.SWAP
        );

        emit MultiSwapped(
            _transactionId,
            _integrator,
            msg.sender,
            _refundee,
            _recipient,
            swapInfo
        );
    }

    function multiSwapWithoutRevert(
        bytes32 _transactionId,
        address _integrator,
        address _refundee,
        address _recipient,
        SwapData[] calldata _data
    ) external payable nonReentrant refundExcessNative(_refundee) {
        if (_recipient == address(0)) revert ZeroAddress();

        uint256 length = _data.length;
        SwapInfo[] memory swapInfo = new SwapInfo[](length);
        uint256 successfulSwap;

        for (uint256 i = 0; i < length; ) {
            (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(
                _integrator,
                FeeType.SWAP,
                _data[i]
            );

            (
                uint256 leftoverFromAmount,
                uint256 returnToAmount
            ) = _executeSwaps(_data[i], totalFee, true);

            if (returnToAmount == 0) {
                swapInfo[i] = SwapInfo(
                    _data[i].callTo,
                    _data[i].to,
                    _data[i].from,
                    _data[i].fromAmount,
                    0,
                    0
                );

                LibAsset.transferToken(
                    _data[i].from,
                    _recipient,
                    _data[i].fromAmount
                );
            } else {
                LibFees.accrueTokenFees(
                    _transactionId,
                    _integrator,
                    FeeType.SWAP,
                    _data[i].from,
                    totalFee - dZapShare,
                    dZapShare
                );

                if (leftoverFromAmount > 0)
                    LibAsset.transferToken(
                        _data[i].from,
                        _refundee,
                        leftoverFromAmount
                    );

                LibAsset.transferToken(
                    _data[i].to,
                    _recipient,
                    returnToAmount
                );

                swapInfo[i] = SwapInfo(
                    _data[i].callTo,
                    _data[i].to,
                    _data[i].from,
                    _data[i].fromAmount,
                    leftoverFromAmount,
                    returnToAmount
                );

                unchecked {
                    ++successfulSwap;
                }
            }

            // unchecked {
            //     ++i;
            // }
        }

        if (successfulSwap == 0) {
            revert AllSwapsFailed();
        }

        LibFees.accrueFixedNativeFees(
            _transactionId,
            _integrator,
            FeeType.SWAP
        );

        // uint256 fixedNativeFee = successfulSwap >= length / 2
        //     ? LibFees.accrueFixedNativeFees(FeeType.SWAP, _integrator)
        //     : 0;

        emit MultiSwapped(
            _transactionId,
            _integrator,
            msg.sender,
            _refundee,
            _recipient,
            swapInfo
        );
    }
}
