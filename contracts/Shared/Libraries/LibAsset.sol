pragma solidity 0.8.19;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { LibFees } from "../Libraries/LibFees.sol";
import { LibPermit } from "../Libraries/LibPermit.sol";

import { FeeType, SwapData, PermitType } from "../Types.sol";
import { NoTransferToNullAddress, InsufficientBalance, NativeTransferFailed, NullAddrIsNotAValidSpender, NullAddrIsNotAnERC20Token, InvalidAmount, IntegratorNotAllowed } from "../Errors.sol";

/// @title LibAsset
/// @notice This library contains helpers for dealing with onchain transfers
///         of assets, including accounting for the native asset `assetId`
///         conventions and any noncompliant ERC20 transfers
library LibAsset {
    address internal constant _NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /// @notice Gets the balance of the inheriting contract for the given asset
    function getOwnBalance(address _token) internal view returns (uint256) {
        return _token == _NATIVE_TOKEN ? address(this).balance : IERC20(_token).balanceOf(address(this));
    }

    /// @notice If the current allowance is insufficient, the allowance for a given spender
    function approveERC20(address _token, address _spender, uint256 _amount) internal {
        if (_token == _NATIVE_TOKEN) return;
        if (_spender == address(0)) revert NullAddrIsNotAValidSpender();

        uint256 allowance = IERC20(_token).allowance(address(this), _spender);

        if (allowance < _amount) SafeERC20.safeIncreaseAllowance(IERC20(_token), _spender, _amount - allowance);
    }

    /// @notice Transfers ether from the inheriting contract to a given recipient
    function transferNativeToken(address _recipient, uint256 _amount) internal {
        if (_recipient == address(0)) revert NoTransferToNullAddress();
        if (_amount > address(this).balance) revert InsufficientBalance(_amount, address(this).balance);

        // solhint-disable-next-line avoid-low-level-calls

        (bool success, ) = _recipient.call{ value: _amount }("");
        if (!success) revert NativeTransferFailed();
    }

    /// @notice Transfers tokens from the inheriting contract to a given recipient
    function transferERC20(address _token, address _recipient, uint256 _amount) internal {
        if (isNativeToken(_token)) revert NullAddrIsNotAnERC20Token();

        uint256 assetBalance = IERC20(_token).balanceOf(address(this));
        if (_amount > assetBalance) revert InsufficientBalance(_amount, assetBalance);
        SafeERC20.safeTransfer(IERC20(_token), _recipient, _amount);
    }

    /// @notice Transfers tokens from a sender to a given recipient
    function transferFromERC20(address _token, address _from, address _to, uint256 _amount) internal {
        if (_token == _NATIVE_TOKEN) revert NullAddrIsNotAnERC20Token();
        if (_to == address(0)) revert NoTransferToNullAddress();

        IERC20 token = IERC20(_token);

        uint256 prevBalance = token.balanceOf(_to);
        SafeERC20.safeTransferFrom(token, _from, _to, _amount);
        if (token.balanceOf(_to) - prevBalance != _amount) {
            revert InvalidAmount();
        }
    }

    /// @notice Wrapper function to transfer a given asset (native or erc20) to
    ///         some recipient. Should handle all non-compliant return value
    ///         tokens as well by using the SafeERC20 contract by open zeppelin.
    function transferToken(address _token, address _recipient, uint256 _amount) internal {
        if (_amount > 0) (_token == _NATIVE_TOKEN) ? transferNativeToken(_recipient, _amount) : transferERC20(_token, _recipient, _amount);
    }

    /// @dev Use permit2 to approve token
    function permitAndTransferFromErc20(address _token, address _from, address _to, uint256 _amount, bytes calldata permit_) internal {
        (PermitType permitType, bytes memory data) = abi.decode(permit_, (PermitType, bytes));

        if (permitType == PermitType.PERMIT) {
            LibPermit.permit(_token, data);
            transferFromERC20(_token, _from, _to, _amount);
        } else if (permitType == PermitType.PERMIT2_TRANSFER_FROM) {
            LibPermit.permit2TransferFrom(_token, data, _amount);
        } else {
            LibPermit.permit2ApproveAndTransfer(_from, _to, uint160(_amount), _token, data);
        }
    }

    /// @dev Deposits token and accrues fixed and token fees
    function deposit(
        address _integrator,
        FeeType _feeType,
        address _token,
        uint256 _amount,
        bytes calldata _permit
    ) internal returns (uint256 totalFee, uint256 dZapShare) {
        if (!LibFees.isIntegratorAllowed(_integrator)) revert IntegratorNotAllowed();

        if (!LibAsset.isNativeToken(_token)) {
            if (_amount == 0) revert InvalidAmount();
            permitAndTransferFromErc20(_token, msg.sender, address(this), _amount, _permit);
        }

        (totalFee, dZapShare) = LibFees.calculateTokenFees(_amount, LibFees.getIntegratorFeeInfo(_integrator, _feeType));
    }

    /// @dev Deposits token for each swap that requires and accrues fixed and token fees
    function deposit(address _integrator, FeeType _feeType, SwapData calldata _swap) internal returns (uint256 totalFee, uint256 dZapShare) {
        if (!LibFees.isIntegratorAllowed(_integrator)) revert IntegratorNotAllowed();

        if (!LibAsset.isNativeToken(_swap.from)) {
            if (_swap.fromAmount == 0) revert InvalidAmount();
            permitAndTransferFromErc20(_swap.from, msg.sender, address(this), _swap.fromAmount, _swap.permit);
        }

        (totalFee, dZapShare) = LibFees.calculateTokenFees(_swap.fromAmount, LibFees.getIntegratorFeeInfo(_integrator, _feeType));
    }

    // @notice Determines whether the given token is the native token
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
        return size > 0;
    }

    /* ========= INTERNAL ========= */
}
