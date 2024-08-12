// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibAllowList } from "../../Shared/Libraries/LibAllowList.sol";
import { LibBridgeStorage } from "../Libraries/LibBridgeStorage.sol";

import { InformationMismatch, CannotBridgeToSameNetwork, InvalidAmount, NotAContract, InvalidContract, InvalidLength, ContractCallNotAllowed, NoSwapFromZeroBalance, UnAuthorizedCall } from "../../Shared/ErrorsNew.sol";

import { BridgeData, GenericBridgeData, CrossChainData } from "../Types.sol";
import { SwapData } from "../../Shared/Types.sol";

library LibValidatable {
    uint256 internal constant _MAX_ADDRESS_LENGTH = 255;

    function validateSwapData(SwapData calldata _swapData) internal view {
        if (!LibAllowList.contractIsAllowed(_swapData.callTo)) revert UnAuthorizedCall(_swapData.callTo);
        if (!LibAsset.isContract(_swapData.callTo)) revert InvalidContract();
        if (_swapData.fromAmount == 0) revert NoSwapFromZeroBalance();
    }

    function validateData(GenericBridgeData memory _bridgeData) internal view {
        if (_bridgeData.to.length > _MAX_ADDRESS_LENGTH || _bridgeData.receiver.length > _MAX_ADDRESS_LENGTH) revert InvalidLength();
        if (_bridgeData.minAmountIn == 0) revert InvalidAmount();
        if (_bridgeData.destinationChainId == block.chainid) revert CannotBridgeToSameNetwork();
    }

    function validateCrossChainData(CrossChainData calldata _crossChainData) internal view {
        if (!LibAsset.isContract(_crossChainData.callTo)) revert NotAContract();
        if (!LibBridgeStorage.getCrossChainStorage().allowlist[_crossChainData.callTo].isWhitelisted) revert UnAuthorizedCall(_crossChainData.callTo);
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
