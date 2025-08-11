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

/// @title DZap BridgeFacet
/// @notice Provides functionality for bridging tokens across chains
contract BridgeFacet is IBridgeFacet, Swapper, RefundNative, Pausable, ReentrancyGuard {
    /* ========= EXTERNAL ========= */

    /// @inheritdoc IBridgeFacet
    function bridge(
        bytes calldata _transactionId,
        bytes calldata _feeData,
        bytes calldata _feeVerificationSignature,
        uint256 _deadline,
        InputToken calldata _intputTokens,
        AdapterInfo calldata _adapterInfo
    ) external payable refundExcessNative(msg.sender) whenNotPaused nonReentrant {
        LibValidator.handleFeeVerification(
            msg.sender,
            _deadline,
            keccak256(_transactionId),
            keccak256(_feeData),
            keccak256(abi.encode(_adapterInfo)),
            _feeVerificationSignature
        );

        LibBridge.refundExcessTokens(_adapterInfo);

        if (!LibAsset.isNativeToken(_intputTokens.token)) {
            LibAsset.deposit(msg.sender, _intputTokens.token, _intputTokens.amount, _intputTokens.permit);
        }

        address integrator = LibBridge.takeFee(_feeData);

        LibBridge.bridge(_adapterInfo);

        emit DZapBridgeStarted(_transactionId, msg.sender, integrator);
    }

    /// @inheritdoc IBridgeFacet
    function bridge(
        bytes calldata _transactionId,
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
            keccak256(_transactionId),
            keccak256(_feeData),
            keccak256(abi.encode(_adapterInfo)),
            _feeVerificationSignature
        );

        LibBridge.refundExcessTokens(_adapterInfo);

        if (!LibAsset.isNativeToken(_intputTokens.token)) {
            LibAsset.deposit(msg.sender, _intputTokens.token, _intputTokens.amount, _intputTokens.permit);
        }

        address integrator = LibBridge.takeFee(_feeData);

        _executeBridgeSwap(_transactionId, msg.sender, _swapData, _swapExecutionData, false);

        LibBridge.bridge(_adapterInfo);

        emit DZapBridgeStarted(_transactionId, msg.sender, integrator);
    }

    /// @inheritdoc IBridgeFacet
    function bridge(
        bytes calldata _transactionId,
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
            keccak256(_transactionId),
            keccak256(_feeData),
            keccak256(abi.encode(_adapterInfo)),
            _feeVerificationSignature
        );

        LibBridge.refundExcessTokens(_adapterInfo);

        LibAsset.depositBatch(msg.sender, _erc20Token);

        address integrator = LibBridge.takeFee(_feeData);

        if (_swapData.length > 0) _executeBridgeSwaps(_transactionId, msg.sender, _swapData, _swapExecutionData, false);

        LibBridge.bridge(_adapterInfo);

        emit DZapBridgeStarted(_transactionId, msg.sender, integrator);
    }

    /// @inheritdoc IBridgeFacet
    function bridge(
        bytes calldata _transactionId,
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
            keccak256(_transactionId),
            keccak256(_feeData),
            keccak256(abi.encode(_adapterInfo)),
            _feeVerificationSignature
        );

        LibBridge.refundExcessTokens(_adapterInfo);

        LibAsset.depositBatch(msg.sender, _tokenDepositDetails, _batchDepositSignature);

        address integrator = LibBridge.takeFee(_feeData);

        if (_swapData.length > 0) _executeBridgeSwaps(_transactionId, msg.sender, _swapData, _swapExecutionData, false);

        LibBridge.bridge(_adapterInfo);

        emit DZapBridgeStarted(_transactionId, msg.sender, integrator);
    }
}
