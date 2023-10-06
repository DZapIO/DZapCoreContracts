// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { IDexManagerFacet } from "../Shared/Interfaces/IDexManagerFacet.sol";

import { SwapData } from "../Shared/Types.sol";
import { LibAsset, IERC20 } from "../Shared/Libraries/LibAsset.sol";
import { LibBytes } from "../Shared/Libraries/LibBytes.sol";
import { LibSwap } from "../Shared/Libraries/LibSwap.sol";
import { ReentrancyGuard } from "../Shared/Helpers/ReentrancyGuard.sol";

import { IExecutor } from "../Shared/Interfaces/IExecutor.sol";
import { ContractCallNotAllowed, ZeroAddress, SlippageTooHigh } from "../Shared/Errors.sol";

/// @title Executor
/// @notice Arbitrary execution contract used for cross-chain swaps and message passing
contract Executor is IExecutor, ReentrancyGuard {
    /* ========= STORAGE ========= */

    IDexManagerFacet public diamond;

    /* ========= EVENTS ========= */

    event TokenSwapped(
        bytes32 transactionId,
        address callTo,
        address receiver,
        address fromAssetId,
        address toAssetId,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 leftoverFromAmount,
        uint256 timestamp
    );

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

    /// @notice Performs a swap before completing a cross-chain transaction
    /// @param _transactionId the transaction id for the swap
    /// @param _receiver address that will receive tokens in the end
    /// @param _swapData array of data needed for swaps
    function swapAndCompleteBridgeTokens(
        bytes32 _transactionId,
        address payable _receiver,
        SwapData calldata _swapData
    ) external payable nonReentrant {
        if (!LibAsset.isNativeToken(_swapData.from)) {
            LibAsset.transferFromERC20(
                _swapData.from,
                msg.sender,
                address(this),
                _swapData.fromAmount
            );
        }

        // swap
        (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(
            _swapData
        );

        if (leftoverFromAmount > 0) {
            LibAsset.transferToken(
                _swapData.from,
                _receiver,
                leftoverFromAmount
            );
        }

        if (returnToAmount > 0) {
            LibAsset.transferToken(_swapData.to, _receiver, returnToAmount);
        }

        emit TokenSwapped(
            _transactionId,
            _swapData.callTo,
            _receiver,
            _swapData.from,
            _swapData.to,
            _swapData.fromAmount,
            returnToAmount,
            leftoverFromAmount,
            block.timestamp
        );
    }

    /* ========= INTERNAL ========= */

    function _executeSwaps(
        SwapData calldata _swapData
    ) private returns (uint256 leftoverFromAmount, uint256 returnToAmount) {
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
        (leftoverFromAmount, returnToAmount) = LibSwap.swap(
            _swapData,
            0,
            false
        );
    }
}
