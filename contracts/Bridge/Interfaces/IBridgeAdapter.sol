
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IBridgeAdapter {
    function bridge(address _srcToken, uint256 _amount, bytes calldata _data) external payable;
}
