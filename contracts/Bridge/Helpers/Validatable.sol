// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibUtil } from "../../Shared/Libraries/LibUtil.sol";

import { InvalidReceiver, InformationMismatch, InvalidSendingToken, InvalidAmount, NativeTokenNotSupported, InvalidDestinationChain, CannotBridgeToSameNetwork, NotAContract, InvalidContract } from "../../Shared/Errors.sol";

import { CrossChainData, BridgeData } from "../Types.sol";

contract Validatable {
    function _validateData(BridgeData memory _bridgeData) internal view {
        if (LibUtil.isZeroAddress(_bridgeData.receiver)) revert InvalidReceiver();
        if (_bridgeData.minAmountIn == 0) revert InvalidAmount();
        if (_bridgeData.destinationChainId == block.chainid) revert CannotBridgeToSameNetwork();
    }

    function _validateCrossChainData(CrossChainData calldata _genericData) internal view {
        if (!LibAsset.isContract(_genericData.callTo)) revert NotAContract();
    }

    function _hasSourceSwaps(BridgeData memory _bridgeData) internal pure {
        if (!_bridgeData.hasSourceSwaps) revert InformationMismatch();
    }

    function _doesNotContainSourceSwaps(BridgeData memory _bridgeData) internal pure {
        if (_bridgeData.hasSourceSwaps) revert InformationMismatch();
    }

    function _doesNotContainDestinationCall(BridgeData memory _bridgeData) internal pure {
        if (_bridgeData.hasDestinationCall) revert InformationMismatch();
    }

    function _doesNotContainSourceSwapOrDestinationCall(BridgeData memory _bridgeData) internal pure {
        if (_bridgeData.hasSourceSwaps) revert InformationMismatch();
        if (_bridgeData.hasDestinationCall) revert InformationMismatch();
    }
}
