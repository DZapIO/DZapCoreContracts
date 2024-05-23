// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { LibAsset } from "../Libraries/LibAsset.sol";

abstract contract RefundNative {
    /// @dev Refunds any excess native asset sent to the contract after the main function
    /// @notice Refunds any excess native asset sent to the contract after the main function
    /// @param _refundee Address to send refunds to
    modifier refundExcessNative(address _refundee) {
        uint256 initialBalance = address(this).balance - msg.value;
        _;
        uint256 finalBalance = address(this).balance;

        if (finalBalance > initialBalance) LibAsset.transferToken(LibAsset._NATIVE_TOKEN, _refundee, finalBalance - initialBalance);
    }
}
