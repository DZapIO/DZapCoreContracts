// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibDiamond } from "../Libraries/LibDiamond.sol";
import { LibAccess } from "../Libraries/LibAccess.sol";
import { LibAllowList } from "../Libraries/LibAllowList.sol";
import { IDexManagerFacet } from "../Interfaces/IDexManagerFacet.sol";
import { CannotAuthorizeSelf } from "../Errors.sol";

/// @title Dex Manager Facet
/// @notice Facet contract for managing approved DEXs to be used in swaps.
contract DexManagerFacet is IDexManagerFacet {
    /* ========= EXTERNAL ========= */

    /// @notice Register the address of a DEX contract to be approved for swapping.
    /// @param _dex The address of the DEX contract to be approved.
    function addDex(address _dex) external {
        if (msg.sender != LibDiamond.contractOwner()) {
            LibAccess.enforceAccessControl();
        }

        if (_dex == address(this)) {
            revert CannotAuthorizeSelf();
        }

        emit DexAdded(_dex);
    }

    /// @notice Batch register the address of DEX contracts to be approved for swapping.
    /// @param _dexs The addresses of the DEX contracts to be approved.
    function batchAddDex(address[] calldata _dexs) external {
        if (msg.sender != LibDiamond.contractOwner()) {
            LibAccess.enforceAccessControl();
        }
        uint256 length = _dexs.length;

        for (uint256 i = 0; i < length; ) {
            address dex = _dexs[i];
            if (dex == address(this)) {
                revert CannotAuthorizeSelf();
            }
            LibAllowList.addAllowedContract(dex);
            emit DexAdded(dex);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Unregister the address of a DEX contract approved for swapping.
    /// @param _dex The address of the DEX contract to be unregistered.
    function removeDex(address _dex) external {
        if (msg.sender != LibDiamond.contractOwner()) {
            LibAccess.enforceAccessControl();
        }
        LibAllowList.removeAllowedContract(_dex);
        emit DexRemoved(_dex);
    }

    /// @notice Batch unregister the addresses of DEX contracts approved for swapping.
    /// @param _dexs The addresses of the DEX contracts to be unregistered.
    function batchRemoveDex(address[] calldata _dexs) external {
        if (msg.sender != LibDiamond.contractOwner()) {
            LibAccess.enforceAccessControl();
        }
        uint256 length = _dexs.length;
        for (uint256 i = 0; i < length; ) {
            LibAllowList.removeAllowedContract(_dexs[i]);
            emit DexRemoved(_dexs[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Adds/removes a specific function signature to/from the allowlist
    /// @param _signature the function signature to allow/disallow
    /// @param _approval whether the function signature should be allowed
    function setFunctionApprovalBySignature(
        address _dex,
        bytes4 _signature,
        bool _approval
    ) external {
        if (msg.sender != LibDiamond.contractOwner()) {
            LibAccess.enforceAccessControl();
        }
        if (_dex == address(this)) {
            revert CannotAuthorizeSelf();
        }

        if (_approval) {
            LibAllowList.addAllowedSelector(_dex, _signature);
        } else {
            LibAllowList.removeAllowedSelector(_dex, _signature);
        }

        emit FunctionSignatureApprovalChanged(_dex, _signature, _approval);
    }

    /// @notice Batch Adds/removes a specific function signature to/from the allowlist
    /// @param _signatures the function signatures to allow/disallow
    /// @param _approval whether the function signatures should be allowed
    function batchSetFunctionApprovalBySignature(
        address[] calldata _dexs,
        bytes4[] calldata _signatures,
        bool[] calldata _approval
    ) external {
        if (msg.sender != LibDiamond.contractOwner()) {
            LibAccess.enforceAccessControl();
        }
        uint256 length = _signatures.length;
        for (uint256 i = 0; i < length; ) {
            address dex = _dexs[i];
            if (dex == address(this)) {
                revert CannotAuthorizeSelf();
            }

            bytes4 _signature = _signatures[i];
            if (_approval[i]) {
                LibAllowList.addAllowedSelector(dex, _signature);
            } else {
                LibAllowList.removeAllowedSelector(dex, _signature);
            }
            emit FunctionSignatureApprovalChanged(
                dex,
                _signature,
                _approval[i]
            );
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Returns whether a dex is approved
    /// @return approved Approved or not
    function isContractApproved(
        address _dex
    ) public view returns (bool approved) {
        return LibAllowList.contractIsAllowed(_dex);
    }

    /// @notice Returns whether a function signature is approved
    /// @param _signature the function signature to query
    /// @return approved Approved or not
    function isFunctionApproved(
        address _dex,
        bytes4 _signature
    ) public view returns (bool approved) {
        return LibAllowList.selectorIsAllowed(_dex, _signature);
    }
}
