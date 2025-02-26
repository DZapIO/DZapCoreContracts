// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { GenericBridgeData, AdapterData } from "../Types.sol";
import { SwapInfo, SwapData } from "../../Shared/Types.sol";

interface IBatchBridgeCallFacet {
    /* ========= EVENTS ========= */

    event BatchBridgeTransferStart(bytes32 indexed transactionId, address indexed integrator, address indexed sender, GenericBridgeData[] bridgeData);

    event BatchSwapAndBridgeTransferStart(bytes32 indexed transactionId, address indexed integrator, address indexed sender, GenericBridgeData[] bridgeData, SwapInfo[] swapInfo);

    /* ========= EXTERNAL ========= */

    /// @notice Bridges tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging
    /// @param _data contains adapter related data
    function batchBridge(
        bytes32 _transactionId, 
        address _integrator, 
        GenericBridgeData[] memory _bridgeData,
        AdapterData[] calldata _data
    ) external payable;
   
    /// @notice Bridges tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging
    /// @param _swapData contains address to which tokens are to be transferred
    /// @param _data contains adapter related data
    function batchSwapAndBridge(
        bytes32 _transactionId, 
        address _integrator, 
        GenericBridgeData[] memory _bridgeData,
        SwapData[] calldata _swapData,
        AdapterData[] calldata _data
    ) external payable;
}
