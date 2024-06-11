// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibSwap } from "../../Shared/Libraries/LibSwap.sol";

import { ISwapFacet } from "../Interfaces/ISwapFacet.sol";

import { Swapper } from "../../Shared/Helpers/Swapper.sol";
import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { SwapData, SwapInfo, FeeType, FeeInfo } from "../../Shared/Types.sol";
import { ZeroAddress, SwapCallFailed, ContractCallNotAllowed, IntegratorNotAllowed, InvalidAmount, AllSwapsFailed } from "../../Shared/Errors.sol";

/// @title Swap Facet
/// @notice Provides functionality for swapping through ANY APPROVED DEX
/// @dev Uses calldata to execute APPROVED arbitrary methods on DEXs
contract SwapFacet is ISwapFacet, Swapper, RefundNative {
    /* ========= EXTERNAL ========= */

    function swap(bytes32 _transactionId, address _integrator, address _recipient, SwapData calldata _data) external payable refundExcessNative(msg.sender) {
        if (_recipient == address(0)) revert ZeroAddress();
        if (!LibFees.isIntegratorAllowed(_integrator)) revert IntegratorNotAllowed();

        if (!LibAsset.isNativeToken(_data.from)) {
            LibAsset.permitAndTransferFromErc20(_data.from, msg.sender, address(this), _data.fromAmount, _data.permit);
        }

        (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(_data, _recipient, false);

        if (leftoverFromAmount != 0 && !LibAsset.isNativeToken(_data.from)) LibAsset.transferERC20(_data.from, msg.sender, leftoverFromAmount);

        emit Swapped(_transactionId, _integrator, msg.sender, _recipient, SwapInfo(_data.callTo, _data.from, _data.to, _data.fromAmount, leftoverFromAmount, returnToAmount));
    }

    function swapErc20ToEc20(bytes32 _transactionId, address _recipient, SwapData calldata _data) external {
        if (_recipient == address(0)) revert ZeroAddress();
        _validateSwapData(_data);

        LibAsset.permitAndTransferFromErc20(_data.from, msg.sender, address(this), _data.fromAmount, _data.permit);

        (uint256 leftoverFromAmount, uint256 returnToAmount) = LibSwap.swapErc20ToErc20(_data, _recipient);

        if (leftoverFromAmount != 0) LibAsset.transferERC20(_data.from, msg.sender, leftoverFromAmount);

        emit SwappedSingleToken(_transactionId, msg.sender, _recipient, SwapInfo(_data.callTo, _data.from, _data.to, _data.fromAmount, leftoverFromAmount, returnToAmount));
    }

    function swapErc20ToNative(bytes32 _transactionId, address _recipient, SwapData calldata _data) external {
        if (_recipient == address(0)) revert ZeroAddress();
        _validateSwapData(_data);

        LibAsset.permitAndTransferFromErc20(_data.from, msg.sender, address(this), _data.fromAmount, _data.permit);

        (uint256 leftoverFromAmount, uint256 returnToAmount) = LibSwap.swapErc20ToNative(_data, _recipient);

        if (leftoverFromAmount != 0) LibAsset.transferERC20(_data.from, msg.sender, leftoverFromAmount);

        emit SwappedSingleToken(_transactionId, msg.sender, _recipient, SwapInfo(_data.callTo, _data.from, _data.to, _data.fromAmount, leftoverFromAmount, returnToAmount));
    }

    function swapNativeToErc20(bytes32 _transactionId, address _recipient, SwapData calldata _data) external payable refundExcessNative(msg.sender) {
        if (_recipient == address(0)) revert ZeroAddress();
        _validateSwapData(_data);

        (uint256 leftoverFromAmount, uint256 returnToAmount) = LibSwap.swapNativeToErc20(_data, _recipient);

        emit SwappedSingleToken(_transactionId, msg.sender, _recipient, SwapInfo(_data.callTo, _data.from, _data.to, _data.fromAmount, leftoverFromAmount, returnToAmount));
    }

    function multiSwap(bytes32 _transactionId, address _integrator, address _recipient, SwapData[] calldata _data) external payable refundExcessNative(msg.sender) {
        if (_recipient == address(0)) revert ZeroAddress();
        if (!LibFees.isIntegratorAllowed(_integrator)) revert IntegratorNotAllowed();

        uint256 length = _data.length;
        SwapInfo[] memory swapInfo = new SwapInfo[](length);

        for (uint256 i = 0; i < length; ) {
            SwapData memory swapData = _data[i];

            if (!LibAsset.isNativeToken(swapData.from)) {
                LibAsset.permitAndTransferFromErc20(swapData.from, msg.sender, address(this), swapData.fromAmount, _data[i].permit);
            }

            (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(_data[i], _recipient, false);

            if (leftoverFromAmount != 0 && !LibAsset.isNativeToken(swapData.from)) LibAsset.transferToken(swapData.from, msg.sender, leftoverFromAmount);

            swapInfo[i] = SwapInfo(swapData.callTo, swapData.from, swapData.to, swapData.fromAmount, leftoverFromAmount, returnToAmount);
            unchecked {
                ++i;
            }
        }

        emit MultiSwapped(_transactionId, _integrator, msg.sender, _recipient, swapInfo);
    }

    // solhint-disable-next-line code-complexity
    function multiSwapWithoutRevert(bytes32 _transactionId, address _integrator, address _recipient, SwapData[] calldata _data) external payable refundExcessNative(msg.sender) {
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

            (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(_data[i], _recipient, true);

            if (returnToAmount == 0) {
                swapInfo[i] = SwapInfo(swapData.callTo, swapData.from, swapData.to, swapData.fromAmount, 0, 0);
                LibAsset.transferToken(swapData.from, msg.sender, swapData.fromAmount);

                unchecked {
                    ++failedSwaps;
                }
            } else {
                if (leftoverFromAmount != 0 && !LibAsset.isNativeToken(swapData.from)) LibAsset.transferToken(swapData.from, msg.sender, leftoverFromAmount);

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
