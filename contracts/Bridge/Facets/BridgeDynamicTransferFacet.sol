// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibBridge } from "../Libraries/LibBridge.sol";

import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { IBridgeDynamicTransferFacet } from "../Interfaces/IBridgeDynamicTransferFacet.sol";

import { CrossChainData, GenericBridgeData, CrossChainStorage, TransferData } from "../Types.sol";
import { FeeType, SwapData, SwapInfo, FeeInfo } from "../../Shared/Types.sol";

/// @title BridgeDynamicTransferFacet
/// @notice Provides functionality for bridging tokens across chains using transfer
contract BridgeDynamicTransferFacet is IBridgeDynamicTransferFacet, RefundNative {
    function bridgeViaTransfer(bytes32 _transactionId, address _integrator, GenericBridgeData memory _bridgeData, TransferData calldata _transferData) external payable refundExcessNative(msg.sender) {
        LibBridge.transferBridge(_integrator, LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE), _bridgeData, _transferData);

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);

        emit BridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData);
    }

    function bridgeMultipleTokensViaTransfer(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, TransferData[] calldata _transferData) external payable refundExcessNative(msg.sender) {
        uint256 length = _bridgeData.length;
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);

        for (uint256 i = 0; i < length; ) {
            LibBridge.transferBridge(_integrator, feeInfo, _bridgeData[i], _transferData[i]);

            unchecked {
                ++i;
            }
        }

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);
        emit MultiTokenBridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData);
    }
}
