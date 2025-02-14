// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibBridge } from "../Libraries/LibBridge.sol";

import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibValidatable } from "../Libraries/LibValidatable.sol";

import { IBridgeRelayFacet } from "../Interfaces/IBridgeRelayFacet.sol";

import { GenericBridgeData, RelayData } from "../Types.sol";
import { FeeType, SwapData, SwapInfo, FeeInfo } from "../../Shared/Types.sol";
import { NativeCallFailed, Erc20CallFailed } from "../../Shared/ErrorsNew.sol";

/// @title BridgeRelayFacet
/// @notice Provides functionality for bridging tokens across chains using relay bridge
contract RelayBridgeFacet is IBridgeRelayFacet, RefundNative {
    
    // ------------------- Storage ------------------- //
    address public immutable RELAY_RECEIVER; // for native transfers
    address public immutable RELAY_SOLVER;   // for ERC20 transfers

    // ------------------- Constructor -------------------//

    function getRelayAddress() external view returns(address receiver, address solver) {
        return (RELAY_RECEIVER, RELAY_SOLVER);
    }

    constructor(address _relayReceiver, address _relaySolver) {
        RELAY_RECEIVER = _relayReceiver;
        RELAY_SOLVER = _relaySolver;
    }

    // ------------------- External -------------------//

    function bridgeViaRelay(bytes32 _transactionId, address _integrator, GenericBridgeData memory _bridgeData, RelayData calldata _relayData) external payable refundExcessNative(msg.sender) {
        LibValidatable.validateData(_bridgeData);
        LibValidatable.doesNotContainSourceSwapOrDestinationCall(_bridgeData.hasSourceSwaps, _bridgeData.hasDestinationCall);

        FeeInfo memory  feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(feeInfo, _bridgeData.from, _bridgeData.minAmountIn, _relayData.permit);
        _bridgeData.minAmountIn -= totalFee;

        _bridge(_bridgeData, _relayData);

        LibFees.accrueTokenFees(_integrator, _bridgeData.from, totalFee - dZapShare, dZapShare);
        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);

        emit BridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData);
    }

    function bridgeMultipleTokensViaRelay(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, RelayData[] calldata _relayData) external payable refundExcessNative(msg.sender) {
        uint256 length = _bridgeData.length;
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);

        for (uint256 i = 0; i < length; ) {
            GenericBridgeData memory bridgeData = _bridgeData[i];

            LibValidatable.validateData(_bridgeData[i]);
            LibValidatable.doesNotContainSourceSwapOrDestinationCall(bridgeData.hasSourceSwaps, bridgeData.hasDestinationCall);

            (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(feeInfo, bridgeData.from, bridgeData.minAmountIn, _relayData[i].permit);
            bridgeData.minAmountIn -= totalFee;

            _bridge(bridgeData, _relayData[i]);

            LibFees.accrueTokenFees(_integrator, bridgeData.from, totalFee - dZapShare, dZapShare);

            unchecked {
                ++i;
            }
        }

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);
        emit MultiTokenBridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData);
    }
    
    function swapAndBridgeViaRelay(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, SwapData[] calldata _swapData, RelayData[] calldata _relayData) external payable refundExcessNative(msg.sender) {
        uint256 length = _bridgeData.length;
        uint256 swapCount;
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);
        SwapInfo[] memory swapInfo = new SwapInfo[](_swapData.length);

        for (uint256 i = 0; i < length; ) {
            GenericBridgeData memory bridgeData = _bridgeData[i];
            LibValidatable.validateData(bridgeData);

            if (bridgeData.hasSourceSwaps) {
                swapInfo[swapCount] = LibBridge.swap(_integrator, feeInfo, bridgeData, _swapData[swapCount]);
                
                unchecked {
                    ++swapCount;
                }
            } else {
                (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(feeInfo, bridgeData.from, bridgeData.minAmountIn, _relayData[i].permit);
                bridgeData.minAmountIn -= totalFee;

                LibFees.accrueTokenFees(_integrator, bridgeData.from, totalFee - dZapShare, dZapShare);
            }

            _bridge(bridgeData, _relayData[i]);

            unchecked {
                ++i;
            }
        }

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);
        emit SwapBridgeTransferStarted(_transactionId, _integrator, msg.sender, _bridgeData, swapInfo);
    }

    // ------------------- Internal -------------------//

    function _bridge(
        GenericBridgeData memory _bridgeData, 
        RelayData calldata _relayData
    ) private {
        if (LibAsset.isNativeToken(_bridgeData.from)) {
            (bool success, bytes memory reason) = RELAY_RECEIVER.call{value: _bridgeData.minAmountIn}(abi.encode(_relayData.requestId));
            if (!success) revert NativeCallFailed(reason);
        } else {
            bytes memory transferCallData = bytes.concat(
                abi.encodeWithSignature("transfer(address,uint256)",RELAY_SOLVER,_bridgeData.minAmountIn),
                abi.encode(_relayData.requestId)
            );
            (bool success, bytes memory reason) = _bridgeData.from.call(transferCallData);
            if (!success) revert Erc20CallFailed(reason);
        }
    }
}
