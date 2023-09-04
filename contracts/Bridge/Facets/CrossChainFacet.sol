// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibUtil } from "../../Shared/Libraries/LibUtil.sol";
import { LibDiamond } from "../../Shared/Libraries/LibDiamond.sol";

import { ReentrancyGuard } from "../../Shared/Helpers/ReentrancyGuard.sol";
import { Swapper } from "../../Shared/Helpers/Swapper.sol";

import { Validatable } from "../Helpers/Validatable.sol";
import { LibBridgeStorage } from "../Libraries/LibBridgeStorage.sol";
import { ICrossChainFacet } from "../Interfaces/ICrossChainFacet.sol";

import { CrossChainData, BridgeData, CallToFunctionInfo, CrossChainStorage } from "../Types.sol";

import { UnAuthorizedCallToFunction, BridgeCallFailed } from "../../Shared/Errors.sol";
import { TokenInformationMismatch, SlippageTooHigh } from "../../Shared/Errors.sol";
import { FeeType, SwapData, SwapInfo } from "../../Shared/Types.sol";

contract CrossChainFacet is
    ICrossChainFacet,
    ReentrancyGuard,
    Swapper,
    Validatable
{
    /* ========= RESTRICTED ========= */

    function updateSelectorInfo(
        address[] calldata _routers,
        bytes4[] calldata _selectors,
        CallToFunctionInfo[] calldata _infos
    ) external {
        LibDiamond.enforceIsContractOwner();

        CrossChainStorage storage sm = LibBridgeStorage.getCrossChainStorage();

        for (uint64 i; i < _routers.length; ) {
            sm.selectorToInfo[_routers[i]][_selectors[i]] = _infos[i];
            unchecked {
                ++i;
            }
        }

        emit SelectorToInfoUpdated(_routers, _selectors, _infos);
    }

    /* ========= EXTERNAL ========= */

    function bridgeViaCrossChain(
        bytes32 _transactionId,
        address _integrator,
        address _refundee,
        BridgeData memory _bridgeData,
        CrossChainData calldata _genericData
    ) external payable nonReentrant refundExcessNative(_refundee) {
        _validateData(_bridgeData, _genericData);

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(
            _integrator,
            FeeType.BRIDGE,
            _bridgeData.from,
            _bridgeData.minAmount,
            _genericData.permit
        );

        _bridgeData.minAmount -= totalFee;
        _startBridge(
            _bridgeData,
            _patchGenericCrossChainData(_genericData, _bridgeData.minAmount)
        );

        LibFees.accrueFixedNativeFees(
            _transactionId,
            _integrator,
            FeeType.BRIDGE
        );

        LibFees.accrueTokenFees(
            _transactionId,
            _integrator,
            FeeType.SWAP,
            _bridgeData.from,
            totalFee - dZapShare,
            dZapShare
        );

        emit BridgeTransferStarted(
            _transactionId,
            _integrator,
            msg.sender,
            _refundee,
            _bridgeData
        );
    }

    function multiTokenBridgeViaCrossChain(
        bytes32 _transactionId,
        address _integrator,
        address _refundee,
        BridgeData[] memory _bridgeData,
        CrossChainData[] calldata _genericData
    ) external payable nonReentrant refundExcessNative(_refundee) {
        uint256 length = _bridgeData.length;

        for (uint256 i = 0; i < length; ) {
            BridgeData memory bridgeData = _bridgeData[i];

            _validateData(bridgeData, _genericData[i]);

            (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(
                _integrator,
                FeeType.BRIDGE,
                bridgeData.from,
                bridgeData.minAmount,
                _genericData[i].permit
            );
            bridgeData.minAmount -= totalFee;

            LibFees.accrueTokenFees(
                _transactionId,
                _integrator,
                FeeType.SWAP,
                bridgeData.from,
                totalFee - dZapShare,
                dZapShare
            );

            unchecked {
                ++i;
            }
        }

        LibFees.accrueFixedNativeFees(
            _transactionId,
            _integrator,
            FeeType.BRIDGE
        );

        emit MultiTokenBridgeTransferStarted(
            _transactionId,
            _integrator,
            msg.sender,
            _refundee,
            _bridgeData
        );
    }

    function swapAndBridgeViaCrossChain(
        bytes32 _transactionId,
        address _integrator,
        address _refundee,
        BridgeData[] memory _bridgeData,
        SwapData[] calldata _swapData, // src swap data
        CrossChainData[] calldata _genericData //  = _swapBridgeData.length
    ) external payable nonReentrant refundExcessNative(_refundee) {
        uint256 length = _bridgeData.length;
        uint256 swapCount;
        SwapInfo[] memory swapInfo = new SwapInfo[](_swapData.length);

        for (uint256 i = 0; i < length; i++) {
            BridgeData memory bridgeData = _bridgeData[i];

            _validateBridgeSwapData(bridgeData, _genericData[i]);

            uint256 totalFee;
            uint256 dZapShare;

            if (bridgeData.hasSourceSwaps) {
                // src swap
                (totalFee, dZapShare) = LibAsset.deposit(
                    _integrator,
                    FeeType.SWAP,
                    _swapData[swapCount]
                );

                (
                    uint256 leftoverFromAmount,
                    uint256 returnToAmount
                ) = _executeSwaps(_swapData[swapCount], totalFee, false);

                if (returnToAmount < bridgeData.minAmount)
                    revert SlippageTooHigh(
                        bridgeData.minAmount,
                        returnToAmount
                    );
                bridgeData.minAmount = returnToAmount;
                _startBridge(
                    bridgeData,
                    _patchGenericCrossChainData(
                        _genericData[i],
                        bridgeData.minAmount
                    )
                );

                if (leftoverFromAmount > 0)
                    LibAsset.transferToken(
                        _swapData[swapCount].from,
                        _refundee,
                        leftoverFromAmount
                    );

                swapInfo[swapCount] = SwapInfo(
                    _swapData[swapCount].callTo,
                    _swapData[swapCount].to,
                    _swapData[swapCount].from,
                    _swapData[swapCount].fromAmount,
                    leftoverFromAmount,
                    returnToAmount
                );

                ++swapCount;
            } else {
                // dstSwap
                (totalFee, dZapShare) = LibAsset.deposit(
                    _integrator,
                    FeeType.BRIDGE,
                    bridgeData.from,
                    bridgeData.minAmount,
                    _genericData[i].permit
                );

                bridgeData.minAmount -= totalFee;
            }

            LibFees.accrueTokenFees(
                _transactionId,
                _integrator,
                FeeType.BRIDGE,
                _swapData[swapCount].from,
                totalFee - dZapShare,
                dZapShare
            );

            _startBridge(
                bridgeData,
                _patchGenericCrossChainData(
                    _genericData[i],
                    bridgeData.minAmount
                )
            );
        }

        LibFees.accrueFixedNativeFees(
            _transactionId,
            _integrator,
            FeeType.BRIDGE
        );

        emit SwapBridgeTransferStarted(
            _transactionId,
            _integrator,
            msg.sender,
            _refundee,
            _bridgeData,
            swapInfo
        );
    }

    /* ========= INTERNAL ========= */

    function _startBridge(
        BridgeData memory _bridgeData,
        CrossChainData memory _genericData
    ) internal {
        // bool isNative = LibAsset.isNativeToken(_bridgeData.from);
        uint256 nativeValue;

        if (LibAsset.isNativeToken(_bridgeData.from)) {
            nativeValue = _bridgeData.minAmount;
        } else {
            LibAsset.approveERC20(
                _bridgeData.from,
                _genericData.approveTo,
                _bridgeData.minAmount
            );
        }

        (bool success, bytes memory res) = _genericData.callTo.call{
            value: nativeValue + _genericData.extraNative
        }(_genericData.callData);
        if (!success) {
            revert BridgeCallFailed(res);
        }
    }

    function _patchGenericCrossChainData(
        CrossChainData calldata _genericData,
        uint256 amount
    ) private view returns (CrossChainData memory) {
        CrossChainStorage storage sm = LibBridgeStorage.getCrossChainStorage();
        CallToFunctionInfo memory info = sm.selectorToInfo[
            _genericData.callTo
        ][bytes4(_genericData.callData[:4])];

        if (info.isAvailable) {
            if (info.offset > 0) {
                return
                    CrossChainData(
                        _genericData.callTo,
                        _genericData.approveTo,
                        _genericData.extraNative,
                        _genericData.permit,
                        bytes.concat(
                            _genericData.callData[:info.offset],
                            abi.encode(amount),
                            _genericData.callData[info.offset + 32:]
                        )
                    );
            } else {
                return
                    CrossChainData(
                        _genericData.callTo,
                        _genericData.approveTo,
                        _genericData.extraNative,
                        _genericData.permit,
                        _genericData.callData
                    );
            }
        } else {
            revert UnAuthorizedCallToFunction();
        }
    }
}
