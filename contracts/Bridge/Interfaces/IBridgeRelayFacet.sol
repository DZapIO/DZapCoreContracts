// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { GenericBridgeData, RelayData } from "../Types.sol";
import { SwapInfo, SwapData } from "../../Shared/Types.sol";

interface IBridgeRelayFacet {
    /* ========= EVENTS ========= */

    event BridgeTransferStarted(bytes32 indexed transactionId, address indexed integrator, address indexed sender, GenericBridgeData bridgeData);

    event MultiTokenBridgeTransferStarted(bytes32 indexed transactionId, address indexed integrator, address indexed sender, GenericBridgeData[] bridgeData);

    event SwapBridgeTransferStarted(bytes32 indexed transactionId, address indexed integrator, address indexed sender, GenericBridgeData[] bridgeData, SwapInfo[] swapInfo);

    /* ========= VIEW ========= */

    function getRelayAddress() external view returns(address receiver, address solver);

    /* ========= EXTERNAL ========= */

    /// @notice Bridges tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging (support nonEvm addresses)
    /// @param _relayData contains relay bridge trandfer data
    function bridgeViaRelay(bytes32 _transactionId, address _integrator, GenericBridgeData memory _bridgeData, RelayData calldata _relayData) external payable;

    /// @notice Bridges tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging (support nonEvm addresses)
    /// @param _relayData contains relay bridge trandfer data
    function bridgeMultipleTokensViaRelay(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, RelayData[] calldata _relayData) external payable;

    /// @notice Bridges multiple tokens via arbitrary cross-chain provider with swaps on src or dst chain
    /// @param _bridgeData the core information needed for bridging
    /// @param _swapData an array of swap related data for performing swaps before bridging
    /// @param _relayData contains relay bridge trandfer data
    function swapAndBridgeViaRelay(bytes32 _transactionId, address _integrator, GenericBridgeData[] memory _bridgeData, SwapData[] calldata _swapData, RelayData[] calldata _relayData) external payable;
}
