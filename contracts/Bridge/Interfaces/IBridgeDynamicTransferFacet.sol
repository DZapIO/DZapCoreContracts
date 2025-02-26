// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { GenericBridgeData, CrossChainData, TransferData } from "../Types.sol";
import { SwapInfo, SwapData } from "../../Shared/Types.sol";

interface IBridgeDynamicTransferFacet {
    /* ========= EVENTS ========= */

    event BridgeTransferStarted(bytes32 indexed transactionId, address indexed integrator, address indexed sender, GenericBridgeData bridgeData);

    event MultiTokenBridgeTransferStarted(bytes32 indexed transactionId, address indexed integrator, address indexed sender, GenericBridgeData[] bridgeData);

    event SwapBridgeTransferStarted(bytes32 indexed transactionId, address indexed integrator, address indexed sender, GenericBridgeData[] bridgeData, SwapInfo[] swapInfo);

    /* ========= EXTERNAL ========= */

    /// @notice Bridges tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging (support nonEvm addresses)
    /// @param _transferData contains address to which tokens are to be transferred
    function bridgeViaTransfer(bytes32 _transactionId, address _integrator, GenericBridgeData memory _bridgeData, TransferData calldata _transferData) external payable;

    /// @notice Bridges tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging (support nonEvm addresses)
    /// @param _transferData contains address to which tokens are to be transferred
    function bridgeMultipleTokensViaTransfer(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, TransferData[] calldata _transferData) external payable;

    /// @notice Bridges multiple tokens via arbitrary cross-chain provider with swaps on src or dst chain
    /// @param _bridgeData the core information needed for bridging
    /// @param _swapData an array of swap related data for performing swaps before bridging
    /// @param _transferData contains address to which tokens are to be transferred
    function swapAndBridgeViaTransfer(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, SwapData[] calldata _swapData, TransferData[] calldata _transferData) external payable;
}
