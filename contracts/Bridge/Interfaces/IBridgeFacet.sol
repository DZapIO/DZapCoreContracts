// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { IBridge } from "../../Shared/Interfaces/IBridge.sol";
import { PermitBatchTransferFrom } from "../../Shared/Interfaces/IPermit2.sol";
import { InputToken, BridgeSwapData, SwapExecutionData, AdapterInfo } from "../../Shared/Types.sol";

/**
 * @title IBridgeFacet
 * @author DZap
 */
interface IBridgeFacet is IBridge {
    /* ========= EXTERNAL ========= */

    /**
     * @notice Bridges tokens directly to another chain without pre-bridge swaps
     * @dev Simplest bridging method for tokens natively supported by bridge protocols.
     *
     * @param _transactionId Unique identifier for bridge tracking
     * @param _feeData Encoded FeeConfig containing integrator address and fees info.
     *                 Used for fee distribution between integrator and protocol
     * @param _feeVerificationSignature Oracle signature ensuring fee accuracy
     * @param _deadline Expiration timestamp for fee quote validity
     * @param _intputTokens Input token specification with amount and permissions
     * @param _adapterInfo Bridge adapter configuration and parameters
     */
    function bridge(
        bytes32 _transactionId,
        bytes calldata _feeData,
        bytes calldata _feeVerificationSignature,
        uint256 _deadline,
        InputToken calldata _intputTokens,
        AdapterInfo calldata _adapterInfo
    ) external payable;

    /**
     * @notice Bridges tokens with optional pre-bridge swap
     * @dev Enables bridging of tokens not natively supported by target bridge.
     *      Automatically swaps input token to bridge-compatible token before bridging.
     *
     * @param _transactionId Unique identifier for the operation
     * @param _feeData Encoded FeeConfig containing integrator address and fees info.
     *                 Used for fee distribution between integrator and protocol
     * @param _feeVerificationSignature Fee verification signature
     * @param _deadline Fee quote expiration timestamp
     * @param _intputTokens Input token for swap and/or bridge
     * @param _swapData Swap configuration
     * @param _swapExecutionData Swap execution parameters
     * @param _adapterInfo Bridge adapter configuration
     */
    function bridge(
        bytes32 _transactionId,
        bytes calldata _feeData,
        bytes calldata _feeVerificationSignature,
        uint256 _deadline,
        InputToken calldata _intputTokens,
        BridgeSwapData memory _swapData,
        SwapExecutionData memory _swapExecutionData,
        AdapterInfo calldata _adapterInfo
    ) external payable;

    /**
     * @notice Bridges multiple tokens to another chain with optional swaps
     * @dev Advanced bridging for complex multi-token operations. Each token can have
     *      independent swap and bridge configurations for maximum flexibility.
     *
     * @param _transactionId Unique identifier for batch bridge operation
     * @param _feeData Encoded FeeConfig containing integrator address and fees info.
     *                 Used for fee distribution between integrator and protocol
     * @param _feeVerificationSignature Oracle verification covering all fees
     * @param _deadline Expiration for all fee quotes
     * @param _intputTokens Array of input tokens with amounts
     * @param _swapData Array of swap configurations (empty entries for direct bridge)
     * @param _swapExecutionData Array of swap execution parameters
     * @param _adapterInfo Array of bridge adapter configurations
     */
    function bridge(
        bytes32 _transactionId,
        bytes calldata _feeData,
        bytes calldata _feeVerificationSignature,
        uint256 _deadline,
        InputToken[] calldata _intputTokens,
        BridgeSwapData[] memory _swapData,
        SwapExecutionData[] memory _swapExecutionData,
        AdapterInfo[] calldata _adapterInfo
    ) external payable;

    /**
     * @notice Bridges multiple tokens using Permit2 batch transfers
     * @dev Ultimate bridge solution combining gas efficiency of Permit2 with
     *      flexibility of multi-token bridging. Single signature authorizes
     *      all token transfers and bridge operations.
     *
     * @param _transactionId Unique identifier for the operation
     * @param _feeData Encoded FeeConfig containing integrator address and fees info.
     *                 Used for fee distribution between integrator and protocol
     * @param _feeVerificationSignature Oracle signature for fee verification
     * @param _batchDepositSignature Permit2 batch transfer signature
     * @param _deadline Fee quote expiration timestamp
     * @param _tokenDepositDetails Permit2 batch transfer structure
     * @param _swapData Array of swap configurations
     * @param _swapExecutionData Array of swap execution data
     * @param _adapterInfo Array of bridge adapter configurations
     */
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
    ) external payable;
}
