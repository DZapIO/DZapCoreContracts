// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

// import "hardhat/console.sol";

contract ExchangeMock {
    using SafeERC20 for IERC20;

    uint256 public rate = 1000; // 1: 1, 500 = 1: 2x

    error NativeTransferFailed();
    error InvalidNativeSend(uint256 required, uint256 sent);
    error SwapFailedDueToDex(uint256 amount);
    error SwapFailedDueToDex2();

    function changeRate(uint256 rate_) external {
        // require(rate_ <= 1000 && rate_ > 0, "Invalid Rate");
        rate = rate_;
    }

    function isNative(address token_) private pure returns (bool) {
        return
            token_ == address(0) ||
            token_ == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    }

    // solhint-disable-next-line
    function swap(
        address srcToken_,
        address dstToken_,
        address recipient_,
        uint256 amount_,
        bool testLeftOver,
        bool testRevert
    ) external payable returns (uint256 returnAmount, uint256 leftOverTokens) {
        // console.log("***ExchangeMock***", srcToken_, dstToken_, recipient_);
        // console.log(isNative(srcToken_), isNative(dstToken_), amount_);

        if (testRevert) {
            // require(false, "SwapFailedDueToDex");
            revert SwapFailedDueToDex2();
            // revert SwapFailedDueToDex(amount_);
        }

        if (isNative(srcToken_)) {
            // console.log("mock exchange src transfer started");

            if (msg.value != amount_)
                revert InvalidNativeSend(amount_, msg.value);

            // console.log("mock exchange src transfer ended");
        } else {
            // console.log("mock exchange src transfer started");

            IERC20(srcToken_).safeTransferFrom(
                recipient_,
                address(this),
                amount_
            );

            // console.log("mock exchange src transfer ended");
        }

        uint256 srcDecimal = isNative(srcToken_)
            ? 18
            : IERC20Metadata(srcToken_).decimals();
        uint256 dstDecimal = isNative(dstToken_)
            ? 18
            : IERC20Metadata(dstToken_).decimals();

        returnAmount =
            (((amount_ * 10 ** dstDecimal) / 10 ** srcDecimal) * rate) /
            1000;
        // console.log("returnAmount", returnAmount, srcDecimal, dstDecimal);

        if (isNative(dstToken_)) {
            (bool success, ) = recipient_.call{ value: returnAmount }("");
            if (!success) revert NativeTransferFailed();
        } else {
            IERC20(dstToken_).safeTransfer(recipient_, returnAmount);
        }

        if (testLeftOver) {
            leftOverTokens = amount_ / 9;
            // console.log("testLeftOver", leftOverTokens);
            if (leftOverTokens > 0) {
                if (isNative(srcToken_)) {
                    (bool success, ) = recipient_.call{
                        value: leftOverTokens
                    }("");
                    if (!success) revert NativeTransferFailed();
                } else {
                    IERC20(srcToken_).safeTransfer(recipient_, leftOverTokens);
                }
            }
        }
        // console.log(
        //     "***ExchangeMock Finises***",
        //     returnAmount,
        //     leftOverTokens
        // );
    }

    // Able to receive ether
    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}
}
