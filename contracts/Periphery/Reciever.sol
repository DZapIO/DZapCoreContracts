// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { SwapData } from "../Shared/Types.sol";
import { LibAsset } from "../Shared/Libraries/LibAsset.sol";
// import { LibSwap } from "../Shared/Libraries/LibSwap.sol";
import { ReentrancyGuard } from "../Shared/Helpers/ReentrancyGuard.sol";
import { Ownable } from "../Shared/Helpers/Ownable.sol";

import { IExecutor } from "../Shared/Interfaces/IExecutor.sol";
import { IReceiver } from "../Shared/Interfaces/IReceiver.sol";

import { UnAuthorized } from "../Shared/Errors.sol";

contract Reciever is IReceiver, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /* ========= STORAGE ========= */
    address public sgRouter;
    IExecutor public executor;
    uint256 public recoverGas;

    /* ========= MODIFIER ========= */

    modifier onlySGRouter() {
        if (msg.sender != sgRouter) {
            revert UnAuthorized();
        }
        _;
    }

    /* ========= CONSTRUCTOR ========= */

    constructor(
        address _owner,
        // address _sgRouter,
        address _executor,
        uint256 _recoverGas
    ) Ownable(_owner) {
        // sgRouter = _sgRouter;
        executor = IExecutor(_executor);
        recoverGas = _recoverGas;

        // emit StargateRouterSet(_sgRouter);
        emit RecoverGasSet(_recoverGas);
    }

    /// @notice Receive native asset directly.
    /// @dev Some bridges may send native asset before execute external calls.
    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    /* ========= RESTRICTED ========= */

    // function setStargateRouter(address _sgRouter) external onlyOwner {
    //     sgRouter = _sgRouter;
    //     emit StargateRouterSet(_sgRouter);
    // }

    function setExecutor(address _executor) external onlyOwner {
        executor = IExecutor(_executor);
        emit ExecutorSet(_executor);
    }

    function setRecoverGas(uint256 _recoverGas) external onlyOwner {
        recoverGas = _recoverGas;
        emit RecoverGasSet(_recoverGas);
    }

    function pullToken(
        address token,
        address _receiver,
        uint256 _amount
    ) external onlyOwner {
        if (LibAsset.isNativeToken(token)) {
            _receiver.call{ value: _amount }("");
        } else {
            IERC20(token).safeTransfer(_receiver, _amount);
        }
    }

    /* ========= EXTERNAL ========= */

    //  function sgReceive(
    //     uint16, // _srcChainId unused
    //     bytes memory, // _srcAddress unused
    //     uint256, // _nonce unused
    //     address _token,
    //     uint256 _amountLD,
    //     bytes memory _payload
    // ) external nonReentrant onlySGRoute {}

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
                // msg.value,
                false
            );
        } else {
            // uint256 allowance = IERC20(_swapData.from).allowance(
            //     msg.sender,
            //     address(this)
            // );

            LibAsset.transferFromERC20(
                _swapData.from,
                msg.sender,
                address(this),
                _swapData.fromAmount
                // allowance
            );

            _swapAndCompleteBridgeTokens(
                _transactionId,
                _swapData,
                _receiver,
                // allowance,
                false
            );
        }
    }

    /* ========= PRIVATE ========= */

    function _swapAndCompleteBridgeTokens(
        bytes32 _transactionId,
        SwapData memory _swapData,
        address payable _receiver,
        // uint256 amount,
        bool _reserveRecoverGas
    ) private {
        uint256 _recoverGas = _reserveRecoverGas ? recoverGas : 0;
        uint256 amount = _swapData.fromAmount;

        if (LibAsset.isNativeToken(_swapData.from)) {
            // case 1: Native
            if (_reserveRecoverGas && gasleft() < _recoverGas) {
                // case 1a: not enough gas left to execute calls
                _receiver.call{ value: amount }("");

                emit DZapTransferRecovered(
                    _transactionId,
                    _swapData.from,
                    _receiver,
                    amount,
                    block.timestamp
                );
                return;
            }

            // case 1b: enough gas left to execute calls
            try
                executor.swapAndCompleteBridgeTokens{
                    value: amount,
                    gas: gasleft() - _recoverGas
                }(_transactionId, _receiver, _swapData)
            {} catch {
                _receiver.call{ value: amount }("");
            }
        } else {
            // case 2: ERC20 asset

            IERC20 token = IERC20(_swapData.from);
            token.safeApprove(address(executor), 0);
            token.safeIncreaseAllowance(address(executor), amount);

            if (_reserveRecoverGas && gasleft() < _recoverGas) {
                // case 2a: not enough gas left to execute calls
                token.safeTransfer(_receiver, amount);

                emit DZapTransferRecovered(
                    _transactionId,
                    _swapData.from,
                    _receiver,
                    amount,
                    block.timestamp
                );
                return;
            }

            // case 2b: enough gas left to execute calls
            try
                executor.swapAndCompleteBridgeTokens{
                    gas: gasleft() - _recoverGas
                }(_transactionId, _receiver, _swapData)
            {} catch {
                token.safeTransfer(_receiver, _swapData.fromAmount);

                emit DZapTransferRecovered(
                    _transactionId,
                    _swapData.from,
                    _receiver,
                    _swapData.fromAmount,
                    block.timestamp
                );
            }

            token.safeApprove(address(executor), 0);
        }
    }
}
