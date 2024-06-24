// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { CannotAuthorizeSelf, UnAuthorized } from "../ErrorsNew.sol";

struct AccessStorage {
    mapping(bytes4 => mapping(address => bool)) execAccess;
}

/// @title Access Library
/// @notice Provides functionality for managing method level access control
library LibAccess {
    /// Types ///
    bytes32 internal constant _ACCESS_STORAGE_SLOT = keccak256("dzap.library.access.management");

    /// Events ///
    event AccessGranted(address indexed account, bytes4 indexed method);
    event AccessRevoked(address indexed account, bytes4 indexed method);

    /// @dev Fetch local storage
    function accessStorage() internal pure returns (AccessStorage storage accStor) {
        bytes32 position = _ACCESS_STORAGE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            accStor.slot := position
        }
    }

    /// @notice Gives an address permission to execute a method
    /// @param _selector The method selector to execute
    /// @param _executor The address to grant permission to
    function addAccess(bytes4 _selector, address _executor) internal {
        if (_executor == address(this)) {
            revert CannotAuthorizeSelf();
        }
        AccessStorage storage accStor = accessStorage();
        accStor.execAccess[_selector][_executor] = true;
        emit AccessGranted(_executor, _selector);
    }

    /// @notice Revokes permission to execute a method
    /// @param _selector The method selector to execute
    /// @param _executor The address to revoke permission from
    function removeAccess(bytes4 _selector, address _executor) internal {
        AccessStorage storage accStor = accessStorage();
        accStor.execAccess[_selector][_executor] = false;
        emit AccessRevoked(_executor, _selector);
    }

    /// @notice Enforces access control by reverting if `msg.sender`
    ///     has not been given permission to execute `msg.sig`
    function enforceAccessControl() internal view {
        AccessStorage storage accStor = accessStorage();
        if (accStor.execAccess[msg.sig][msg.sender] != true) revert UnAuthorized();
    }
}
