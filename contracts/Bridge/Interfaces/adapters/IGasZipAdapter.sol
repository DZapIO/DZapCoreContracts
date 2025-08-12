// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

struct GasZipData {
    bytes32 recipient; // EVM addresses need to be padded with trailing 0s,
    uint256 destChains; // short Chains
    uint256 depositAmount;
}

interface IGasZipAdapter {
    /* ========= EVENT ========= */

    event GasZipBridgeTransferStarted(bytes32 indexed transactionId, address indexed user, GasZipData gasZipData, bytes destinationCalldata);

    /* ========= VIEW ========= */

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
