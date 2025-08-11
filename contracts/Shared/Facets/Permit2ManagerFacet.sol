// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibGlobalStorage, GlobalStorage } from "../Libraries/LibGlobalStorage.sol";
import { AuthorizationGuard } from "../Helpers/AuthorizationGuard.sol";
import { IPermit2ManagerFacet } from "../Interfaces/IPermit2ManagerFacet.sol";
import { ZeroAddress } from "../Errors.sol";

/// @title DZap Permit2 Manager Facet
/// @notice Provides functionality for updating permit2
contract Permit2ManagerFacet is IPermit2ManagerFacet, AuthorizationGuard {
    /* ========= EXTERNAL ========= */

    /// @inheritdoc IPermit2ManagerFacet
    function updatePermit2(address _permit2) external onlyAuthorized {
        if (_permit2 == address(0)) revert ZeroAddress();

        GlobalStorage storage gs = LibGlobalStorage.globalStorage();
        gs.permit2 = _permit2;
        emit Permit2Updated(_permit2);
    }
}
