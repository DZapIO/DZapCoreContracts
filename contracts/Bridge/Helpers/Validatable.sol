// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibUtil } from "../../Shared/Libraries/LibUtil.sol";

import { InvalidReceiver, InformationMismatch, InvalidSendingToken, InvalidAmount, NativeTokenNotSupported, InvalidDestinationChain, CannotBridgeToSameNetwork, NotAContract, InvalidContract } from "../../Shared/Errors.sol";

import { CrossChainData, BridgeData } from "../Types.sol";

contract Validatable {
    // multi token Bridge
    function _validateData(
        BridgeData memory _bridgeData,
        CrossChainData calldata _genericData
    ) internal view {
        // validateBridgeData
        if (LibUtil.isZeroAddress(_bridgeData.receiver)) {
            revert InvalidReceiver();
        }
        if (_bridgeData.minAmount == 0) {
            revert InvalidAmount();
        }
        if (_bridgeData.destinationChainId == block.chainid) {
            revert CannotBridgeToSameNetwork();
        }
        // validateGenericCrossChainData
        if (!LibAsset.isContract(_genericData.callTo)) revert NotAContract();
        // doesNotContainSourceSwaps
        if (_bridgeData.hasSourceSwaps) {
            revert InformationMismatch();
        }
        // doesNotContainDestinationCalls
        if (_bridgeData.hasDestinationCall) {
            revert InformationMismatch();
        }
    }

    // multi token Bridge
    function _validateBridgeSwapData(
        BridgeData memory _bridgeData,
        CrossChainData calldata _genericData
    ) internal view {
        // validateBridgeData
        if (LibUtil.isZeroAddress(_bridgeData.receiver)) {
            revert InvalidReceiver();
        }

        if (_bridgeData.minAmount == 0) {
            revert InvalidAmount();
        }
        if (_bridgeData.destinationChainId == block.chainid) {
            revert CannotBridgeToSameNetwork();
        }

        // validateGenericCrossChainData
        if (!LibAsset.isContract(_genericData.callTo)) revert NotAContract();

        // contains sourceSwaps or destinationCall
        // if (!_bridgeData.hasSourceSwaps && !_bridgeData.hasDestinationCall) {
        //     revert InformationMismatch();
        // }
    }
}
