// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibDiamond } from "../Libraries/LibDiamond.sol";
import { LibAccess } from "../Libraries/LibAccess.sol";

/**
 * @title AuthorizationGuard
 * @author DZap
 * @notice Abstract contract to provide authorization functionality
 */
abstract contract AuthorizationGuard {
    modifier onlyAuthorized() {
        if (msg.sender != LibDiamond.contractOwner()) LibAccess.enforceAccessControl();
        _;
    }
}
