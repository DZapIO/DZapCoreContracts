// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract MockReceiver {
    bytes public lastCallData;

    fallback() external payable {
        lastCallData = msg.data;
    }

    receive() external payable {}
}