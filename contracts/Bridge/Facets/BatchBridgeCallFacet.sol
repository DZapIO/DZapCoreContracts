// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibBridge } from "../Libraries/LibBridge.sol";

import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { IBatchBridgeCallFacet } from "../Interfaces/IBatchBridgeCallFacet.sol";

import { FeeType, SwapData, SwapInfo, FeeInfo } from "../../Shared/Types.sol";
import { GenericBridgeData, CrossChainData, BridgeData, TransferData } from "../Types.sol";

/// @title BatchBridgeCallFacet Facet
/// @notice Batches multiple bridge facets
contract BatchBridgeCallFacet is IBatchBridgeCallFacet, RefundNative {
    function batchBridge(bytes32 _transactionId, address _integrator, CrossChainData[] calldata _crossChainData, GenericBridgeData[] memory _bridgeData, TransferData[] calldata _transferData) external payable refundExcessNative(msg.sender) {
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);
        uint256 length = _crossChainData.length;
        uint256 i;

        for (i; i < length; ) {
            LibBridge.bridge(_integrator, feeInfo, _bridgeData[i], _crossChainData[i]);

            unchecked {
                ++i;
            }
        }

        length = _transferData.length;
        for (uint256 j; j < length; ) {
            LibBridge.transferBridge(_integrator, feeInfo, _bridgeData[i], _transferData[j]);

            unchecked {
                ++i;
                ++j;
            }
        }

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);
        emit BatchBridgeTransferStart(_transactionId, _integrator, msg.sender, _bridgeData);
    }

    function batchSwapAndBridge(bytes32 _transactionId, address _integrator, CrossChainData[] calldata _crossChainData, GenericBridgeData[] memory _bridgeData, SwapData[] calldata _swapData, TransferData[] calldata _transferData) external payable refundExcessNative(msg.sender) {
        uint256 length = _crossChainData.length;
        uint256 i;
        uint256 swapCount;
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);
        SwapInfo[] memory swapInfo = new SwapInfo[](_swapData.length);

        for (i; i < length; ) {
            GenericBridgeData memory bridgeData = _bridgeData[i];

            if (bridgeData.hasSourceSwaps) {
                swapInfo[swapCount] = LibBridge.swapAndBridge(_integrator, feeInfo, bridgeData, _crossChainData[i], _swapData[swapCount]);

                unchecked {
                    ++swapCount;
                }
            } else {
                LibBridge.bridgeWithoutSwapAndDestCallCheck(_integrator, feeInfo, _bridgeData[i], _crossChainData[i]);
            }

            unchecked {
                ++i;
            }
        }

        length = _transferData.length;
        for (uint256 j; j < length; ) {
            GenericBridgeData memory bridgeData = _bridgeData[i];

            if (bridgeData.hasSourceSwaps) {
                swapInfo[swapCount] = LibBridge.swapAndBridgeViaTransfer(_integrator, feeInfo, bridgeData, _transferData[j], _swapData[swapCount]);

                unchecked {
                    ++swapCount;
                }
            } else {
                LibBridge.transferBridgeWithoutSwapAndDestCallCheck(_integrator, feeInfo, _bridgeData[i], _transferData[j]);
            }

            unchecked {
                ++i;
                ++j;
            }
        }

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);
        emit BatchSwapAndBridgeTransferStart(_transactionId, _integrator, msg.sender, _bridgeData, swapInfo);
    }
}
