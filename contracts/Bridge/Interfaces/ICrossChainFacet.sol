// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

// import { SwapData, SwapInfo } from "../../Shared/Types.sol";
import { CallToFunctionInfo, BridgeData, CrossChainData } from "../Types.sol";
import { SwapInfo, SwapData } from "../../Shared/Types.sol";

interface ICrossChainFacet {
    /* ========= EVENTS ========= */

    event SelectorToInfoUpdated(address[] routers, bytes4[] selectors, CallToFunctionInfo[] info);

    event BridgeTransferStarted(bytes32 transactionId, address indexed integrator, address indexed sender, address refundee, BridgeData bridgeData);

    event MultiTokenBridgeTransferStarted(bytes32 transactionId, address indexed integrator, address indexed sender, address refundee, BridgeData[] bridgeData);

    event SwapBridgeTransferStarted(bytes32 transactionId, address indexed integrator, address indexed sender, address refundee, BridgeData[] bridgeData, SwapInfo[] swapInfo);

    /* ========= EXTERNAL ========= */

    /// @notice Updates the amount offset of the specific function of the specific provider's router
    /// @param _routers Array of provider's routers
    /// @param _selectors Array of function selectors
    /// @param _infos Array of params associated with specified function
    function updateSelectorInfo(address[] calldata _routers, bytes4[] calldata _selectors, CallToFunctionInfo[] calldata _infos) external;

    /// @notice Bridges tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging
    /// @param _genericData data specific to CrossChainFacet
    function bridge(bytes32 _transactionId, address _integrator, address _refundee, BridgeData memory _bridgeData, CrossChainData calldata _genericData) external payable;

    /// @notice Bridges multiple tokens via arbitrary cross-chain provider
    /// @param _bridgeData the core information needed for bridging
    /// @param _genericData data specific to CrossChainFacet
    function bridgeMultipleTokens(bytes32 _transactionId, address _integrator, address _refundee, BridgeData[] memory _bridgeData, CrossChainData[] calldata _genericData) external payable;

    /// @notice Bridges multiple tokens via arbitrary cross-chain provider with swaps on src or dst chain
    /// @param _bridgeData the core information needed for bridging
    /// @param _swapData an array of swap related data for performing swaps before bridging
    /// @param _genericData data specific to GenericCrossChainFacet
    function swapAndBridge(bytes32 _transactionId, address _integrator, address _refundee, BridgeData[] memory _bridgeData, SwapData[] calldata _swapData, CrossChainData[] calldata _genericData) external payable;

    /// @notice Returns selector info
    function getSelectorInfo(address _router, bytes4 _selector) external view returns (CallToFunctionInfo memory);
}
