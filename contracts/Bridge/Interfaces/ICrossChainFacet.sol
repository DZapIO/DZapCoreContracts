// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

// import { SwapData, SwapInfo } from "../../Shared/Types.sol";
import { CallToFunctionInfo, BridgeData, CrossChainData } from "../Types.sol";
import { SwapInfo, SwapData } from "../../Shared/Types.sol";

interface ICrossChainFacet {
    /* ========= EVENTS ========= */

    event SelectorToInfoUpdated(
        address[] routers,
        bytes4[] selectors,
        CallToFunctionInfo[] info
    );

    event BridgeTransferStarted(
        bytes32 transactionId,
        address indexed integrator,
        address indexed sender,
        address refundee,
        BridgeData bridgeData
    );

    event MultiTokenBridgeTransferStarted(
        bytes32 transactionId,
        address indexed integrator,
        address indexed sender,
        address refundee,
        BridgeData[] bridgeData
    );

    event SwapBridgeTransferStarted(
        bytes32 transactionId,
        address indexed integrator,
        address indexed sender,
        address refundee,
        BridgeData[] bridgeData,
        SwapInfo[] swapInfo
    );

    /* ========= EXTERNAL ========= */

    function bridge(
        bytes32 _transactionId,
        address _integrator,
        address _refundee,
        BridgeData memory _bridgeData,
        CrossChainData calldata _genericData
    ) external payable;

    function bridgeMultipleTokens(
        bytes32 _transactionId,
        address _integrator,
        address _refundee,
        BridgeData[] memory _bridgeData,
        CrossChainData[] calldata _genericData
    ) external payable;

    function swapAndBridge(
        bytes32 _transactionId,
        address _integrator,
        address _refundee,
        BridgeData[] memory _bridgeData,
        SwapData[] calldata _swapData, // src swap data
        CrossChainData[] calldata _genericData //  = _swapBridgeData.length
    ) external payable;
}
