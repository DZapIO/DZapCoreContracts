// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../Libraries/LibAsset.sol";
import { LibPermit } from "../Libraries/LibPermit.sol";
import { LibValidator } from "../Libraries/LibValidator.sol";
import { LibBridge } from "../Libraries/LibBridge.sol";

import { PermitBatchTransferFrom } from "../Interfaces/IPermit2.sol";
import { IBridge } from "../Interfaces/IBridge.sol";
import { IGasLessFacet } from "../Interfaces/IGasLessFacet.sol";

import { Swapper } from "../Helpers/Swapper.sol";
import { RefundNative } from "../Helpers/RefundNative.sol";
import { Pausable } from "../Helpers/Pausable.sol";
import { ReentrancyGuard } from "../Helpers/ReentrancyGuard.sol";

import { SwapData, BridgeSwapData, SwapExecutionData, TokenInfo, InputToken, AdapterInfo } from "../Types.sol";

/**
 * @title GasLessFacet
 * @author DZap
 * @dev This contract enables meta-transactions for swaps and bridges, allowing users to interact with DeFi
 *      protocols without holding native tokens for gas fees. Executors are compensated through fees.
 *
 *      Key Features:
 *      - Gasless swaps (single and multi-token)
 *      - Gasless bridges (single and multi-token)
 *      - Support for Permit2 batch transfers
 *      - Intent-based execution with signature verification
 *      - Executor fee compensation mechanism
 */
