// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibBridge } from "../Libraries/LibBridge.sol";

import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { IGenericCrossChainFaucet } from "../Interfaces/IGenericCrossChainFaucet.sol";

import { CrossChainData, GenericBridgeData } from "../Types.sol";
import { FeeType, SwapData, SwapInfo, FeeInfo } from "../../Shared/Types.sol";

/// @title GenericCrossChainFacet Facet
/// @notice Provides functionality for bridging tokens across non evm chains
contract GenericCrossChainFacet is IGenericCrossChainFaucet, RefundNative {
    /* ========= EXTERNAL ========= */

    function bridgeViaGenericCrossChain(bytes32 _transactionId, address _integrator, GenericBridgeData memory _bridgeData, CrossChainData calldata _genericData) external payable refundExcessNative(msg.sender) {
        LibBridge.genericBridge(_integrator, LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE), _bridgeData, _genericData);

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);

        emit BridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData);
    }

    function bridgeMultipleTokensViaGenericCrossChain(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, CrossChainData[] calldata _genericData) external payable refundExcessNative(msg.sender) {
        uint256 length = _bridgeData.length;
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);

        for (uint256 i = 0; i < length; ) {
            LibBridge.genericBridge(_integrator, feeInfo, _bridgeData[i], _genericData[i]);

            unchecked {
                ++i;
            }
        }

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);

        emit MultiTokenBridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData);
    }
}
