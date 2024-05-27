// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibUtil } from "../../Shared/Libraries/LibUtil.sol";
import { LibAllowList } from "../../Shared/Libraries/LibAllowList.sol";

import { InvalidReceiver, InformationMismatch, CannotBridgeToSameNetwork, InvalidAmount, NotAContract, InvalidContract, InvalidLength, ContractCallNotAllowed, NoSwapFromZeroBalance } from "../../Shared/Errors.sol";

import { BridgeData, GenericBridgeData } from "../Types.sol";
import { SwapData } from "../../Shared/Types.sol";

library LibValidatable {
    uint256 internal constant _MAX_ADDRESS_LENGTH = 255;

    function validateSwapData(SwapData calldata _swapData) internal view {
        if (!LibAllowList.contractIsAllowed(_swapData.callTo) || !LibAllowList.contractIsAllowed(_swapData.approveTo)) revert ContractCallNotAllowed();
        if (!LibAsset.isContract(_swapData.callTo)) revert InvalidContract();
        if (_swapData.fromAmount == 0) revert NoSwapFromZeroBalance();
    }

    function validateData(BridgeData memory _bridgeData) internal view {
        if (LibUtil.isZeroAddress(_bridgeData.receiver)) revert InvalidReceiver();
        if (_bridgeData.minAmountIn == 0) revert InvalidAmount();
        if (_bridgeData.destinationChainId == block.chainid) revert CannotBridgeToSameNetwork();
    }

    function validateData(GenericBridgeData memory _bridgeData) internal view {
        if (_bridgeData.to.length > _MAX_ADDRESS_LENGTH || _bridgeData.receiver.length > _MAX_ADDRESS_LENGTH) revert InvalidLength();
        if (_bridgeData.minAmountIn == 0) revert InvalidAmount();
        if (_bridgeData.destinationChainId == block.chainid) revert CannotBridgeToSameNetwork();
    }

    function validateCrossChainData(address _callTo) internal view {
        if (!LibAsset.isContract(_callTo)) revert NotAContract();
    }

    function hasSourceSwaps(bool _hasSourceSwaps) internal pure {
        if (!_hasSourceSwaps) revert InformationMismatch();
    }

    function doesNotContainSourceSwaps(bool _hasSourceSwaps) internal pure {
        if (_hasSourceSwaps) revert InformationMismatch();
    }

    function doesNotContainDestinationCall(bool _hasDestinationCall) internal pure {
        if (_hasDestinationCall) revert InformationMismatch();
    }

    function doesNotContainSourceSwapOrDestinationCall(bool _hasSourceSwaps, bool _hasDestinationCall) internal pure {
        if (_hasSourceSwaps) revert InformationMismatch();
        if (_hasDestinationCall) revert InformationMismatch();
    }
}
