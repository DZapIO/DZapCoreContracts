// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IValidatorFacet {
    /* ========= EVENTS ========= */

    event FeeValidatorUpdated(address indexed feeValidator);

    /* ========= RESTRICTED ========= */

    /// @dev Sets address of the fee validator
    function setFeeValidator(address _feeValidator) external;

    /* ========= VIEW FUNCTIONS ========= */

    /// @dev Returns address of the fee validator
    function getFeeValidator() external view returns (address);

    /// @dev Returns nonce of the user
    function getNonce(address _user) external view returns (uint256);
}
