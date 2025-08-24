// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/**
 * @title IDiamondInit
 * @author DZap
 */
interface IDiamondInit {
    function initialize(address _protocolFeeVault, address _feeValidator, address _refundVault, address _permit2) external;
}
