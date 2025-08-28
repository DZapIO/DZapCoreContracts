// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { LibPermit } from "../Libraries/LibPermit.sol";
import { PermitType, InputToken } from "../Types.sol";
import { PermitBatchTransferFrom } from "../Interfaces/IPermit2.sol";
import { NoTransferToNullAddress, NativeTransferFailed, NullAddrIsNotAValidSpender, InvalidPermitType, TransferAmountMismatch } from "../Errors.sol";

/**
 * @title LibAsset
 * @author DZap
 * @notice This library contains helpers for dealing with onchain transfers
 *         of assets, including accounting for the native asset `assetId`
 *         conventions and any noncompliant ERC20 transfers
 */
library LibAsset {
    // ============= CONSTANTS =============

    address internal constant _NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    // ============= BALANCE QUERY FUNCTIONS =============

    /// @notice Gets the balance of the inheriting contract for the given asset
    function getOwnBalance(address _token) internal view returns (uint256) {
        return _token == _NATIVE_TOKEN ? address(this).balance : IERC20(_token).balanceOf(address(this));
    }

    /// @notice Gets the balance of the given asset for the given recipient
    function getBalance(address _token, address _recipient) internal view returns (uint256) {
        return _token == _NATIVE_TOKEN ? _recipient.balance : IERC20(_token).balanceOf(_recipient);
    }

    /// @notice Gets the balance of the given erc20 token for the given recipient
    function getErc20Balance(address _token, address _recipient) internal view returns (uint256) {
        return IERC20(_token).balanceOf(_recipient);
    }

    // ============= APPROVAL FUNCTIONS =============

    /// @notice If the current allowance is insufficient, then MAX_UINT allowance for a given spender
    function maxApproveERC20(address _token, address _spender, uint256 _amount) internal {
        if (_spender == address(0)) revert NullAddrIsNotAValidSpender();
        uint256 allowance = IERC20(_token).allowance(address(this), _spender);
        if (allowance < _amount) {
            SafeERC20.forceApprove(IERC20(_token), _spender, type(uint256).max);
        }
    }

    // ============= TRANSFER FUNCTIONS =============

    /// @notice Transfers ether from the inheriting contract to a given recipient
    function transferNativeToken(address _recipient, uint256 _amount) internal {
        if (_recipient == address(0)) revert NoTransferToNullAddress();
        (bool success, ) = _recipient.call{ value: _amount }("");
        if (!success) revert NativeTransferFailed();
    }

    /// @notice Transfers tokens from the inheriting contract to a given recipient
    function transferERC20(address _token, address _recipient, uint256 _amount) internal {
        if (_recipient == address(0)) revert NoTransferToNullAddress();
        SafeERC20.safeTransfer(IERC20(_token), _recipient, _amount);
    }

    /// @notice Transfers tokens from the inheriting contract to a given recipient without checks
    function transferERC20WithoutChecks(address _token, address _recipient, uint256 _amount) internal {
        SafeERC20.safeTransfer(IERC20(_token), _recipient, _amount);
    }

    /// @notice Transfers tokens from a sender to a given recipient without checking the final balance
    /// @dev need to handle deflationary, rebasing or share based tokens
    function transferFromERC20WithoutChecks(address _token, address _from, address _to, uint256 _amount) internal {
        SafeERC20.safeTransferFrom(IERC20(_token), _from, _to, _amount);
    }

    /// @notice Transfers tokens from the inheriting contract to a given recipient with balance check
    function transferERC20WithBalanceCheck(address _token, address _recipient, uint256 _amount) internal {
        if (_recipient == address(0)) revert NoTransferToNullAddress();

        IERC20 token = IERC20(_token);
        uint256 prevBalance = token.balanceOf(_recipient);
        SafeERC20.safeTransfer(token, _recipient, _amount);
        uint256 curr = token.balanceOf(_recipient);
        if (curr < prevBalance || curr - prevBalance != _amount) {
            revert TransferAmountMismatch();
        }
    }

    /// @notice Transfers tokens from a sender to a given recipient with balance check
    function transferFromERC20WithBalanceCheck(address _token, address _sender, address _recipient, uint256 _amount) internal {
        if (_recipient == address(0)) revert NoTransferToNullAddress();

        IERC20 token = IERC20(_token);
        uint256 prevBalance = token.balanceOf(_recipient);
        SafeERC20.safeTransferFrom(token, _sender, _recipient, _amount);
        uint256 curr = token.balanceOf(_recipient);
        if (curr < prevBalance || curr - prevBalance != _amount) {
            revert TransferAmountMismatch();
        }
    }

    /// @notice Wrapper function to transfer a given asset (native or erc20) to
    ///         some recipient. Should handle all non-compliant return value
    ///         tokens as well by using the SafeERC20 contract by open zeppelin.
    function transferToken(address _token, address _recipient, uint256 _amount) internal {
        if (_amount != 0) {
            if (_token == _NATIVE_TOKEN) transferNativeToken(_recipient, _amount);
            else transferERC20(_token, _recipient, _amount);
        }
    }

    // ============= DEPOSIT FUNCTIONS =============

    /// @notice Deposits tokens from a sender to the inheriting contract
    /// @dev only handles erc20 token
    function deposit(address _from, address _token, uint256 _amount, bytes calldata _permit) internal {
        (PermitType permitType, bytes memory data) = abi.decode(_permit, (PermitType, bytes));

        if (permitType == PermitType.PERMIT2_WITNESS_TRANSFER) {
            LibPermit.permit2WitnessTransferFrom(_from, address(this), _token, _amount, data);
        } else if (permitType == PermitType.PERMIT) {
            if (data.length != 0) LibPermit.eip2612Permit(_from, address(this), _token, _amount, data);
            transferFromERC20WithoutChecks(_token, _from, address(this), _amount);
        } else if (permitType == PermitType.PERMIT2_APPROVE) {
            LibPermit.permit2ApproveAndTransfer(_from, address(this), _token, uint160(_amount), data);
        } else {
            revert InvalidPermitType();
        }
    }

    /// @notice Deposits tokens from a sender to the inheriting contract
    function depositBatch(address _from, InputToken[] calldata erc20Tokens) internal {
        uint256 i;
        uint256 length = erc20Tokens.length;
        for (i; i < length; ) {
            deposit(_from, erc20Tokens[i].token, erc20Tokens[i].amount, erc20Tokens[i].permit);
            unchecked {
                ++i;
            }
        }
    }

    function depositBatch(address _from, PermitBatchTransferFrom calldata permit, bytes calldata permitSignature) internal {
        LibPermit.permit2BatchWitnessTransferFrom(_from, address(this), permit, permitSignature);
    }

    // ============= UTILITY FUNCTIONS =============

    /// @notice Determines whether the given token is the native token
    function isNativeToken(address _token) internal pure returns (bool) {
        return _token == _NATIVE_TOKEN;
    }

    /// @dev Checks whether the given address is a contract and contains code
    function isContract(address _contractAddr) internal view returns (bool) {
        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            size := extcodesize(_contractAddr)
        }
        return size != 0;
    }
}
