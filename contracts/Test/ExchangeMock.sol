// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";
// import "hardhat/console.sol";

contract ExchangeMock {
    using SafeERC20 for IERC20;

    uint256 public BPS_MULTIPLIER = 10000;
    uint256 public BPS_DENOMINATOR = 100 * BPS_MULTIPLIER;

    uint256 public rate = BPS_MULTIPLIER; // 1: 1, 5000 = 1: 2x
    uint256 public leftOverPercent = 10 * BPS_MULTIPLIER; // 10%

    error NativeTransferFailed();
    error InvalidNativeSend(uint256 required, uint256 sent);
    error SwapFailedFromExchange();

    function changeRate(uint256 rate_) external {
        // require(rate_ <= 1000 && rate_ > 0, "Invalid Rate");
        rate = rate_;
    }

    function isNative(address token_) private pure returns (bool) {
        return token_ == address(0) || token_ == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    }

    // solhint-disable-next-line
    function swap(address srcToken_, address dstToken_, address recipient_, uint256 amount_, bool testLeftOver_, bool testRevert_) external payable returns (uint256 returnAmount, uint256 leftOverTokens) {
        if (testRevert_) {
            revert SwapFailedFromExchange();
        }

        if (isNative(srcToken_)) {
            if (msg.value != amount_) revert InvalidNativeSend(amount_, msg.value);
        } else {
            IERC20(srcToken_).safeTransferFrom(msg.sender, address(this), amount_);
        }

        uint256 srcDecimal = isNative(srcToken_) ? 18 : IERC20Metadata(srcToken_).decimals();
        uint256 dstDecimal = isNative(dstToken_) ? 18 : IERC20Metadata(dstToken_).decimals();

        returnAmount = (((amount_ * 10 ** dstDecimal) / 10 ** srcDecimal) * rate) / BPS_MULTIPLIER;

        if (isNative(dstToken_)) {
            (bool success, ) = recipient_.call{ value: returnAmount }("");
            if (!success) revert NativeTransferFailed();
        } else {
            IERC20(dstToken_).safeTransfer(recipient_, returnAmount);
        }

        if (testLeftOver_) {
            leftOverTokens = (amount_ * leftOverPercent) / BPS_DENOMINATOR;
            if (leftOverTokens > 0) {
                if (isNative(srcToken_)) {
                    (bool success, ) = msg.sender.call{ value: leftOverTokens }("");
                    if (!success) revert NativeTransferFailed();
                } else {
                    IERC20(srcToken_).safeTransfer(msg.sender, leftOverTokens);
                }
            }
        }

        // if (testLeftOver_) {
        //     leftOverTokens = (amount_ * leftOverPercent) / BPS_DENOMINATOR;
        //     if (leftOverTokens > 0) {
        //         if (isNative(srcToken_)) {
        //             (bool success, ) = recipient_.call{ value: leftOverTokens }("");
        //             if (!success) revert NativeTransferFailed();
        //         } else {
        //             IERC20(srcToken_).safeTransfer(recipient_, leftOverTokens);
        //         }
        //     }
        // }
    }

    // Able to receive ether
    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}
}
