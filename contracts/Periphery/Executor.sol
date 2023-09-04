// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { IDexManagerFacet } from "../Shared/Interfaces/IDexManagerFacet.sol";

import { SwapData } from "../Shared/Types.sol";
import { LibAsset } from "../Shared/Libraries/LibAsset.sol";
import { LibBytes } from "../Shared/Libraries/LibBytes.sol";
import { LibSwap } from "../Shared/Libraries/LibSwap.sol";
import { ReentrancyGuard } from "../Shared/Helpers/ReentrancyGuard.sol";

import { IExecutor } from "../Shared/Interfaces/IExecutor.sol";
import { ContractCallNotAllowed, ZeroAddress } from "../Shared/Errors.sol";

// emergency withdraw
contract Executor is IExecutor, ReentrancyGuard {
    /* ========= STORAGE ========= */

    IDexManagerFacet public diamond;

    /* ========= ERRORS ========= */

    error ExecutionFailed();
    error InvalidCaller();

    /* ========= CONSTRUCTOR ========= */

    constructor(address _diamond) {
        if (_diamond == address(0)) revert ZeroAddress();

        diamond = IDexManagerFacet(_diamond);
    }

    /* ========= EXTERNAL ========= */

    /// @dev required for receiving native assets from destination swaps
    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    function swapAndCompleteBridgeTokens(
        bytes32 _transactionId,
        address payable _receiver,
        SwapData calldata _swapData
    ) external payable nonReentrant {
        uint256 initialFromBalance;
        uint256 initialToBalance = !LibAsset.isNativeToken(_swapData.to)
            ? LibAsset.getOwnBalance(_swapData.to)
            : LibAsset.getOwnBalance(_swapData.to) - msg.value;

        if (!LibAsset.isNativeToken(_swapData.from)) {
            initialFromBalance = LibAsset.getOwnBalance(_swapData.from);
            LibAsset.transferFromERC20(
                _swapData.from,
                msg.sender,
                address(this),
                _swapData.fromAmount
            );
        } else {
            initialFromBalance =
                LibAsset.getOwnBalance(_swapData.from) -
                msg.value;
        }

        // swap
        _executeSwaps(_transactionId, _swapData);

        uint256 postSwapFromBalance = LibAsset.getOwnBalance(_swapData.from);
        // uint256 leftoverFromAmount = LibAsset.getOwnBalance(_swapData.from) -
        //     (initialFromBalance - _swapData.fromAmount);
        uint256 postSwapToBalance = LibAsset.getOwnBalance(_swapData.to);

        if (postSwapFromBalance > initialFromBalance) {
            LibAsset.transferToken(
                _swapData.from,
                _receiver,
                postSwapFromBalance - initialFromBalance
            );
        }

        if (postSwapToBalance > initialToBalance) {
            LibAsset.transferToken(
                _swapData.to,
                _receiver,
                postSwapToBalance - initialToBalance
            );
        }
    }

    /* ========= INTERNAL ========= */

    function _executeSwaps(
        bytes32 _transactionId,
        SwapData calldata _swapData
    ) private {
        if (
            !((LibAsset.isNativeToken(_swapData.from) ||
                diamond.isContractApproved(_swapData.approveTo)) &&
                diamond.isContractApproved(_swapData.callTo) &&
                diamond.isFunctionApproved(
                    _swapData.callTo,
                    LibBytes.getFirst4Bytes(_swapData.swapCallData)
                ))
        ) revert ContractCallNotAllowed();

        // swap
        LibSwap.swap(_transactionId, _swapData);
    }
}
