// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibBridge } from "../Libraries/LibBridge.sol";

import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { ICrossChainFacet } from "../Interfaces/ICrossChainFacet.sol";

import { CrossChainData, GenericBridgeData } from "../Types.sol";
import { FeeType, SwapData, SwapInfo, FeeInfo } from "../../Shared/Types.sol";

/// @title CrossChain Facet
/// @notice Provides functionality for bridging tokens across chains
contract CrossChainFacet is ICrossChainFacet, RefundNative {
    /* ========= EXTERNAL ========= */

    function bridge(bytes32 _transactionId, address _integrator, GenericBridgeData memory _bridgeData, CrossChainData calldata _genericData) external payable refundExcessNative(msg.sender) {
        LibBridge.bridge(_integrator, LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE), _bridgeData, _genericData);

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);

        emit BridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData);
    }

    function bridgeMultipleTokens(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, CrossChainData[] calldata _genericData) external payable refundExcessNative(msg.sender) {
        uint256 length = _bridgeData.length;
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);

        for (uint256 i; i < length; ) {
            LibBridge.bridge(_integrator, feeInfo, _bridgeData[i], _genericData[i]);

            unchecked {
                ++i;
            }
        }

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);

        emit MultiTokenBridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData);
    }

    function swapAndBridge(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, SwapData[] calldata _swapData, CrossChainData[] calldata _genericData) external payable refundExcessNative(msg.sender) {
        uint256 length = _bridgeData.length;
        uint256 swapCount;
        SwapInfo[] memory swapInfo = new SwapInfo[](_swapData.length);
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);

        for (uint256 i; i < length; ) {
            GenericBridgeData memory bridgeData = _bridgeData[i];

            if (bridgeData.hasSourceSwaps) {
                swapInfo[swapCount] = LibBridge.swapAndBridge(_integrator, feeInfo, bridgeData, _genericData[i], _swapData[swapCount]);

                unchecked {
                    ++swapCount;
                }
            } else {
                // dstSwap or simple swap
                LibBridge.bridgeWithoutSwapAndCallCheck(_integrator, feeInfo, bridgeData, _genericData[i]);
            }

            unchecked {
                ++i;
            }
        }

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);

        emit SwapBridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData, swapInfo);
    }
}
