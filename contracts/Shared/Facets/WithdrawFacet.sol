// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibDiamond } from "../Libraries/LibDiamond.sol";
import { LibAccess } from "../Libraries/LibAccess.sol";
import { LibAsset } from "../Libraries/LibAsset.sol";
import { LibUtil } from "../Libraries/LibUtil.sol";
import { IWithdrawFacet } from "../Interfaces/IWithdrawFacet.sol";

import { NotAContract } from "../Errors.sol";

contract WithdrawFacet is IWithdrawFacet {
    error WithdrawFailed();

    /* ========= EXTERNAL ========= */

    /// @notice Execute call data and withdraw asset.
    /// @param _callTo The address to execute the calldata on.
    /// @param _callData The data to execute.
    /// @param _tokenAddress Asset to be withdrawn.
    /// @param _to address to withdraw to.
    /// @param _amount amount of asset to withdraw.
    function executeCallAndWithdraw(
        address payable _callTo,
        bytes calldata _callData,
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) external {
        if (msg.sender != LibDiamond.contractOwner()) {
            LibAccess.enforceAccessControl();
        }

        // Check if the _callTo is a contract
        bool success;
        bool isContract = LibAsset.isContract(_callTo);
        if (!isContract) revert NotAContract();

        // solhint-disable-next-line avoid-low-level-calls
        (success, ) = _callTo.call(_callData);

        if (success) {
            _withdrawToken(_tokenAddress, _to, _amount);
        } else {
            revert WithdrawFailed();
        }
    }

    /// @notice Withdraw asset.
    /// @param _tokenAddress Asset to be withdrawn.
    /// @param _to address to withdraw to.
    /// @param _amount amount of asset to withdraw.
    function withdraw(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) external {
        if (msg.sender != LibDiamond.contractOwner()) {
            LibAccess.enforceAccessControl();
        }
        _withdrawToken(_tokenAddress, _to, _amount);
    }

    /* ========= INTERNAL ========= */

    /// @notice Withdraw asset.
    /// @param _tokenAddress Asset to be withdrawn.
    /// @param _to address to withdraw to.
    /// @param _amount amount of asset to withdraw.
    function _withdrawToken(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) internal {
        address sendTo = (LibUtil.isZeroAddress(_to)) ? msg.sender : _to;
        LibAsset.transferToken(_tokenAddress, sendTo, _amount);
        emit LogWithdraw(_tokenAddress, sendTo, _amount);
    }
}
