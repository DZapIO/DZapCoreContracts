// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IVaultManagerFacet {
    /* ========= EVENTS ========= */

    event ProtocolFeeVaultUpdated(address indexed protocolFeeVault);
    event RefundVaultUpdated(address indexed refundVault);

    /* ========= RESTRICTED ========= */

    /// @dev Sets address of the protocol fee vault
    function setProtocolFeeVault(address _protocolFeeVault) external;

    /// @dev Sets address of the refund vault
    function setRefundVault(address _refundVault) external;

    /* ========= VIEW FUNCTIONS ========= */

    /// @dev Returns address of the protocol fee vault
    function getProtocolFeeVault() external view returns (address);

    /// @dev Returns address of the refund vault
    function getRefundVault() external view returns (address);
}
