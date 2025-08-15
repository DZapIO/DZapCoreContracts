// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibBridge } from "../../Shared/Libraries/LibBridge.sol";
import { LibValidator } from "../../Shared/Libraries/LibValidator.sol";

import { Swapper } from "../../Shared/Helpers/Swapper.sol";
import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";
import { ReentrancyGuard } from "../../Shared/Helpers/ReentrancyGuard.sol";
import { Pausable } from "../../Shared/Helpers/Pausable.sol";
import { PermitBatchTransferFrom } from "../../Shared/Interfaces/IPermit2.sol";
import { IBridgeFacet } from "../Interfaces/IBridgeFacet.sol";

import { InputToken, BridgeSwapData, SwapExecutionData, AdapterInfo } from "../../Shared/Types.sol";

/**
 * @title BridgeFacet
 * @author DZap
 * @dev Provide comprehensive bridging solutions with optional pre-bridge token swaps.
 *     Supports multiple bridge adapters and execution patterns.
 *
 *      Key Features:
 *      - Direct token bridging
 *      - Swap-then-bridge operations
 *      - Multi-token batch bridging
 *      - Permit2 integration
 *      - Dynamic fee for integrators
 *      - Support bridging to non evm chains
 *
 *      Bridge Adapters:
 *      - Generic bridges (most protocols)
 *      - Specialized adapters (Relay, GasZip, etc.)
 *      - Direct transfers (Near, Changenow, etc.)
 */
contract BridgeFacet is IBridgeFacet, Swapper, RefundNative, Pausable, ReentrancyGuard {
    /* ========= EXTERNAL ========= */

    /// @inheritdoc IBridgeFacet
    function bridge(
        bytes32 _transactionId,
        bytes calldata _feeData,
        bytes calldata _feeVerificationSignature,
        uint256 _deadline,
        InputToken calldata _intputTokens,
        AdapterInfo calldata _adapterInfo
    ) external payable refundExcessNative(msg.sender) whenNotPaused nonReentrant {
        LibValidator.handleFeeVerification(
            msg.sender,
            _deadline,
            _transactionId,
            keccak256(_feeData),
            keccak256(abi.encode(_adapterInfo)),
            _feeVerificationSignature
        );

        if (!LibAsset.isNativeToken(_intputTokens.token)) {
            LibAsset.deposit(msg.sender, _intputTokens.token, _intputTokens.amount, _intputTokens.permit);
        }

        address integrator = LibBridge.takeFee(_feeData);

        LibBridge.bridge(_adapterInfo);

        emit DZapBridgeStarted(_transactionId, msg.sender, integrator);
    }

    /// @inheritdoc IBridgeFacet
    function bridge(
        bytes32 _transactionId,
        bytes calldata _feeData,
        bytes calldata _feeVerificationSignature,
        uint256 _deadline,
        InputToken calldata _intputTokens,
        BridgeSwapData memory _swapData,
        SwapExecutionData memory _swapExecutionData,
        AdapterInfo calldata _adapterInfo
    ) external payable refundExcessNative(msg.sender) whenNotPaused nonReentrant {
        LibValidator.handleFeeVerification(
            msg.sender,
            _deadline,
            _transactionId,
            keccak256(_feeData),
            keccak256(abi.encode(_adapterInfo)),
            _feeVerificationSignature
        );

        if (!LibAsset.isNativeToken(_intputTokens.token)) {
            LibAsset.deposit(msg.sender, _intputTokens.token, _intputTokens.amount, _intputTokens.permit);
        }

        address integrator = LibBridge.takeFee(_feeData);

        _executeBridgeSwap(_transactionId, msg.sender, integrator, _swapData, _swapExecutionData, false);

        LibBridge.bridge(_adapterInfo);

        emit DZapBridgeStarted(_transactionId, msg.sender, integrator);
    }

    /// @inheritdoc IBridgeFacet
    function bridge(
        bytes32 _transactionId,
        bytes calldata _feeData,
        bytes calldata _feeVerificationSignature,
        uint256 _deadline,
        InputToken[] calldata _erc20Token,
        BridgeSwapData[] memory _swapData,
        SwapExecutionData[] memory _swapExecutionData,
        AdapterInfo[] calldata _adapterInfo
    ) external payable refundExcessNative(msg.sender) whenNotPaused nonReentrant {
        LibValidator.handleFeeVerification(
            msg.sender,
            _deadline,
            _transactionId,
            keccak256(_feeData),
            keccak256(abi.encode(_adapterInfo)),
            _feeVerificationSignature
        );

        LibAsset.depositBatch(msg.sender, _erc20Token);

        address integrator = LibBridge.takeFee(_feeData);

        if (_swapData.length > 0) _executeBridgeSwaps(_transactionId, msg.sender, integrator, _swapData, _swapExecutionData, false);

        LibBridge.bridge(_adapterInfo);

        emit DZapBridgeStarted(_transactionId, msg.sender, integrator);
    }

    /// @inheritdoc IBridgeFacet
    function bridge(
        bytes32 _transactionId,
        bytes calldata _feeData,
        bytes calldata _feeVerificationSignature,
        bytes calldata _batchDepositSignature,
        uint256 _deadline,
        PermitBatchTransferFrom calldata _tokenDepositDetails,
        BridgeSwapData[] memory _swapData,
        SwapExecutionData[] memory _swapExecutionData,
        AdapterInfo[] calldata _adapterInfo
    ) external payable refundExcessNative(msg.sender) whenNotPaused nonReentrant {
        LibValidator.handleFeeVerification(
            msg.sender,
            _deadline,
            _transactionId,
            keccak256(_feeData),
            keccak256(abi.encode(_adapterInfo)),
            _feeVerificationSignature
        );

        LibAsset.depositBatch(msg.sender, _tokenDepositDetails, _batchDepositSignature);

        address integrator = LibBridge.takeFee(_feeData);

        if (_swapData.length > 0) _executeBridgeSwaps(_transactionId, msg.sender, integrator, _swapData, _swapExecutionData, false);

        LibBridge.bridge(_adapterInfo);

        emit DZapBridgeStarted(_transactionId, msg.sender, integrator);
    }
}
