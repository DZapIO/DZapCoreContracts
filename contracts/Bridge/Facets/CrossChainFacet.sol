// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibAccess } from "../../Shared/Libraries/LibAccess.sol";
import { LibDiamond } from "../../Shared/Libraries/LibDiamond.sol";

import { Swapper } from "../../Shared/Helpers/Swapper.sol";

import { Validatable } from "../Helpers/Validatable.sol";
import { LibBridgeStorage } from "../Libraries/LibBridgeStorage.sol";
import { ICrossChainFacet } from "../Interfaces/ICrossChainFacet.sol";

import { CrossChainData, BridgeData, CrossChainAllowedList } from "../Types.sol";

import { UnAuthorizedCall, BridgeCallFailed, SlippageTooHigh, InvalidSwapDetails } from "../../Shared/Errors.sol";
import { FeeType, SwapData, SwapInfo, FeeInfo } from "../../Shared/Types.sol";

/// @title CrossChain Facet
/// @notice Provides functionality for bridging tokens across chains
contract CrossChainFacet is ICrossChainFacet, Swapper, Validatable {
    /* ========= EXTERNAL ========= */

    function bridge(bytes32 _transactionId, address _integrator, BridgeData memory _bridgeData, CrossChainData calldata _genericData) external payable refundExcessNative(msg.sender) {
        _validateData(_bridgeData);
        _validateCrossChainData(_genericData);
        _doesNotContainSourceSwapOrDestinationCall(_bridgeData);

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE), _bridgeData.from, _bridgeData.minAmountIn, _genericData.permit);
        _bridgeData.minAmountIn -= totalFee;

        _startBridge(_bridgeData, _patchGenericCrossChainData(_genericData, _bridgeData.minAmountIn));

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);
        LibFees.accrueTokenFees(_integrator, _bridgeData.from, totalFee - dZapShare, dZapShare);

        emit BridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData);
    }

    function bridgeMultipleTokens(bytes32 _transactionId, address _integrator, BridgeData[] memory _bridgeData, CrossChainData[] calldata _genericData) external payable refundExcessNative(msg.sender) {
        uint256 length = _bridgeData.length;
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);

        for (uint256 i; i < length; ) {
            BridgeData memory bridgeData = _bridgeData[i];

            _validateData(bridgeData);
            _doesNotContainSourceSwapOrDestinationCall(bridgeData);
            _validateCrossChainData(_genericData[i]);

            (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(feeInfo, bridgeData.from, bridgeData.minAmountIn, _genericData[i].permit);
            bridgeData.minAmountIn -= totalFee;

            _startBridge(bridgeData, _patchGenericCrossChainData(_genericData[i], bridgeData.minAmountIn));

            LibFees.accrueTokenFees(_integrator, bridgeData.from, totalFee - dZapShare, dZapShare);

            unchecked {
                ++i;
            }
        }

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);

        emit MultiTokenBridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData);
    }

    function swapAndBridge(bytes32 _transactionId, address _integrator, BridgeData[] memory _bridgeData, SwapData[] calldata _swapData, CrossChainData[] calldata _genericData) external payable refundExcessNative(msg.sender) {
        uint256 length = _bridgeData.length;
        uint256 swapCount;
        SwapInfo[] memory swapInfo = new SwapInfo[](_swapData.length);
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);

        for (uint256 i = 0; i < length; ) {
            BridgeData memory bridgeData = _bridgeData[i];

            _validateData(bridgeData);
            _validateCrossChainData(_genericData[i]);

            if (bridgeData.hasSourceSwaps) {
                _hasSourceSwaps(bridgeData);

                if (_swapData[swapCount].to != bridgeData.from) revert InvalidSwapDetails();

                // src swap
                (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(feeInfo, _swapData[swapCount].from, _swapData[swapCount].fromAmount, _swapData[swapCount].permit);
                (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(_swapData[swapCount], totalFee, false);

                if (returnToAmount < bridgeData.minAmountIn) revert SlippageTooHigh(bridgeData.minAmountIn, returnToAmount);

                bridgeData.minAmountIn = returnToAmount;

                swapInfo[swapCount] = SwapInfo(_swapData[swapCount].callTo, _swapData[swapCount].from, _swapData[swapCount].to, _swapData[swapCount].fromAmount, leftoverFromAmount, returnToAmount);

                LibFees.accrueTokenFees(_integrator, _swapData[swapCount].from, totalFee - dZapShare, dZapShare);

                if (leftoverFromAmount > 0) LibAsset.transferToken(_swapData[swapCount].from, msg.sender, leftoverFromAmount);

                unchecked {
                    ++swapCount;
                }
            } else {
                // dstSwap or simple swap
                (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(feeInfo, bridgeData.from, bridgeData.minAmountIn, _genericData[i].permit);
                bridgeData.minAmountIn -= totalFee;
                LibFees.accrueTokenFees(_integrator, bridgeData.from, totalFee - dZapShare, dZapShare);
            }

            _startBridge(bridgeData, _patchGenericCrossChainData(_genericData[i], bridgeData.minAmountIn));

            unchecked {
                ++i;
            }
        }

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);

        emit SwapBridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData, swapInfo);
    }

    /* ========= INTERNAL ========= */

    function _startBridge(BridgeData memory _bridgeData, CrossChainData memory _genericData) internal {
        uint256 nativeValue;

        if (LibAsset.isNativeToken(_bridgeData.from)) {
            nativeValue = _bridgeData.minAmountIn;
        } else {
            LibAsset.approveERC20(_bridgeData.from, _genericData.approveTo, _bridgeData.minAmountIn);
        }

        (bool success, bytes memory res) = _genericData.callTo.call{ value: nativeValue + _genericData.extraNative }(_genericData.callData);

        if (!success) {
            revert BridgeCallFailed(res);
        }
    }

    function _patchGenericCrossChainData(CrossChainData calldata _genericData, uint256 amount) private view returns (CrossChainData memory) {
        CrossChainAllowedList storage bridgeInfo = LibBridgeStorage.getCrossChainStorage().allowlist[_genericData.callTo];
        bytes4 funSig = bytes4(_genericData.callData);
        uint256 offset = bridgeInfo.selectorToInfo[funSig];

        if (bridgeInfo.isWhitelisted) {
            if (offset > 0) {
                return CrossChainData(_genericData.callTo, _genericData.approveTo, _genericData.extraNative, _genericData.permit, bytes.concat(_genericData.callData[:offset], abi.encode(amount), _genericData.callData[offset + 32:]));
            } else return _genericData;
        } else revert UnAuthorizedCall(_genericData.callTo);
    }
}
