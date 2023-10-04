// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

contract BridgeMock {
    using SafeERC20 for IERC20;

    uint256 public BPS_MULTIPLIER = 10000;
    uint256 public BPS_DENOMINATOR = 100 * BPS_MULTIPLIER;

    uint256 public nativeFeeAmount = 1e18;
    uint256 public tokenFee = 5 * BPS_MULTIPLIER; // 5%

    error NativeTransferFailed();
    error InvalidNativeFee();
    error BridgeCallFailedFromRouter();
    error ReceiverCallFailed();

    function isNative(address token_) private pure returns (bool) {
        return
            token_ == address(0) ||
            token_ == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    }

    function bridge(
        address recipient_,
        address token_,
        uint256 amount_,
        bool testRevert_
    ) external payable {
        if (testRevert_) {
            revert BridgeCallFailedFromRouter();
        }

        if (isNative(token_)) {
            if (msg.value != amount_ + nativeFeeAmount) {
                revert InvalidNativeFee();
            }
        } else if (msg.value != nativeFeeAmount) {
            revert InvalidNativeFee();
        }

        uint256 tokenFeeAmount = (amount_ * tokenFee) / BPS_DENOMINATOR;
        uint256 amountWithoutFee = amount_ - tokenFeeAmount;

        if (isNative(token_)) {
            (bool success, ) = recipient_.call{ value: amountWithoutFee }("");
            if (!success) revert NativeTransferFailed();
        } else {
            IERC20(token_).safeTransferFrom(
                msg.sender,
                address(this),
                amount_
            );
            IERC20(token_).safeTransfer(recipient_, amountWithoutFee);
        }
    }

    function bridgeAndSwap(
        address callTo_,
        address token_,
        uint256 amount_,
        bytes memory callData_, // receiver
        bool testRevert_
    ) external payable {
        if (testRevert_) {
            revert BridgeCallFailedFromRouter();
        }

        if (isNative(token_)) {
            if (msg.value != amount_ + nativeFeeAmount) {
                revert InvalidNativeFee();
            }
        } else if (msg.value != nativeFeeAmount) {
            revert InvalidNativeFee();
        }
        uint256 tokenFeeAmount = (amount_ * tokenFee) / BPS_DENOMINATOR;
        uint256 amountWithoutFee = amount_ - tokenFeeAmount;
        uint256 nativeValue;

        if (isNative(token_)) {
            nativeValue = amountWithoutFee;
        } else {
            IERC20(token_).safeTransferFrom(
                msg.sender,
                address(this),
                amount_
            );

            IERC20(token_).approve(callTo_, amountWithoutFee);
        }

        (bool success, bytes memory res) = callTo_.call{ value: nativeValue }(
            callData_
        );
        require(success, "mock external call failed");
    }

    function sendCallToReceiver(
        address callTo_,
        address token_,
        uint256 amount_,
        bytes memory callData_, // receiver
        bool testRevert_
    ) external payable {
        if (testRevert_) {
            revert ReceiverCallFailed();
        }

        if (isNative(token_)) {
            if (msg.value != amount_ + nativeFeeAmount) {
                revert InvalidNativeFee();
            }
        } else if (msg.value != nativeFeeAmount) {
            revert InvalidNativeFee();
        }

        uint256 tokenFeeAmount = (amount_ * tokenFee) / BPS_DENOMINATOR;
        uint256 amountWithoutFee = amount_ - tokenFeeAmount;
        uint256 nativeValue;

        if (isNative(token_)) {
            nativeValue = amountWithoutFee;
        } else {
            IERC20(token_).safeTransferFrom(
                msg.sender,
                address(this),
                amount_
            );

            IERC20(token_).approve(callTo_, amountWithoutFee);
        }

        (bool success, bytes memory res) = callTo_.call{ value: nativeValue }(
            callData_
        );
        require(success, "mock external call failed");
    }

    // Able to receive ether
    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}
}
