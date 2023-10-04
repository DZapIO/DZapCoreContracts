// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibDiamond } from "../Libraries/LibDiamond.sol";
import { LibAccess } from "../Libraries/LibAccess.sol";
import { LibAsset } from "../Libraries/LibAsset.sol";
import { LibUtil } from "../Libraries/LibUtil.sol";
import { IWithdrawFacet } from "../Interfaces/IWithdrawFacet.sol";

import { NotAContract, NoTransferToNullAddress } from "../Errors.sol";

contract WithdrawFacet is IWithdrawFacet {
    error WithdrawFailed();

    /* ========= MODIFIER ========= */

    modifier onlyAuthorized() {
        if (msg.sender != LibDiamond.contractOwner()) {
            LibAccess.enforceAccessControl();
        }
        _;
    }

    /* ========= EXTERNAL ========= */

    /// @notice Execute call data and withdraw asset.
    /// @param _callTo The address to execute the calldata on.
    /// @param _callData The data to execute.
    /// @param _token Asset to be withdrawn.
    /// @param _to address to withdraw to.
    /// @param _amount amount of asset to withdraw.
    function executeCallAndWithdraw(
        address payable _callTo,
        bytes calldata _callData,
        address _token,
        address _to,
        uint256 _amount
    ) external onlyAuthorized {
        // Check if the _callTo is a contract
        bool success;
        bool isContract = LibAsset.isContract(_callTo);
        if (!isContract) revert NotAContract();

        // solhint-disable-next-line avoid-low-level-calls
        (success, ) = _callTo.call(_callData);

        if (success) {
            _withdrawToken(_token, _to, _amount);
        } else {
            revert WithdrawFailed();
        }
    }

    /// @notice Withdraw asset.
    /// @param _token Asset to be withdrawn.
    /// @param _to address to withdraw to.
    /// @param _amount amount of asset to withdraw.
    function withdraw(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyAuthorized {
        _withdrawToken(_token, _to, _amount);
    }

    /* ========= INTERNAL ========= */

    /// @notice Withdraw asset.
    /// @param _token Asset to be withdrawn.
    /// @param _to address to withdraw to.
    /// @param _amount amount of asset to withdraw.
    function _withdrawToken(
        address _token,
        address _to,
        uint256 _amount
    ) internal {
        if (_to == address(0)) {
            revert NoTransferToNullAddress();
        }

        LibAsset.transferToken(_token, _to, _amount);
        emit LogWithdraw(_token, _to, _amount);
    }
}
