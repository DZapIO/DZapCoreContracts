// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibSwap } from "../../Shared/Libraries/LibSwap.sol";

import { ISwapTransferFacet } from "../Interfaces/ISwapTransferFacet.sol";

import { Swapper } from "../../Shared/Helpers/Swapper.sol";
import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { SwapData, SwapInfo } from "../../Shared/Types.sol";
import { ZeroAddress, SwapCallFailed, ContractCallNotAllowed, IntegratorNotAllowed, InvalidAmount, AllSwapsFailed } from "../../Shared/ErrorsNew.sol";

/// @title Swap Transfer Facet
/// @notice Provides functionality for swapping through ANY APPROVED DEX,
/// @notice funds come in contract first and then it handles it
/// @dev Uses calldata to execute APPROVED arbitrary methods on DEXs
contract SwapTransferFacet is ISwapTransferFacet, Swapper, RefundNative {
    /* ========= EXTERNAL ========= */

    function swapAndTransfer(bytes32 _transactionId, address _integrator, address _recipient, SwapData calldata _data) external payable refundExcessNative(msg.sender) {
        if (_recipient == address(0)) revert ZeroAddress();
        if (!LibFees.isIntegratorAllowed(_integrator)) revert IntegratorNotAllowed();

        if (!LibAsset.isNativeToken(_data.from)) {
            LibAsset.permitAndTransferFromErc20(_data.from, msg.sender, address(this), _data.fromAmount, _data.permit);
        }

        (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(_data, 0, false);

        if (leftoverFromAmount != 0 && !LibAsset.isNativeToken(_data.from)) LibAsset.transferERC20(_data.from, msg.sender, leftoverFromAmount);
        LibAsset.transferToken(_data.to, _recipient, returnToAmount);

        emit Swapped(_transactionId, _integrator, msg.sender, _recipient, SwapInfo(_data.callTo, _data.from, _data.to, _data.fromAmount, leftoverFromAmount, returnToAmount));
    }

    function multiSwapAndTransfer(bytes32 _transactionId, address _integrator, address _recipient, SwapData[] calldata _data) external payable refundExcessNative(msg.sender) {
        if (_recipient == address(0)) revert ZeroAddress();
        if (!LibFees.isIntegratorAllowed(_integrator)) revert IntegratorNotAllowed();

        uint256 length = _data.length;
        SwapInfo[] memory swapInfo = new SwapInfo[](length);

        for (uint256 i = 0; i < length; ) {
            SwapData memory swapData = _data[i];

            if (!LibAsset.isNativeToken(swapData.from)) {
                LibAsset.permitAndTransferFromErc20(swapData.from, msg.sender, address(this), swapData.fromAmount, _data[i].permit);
            }

            (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(_data[i], 0, false);

            if (leftoverFromAmount != 0 && !LibAsset.isNativeToken(swapData.from)) LibAsset.transferToken(swapData.from, msg.sender, leftoverFromAmount);
            LibAsset.transferToken(swapData.to, _recipient, returnToAmount);

            swapInfo[i] = SwapInfo(swapData.callTo, swapData.from, swapData.to, swapData.fromAmount, leftoverFromAmount, returnToAmount);
            unchecked {
                ++i;
            }
        }

        emit MultiSwapped(_transactionId, _integrator, msg.sender, _recipient, swapInfo);
    }

    // solhint-disable-next-line code-complexity
    function multiSwapAndTransferWithoutRevert(bytes32 _transactionId, address _integrator, address _recipient, SwapData[] calldata _data) external payable refundExcessNative(msg.sender) {
        if (_recipient == address(0)) revert ZeroAddress();
        if (!LibFees.isIntegratorAllowed(_integrator)) revert IntegratorNotAllowed();

        uint256 length = _data.length;
        uint256 failedSwaps;
        SwapInfo[] memory swapInfo = new SwapInfo[](length);

        for (uint256 i = 0; i < length; ) {
            SwapData memory swapData = _data[i];

            if (!LibAsset.isNativeToken(swapData.from)) {
                LibAsset.permitAndTransferFromErc20(swapData.from, msg.sender, address(this), swapData.fromAmount, _data[i].permit);
            }

            (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(_data[i], 0, true);

            if (returnToAmount == 0) {
                swapInfo[i] = SwapInfo(swapData.callTo, swapData.from, swapData.to, swapData.fromAmount, 0, 0);
                LibAsset.transferToken(swapData.from, msg.sender, swapData.fromAmount);

                unchecked {
                    ++failedSwaps;
                }
            } else {
                if (leftoverFromAmount != 0 && !LibAsset.isNativeToken(swapData.from)) LibAsset.transferToken(swapData.from, msg.sender, leftoverFromAmount);
                LibAsset.transferToken(swapData.to, _recipient, returnToAmount);

                swapInfo[i] = SwapInfo(swapData.callTo, swapData.from, swapData.to, swapData.fromAmount, leftoverFromAmount, returnToAmount);
            }

            unchecked {
                ++i;
            }
        }

        if (failedSwaps == length) revert AllSwapsFailed();

        emit MultiSwapped(_transactionId, _integrator, msg.sender, _recipient, swapInfo);
    }
}
