// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { BridgeData, CrossChainData, GenericBridgeData, TransferData } from "../Types.sol";

interface IBatchBridgeCallFacet {
    /* ========= EVENTS ========= */

    event BatchBridgeTransferStart(bytes32 transactionId, address integrator, address indexed sender, BridgeData[] bridgeData, GenericBridgeData[] genericBridgeData);

    /* ========= EXTERNAL ========= */

    function batchBridgeCall(bytes32 _transactionId, address _integrator, CrossChainData[] calldata _crossChainData, BridgeData[] memory _bridgeData, GenericBridgeData[] memory _genericBridgeData, TransferData[] calldata _transferData) external payable;
}
