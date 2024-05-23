// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { GenericBridgeData, CrossChainData } from "../Types.sol";

interface IGenericCrossChainFaucet {
    /* ========= EVENTS ========= */

    event BridgeTransferStarted(bytes32 transactionId, address indexed integrator, address indexed sender, GenericBridgeData bridgeData);

    event MultiTokenBridgeTransferStarted(bytes32 transactionId, address indexed integrator, address indexed sender, GenericBridgeData[] bridgeData);

    /* ========= EXTERNAL ========= */

    function bridgeViaGenericCrossChain(bytes32 _transactionId, address _integrator, GenericBridgeData memory _bridgeData, CrossChainData calldata _genericData) external payable;

    function bridgeMultipleTokensViaGenericCrossChain(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, CrossChainData[] calldata _genericData) external payable;
}
