// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibBridge } from "../../Shared/Libraries/LibBridge.sol";
import { NoBridgeFromZeroAmount, BridgeNotWhitelisted, CannotBridgeToSameNetwork, InvalidEncodedAddress } from "../../Shared/Errors.sol";

/**
 * @title LibValidatable
 * @author DZap
 * @notice This library contains helpers for validating bridge data
 */
library LibValidatable {
    uint256 internal constant _MAX_ADDRESS_LENGTH = 255;

    /// @notice Validates the data for a bridge swap
    function validateData(address _callTo, uint256 _fromAmount, uint256 _destinationChainId) internal view {
        if (!LibBridge.isBridgeWhitelisted(_callTo)) revert BridgeNotWhitelisted(_callTo);
        if (_fromAmount == 0) revert NoBridgeFromZeroAmount();
        if (_destinationChainId == block.chainid) revert CannotBridgeToSameNetwork();
    }

    /// @notice Validates the data for a bridge swap
    function validateData(bytes calldata _to, bytes calldata _receiver, uint256 _fromAmount, uint256 _destinationChainId) internal view {
        if (_to.length > _MAX_ADDRESS_LENGTH || _receiver.length > _MAX_ADDRESS_LENGTH) revert InvalidEncodedAddress();
        if (_fromAmount == 0) revert NoBridgeFromZeroAmount();
        if (_destinationChainId == block.chainid) revert CannotBridgeToSameNetwork();
    }
}
