// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { PermitBatchTransferFrom } from "./IPermit2.sol";
import { SwapData, BridgeSwapData, SwapExecutionData, TokenInfo, InputToken, AdapterInfo } from "../Types.sol";

/**
 * @title IGasLessFacet
 * @author DZap
 */
interface IGasLessFacet {
    /* ========= EVENTS ========= */

    event DZapGasLessStarted(bytes32 indexed _transactionId, address indexed executor, address indexed _user);

    /* ========= EXTERNAL ========= */

    /**
     * @notice Executes a gasless token swap on behalf of a user
     * @dev The executor pays gas fees and receives compensation through _executorFeeInfo.
     *      User must have signed an intent with the specified parameters and deadline.
     *
     * @param _transactionId Unique identifier to prevent replay attacks
     * @param _user Address of the user initiating the swap
     * @param _integrator Address of the integrator for fee sharing
     * @param _userIntentDeadline Timestamp after which the user's intent expires
     * @param _userIntentSignature User's signature authorizing the transaction
     * @param _tokenApprovalData Encoded approval data for token transfers (simple approval, eip2612 permit, permit2 transferFrom)
     * @param _executorFeeInfo Token and amount for executor compensation
     * @param _swapData Configuration for the token swap (recipient, tokens, amounts, slippage)
     * @param _swapExecutionData Low-level execution data (target contract, calldata)
     */
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
    ) external;

    /**
     * @notice Executes multiple gasless token swaps in a single transaction
     * @dev Enables complex multi-hop swaps or parallel swaps across different tokens.
     *      More gas-efficient than multiple single swaps and provides atomic execution.
     *
     * @param _transactionId Unique identifier to prevent replay attacks
     * @param _user Address of the user initiating the swaps
     * @param _integrator Address of the integrator for fee sharing
     * @param _userIntentDeadline Timestamp after which the user's intent expires
     * @param _userIntentSignature User's signature authorizing all swaps
     * @param _inputTokens Array of input tokens with amounts and permissions
     * @param _executorFeeInfo Array of executor fee tokens and amounts
     * @param _swapData Array of swap configurations for each token pair
     * @param _swapExecutionData Array of execution data for each swap
     */
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
    ) external;

    /**
     * @notice Executes multiple gasless swaps using Permit2 batch witness transfers
     * @dev Uses Permit2 for gas-efficient batch token transfers with witness data.
     *      Eliminates need for separate token approvals by including signature-based permits.
     *
     * @param _transactionId Unique identifier to prevent replay attacks
     * @param _user Address of the user initiating the swaps
     * @param _integrator Address of the integrator for fee sharing
     * @param _userIntentSignature User's signature authorizing the operation
     * @param _tokenDepositDetails Permit2 batch transfer structure with witness
     * @param _executorFeeInfo Array of executor fee tokens and amounts
     * @param _swapData Array of swap configurations
     * @param _swapExecutionData Array of execution data for each swap
     */
    function executeMultiSwapWithWitness(
        bytes32 _transactionId,
        address _user,
        address _integrator,
        bytes calldata _userIntentSignature,
        PermitBatchTransferFrom calldata _tokenDepositDetails,
        TokenInfo[] calldata _executorFeeInfo,
        SwapData[] calldata _swapData,
        SwapExecutionData[] calldata _swapExecutionData
    ) external;

    /**
     * @notice Executes a gasless cross-chain bridge transaction
     * @dev Enables users to bridge tokens without holding native tokens for gas.
     *      Includes fee verification to ensure accurate bridge costs.
     *
     * @param _transactionId Unique identifier for the bridge operation
     * @param _bridgeFeeData Encoded FeeConfig containing integrator address and fees info.
     *                       Used for fee distribution between integrator and protocol
     * @param _userIntentSignature User's signature authorizing the bridge
     * @param _feeVerificationSignature Oracle signature verifying bridge fees
     * @param _userIntentDeadline Expiration time for user's intent
     * @param _bridgeFeeDeadline Expiration time for fee quote
     * @param _user Address of the user initiating the bridge
     * @param _inputToken Token to be bridged with amount and permissions
     * @param _executorFeeInfo Executor compensation details
     * @param _adapterInfo Bridge adapter configuration and parameters
     */
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
    ) external payable;

    /**
     * @notice Executes multiple gasless bridge transactions with optional pre-bridge swaps
     * @dev Combines swapping and bridging in atomic transactions. Useful for bridging
     *      tokens that aren't natively supported on destination chains.
     *
     * @param _transactionId Unique identifier for the multi-bridge operation
     * @param _bridgeFeeData Encoded FeeConfig containing integrator address and fees info.
     *                       Used for fee distribution between integrator and protocol
     * @param _userIntentSignature User's signature for the entire operation
     * @param _feeVerificationSignature Oracle verification of all bridge fees
     * @param _userIntentDeadline User intent expiration timestamp
     * @param _bridgeFeeDeadline Bridge fee quote expiration timestamp
     * @param _user Address of the user initiating the bridges
     * @param _inputTokens Array of input tokens for swaps and bridges
     * @param _executorFeeInfo Array of executor fees for each operation
     * @param _swapData Array of swap configurations (empty if no pre-bridge swaps)
     * @param _swapExecutionData Array of swap execution data
     * @param _adapterInfo Array of bridge adapter configurations
     */
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
    ) external payable;

    /**
     * @notice Executes multiple gasless bridges using Permit2 batch transfers
     * @dev Most gas-efficient method for complex multi-bridge operations.
     *      Combines Permit2 batch transfers with multi-bridge execution.
     *
     * @param _transactionId Unique identifier for the batch bridge operation
     * @param _bridgeFeeData Encoded FeeConfig containing integrator address and fees info.
     *                       Used for fee distribution between integrator and protocol
     * @param _userIntentSignature User's authorization signature
     * @param _feeVerificationSignature Oracle verification of bridge fees
     * @param _bridgeFeeDeadline Expiration time for fee quotes
     * @param _user Address of the user initiating the operations
     * @param _tokenDepositDetails Permit2 batch transfer with witness data
     * @param _executorFeeInfo Array of executor compensation details
     * @param _swapData Array of pre-bridge swap configurations
     * @param _swapExecutionData Array of swap execution parameters
     * @param _adapterInfo Array of bridge adapter configurations
     */
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
    ) external payable;
}
