// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibGlobalStorage, GlobalStorage } from "../Libraries/LibGlobalStorage.sol";
import { LibValidator } from "../Libraries/LibValidator.sol";
import { AuthorizationGuard } from "../Helpers/AuthorizationGuard.sol";
import { Pausable } from "../Helpers/Pausable.sol";
import { IGlobalConfigFacet } from "../Interfaces/IGlobalConfigFacet.sol";
import { ZeroAddress, CannotAuthorizeSelf } from "../Errors.sol";

/**
 * @title GlobalConfigFacet
 * @author DZap
 * @notice Provides functionality for managing global config
 */
contract GlobalConfigFacet is IGlobalConfigFacet, AuthorizationGuard, Pausable {
    /* ========= RESTRICTED ========= */

    /// @inheritdoc IGlobalConfigFacet
    function setProtocolFeeVault(address _protocolFeeVault) external onlyAuthorized {
        if (_protocolFeeVault == address(0)) revert ZeroAddress();
        if (_protocolFeeVault == address(this)) revert CannotAuthorizeSelf();

        GlobalStorage storage gs = LibGlobalStorage.globalStorage();
        gs.protocolFeeVault = _protocolFeeVault;
        emit ProtocolFeeVaultUpdated(_protocolFeeVault);
    }

    /// @inheritdoc IGlobalConfigFacet
    function setRefundVault(address _refundVault) external onlyAuthorized {
        if (_refundVault == address(0)) revert ZeroAddress();
        if (_refundVault == address(this)) revert CannotAuthorizeSelf();

        GlobalStorage storage gs = LibGlobalStorage.globalStorage();
        gs.refundVault = _refundVault;

        emit RefundVaultUpdated(_refundVault);
    }

    /// @inheritdoc IGlobalConfigFacet
    function setFeeValidator(address _feeValidator) external onlyAuthorized {
        if (_feeValidator == address(0)) revert ZeroAddress();
        if (_feeValidator == address(this)) revert CannotAuthorizeSelf();

        GlobalStorage storage gs = LibGlobalStorage.globalStorage();
        gs.feeValidator = _feeValidator;
        emit FeeValidatorUpdated(_feeValidator);
    }

    /// @inheritdoc IGlobalConfigFacet
    function pause() external onlyAuthorized whenNotPaused {
        GlobalStorage storage gs = LibGlobalStorage.globalStorage();
        gs.paused = true;
        emit Paused();
    }

    /// @inheritdoc IGlobalConfigFacet
    function unpause() external onlyAuthorized whenPaused {
        GlobalStorage storage gs = LibGlobalStorage.globalStorage();
        gs.paused = false;
        emit Unpaused();
    }

    /* ========= VIEW FUNCTIONS ========= */

    /// @inheritdoc IGlobalConfigFacet
    function getProtocolFeeVault() external view returns (address) {
        return LibGlobalStorage.getProtocolFeeVault();
    }

    /// @inheritdoc IGlobalConfigFacet
    function getRefundVault() external view returns (address) {
        return LibGlobalStorage.getRefundVault();
    }

    /// @inheritdoc IGlobalConfigFacet
    function getFeeValidator() external view returns (address) {
        return LibGlobalStorage.getFeeValidator();
    }

    /// @inheritdoc IGlobalConfigFacet
    function getNonce(address _user) external view returns (uint256) {
        return LibValidator.getNonce(_user);
    }

    /// @inheritdoc IGlobalConfigFacet
    function getPermit2() external view returns (address) {
        return LibGlobalStorage.getPermit2();
    }

    /// @inheritdoc IGlobalConfigFacet
    function getPaused() external view returns (bool) {
        return LibGlobalStorage.getPaused();
    }
}
