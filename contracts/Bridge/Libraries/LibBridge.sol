// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibSwap } from "../../Shared/Libraries/LibSwap.sol";
import { LibValidatable } from "../Libraries/LibValidatable.sol";
import { LibBridgeStorage } from "../Libraries/LibBridgeStorage.sol";

import { FeeInfo, SwapInfo, SwapData } from "../../Shared/Types.sol";
import { GenericBridgeData, CrossChainData, CrossChainAllowedList, BridgeData, TransferData } from "../Types.sol";
import { UnAuthorizedCall, BridgeCallFailed, InvalidSwapDetails, SlippageTooHigh } from "../../Shared/Errors.sol";

/// @notice Provides mappings for all facets that may need them
library LibBridge {
    function bridge(address _integrator, FeeInfo memory _feeInfo, BridgeData memory _bridgeData, CrossChainData calldata _crossChainData) internal {
        LibValidatable.doesNotContainSourceSwapOrDestinationCall(_bridgeData.hasSourceSwaps, _bridgeData.hasDestinationCall);

        _bridge(_integrator, _feeInfo, _bridgeData, _crossChainData);
    }

    function bridgeWithoutSwapAndCallCheck(address _integrator, FeeInfo memory _feeInfo, BridgeData memory _bridgeData, CrossChainData calldata _crossChainData) internal {
        _bridge(_integrator, _feeInfo, _bridgeData, _crossChainData);
    }

    function genericBridge(address _integrator, FeeInfo memory _feeInfo, GenericBridgeData memory _bridgeData, CrossChainData calldata _crossChainData) internal {
        LibValidatable.validateData(_bridgeData);
        LibValidatable.validateCrossChainData(_crossChainData.callTo);
        LibValidatable.doesNotContainSourceSwapOrDestinationCall(_bridgeData.hasSourceSwaps, _bridgeData.hasDestinationCall);

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(_feeInfo, _bridgeData.from, _bridgeData.minAmountIn, _crossChainData.permit);
        _bridgeData.minAmountIn -= totalFee;

        _startBridge(_bridgeData.from, _bridgeData.minAmountIn, _patchGenericCrossChainData(_crossChainData, _bridgeData.minAmountIn));

        LibFees.accrueTokenFees(_integrator, _bridgeData.from, totalFee - dZapShare, dZapShare);
    }

    function transferBridge(address _integrator, FeeInfo memory _feeInfo, GenericBridgeData memory _bridgeData, TransferData calldata _transferData) internal {
        LibValidatable.validateData(_bridgeData);
        LibValidatable.doesNotContainSourceSwapOrDestinationCall(_bridgeData.hasSourceSwaps, _bridgeData.hasDestinationCall);

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(_feeInfo, _bridgeData.from, _bridgeData.minAmountIn, _transferData.permit);
        _bridgeData.minAmountIn -= totalFee;

        if (LibAsset.isNativeToken(_bridgeData.from)) {
            LibAsset.transferNativeToken(_transferData.transferTo, _bridgeData.minAmountIn);
        } else {
            LibAsset.transferERC20(_bridgeData.from, _transferData.transferTo, _bridgeData.minAmountIn);
        }

        LibFees.accrueTokenFees(_integrator, _bridgeData.from, totalFee - dZapShare, dZapShare);
    }

    function swapAndBridge(address _integrator, FeeInfo memory _feeInfo, BridgeData memory _bridgeData, CrossChainData calldata _crossChainData, SwapData calldata _swapData) internal returns (SwapInfo memory) {
        LibValidatable.validateData(_bridgeData);
        LibValidatable.validateCrossChainData(_crossChainData.callTo);

        if (_swapData.to != _bridgeData.from) revert InvalidSwapDetails();

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(_feeInfo, _swapData.from, _swapData.fromAmount, _swapData.permit);

        LibValidatable.validateSwapData(_swapData);
        (uint256 leftoverFromAmount, uint256 returnToAmount) = LibSwap.swap(_swapData, totalFee, false);

        if (returnToAmount < _bridgeData.minAmountIn) revert SlippageTooHigh(_bridgeData.minAmountIn, returnToAmount);
        _bridgeData.minAmountIn = returnToAmount;

        LibFees.accrueTokenFees(_integrator, _swapData.from, totalFee - dZapShare, dZapShare);

        if (leftoverFromAmount != 0) LibAsset.transferToken(_swapData.from, msg.sender, leftoverFromAmount);

        _startBridge(_bridgeData.from, _bridgeData.minAmountIn, _patchGenericCrossChainData(_crossChainData, _bridgeData.minAmountIn));

        return SwapInfo(_swapData.callTo, _swapData.from, _swapData.to, _swapData.fromAmount, leftoverFromAmount, returnToAmount);
    }

    function _startBridge(address _from, uint256 _minAmountIn, CrossChainData memory _crossChainData) private {
        uint256 nativeValue;

        if (LibAsset.isNativeToken(_from)) {
            nativeValue = _minAmountIn;
        } else {
            LibAsset.approveERC20(_from, _crossChainData.approveTo, _minAmountIn);
        }

        (bool success, bytes memory res) = _crossChainData.callTo.call{ value: nativeValue + _crossChainData.extraNative }(_crossChainData.callData);

        if (!success) {
            revert BridgeCallFailed(res);
        }
    }

    function _bridge(address _integrator, FeeInfo memory _feeInfo, BridgeData memory _bridgeData, CrossChainData calldata _crossChainData) private {
        LibValidatable.validateData(_bridgeData);
        LibValidatable.validateCrossChainData(_crossChainData.callTo);

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(_feeInfo, _bridgeData.from, _bridgeData.minAmountIn, _crossChainData.permit);
        _bridgeData.minAmountIn -= totalFee;

        _startBridge(_bridgeData.from, _bridgeData.minAmountIn, _patchGenericCrossChainData(_crossChainData, _bridgeData.minAmountIn));

        LibFees.accrueTokenFees(_integrator, _bridgeData.from, totalFee - dZapShare, dZapShare);
    }

    function _patchGenericCrossChainData(CrossChainData calldata _crossChainData, uint256 amount) private view returns (CrossChainData memory) {
        CrossChainAllowedList storage bridgeInfo = LibBridgeStorage.getCrossChainStorage().allowlist[_crossChainData.callTo];
        bytes4 funSig = bytes4(_crossChainData.callData[:4]);
        uint256 offset = bridgeInfo.selectorToInfo[funSig];

        if (bridgeInfo.isWhitelisted) {
            if (offset != 0) {
                return CrossChainData(_crossChainData.callTo, _crossChainData.approveTo, _crossChainData.extraNative, _crossChainData.permit, bytes.concat(_crossChainData.callData[:offset], abi.encode(amount), _crossChainData.callData[offset + 32:]));
            } else return _crossChainData;
        } else revert UnAuthorizedCall(_crossChainData.callTo);
    }
}
