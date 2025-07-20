// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibGlobalStorage, GlobalStorage } from "../Libraries/LibGlobalStorage.sol";
import { LibValidator } from "../Libraries/LibValidator.sol";
import { AuthorizationGuard } from "../Helpers/AuthorizationGuard.sol";
import { IValidatorFacet } from "../Interfaces/IValidatorFacet.sol";
import { ZeroAddress } from "../Errors.sol";

/// @title Validator Facet
/// @notice Provides functionality for managing validator
contract ValidatorFacet is IValidatorFacet, AuthorizationGuard {
    /* ========= RESTRICTED ========= */

    /// @inheritdoc IValidatorFacet
    function setFeeValidator(address _feeValidator) external onlyAuthorized {
        if (_feeValidator == address(0)) revert ZeroAddress();

        GlobalStorage storage gs = LibGlobalStorage.globalStorage();
        gs.feeValidator = _feeValidator;
        emit FeeValidatorUpdated(_feeValidator);
    }
    /* ========= VIEW FUNCTIONS ========= */

    /// @inheritdoc IValidatorFacet
    function getFeeValidator() external view returns (address) {
        return LibGlobalStorage.getFeeValidator();
    }

    /// @inheritdoc IValidatorFacet
    function getNonce(address _user) external view returns (uint256) {
        return LibValidator.getNonce(_user);
    }
}
