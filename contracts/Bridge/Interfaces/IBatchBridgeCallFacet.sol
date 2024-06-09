// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { CrossChainData, GenericBridgeData, TransferData } from "../Types.sol";

interface IBatchBridgeCallFacet {
    /* ========= EVENTS ========= */

    event BatchBridgeTransferStart(bytes32 transactionId, address integrator, address indexed sender, GenericBridgeData[] bridgeData);

    /* ========= EXTERNAL ========= */

    /// @notice Bridges tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging
    /// @param _crossChainData contains bridge contract call data
    /// @param _transferData contains address to which tokens are to be transferred
    ///  _crossChainData contains contract calldata _bridgeData and _genericBridgeData in sequence
    /// _genericBridgeData contains GenericData and transferData in sequence
    function batchBridgeCall(bytes32 _transactionId, address _integrator, CrossChainData[] calldata _crossChainData, GenericBridgeData[] memory _bridgeData, TransferData[] calldata _transferData) external payable;
}
