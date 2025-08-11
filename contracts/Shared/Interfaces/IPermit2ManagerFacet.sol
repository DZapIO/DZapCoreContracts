// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IPermit2ManagerFacet {
    /* ========= EVENTS ========= */

    event Permit2Updated(address indexed permit2);

    /* ========= RESTRICTED ========= */

    /// @dev Sets address of the protocols fee vault
    function updatePermit2(address _permit2) external;
}
