// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { InvalidContract } from "../Errors.sol";
import { AllowList } from "../Types.sol";

struct AllowListStorage {
    mapping(address => AllowList) allowlist;
}

/// @title Lib Allow List
/// @notice Library for managing and accessing the conract address allow list
library LibAllowList {
    bytes32 internal constant NAMESPACE = keccak256("dzap.library.allow.list");

    /// @dev Adds a contract address to the allow list
    /// @param _contract the contract address to add
    function addAllowedContract(address _contract) internal {
        _checkAddress(_contract);

        AllowListStorage storage als = _getStorage();

        if (als.allowlist[_contract].isAllowed) return;

        als.allowlist[_contract].isAllowed = true;
    }

    /// @dev Remove a contract address from the allow list
    /// @param _contract the contract address to remove
    function removeAllowedContract(address _contract) internal {
        AllowListStorage storage als = _getStorage();

        if (!als.allowlist[_contract].isAllowed) {
            return;
        }

        als.allowlist[_contract].isAllowed = false;
    }

    /// @dev Add a selector to the allow list
    /// @param _selector the selector to add
    function addAllowedSelector(address _contract, bytes4 _selector) internal {
        _checkAddress(_contract);

        _getStorage().allowlist[_contract].selectorAllowList[_selector] = true;
    }

    /// @dev Removes a selector from the allow list
    /// @param _selector the selector to remove
    function removeAllowedSelector(
        address _contract,
        bytes4 _selector
    ) internal {
        _getStorage().allowlist[_contract].selectorAllowList[
            _selector
        ] = false;
    }

    /// @dev Checks whether a contract address has been added to the allow list
    /// @param _contract the contract address to check
    function contractIsAllowed(
        address _contract
    ) internal view returns (bool) {
        return _getStorage().allowlist[_contract].isAllowed;
    }

    /// @dev Returns if selector has been added to the allow list
    /// @param _selector the selector to check
    function selectorIsAllowed(
        address _contract,
        bytes4 _selector
    ) internal view returns (bool) {
        return _getStorage().allowlist[_contract].selectorAllowList[_selector];
    }

    /// @dev Fetch local storage struct
    function _getStorage()
        internal
        pure
        returns (AllowListStorage storage als)
    {
        bytes32 position = NAMESPACE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            als.slot := position
        }
    }

    /// @dev Contains business logic for validating a contract address.
    /// @param _contract address of the dex to check
    function _checkAddress(address _contract) private view {
        if (_contract == address(0) || _contract.code.length == 0)
            revert InvalidContract();
    }
}
