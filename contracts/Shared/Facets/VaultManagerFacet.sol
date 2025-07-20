// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibGlobalStorage, GlobalStorage } from "../Libraries/LibGlobalStorage.sol";
import { AuthorizationGuard } from "../Helpers/AuthorizationGuard.sol";
import { IVaultManagerFacet } from "../Interfaces/IVaultManagerFacet.sol";
import { ZeroAddress, CannotAuthorizeSelf } from "../Errors.sol";

/// @title Validator Facet
/// @notice Provides functionality for managing validator
contract VaultManagerFacet is IVaultManagerFacet, AuthorizationGuard {
    /* ========= RESTRICTED ========= */

    /// @inheritdoc IVaultManagerFacet
    function setProtocolFeeVault(address _protocolFeeVault) external onlyAuthorized {
        if (_protocolFeeVault == address(0)) revert ZeroAddress();
        if (_protocolFeeVault == address(this)) revert CannotAuthorizeSelf();

        GlobalStorage storage gs = LibGlobalStorage.globalStorage();
        gs.protocolFeeVault = _protocolFeeVault;
        emit ProtocolFeeVaultUpdated(_protocolFeeVault);
    }

    /// @inheritdoc IVaultManagerFacet
    function setRefundVault(address _refundVault) external onlyAuthorized {
        if (_refundVault == address(0)) revert ZeroAddress();
        if (_refundVault == address(this)) revert CannotAuthorizeSelf();

        GlobalStorage storage gs = LibGlobalStorage.globalStorage();
        gs.refundVault = _refundVault;

        emit RefundVaultUpdated(_refundVault);
    }

    /* ========= VIEW FUNCTIONS ========= */

    /// @inheritdoc IVaultManagerFacet
    function getProtocolFeeVault() external view returns (address) {
        return LibGlobalStorage.getProtocolFeeVault();
    }

    /// @inheritdoc IVaultManagerFacet
    function getRefundVault() external view returns (address) {
        return LibGlobalStorage.getRefundVault();
    }
}
