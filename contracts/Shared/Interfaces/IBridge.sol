// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IBridge {
    /* ========= EVENTS ========= */
    event DZapBridgeStarted(bytes indexed transactionId, address indexed user, address indexed integrator);

    event BridgeStarted(
        bytes indexed transactionId,
        address indexed user,
        bytes receiver,
        string bridge,
        address bridgeAddress,
        address from,
        bytes to,
        uint256 amount,
        uint256 destinationChainId,
        bytes destinationCalldata
    );
}
