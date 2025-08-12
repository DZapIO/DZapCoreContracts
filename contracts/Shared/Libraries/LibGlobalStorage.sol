// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

struct GlobalStorage {
    bool initialized;
    address protocolFeeVault;
    address feeValidator;
    address permit2;
    address refundVault;
    bool paused;
}

/**
 * @title LibGlobalStorage
 * @author DZap
 * @notice This library provides functionality for managing global storage
 */
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

    function getPaused() internal view returns (bool) {
        return globalStorage().paused;
    }
}
