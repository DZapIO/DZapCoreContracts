// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
 * @notice Data structure for GasZip bridge operations
 * @param recipient Padded EVM address (32 bytes with trailing zeros)
 * @param destChains Encoded destination chain information
 * @param depositAmount Amount of tokens to deposit/bridge
 * @dev recipient: EVM addresses need to be padded with trailing 0s,
 *      destChains: takes gaszip short Chains
 */
struct GasZipData {
    bytes32 recipient;
    uint256 destChains;
    uint256 depositAmount;
}

/**
 * @title IGasZipAdapter
 * @author DZap
 */
interface IGasZipAdapter {
    /* ========= EVENT ========= */

    event GasZipBridgeTransferStarted(bytes32 indexed transactionId, address indexed user, GasZipData gasZipData, bytes destinationCalldata);

    /* ========= VIEW ========= */

    /**
     * @notice Returns GasZip router contract address
     * @return Address of the GasZip router for this chain
     */
    function getGasZipRouter() external view returns (address);

    /* ========= EXTERNAL ========= */

    /**
     * @notice Executes bridge transfer through GasZip protocol
     * @param _transactionId DZap transaction identifier
     * @param _user User address for tracking and events
     * @param _maxAmountIn Maximum amount to bridge (swapOutAmount cap) - prevents bridging more than desired even if available
     * @param _from Source token address to bridge
     * @param _destinationCalldata Optional calldata for destination execution
     * @param _gasZipData GasZip-specific configuration and request data
     */
    function bridgeViaGasZip(
        bytes32 _transactionId,
        address _user,
        uint256 _maxAmountIn,
        address _from,
        bytes calldata _destinationCalldata,
        GasZipData memory _gasZipData
    ) external payable;
}
