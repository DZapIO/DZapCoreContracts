// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

struct GlobalStorage {
    bool initialized; // Single flag for entire diamond
    address protocolFeeVault;
    address feeValidator;
    address permit2;
    address refundVault;
}

/// @title LibFees
/// @notice This library contains helpers for calculating and transferring fees
/// @dev Old Fees library, cant be removed due to diamond initialization
library LibGlobalStorage {
    bytes32 internal constant _GLOBAL_NAMESPACE = keccak256("dzap.storage.library.global");

    function globalStorage() internal pure returns (GlobalStorage storage ds) {
        bytes32 slot = _GLOBAL_NAMESPACE;
        assembly {
            ds.slot := slot
        }
    }

    function getRefundVault() internal view returns (address) {
        return globalStorage().refundVault;
    }

    function getProtocolFeeVault() internal view returns (address) {
        return globalStorage().protocolFeeVault;
    }

    function getFeeValidator() internal view returns (address) {
        return globalStorage().feeValidator;
    }

    function getPermit2() internal view returns (address) {
        return globalStorage().permit2;
    }
}
