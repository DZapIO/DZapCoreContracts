// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title DZap Reentrancy Guard
/// @notice Abstract contract to provide protection against reentrancy
abstract contract ReentrancyGuard {
    /* ========= Storage ========= */

    bytes32 private constant NAMESPACE = keccak256("dzap.reentrancyguard");

    /* ========= Types ========= */

    struct ReentrancyStorage {
        uint256 status;
    }

    /* ========= Errors ========= */

    error ReentrancyError();

    /* ========= Constants ========= */

    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    /* ========= Modifiers ========= */

    modifier nonReentrant() {
        ReentrancyStorage storage s = reentrancyStorage();
        if (s.status == _ENTERED) revert ReentrancyError();
        s.status = _ENTERED;
        _;
        s.status = _NOT_ENTERED;
    }

    /* ========= Private Methods ========= */

    /// @dev fetch local storage
    function reentrancyStorage() private pure returns (ReentrancyStorage storage data) {
        bytes32 position = NAMESPACE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            data.slot := position
        }
    }
}
