// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibBridge } from "../Libraries/LibBridge.sol";

import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { IBatchBridgeCallFacet } from "../Interfaces/IBatchBridgeCallFacet.sol";

import { FeeType, FeeInfo } from "../../Shared/Types.sol";
import { GenericBridgeData, CrossChainData, BridgeData, TransferData } from "../Types.sol";

/// @title BatchBridgeCallFacet Facet
/// @notice Batches multiple bridge facets
contract BatchBridgeCallFacet is IBatchBridgeCallFacet, RefundNative {
    function batchBridgeCall(bytes32 _transactionId, address _integrator, CrossChainData[] calldata _crossChainData, GenericBridgeData[] memory _bridgeData, TransferData[] calldata _transferData) external payable refundExcessNative(msg.sender) {
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
}
