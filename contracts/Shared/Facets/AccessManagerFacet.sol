// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibDiamond } from "../Libraries/LibDiamond.sol";
import { LibAccess } from "../Libraries/LibAccess.sol";
import { IAccessManagerFacet } from "../Interfaces/IAccessManagerFacet.sol";
import { CannotAuthorizeSelf } from "../Errors.sol";

/// @title Access Manager Facet
/// @notice Provides functionality for managing method level access control
contract AccessManagerFacet is IAccessManagerFacet {
    /* ========= EXTERNAL ========= */

    /// @inheritdoc IAccessManagerFacet
    function setCanExecute(
        bytes4 _selector,
        address _executor,
        bool _canExecute
    ) external {
        if (_executor == address(this)) {
            revert CannotAuthorizeSelf();
        }
        LibDiamond.enforceIsContractOwner();
        _canExecute
            ? LibAccess.addAccess(_selector, _executor)
            : LibAccess.removeAccess(_selector, _executor);
        if (_canExecute) {
            emit ExecutionAllowed(_executor, _selector);
        } else {
            emit ExecutionDenied(_executor, _selector);
        }
    }

    /// @inheritdoc IAccessManagerFacet
    function setBatchCanExecute(
        bytes4[] calldata _selector,
        address[] calldata _executor,
        bool[] calldata _canExecute
    ) external {
        uint256 length = _selector.length;
        for (uint256 i = 0; i < length; ) {
            bytes4 selector = _selector[i];
            address executor = _executor[i];

            if (executor == address(this)) {
                revert CannotAuthorizeSelf();
            }

            LibDiamond.enforceIsContractOwner();
            _canExecute[i]
                ? LibAccess.addAccess(selector, executor)
                : LibAccess.removeAccess(selector, executor);

            if (_canExecute[i]) {
                emit ExecutionAllowed(executor, selector);
            } else {
                emit ExecutionDenied(executor, selector);
            }
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc IAccessManagerFacet
    function addressCanExecuteMethod(
        bytes4 _selector,
        address _executor
    ) external view returns (bool) {
        return LibAccess.accessStorage().execAccess[_selector][_executor];
    }
}