contract GasLessFacet is IBridge, IGasLessFacet, Swapper, RefundNative, Pausable, ReentrancyGuard {
    /* ========= STORAGE ========= */

    string internal constant _SWAP_WITNESS_TYPE_STRING =
        "DZapSwapWitness witness)DZapSwapWitness(bytes32 txId,address user,bytes32 executorFeesHash,bytes32 swapDataHash)TokenPermissions(address token,uint256 amount)";
    string internal constant _BRIDGE_WITNESS_TYPE_STRING =
        "DZapBridgeWitness witness)DZapBridgeWitness(bytes32 txId,address user,bytes32 executorFeesHash,bytes32 swapDataHash,bytes32 adapterDataHash)TokenPermissions(address token,uint256 amount)";

    bytes32 internal constant _SWAP_WITNESS_TYPEHASH =
        keccak256("DZapSwapWitness(bytes32 txId,address user,bytes32 executorFeesHash,bytes32 swapDataHash)");
    bytes32 internal constant _BRIDGE_WITNESS_TYPEHASH =
        keccak256("DZapBridgeWitness(bytes32 txId,address user,bytes32 executorFeesHash,bytes32 swapDataHash,bytes32 adapterDataHash)");

    /* ========= EXTERNAL ========= */

    /// @inheritdoc IGasLessFacet
    function executeSwap(
        bytes32 _transactionId,
        address _user,
        address _integrator,
        uint256 _userIntentDeadline,
        bytes calldata _userIntentSignature,
        bytes calldata _tokenApprovalData,
        TokenInfo calldata _executorFeeInfo,
        SwapData calldata _swapData,
        SwapExecutionData calldata _swapExecutionData
    ) external whenNotPaused nonReentrant {
        LibValidator.handleGasLessSwapVerification(
            _user,
            _userIntentDeadline,
            _transactionId,
            keccak256(abi.encode(_executorFeeInfo)),
            keccak256(abi.encode(_swapData)),
            _userIntentSignature
        );

        LibAsset.deposit(_user, _swapData.from, _swapData.fromAmount + _executorFeeInfo.amount, _tokenApprovalData);

        if (_executorFeeInfo.token != address(0)) LibAsset.transferERC20WithoutChecks(_executorFeeInfo.token, msg.sender, _executorFeeInfo.amount);

        _executeSwap(_transactionId, _user, _integrator, _swapData, _swapExecutionData, false);

        emit DZapGasLessStarted(_transactionId, msg.sender, _user);
    }

    /// @inheritdoc IGasLessFacet
    function executeMultiSwap(
        bytes32 _transactionId,
        address _user,
        address _integrator,
        uint256 _userIntentDeadline,
        bytes calldata _userIntentSignature,
        InputToken[] calldata _inputTokens,
        TokenInfo[] calldata _executorFeeInfo,
        SwapData[] calldata _swapData,
        SwapExecutionData[] calldata _swapExecutionData
    ) external whenNotPaused nonReentrant {
        LibValidator.handleGasLessSwapVerification(
            _user,
            _userIntentDeadline,
            _transactionId,
            keccak256(abi.encode(_executorFeeInfo)),
            keccak256(abi.encode(_swapData)),
            _userIntentSignature
        );

        LibAsset.depositBatch(_user, _inputTokens);

        _transferExecutorFees(_executorFeeInfo);

        _executeSwaps(_transactionId, _user, _integrator, _swapData, _swapExecutionData, false);

        emit DZapGasLessStarted(_transactionId, msg.sender, _user);
    }

    /// @inheritdoc IGasLessFacet
    function executeMultiSwapWithWitness(
        bytes32 _transactionId,
        address _user,
        address _integrator,
        bytes calldata _userIntentSignature,
        PermitBatchTransferFrom calldata _tokenDepositDetails,
        TokenInfo[] calldata _executorFeeInfo,
        SwapData[] calldata _swapData,
        SwapExecutionData[] calldata _swapExecutionData
    ) external whenNotPaused nonReentrant {
        bytes32 witness = _createSwapWitnessHash(_transactionId, _user, _executorFeeInfo, _swapData);

        LibPermit.permit2BatchWitnessTransferFrom(
            _user,
            address(this),
            witness,
            _tokenDepositDetails,
            _userIntentSignature,
            _SWAP_WITNESS_TYPE_STRING
        );

        _transferExecutorFees(_executorFeeInfo);

        _executeSwaps(_transactionId, _user, _integrator, _swapData, _swapExecutionData, false);

        emit DZapGasLessStarted(_transactionId, msg.sender, _user);
    }

    /// @inheritdoc IGasLessFacet
    function executeBridge(
        bytes32 _transactionId,
        bytes calldata _bridgeFeeData,
        bytes calldata _userIntentSignature,
        bytes calldata _feeVerificationSignature,
        uint256 _userIntentDeadline,
        uint256 _bridgeFeeDeadline,
        address _user,
        InputToken calldata _inputToken,
        TokenInfo calldata _executorFeeInfo,
        AdapterInfo calldata _adapterInfo
    ) external payable refundExcessNative(msg.sender) whenNotPaused nonReentrant {
        bytes32 adapterInfoHash = keccak256(abi.encode(_adapterInfo));

        LibValidator.handleGasLessBridgeVerification(
            _user,
            _userIntentDeadline,
            _transactionId,
            keccak256(abi.encode(_executorFeeInfo)),
            adapterInfoHash,
            _userIntentSignature
        );

        LibValidator.handleFeeVerification(
            _user,
            _bridgeFeeDeadline,
            _transactionId,
            keccak256(_bridgeFeeData),
            adapterInfoHash,
            _feeVerificationSignature
        );

        LibAsset.deposit(_user, _inputToken.token, _inputToken.amount, _inputToken.permit);

        if (_executorFeeInfo.token != address(0)) LibAsset.transferERC20WithoutChecks(_executorFeeInfo.token, msg.sender, _executorFeeInfo.amount);

        address integrator = LibBridge.takeFee(_bridgeFeeData);

        LibBridge.bridge(_adapterInfo);

        emit DZapBridgeStarted(_transactionId, _user, integrator);
        emit DZapGasLessStarted(_transactionId, msg.sender, _user);
    }

    /// @inheritdoc IGasLessFacet
    function executeMultiBridge(
        bytes32 _transactionId,
        bytes calldata _bridgeFeeData,
        bytes calldata _userIntentSignature,
        bytes calldata _feeVerificationSignature,
        uint256 _userIntentDeadline,
        uint256 _bridgeFeeDeadline,
        address _user,
        InputToken[] calldata _inputTokens,
        TokenInfo[] calldata _executorFeeInfo,
        BridgeSwapData[] calldata _swapData,
        SwapExecutionData[] calldata _swapExecutionData,
        AdapterInfo[] calldata _adapterInfo
    ) external payable refundExcessNative(msg.sender) whenNotPaused nonReentrant {
        bytes32 adapterInfoHash = keccak256(abi.encode(_adapterInfo));

        LibValidator.handleGasLessSwapBridgeVerification(
            _user,
            _userIntentDeadline,
            _transactionId,
            keccak256(abi.encode(_executorFeeInfo)),
            keccak256(abi.encode(_swapData)),
            adapterInfoHash,
            _userIntentSignature
        );

        LibValidator.handleFeeVerification(
            _user,
            _bridgeFeeDeadline,
            _transactionId,
            keccak256(_bridgeFeeData),
            adapterInfoHash,
            _feeVerificationSignature
        );

        LibAsset.depositBatch(_user, _inputTokens);

        _transferExecutorFees(_executorFeeInfo);

        address integrator = LibBridge.takeFee(_bridgeFeeData);

        _executeBridgeSwaps(_transactionId, _user, integrator, _swapData, _swapExecutionData, false);

        LibBridge.bridge(_adapterInfo);

        emit DZapBridgeStarted(_transactionId, _user, integrator);
        emit DZapGasLessStarted(_transactionId, msg.sender, _user);
    }

    /// @inheritdoc IGasLessFacet
    function executeMultiBridgeWithWitness(
        bytes32 _transactionId,
        bytes calldata _bridgeFeeData,
        bytes calldata _userIntentSignature,
        bytes calldata _feeVerificationSignature,
        uint256 _bridgeFeeDeadline,
        address _user,
        PermitBatchTransferFrom calldata _tokenDepositDetails,
        TokenInfo[] calldata _executorFeeInfo,
        BridgeSwapData[] calldata _swapData,
        SwapExecutionData[] calldata _swapExecutionData,
        AdapterInfo[] calldata _adapterInfo
    ) external payable refundExcessNative(msg.sender) whenNotPaused nonReentrant {
        bytes32 adapterInfoHash = keccak256(abi.encode(_adapterInfo));
        bytes32 witness = _createBridgeWitnessHash(_user, _transactionId, _executorFeeInfo, _swapData, adapterInfoHash);

        LibPermit.permit2BatchWitnessTransferFrom(
            _user,
            address(this),
            witness,
            _tokenDepositDetails,
            _userIntentSignature,
            _BRIDGE_WITNESS_TYPE_STRING
        );

        address integrator = LibBridge.verifyAndTakeFee(
            _user,
            _bridgeFeeDeadline,
            _transactionId,
            adapterInfoHash,
            _bridgeFeeData,
            _feeVerificationSignature
        );

        _transferExecutorFees(_executorFeeInfo);

        _executeBridgeSwaps(_transactionId, _user, integrator, _swapData, _swapExecutionData, false);

        LibBridge.bridge(_adapterInfo);

        emit DZapBridgeStarted(_transactionId, _user, integrator);
        emit DZapGasLessStarted(_transactionId, msg.sender, _user);
    }

    /* ========= INTERNAL ========= */

    function _transferExecutorFees(TokenInfo[] calldata _executorFeeInfo) internal {
        for (uint256 i = 0; i < _executorFeeInfo.length; ) {
            LibAsset.transferERC20WithoutChecks(_executorFeeInfo[i].token, msg.sender, _executorFeeInfo[i].amount);
            unchecked {
                ++i;
            }
        }
    }

    function _createSwapWitnessHash(
        bytes32 _transactionId,
        address _user,
        TokenInfo[] calldata _executorFeeInfo,
        SwapData[] calldata _swapData
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(_SWAP_WITNESS_TYPEHASH, _transactionId, _user, keccak256(abi.encode(_executorFeeInfo)), keccak256(abi.encode(_swapData)))
            );
    }

    function _createBridgeWitnessHash(
        address _user,
        bytes32 _transactionIdHash,
        TokenInfo[] calldata _executorFeeInfo,
        BridgeSwapData[] calldata _swapData,
        bytes32 _adapterInfoHash
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    _BRIDGE_WITNESS_TYPEHASH,
                    _transactionIdHash,
                    _user,
                    keccak256(abi.encode(_executorFeeInfo)),
                    keccak256(abi.encode(_swapData)),
                    _adapterInfoHash
                )
            );
    }
}
