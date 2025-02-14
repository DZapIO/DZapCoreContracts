// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IGasZipRouter {
    /* ========= EVENTS ========= */

    event Deposit(address from, uint256 chains, uint256 amount, bytes32 to);

    /* ========= EXTERNAL ========= */

     function deposit(uint256 chains, bytes32 to) external payable;
}