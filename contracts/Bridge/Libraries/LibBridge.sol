// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibSwap } from "../../Shared/Libraries/LibSwap.sol";
import { LibValidatable } from "../Libraries/LibValidatable.sol";
import { LibBridgeStorage } from "../Libraries/LibBridgeStorage.sol";

import { FeeInfo, SwapInfo, SwapData } from "../../Shared/Types.sol";
import { GenericBridgeData, CrossChainData, CrossChainAllowedList, TransferData } from "../Types.sol";
import { UnAuthorizedCall, BridgeCallFailed, InvalidSwapDetails, SlippageTooLow } from "../../Shared/ErrorsNew.sol";

/// @notice Provides mappings for all facets that may need them
library LibBridge {
    function bridge(address _integrator, FeeInfo memory _feeInfo, GenericBridgeData memory _bridgeData, CrossChainData calldata _crossChainData) internal {
        LibValidatable.doesNotContainSourceSwapOrDestinationCall(_bridgeData.hasSourceSwaps, _bridgeData.hasDestinationCall);

        _bridge(_integrator, _feeInfo, _bridgeData, _crossChainData);
    }

    function bridgeWithoutSwapAndDestCallCheck(address _integrator, FeeInfo memory _feeInfo, GenericBridgeData memory _bridgeData, CrossChainData calldata _crossChainData) internal {
        _bridge(_integrator, _feeInfo, _bridgeData, _crossChainData);
    }

    function swapAndBridge(address _integrator, FeeInfo memory _feeInfo, GenericBridgeData memory _bridgeData, CrossChainData calldata _crossChainData, SwapData calldata _swapData) internal returns (SwapInfo memory) {
        LibValidatable.validateData(_bridgeData);
        LibValidatable.validateCrossChainData(_crossChainData);
        LibValidatable.validateSwapData(_swapData);
        if (_swapData.to != _bridgeData.from) revert InvalidSwapDetails();

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(_feeInfo, _swapData.from, _swapData.fromAmount, _swapData.permit);

        (uint256 leftoverFromAmount, uint256 returnToAmount) = LibSwap.swap(_swapData, totalFee, false);

        if (returnToAmount < _bridgeData.minAmountIn) revert SlippageTooLow(_bridgeData.minAmountIn, returnToAmount);

        bytes memory bridgeCalldata = _patchGenericCrossChainData(_bridgeData, _crossChainData, returnToAmount);

        _startBridge(_bridgeData.from, _crossChainData.callTo, _crossChainData.approveTo, bridgeCalldata, _bridgeData.minAmountIn, _crossChainData.extraNative);

        LibFees.accrueTokenFees(_integrator, _swapData.from, totalFee - dZapShare, dZapShare);
        if (leftoverFromAmount != 0) LibAsset.transferToken(_swapData.from, msg.sender, leftoverFromAmount);
        if (returnToAmount > _bridgeData.minAmountIn) LibAsset.transferToken(_swapData.to, msg.sender, returnToAmount - _bridgeData.minAmountIn);

        return SwapInfo(_swapData.callTo, _swapData.from, _swapData.to, _swapData.fromAmount, leftoverFromAmount, returnToAmount);
    }

    function transferBridge(address _integrator, FeeInfo memory _feeInfo, GenericBridgeData memory _bridgeData, TransferData calldata _transferData) internal {
        LibValidatable.validateData(_bridgeData);
        LibValidatable.doesNotContainSourceSwapOrDestinationCall(_bridgeData.hasSourceSwaps, _bridgeData.hasDestinationCall);

        _transferBridge(_integrator, _feeInfo, _bridgeData, _transferData);
    }

    function transferBridgeWithoutSwapAndDestCallCheck(address _integrator, FeeInfo memory _feeInfo, GenericBridgeData memory _bridgeData, TransferData calldata _transferData) internal {
        LibValidatable.validateData(_bridgeData);

        _transferBridge(_integrator, _feeInfo, _bridgeData, _transferData);
    }

    function swapAndBridgeViaTransfer(address _integrator, FeeInfo memory _feeInfo, GenericBridgeData memory _bridgeData, TransferData calldata _transferData, SwapData calldata _swapData) internal returns (SwapInfo memory) {
        LibValidatable.validateData(_bridgeData);
        LibValidatable.validateSwapData(_swapData);

        if (_swapData.to != _bridgeData.from) revert InvalidSwapDetails();

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(_feeInfo, _swapData.from, _swapData.fromAmount, _swapData.permit);

        (uint256 leftoverFromAmount, uint256 returnToAmount) = LibSwap.swap(_swapData, totalFee, false);

        if (returnToAmount < _bridgeData.minAmountIn) revert SlippageTooLow(_bridgeData.minAmountIn, returnToAmount);
        _bridgeData.minAmountIn = returnToAmount;

        if (LibAsset.isNativeToken(_bridgeData.from)) {
            LibAsset.transferNativeToken(_transferData.transferTo, _bridgeData.minAmountIn);
        } else {
            LibAsset.transferERC20(_bridgeData.from, _transferData.transferTo, _bridgeData.minAmountIn);
        }

        LibFees.accrueTokenFees(_integrator, _swapData.from, totalFee - dZapShare, dZapShare);
        if (leftoverFromAmount != 0) LibAsset.transferToken(_swapData.from, msg.sender, leftoverFromAmount);

        return SwapInfo(_swapData.callTo, _swapData.from, _swapData.to, _swapData.fromAmount, leftoverFromAmount, returnToAmount);
    }

    function _startBridge(address _from, address _callTo, address _approveTo, bytes memory _callData, uint256 _minAmountIn, uint256 _extraNative) private {
        uint256 nativeValue;

        if (LibAsset.isNativeToken(_from)) {
            nativeValue = _minAmountIn;
        } else {
            LibAsset.approveERC20(_from, _approveTo, _minAmountIn);
        }

        (bool success, bytes memory res) = _callTo.call{ value: nativeValue + _extraNative }(_callData);

        if (!success) {
            revert BridgeCallFailed(res);
        }
    }

    function _bridge(address _integrator, FeeInfo memory _feeInfo, GenericBridgeData memory _bridgeData, CrossChainData calldata _crossChainData) private {
        LibValidatable.validateData(_bridgeData);
        LibValidatable.validateCrossChainData(_crossChainData);

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(_feeInfo, _bridgeData.from, _bridgeData.minAmountIn, _crossChainData.permit);
        _bridgeData.minAmountIn -= totalFee;

        LibFees.accrueTokenFees(_integrator, _bridgeData.from, totalFee - dZapShare, dZapShare);

        _startBridge(_bridgeData.from, _crossChainData.callTo, _crossChainData.approveTo, _crossChainData.callData, _bridgeData.minAmountIn, _crossChainData.extraNative);
    }

    function _patchGenericCrossChainData(GenericBridgeData memory _bridgeData, CrossChainData calldata _crossChainData, uint256 amount) private view returns (bytes memory) {
        uint256 offset = LibBridgeStorage.getCrossChainStorage().allowlist[_crossChainData.callTo].selectorToInfo[bytes4(_crossChainData.callData[:4])];

        if (offset != 0) {
            _bridgeData.minAmountIn = amount;

            return bytes.concat(_crossChainData.callData[:offset], abi.encode(amount), _crossChainData.callData[offset + 32:]);
        } else return _crossChainData.callData;
    }

    function _transferBridge(address _integrator, FeeInfo memory _feeInfo, GenericBridgeData memory _bridgeData, TransferData calldata _transferData) internal {
        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(_feeInfo, _bridgeData.from, _bridgeData.minAmountIn, _transferData.permit);
        _bridgeData.minAmountIn -= totalFee;

        if (LibAsset.isNativeToken(_bridgeData.from)) {
            LibAsset.transferNativeToken(_transferData.transferTo, _bridgeData.minAmountIn);
        } else {
            LibAsset.transferERC20(_bridgeData.from, _transferData.transferTo, _bridgeData.minAmountIn);
        }

        LibFees.accrueTokenFees(_integrator, _bridgeData.from, totalFee - dZapShare, dZapShare);
    }

    function swap(address _integrator, FeeInfo memory _feeInfo, GenericBridgeData memory _bridgeData, SwapData calldata _swapData) internal returns (SwapInfo memory) {
        LibValidatable.validateSwapData(_swapData);
        if (_swapData.to != _bridgeData.from) revert InvalidSwapDetails();

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(_feeInfo, _swapData.from, _swapData.fromAmount, _swapData.permit);

        (uint256 leftoverFromAmount, uint256 returnToAmount) = LibSwap.swap(_swapData, totalFee, false);

        if (returnToAmount < _bridgeData.minAmountIn) revert SlippageTooLow(_bridgeData.minAmountIn, returnToAmount);

        LibFees.accrueTokenFees(_integrator, _swapData.from, totalFee - dZapShare, dZapShare);
        if (leftoverFromAmount != 0) LibAsset.transferToken(_swapData.from, msg.sender, leftoverFromAmount);
        if (returnToAmount > _bridgeData.minAmountIn) LibAsset.transferToken(_swapData.to, msg.sender, returnToAmount - _bridgeData.minAmountIn);

        return SwapInfo(_swapData.callTo, _swapData.from, _swapData.to, _swapData.fromAmount, leftoverFromAmount, returnToAmount);
    }
}
