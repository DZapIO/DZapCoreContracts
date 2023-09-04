// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibUtil } from "../../Shared/Libraries/LibUtil.sol";

import { InvalidReceiver, InformationMismatch, InvalidSendingToken, InvalidAmount, NativeTokenNotSupported, InvalidDestinationChain, CannotBridgeToSameNetwork, NotAContract, InvalidContract } from "../../Shared/Errors.sol";

import { CrossChainData, BridgeData } from "../Types.sol";

contract Validatable {
    modifier validateGenericCrossChainData(
        CrossChainData calldata _genericData
    ) {
        if (!LibAsset.isContract(_genericData.callTo)) revert NotAContract();
        _;
    }

    modifier validateBridgeData(BridgeData memory _bridgeData) {
        if (LibUtil.isZeroAddress(_bridgeData.receiver)) {
            revert InvalidReceiver();
        }
        if (_bridgeData.minAmount == 0) {
            revert InvalidAmount();
        }
        if (_bridgeData.destinationChainId == block.chainid) {
            revert CannotBridgeToSameNetwork();
        }
        _;
    }

    modifier noNativeToken(BridgeData memory _bridgeData) {
        if (LibAsset.isNativeToken(_bridgeData.from)) {
            revert NativeTokenNotSupported();
        }
        _;
    }

    modifier onlyAllowSourceToken(
        BridgeData memory _bridgeData,
        address _token
    ) {
        if (_bridgeData.from != _token) {
            revert InvalidSendingToken();
        }
        _;
    }

    modifier onlyAllowDestinationChain(
        BridgeData memory _bridgeData,
        uint256 _chainId
    ) {
        if (_bridgeData.destinationChainId != _chainId) {
            revert InvalidDestinationChain();
        }
        _;
    }

    modifier containsSourceSwaps(BridgeData memory _bridgeData) {
        if (!_bridgeData.hasSourceSwaps) {
            revert InformationMismatch();
        }
        _;
    }

    modifier doesNotContainSourceSwaps(BridgeData memory _bridgeData) {
        if (_bridgeData.hasSourceSwaps) {
            revert InformationMismatch();
        }
        _;
    }

    modifier doesNotContainDestinationCalls(BridgeData memory _bridgeData) {
        if (_bridgeData.hasDestinationCall) {
            revert InformationMismatch();
        }
        _;
    }

    // multi token Bridge
    function _validateData(
        BridgeData memory _bridgeData,
        CrossChainData calldata _genericData
    ) internal view {
        // validateBridgeData
        // if (LibUtil.isZeroAddress(_bridgeData.receiver)) {
        if (
            LibUtil.isZeroAddress(_bridgeData.receiver) ||
            _bridgeData.receiver == address(this)
        ) {
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
            // if (
            //     LibUtil.isZeroAddress(_bridgeData.receiver) ||
            //     _bridgeData.receiver == address(this)
            // ) {
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
        if (!_bridgeData.hasSourceSwaps && !_bridgeData.hasDestinationCall) {
            revert InformationMismatch();
        }
    }
}
