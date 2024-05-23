// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { GenericBridgeData, CrossChainData } from "../Types.sol";

interface IGenericCrossChainFaucet {
    /* ========= EVENTS ========= */

    event BridgeTransferStarted(bytes32 transactionId, address indexed integrator, address indexed sender, GenericBridgeData bridgeData);

    event MultiTokenBridgeTransferStarted(bytes32 transactionId, address indexed integrator, address indexed sender, GenericBridgeData[] bridgeData);

    /* ========= EXTERNAL ========= */

    /// @notice Bridges tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging (support nonEvm addresses)
    /// @param _genericData contains bridge contract call data
    function bridgeViaGenericCrossChain(bytes32 _transactionId, address _integrator, GenericBridgeData memory _bridgeData, CrossChainData calldata _genericData) external payable;

    /// @notice Bridges multiple tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging (support nonEvm addresses)
    /// @param _genericData contains bridge contract call data
    function bridgeMultipleTokensViaGenericCrossChain(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, CrossChainData[] calldata _genericData) external payable;
}
