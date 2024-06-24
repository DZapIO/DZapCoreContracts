// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibDiamond } from "../Libraries/LibDiamond.sol";
import { LibAccess } from "../Libraries/LibAccess.sol";
import { LibAllowList } from "../Libraries/LibAllowList.sol";
import { IDexManagerFacet } from "../Interfaces/IDexManagerFacet.sol";
import { CannotAuthorizeSelf } from "../ErrorsNew.sol";

/// @title Dex Manager Facet
/// @notice Facet contract for managing approved DEXs to be used in swaps.
contract DexManagerFacet is IDexManagerFacet {
    /* ========= MODIFIER ========= */

    modifier onlyAuthorized() {
        if (msg.sender != LibDiamond.contractOwner()) LibAccess.enforceAccessControl();
        _;
    }

    /* ========= EXTERNAL ========= */

    /// @inheritdoc IDexManagerFacet
    function addDex(address _dex) external onlyAuthorized {
        if (_dex == address(this)) revert CannotAuthorizeSelf();

        LibAllowList.addAllowedContract(_dex);
        emit DexAdded(_dex);
    }

    /// @inheritdoc IDexManagerFacet
    function batchAddDex(address[] calldata _dexs) external onlyAuthorized {
        uint256 length = _dexs.length;

        for (uint256 i = 0; i < length; ) {
            address dex = _dexs[i];
            if (dex == address(this)) revert CannotAuthorizeSelf();

            LibAllowList.addAllowedContract(dex);
            emit DexAdded(dex);
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc IDexManagerFacet
    function removeDex(address _dex) external onlyAuthorized {
        LibAllowList.removeAllowedContract(_dex);
        emit DexRemoved(_dex);
    }

    /// @inheritdoc IDexManagerFacet
    function batchRemoveDex(address[] calldata _dexs) external onlyAuthorized {
        uint256 length = _dexs.length;
        for (uint256 i = 0; i < length; ) {
            LibAllowList.removeAllowedContract(_dexs[i]);
            emit DexRemoved(_dexs[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc IDexManagerFacet
    function setFunctionApprovalBySignature(address _dex, bytes4 _signature, bool _approval) external onlyAuthorized {
        if (_dex == address(this)) revert CannotAuthorizeSelf();

        if (_approval) LibAllowList.addAllowedSelector(_dex, _signature);
        else LibAllowList.removeAllowedSelector(_dex, _signature);

        emit FunctionSignatureApprovalChanged(_dex, _signature, _approval);
    }

    /// @notice Batch Adds/removes a specific function signature to/from the allowlist
    /// @param _signatures the function signatures to allow/disallow
    /// @param _approval whether the function signatures should be allowed
    function batchSetFunctionApprovalBySignature(address[] calldata _dexs, bytes4[] calldata _signatures, bool[] calldata _approval) external onlyAuthorized {
        uint256 length = _signatures.length;
        for (uint256 i = 0; i < length; ) {
            address dex = _dexs[i];
            if (dex == address(this)) revert CannotAuthorizeSelf();

            bytes4 _signature = _signatures[i];
            if (_approval[i]) LibAllowList.addAllowedSelector(dex, _signature);
            else LibAllowList.removeAllowedSelector(dex, _signature);

            emit FunctionSignatureApprovalChanged(dex, _signature, _approval[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Returns whether a dex is approved
    /// @return approved Approved or not
    function isContractApproved(address _dex) public view returns (bool approved) {
        return LibAllowList.contractIsAllowed(_dex);
    }

    /// @notice Returns whether a function signature is approved
    /// @param _signature the function signature to query
    /// @return approved Approved or not
    function isFunctionApproved(address _dex, bytes4 _signature) public view returns (bool approved) {
        return LibAllowList.selectorIsAllowed(_dex, _signature);
    }
}
