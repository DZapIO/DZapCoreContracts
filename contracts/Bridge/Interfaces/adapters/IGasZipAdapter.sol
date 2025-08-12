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

    function bridgeViaGasZip(
        bytes32 _transactionId,
        address _user,
        bool _updateAmountIn,
        address _from,
        bytes calldata _destinationCalldata,
        GasZipData memory _gasZipData
    ) external payable;
}
