// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibGlobalStorage } from "../Libraries/LibGlobalStorage.sol";

/// @title Pausable
/// @notice Abstract contract that restricts function execution based on a global pause state.
/// @dev Intended for use with a global storage library (LibGlobalStorage) that manages the pause flag.
abstract contract Pausable {
    /* ========= Errors ========= */

    error ContractIsPaused();
    error ContractIsNotPaused();

    /* ========= Modifiers ========= */

    modifier whenNotPaused() {
        if (LibGlobalStorage.getPaused()) revert ContractIsPaused();
        _;
    }

    modifier whenPaused() {
        if (!LibGlobalStorage.getPaused()) revert ContractIsNotPaused();
        _;
    }
}
