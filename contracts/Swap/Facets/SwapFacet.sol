// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";

import { ISwapFacet } from "../Interfaces/ISwapFacet.sol";

import { Swapper } from "../../Shared/Helpers/Swapper.sol";
import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { SwapData, SwapInfo, FeeType, FeeInfo } from "../../Shared/Types.sol";
import { ZeroAddress, SwapCallFailed, SlippageTooHigh, ContractCallNotAllowed, IntegratorNotAllowed, InvalidAmount, AllSwapsFailed } from "../../Shared/Errors.sol";

/// @title Swap Facet
/// @notice Provides functionality for swapping through ANY APPROVED DEX
/// @dev Uses calldata to execute APPROVED arbitrary methods on DEXs
contract SwapFacet is ISwapFacet, Swapper, RefundNative {
    /* ========= EXTERNAL ========= */

    function swap(bytes32 _transactionId, address _integrator, address _recipient, SwapData calldata _data) external payable refundExcessNative(msg.sender) {
        if (_recipient == address(0)) revert ZeroAddress();

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(LibFees.getIntegratorFeeInfo(_integrator, FeeType.SWAP), _data);

        (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(_data, totalFee, false);

        LibFees.accrueFixedNativeFees(_integrator, FeeType.SWAP);
        LibFees.accrueTokenFees(_integrator, _data.from, totalFee - dZapShare, dZapShare);

        if (leftoverFromAmount != 0 && !LibAsset.isNativeToken(_data.from)) LibAsset.transferERC20(_data.from, msg.sender, leftoverFromAmount);
        LibAsset.transferToken(_data.to, _recipient, returnToAmount);

        emit Swapped(_transactionId, _integrator, msg.sender, _recipient, SwapInfo(_data.callTo, _data.from, _data.to, _data.fromAmount, leftoverFromAmount, returnToAmount));
    }

    function multiSwap(bytes32 _transactionId, address _integrator, address _recipient, SwapData[] calldata _data) external payable refundExcessNative(msg.sender) {
        if (_recipient == address(0)) revert ZeroAddress();

        uint256 length = _data.length;
        SwapInfo[] memory swapInfo = new SwapInfo[](length);
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.SWAP);

        for (uint256 i = 0; i < length; ) {
            (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(feeInfo, _data[i]);
            (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(_data[i], totalFee, false);

            LibFees.accrueTokenFees(_integrator, _data[i].from, totalFee - dZapShare, dZapShare);

            if (leftoverFromAmount != 0 && !LibAsset.isNativeToken(_data[i].from)) LibAsset.transferToken(_data[i].from, msg.sender, leftoverFromAmount);

            LibAsset.transferToken(_data[i].to, _recipient, returnToAmount);

            swapInfo[i] = SwapInfo(_data[i].callTo, _data[i].from, _data[i].to, _data[i].fromAmount, leftoverFromAmount, returnToAmount);
            unchecked {
                ++i;
            }
        }

        LibFees.accrueFixedNativeFees(_integrator, FeeType.SWAP);

        emit MultiSwapped(_transactionId, _integrator, msg.sender, _recipient, swapInfo);
    }

    function multiSwapWithoutRevert(bytes32 _transactionId, address _integrator, address _recipient, SwapData[] calldata _data) external payable refundExcessNative(msg.sender) {
        if (_recipient == address(0)) revert ZeroAddress();

        uint256 length = _data.length;
        uint256 failedSwaps;
        SwapInfo[] memory swapInfo = new SwapInfo[](length);
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.SWAP);

        for (uint256 i = 0; i < length; ) {
            (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(feeInfo, _data[i]);
            (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(_data[i], totalFee, true);

            if (returnToAmount == 0) {
                swapInfo[i] = SwapInfo(_data[i].callTo, _data[i].from, _data[i].to, _data[i].fromAmount, 0, 0);
                LibAsset.transferToken(_data[i].from, msg.sender, _data[i].fromAmount);

                unchecked {
                    ++failedSwaps;
                }
            } else {
                LibFees.accrueTokenFees(_integrator, _data[i].from, totalFee - dZapShare, dZapShare);

                if (leftoverFromAmount != 0 && !LibAsset.isNativeToken(_data[i].from)) LibAsset.transferToken(_data[i].from, msg.sender, leftoverFromAmount);
                LibAsset.transferToken(_data[i].to, _recipient, returnToAmount);

                swapInfo[i] = SwapInfo(_data[i].callTo, _data[i].from, _data[i].to, _data[i].fromAmount, leftoverFromAmount, returnToAmount);
            }

            unchecked {
                ++i;
            }
        }

        if (failedSwaps == length) revert AllSwapsFailed();
        LibFees.accrueFixedNativeFees(_integrator, FeeType.SWAP);

        emit MultiSwapped(_transactionId, _integrator, msg.sender, _recipient, swapInfo);
    }
}
