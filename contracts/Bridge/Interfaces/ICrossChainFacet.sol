// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { GenericBridgeData, CrossChainData } from "../Types.sol";
import { SwapInfo, SwapData } from "../../Shared/Types.sol";

interface ICrossChainFacet {
    /* ========= EVENTS ========= */

    event BridgeTransferStarted(bytes32 transactionId, address indexed integrator, address indexed sender, GenericBridgeData bridgeData);

    event MultiTokenBridgeTransferStarted(bytes32 transactionId, address indexed integrator, address indexed sender, GenericBridgeData[] bridgeData);

    event SwapBridgeTransferStarted(bytes32 transactionId, address indexed integrator, address indexed sender, GenericBridgeData[] bridgeData, SwapInfo[] swapInfo);

    /* ========= EXTERNAL ========= */

    /// @notice Bridges tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging
    /// @param _genericData contains bridge contract call data
    function bridge(bytes32 _transactionId, address _integrator, GenericBridgeData memory _bridgeData, CrossChainData calldata _genericData) external payable;

    /// @notice Bridges multiple tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging
    /// @param _genericData contains bridge contract call data
    function bridgeMultipleTokens(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, CrossChainData[] calldata _genericData) external payable;

    /// @notice Bridges multiple tokens via arbitrary cross-chain provider with swaps on src or dst chain
    /// @param _bridgeData the core information needed for bridging
    /// @param _swapData an array of swap related data for performing swaps before bridging
    /// @param _genericData contains bridge contract call data
    function swapAndBridge(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, SwapData[] calldata _swapData, CrossChainData[] calldata _genericData) external payable;
}
