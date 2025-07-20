// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

struct GasZipData {
    bytes32 recipient; // EVM addresses need to be padded with trailing 0s,
    uint256 destChains; // short Chains
    uint256 depositAmount;
}

interface IGasZipAdapter {
    /* ========= EVENT ========= */

    event GasZipBridgeTransferStarted(bytes indexed transactionId, address indexed user, GasZipData gasZipData, bool hasDestinationCall);

    /* ========= VIEW ========= */

    function getGasZipRouter() external view returns (address);

    /* ========= EXTERNAL ========= */

    function bridgeViaGasZip(
        bool _updateAmountIn,
        address _from,
        bytes calldata _transactionId,
        GasZipData memory _gasZipData,
        address _user,
        bool _hasDestinationCall
    ) external payable;
}
