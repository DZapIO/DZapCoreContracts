// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
 * @title IGlobalConfigFacet
 * @author DZap
 */
interface IGlobalConfigFacet {
    /* ========= EVENTS ========= */

    event ProtocolFeeVaultUpdated(address indexed protocolFeeVault);
    event RefundVaultUpdated(address indexed refundVault);
    event FeeValidatorUpdated(address indexed feeValidator);
    event Paused();
    event Unpaused();

    /* ========= RESTRICTED ========= */

    /// @dev Sets address of the protocol fee vault
    function setProtocolFeeVault(address _protocolFeeVault) external;

    /// @dev Sets address of the refund vault
    function setRefundVault(address _refundVault) external;

    /// @dev Sets address of the fee validator
    function setFeeValidator(address _feeValidator) external;

    /// @dev Pauses the contract
    function pause() external;

    /// @dev Unpauses the contract
    function unpause() external;

    /* ========= VIEW FUNCTIONS ========= */

    /// @dev Returns address of the protocol fee vault
    function getProtocolFeeVault() external view returns (address);

    /// @dev Returns address of the refund vault
    function getRefundVault() external view returns (address);

    /// @dev Returns address of the fee validator
    function getFeeValidator() external view returns (address);

    /// @dev Returns nonce of the user
    function getNonce(address _user) external view returns (uint256);

    /// @dev Returns address of the permit2
    function getPermit2() external view returns (address);

    /// @dev Returns pause state of the contract
    function getPaused() external view returns (bool);
}
