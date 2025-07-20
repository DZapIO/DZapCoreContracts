// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { PermitBatchTransferFrom } from "./IPermit2.sol";
import { SwapData, BridgeSwapData, SwapExecutionData, TokenInfo, InputToken, AdapterInfo } from "../Types.sol";

interface IGasLessFacet {
    /* ========= EVENTS ========= */

    event DZapGasLessStarted(bytes indexed _transactionId, address indexed executor, address indexed _user);

    /* ========= EXTERNAL ========= */

    /// @notice Executes a gasless swap for a user
    /// @param _transactionId The transaction ID
    /// @param _userIntentSignature The user intent signature
    /// @param _tokenApprovalData The token approval data
    /// @param _userIntentDeadline The user intent deadline
    /// @param _user The user
    /// @param _executorFeeInfo The executor fee info
    /// @param _BridgeswapData The swap data
    /// @param _swapExecutionData The swap execution data
    function executeSwap(
        bytes calldata _transactionId,
        bytes calldata _userIntentSignature,
        bytes calldata _tokenApprovalData,
        uint256 _userIntentDeadline,
        address _user,
        TokenInfo calldata _executorFeeInfo,
        SwapData calldata _BridgeswapData,
        SwapExecutionData calldata _swapExecutionData
    ) external;

    /// @notice Executes a gasless multi swap for a user
    /// @param _transactionId The transaction ID
    /// @param _userIntentSignature The user intent signature
    /// @param _userIntentDeadline The user intent deadline
    /// @param _user The user
    /// @param _inputTokens Input tokens needed for swaps
    /// @param _executorFeeInfo The executor fee info
    /// @param _BridgeswapData The swap data
    /// @param _swapExecutionData The swap execution data
    function executeMultiSwap(
        bytes calldata _transactionId,
        bytes calldata _userIntentSignature,
        uint256 _userIntentDeadline,
        address _user,
        InputToken[] calldata _inputTokens,
        TokenInfo[] calldata _executorFeeInfo,
        SwapData[] calldata _BridgeswapData,
        SwapExecutionData[] calldata _swapExecutionData
    ) external;

    /// @notice Executes a gasless multi swap for a user with permit2 witness
    /// @param _transactionId The transaction ID
    /// @param _userIntentSignature The user intent signature
    /// @param _user The user
    /// @param _tokenDepositDetails The token deposit details
    /// @param _executorFeeInfo The executor fee info
    /// @param _BridgeswapData The swap data
    /// @param _swapExecutionData The swap execution data
    function executeMultiSwapWithPermit2Witness(
        bytes calldata _transactionId,
        bytes calldata _userIntentSignature,
        address _user,
        PermitBatchTransferFrom calldata _tokenDepositDetails,
        TokenInfo[] calldata _executorFeeInfo,
        SwapData[] calldata _BridgeswapData,
        SwapExecutionData[] calldata _swapExecutionData
    ) external;

    /// @notice Executes a gasless bridge for a user
    /// @param _transactionId The transaction ID
    /// @param _bridgeFeeData The bridge fee data
    /// @param _userIntentSignature The user intent signature
    /// @param _feeVerificationSignature The fee verification signature
    /// @param _userIntentDeadline The user intent deadline
    /// @param _bridgeFeeDeadline The bridge fee deadline
    /// @param _user The user
    /// @param _inputToken The input token
    /// @param _executorFeeInfo The executor fee info
    /// @param _adapterInfo The adapter info
    function executeBridge(
        bytes calldata _transactionId,
        bytes calldata _bridgeFeeData,
        bytes calldata _userIntentSignature,
        bytes calldata _feeVerificationSignature,
        uint256 _userIntentDeadline,
        uint256 _bridgeFeeDeadline,
        address _user,
        InputToken calldata _inputToken,
        TokenInfo calldata _executorFeeInfo,
        AdapterInfo calldata _adapterInfo
    ) external payable;

    /// @notice Executes a gasless multi bridge for a user
    /// @param _transactionId The transaction ID
    /// @param _bridgeFeeData The bridge fee data
    /// @param _userIntentSignature The user intent signature
    /// @param _feeVerificationSignature The fee verification signature
    /// @param _userIntentDeadline The user intent deadline
    /// @param _bridgeFeeDeadline The bridge fee deadline
    /// @param _user The user
    /// @param _inputTokens Input tokens needed for bridges
    /// @param _executorFeeInfo The executor fee info
    /// @param _BridgeswapData The swap data
    /// @param _swapExecutionData The swap execution data
    /// @param _adapterInfo The adapter info
    function executeMultiBridge(
        bytes calldata _transactionId,
        bytes calldata _bridgeFeeData,
        bytes calldata _userIntentSignature,
        bytes calldata _feeVerificationSignature,
        uint256 _userIntentDeadline,
        uint256 _bridgeFeeDeadline,
        address _user,
        InputToken[] calldata _inputTokens,
        TokenInfo[] calldata _executorFeeInfo,
        BridgeSwapData[] calldata _BridgeswapData,
        SwapExecutionData[] calldata _swapExecutionData,
        AdapterInfo[] calldata _adapterInfo
    ) external payable;

    /// @notice Executes a gasless multi bridge for a user with permit2 witness
    /// @param _transactionId The transaction ID
    /// @param _bridgeFeeData The bridge fee data
    /// @param _userIntentSignature The user intent signature
    /// @param _feeVerificationSignature The fee verification signature
    /// @param _bridgeFeeDeadline The bridge fee deadline
    /// @param _user The user
    /// @param _tokenDepositDetails The token deposit details
    /// @param _executorFeeInfo The executor fee info
    /// @param _BridgeswapData The swap data
    /// @param _swapExecutionData The swap execution data
    /// @param _adapterInfo The adapter info
    function executeMultiBridgeBatchWithPermit2Witness(
        bytes calldata _transactionId,
        bytes calldata _bridgeFeeData,
        bytes calldata _userIntentSignature,
        bytes calldata _feeVerificationSignature,
        uint256 _bridgeFeeDeadline,
        address _user,
        PermitBatchTransferFrom calldata _tokenDepositDetails,
        TokenInfo[] calldata _executorFeeInfo,
        BridgeSwapData[] calldata _BridgeswapData,
        SwapExecutionData[] calldata _swapExecutionData,
        AdapterInfo[] calldata _adapterInfo
    ) external payable;
}
