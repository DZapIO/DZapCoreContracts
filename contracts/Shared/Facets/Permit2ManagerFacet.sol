// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibGlobalStorage, GlobalStorage } from "../Libraries/LibGlobalStorage.sol";
import { AuthorizationGuard } from "../Helpers/AuthorizationGuard.sol";
import { IPermit2ManagerFacet } from "../Interfaces/IPermit2ManagerFacet.sol";
import { ZeroAddress } from "../Errors.sol";

/**
 * @title Permit2ManagerFacet
 * @author DZap
 * @notice Provides functionality for updating Permit2 contract address
 * @dev On some chains Uniswap Permit2 is not deployed, so this allows
 *      updating the Permit2 address to uniswap permit2 address in future
 */
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
