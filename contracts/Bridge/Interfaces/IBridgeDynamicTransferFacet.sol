// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { GenericBridgeData, CrossChainData, TransferData } from "../Types.sol";

interface IBridgeDynamicTransferFacet {
    /* ========= EVENTS ========= */

    event BridgeTransferStarted(bytes32 transactionId, address indexed integrator, address indexed sender, GenericBridgeData bridgeData);

    event MultiTokenBridgeTransferStarted(bytes32 transactionId, address indexed integrator, address indexed sender, GenericBridgeData[] bridgeData);

    /* ========= EXTERNAL ========= */

    function bridgeViaTransfer(bytes32 _transactionId, address _integrator, GenericBridgeData memory _bridgeData, TransferData calldata _transferData) external payable;

    function bridgeMultipleTokensViaTransfer(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, TransferData[] calldata _transferData) external payable;
}
