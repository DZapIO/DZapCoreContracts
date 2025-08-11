// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "../Shared/Helpers/Ownable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IWrapper is IERC20 {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
}

/// @title DZap TokenWrapper
/// @notice Provides functionality for wrapping and unwrapping tokens
contract TokenWrapper is Ownable {
    address internal constant _NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    IWrapper public wrappedToken;

    /* ========= ERRORS ========= */
    error WithdrawFailure();
    error NativeTransferFailed();
    error ExternalCallFailed();

    /* ========= EVENTS ========= */
    event TokensWithdrawn(address indexed assetId, address indexed receiver, uint256 amount);

    /* ========= CONSTRUCTOR ========= */

    constructor(address _wrappedToken, address _owner) Ownable(_owner) {
        wrappedToken = IWrapper(_wrappedToken);
    }

    /* ========= EXTERNAL ========= */

    /// @notice Wraps the native token
    function deposit() external payable {
        IWrapper(wrappedToken).deposit{ value: msg.value }();
        wrappedToken.transfer(msg.sender, msg.value);
    }

    /// @notice Unwraps all the caller's balance of wrapped token
    function withdraw(uint256 amount) external {
        wrappedToken.transferFrom(msg.sender, address(this), amount);
        IWrapper(wrappedToken).withdraw(amount);
        (bool success, ) = msg.sender.call{ value: amount }("");
        if (!success) revert NativeTransferFailed();
    }

    function withdrawToken(address assetId, address payable receiver, uint256 amount) external onlyOwner {
        if (isNativeToken(assetId)) {
            // solhint-disable-next-line avoid-low-level-calls
            (bool success, ) = receiver.call{ value: amount }("");
            if (!success) revert ExternalCallFailed();
        } else {
            SafeERC20.safeTransfer(IERC20(assetId), receiver, amount);
        }

        emit TokensWithdrawn(assetId, receiver, amount);
    }

    /* ========= INTERNAL ========= */

    function isNativeToken(address _token) internal pure returns (bool) {
        return _token == _NATIVE_TOKEN;
    }

    // Needs to be able to receive native on `withdraw`
    receive() external payable {}
}
