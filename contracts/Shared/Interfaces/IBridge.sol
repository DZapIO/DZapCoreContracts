// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
 * @title IBridge
 * @author DZap
 */
interface IBridge {
    /* ========= EVENTS ========= */
    event DZapBridgeStarted(bytes32 indexed transactionId, address indexed user, address indexed integrator);

    event BridgeStarted(
        bytes32 indexed transactionId,
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
