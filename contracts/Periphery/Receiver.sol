// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { SwapData } from "../Shared/Types.sol";
import { LibAsset } from "../Shared/Libraries/LibAsset.sol";
import { ReentrancyGuard } from "../Shared/Helpers/ReentrancyGuard.sol";
import { Ownable } from "../Shared/Helpers/Ownable.sol";

import { IExecutor } from "../Shared/Interfaces/IExecutor.sol";
import { IReceiver } from "../Shared/Interfaces/IReceiver.sol";

import { UnAuthorized } from "../Shared/Errors.sol";

contract Receiver is IReceiver, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /* ========= STORAGE ========= */
    IExecutor public executor;

    /* ========= CONSTRUCTOR ========= */

    constructor(address _owner, address _executor) Ownable(_owner) {
        executor = IExecutor(_executor);
    }

    /// @notice Receive native asset directly.
    /// @dev Some bridges may send native asset before execute external calls.
    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    /* ========= RESTRICTED ========= */

    function setExecutor(address _executor) external onlyOwner {
        executor = IExecutor(_executor);
        emit ExecutorSet(_executor);
    }

    function recoverToken(
        address _token,
        address _receiver,
        uint256 _amount
    ) external onlyOwner {
        if (LibAsset.isNativeToken(_token)) {
            _receiver.call{ value: _amount }("");
        } else {
            IERC20(_token).safeTransfer(_receiver, _amount);
        }

        emit TokensRecovered(_token, _receiver, _amount);
    }

    /* ========= EXTERNAL ========= */

    function swapAndCompleteBridgeTokens(
        bytes32 _transactionId,
        address payable _receiver,
        SwapData calldata _swapData
    ) external payable {
        if (LibAsset.isNativeToken(_swapData.from)) {
            _swapAndCompleteBridgeTokens(
                _transactionId,
                _swapData,
                _receiver,
                msg.value
            );
        } else {
            uint256 allowance = IERC20(_swapData.from).allowance(
                msg.sender,
                address(this)
            );

            LibAsset.transferFromERC20(
                _swapData.from,
                msg.sender,
                address(this),
                allowance
            );

            _swapAndCompleteBridgeTokens(
                _transactionId,
                _swapData,
                _receiver,
                allowance
            );
        }
    }

    /* ========= PRIVATE ========= */

    function _swapAndCompleteBridgeTokens(
        bytes32 _transactionId,
        SwapData calldata _swapData,
        address payable _receiver,
        uint256 amount
    ) private {
        if (LibAsset.isNativeToken(_swapData.from)) {
            try
                executor.swapAndCompleteBridgeTokens{ value: amount }(
                    _transactionId,
                    _receiver,
                    _swapData
                )
            {} catch {
                _receiver.call{ value: amount }("");

                emit DZapTransferRecovered(
                    _transactionId,
                    _swapData.from,
                    _receiver,
                    amount,
                    block.timestamp
                );
            }
        } else {
            // case 2: ERC20 asset
            IERC20 token = IERC20(_swapData.from);
            token.safeApprove(address(executor), 0);
            token.safeIncreaseAllowance(address(executor), amount);
            try
                executor.swapAndCompleteBridgeTokens(
                    _transactionId,
                    _receiver,
                    _swapData
                )
            {} catch {
                token.safeTransfer(_receiver, amount);
                emit DZapTransferRecovered(
                    _transactionId,
                    _swapData.from,
                    _receiver,
                    amount,
                    block.timestamp
                );
            }
            token.safeApprove(address(executor), 0);
        }
    }
}
