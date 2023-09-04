// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IDiamondInit {
    function initialize(
        address _permit2,
        address _protocolFeeVault,
        uint256 _maxTokenFee,
        uint256 _maxFixedNativeFeeAmount
    ) external;
}
