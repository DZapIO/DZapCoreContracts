// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IDiamondInit {
    function initialize(address _protocolFeeVault, address _feeValidator, address _refundVault, address _permit2) external;
}
