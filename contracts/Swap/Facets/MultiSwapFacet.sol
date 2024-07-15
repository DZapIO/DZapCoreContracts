// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibSwap } from "../../Shared/Libraries/LibSwap.sol";

import { IMultiSwapFacet } from "../Interfaces/IMultiSwapFacet.sol";

import { Swapper } from "../../Shared/Helpers/Swapper.sol";
import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { SwapData, SwapMultiData, SwapMultiTokenInfo, SwapInfo } from "../../Shared/Types.sol";
import { ZeroAddress, SwapCallFailed, ContractCallNotAllowed, IntegratorNotAllowed, InvalidAmount, AllSwapsFailed, NoSwapFromZeroBalance, SlippageTooLow } from "../../Shared/ErrorsNew.sol";

/// @title Swap Transfer Facet
/// @notice Provides functionality for swapping through ANY APPROVED DEX,
/// @notice funds come in contract first and then it handles it
/// @dev Uses calldata to execute APPROVED arbitrary methods on DEXs
contract MultiSwapFacet is IMultiSwapFacet, RefundNative {
    /* ========= EXTERNAL ========= */

    function multiBatchSwap(bytes32 _transactionId, address _integrator, address _recipient, SwapMultiData calldata _data) external payable refundExcessNative(msg.sender) {
        if (_recipient == address(0)) revert ZeroAddress();
        if (!LibFees.isIntegratorAllowed(_integrator)) revert IntegratorNotAllowed();

        uint256 length = _data.tokenInfo.length;
        // uint256[] memory initialToBalances = new uint256[](length);
        // uint256[] memory initialFromBalances = new uint256[](length);
        uint256[] memory initialBalances = new uint256[](length * 2);
        uint256 nativeValue;
        SwapInfo[] memory swapInfo = new SwapInfo[](length);

        for (uint256 i = 0; i < length; ) {
            SwapMultiTokenInfo memory tokenInfo = _data.tokenInfo[i];
            if (tokenInfo.fromAmount == 0) revert NoSwapFromZeroBalance();

            if (!LibAsset.isNativeToken(tokenInfo.from)) {
                LibAsset.permitAndTransferFromErc20(tokenInfo.from, msg.sender, address(this), tokenInfo.fromAmount, _data.tokenInfo[i].permit);
            }

            // initialFromBalances[i] = LibAsset.getOwnBalance(tokenInfo.to);
            // initialToBalances[i] = LibAsset.getOwnBalance(tokenInfo.to);

            initialBalances[i] = LibAsset.getOwnBalance(tokenInfo.from);
            initialBalances[length + i] = LibAsset.getOwnBalance(tokenInfo.to);

            if (LibAsset.isNativeToken(tokenInfo.from)) {
                nativeValue += tokenInfo.fromAmount;
            } else {
                LibAsset.approveERC20(tokenInfo.from, _data.approveTo, tokenInfo.fromAmount);
            }

            unchecked {
                ++i;
            }
        }

        (bool success, bytes memory res) = _data.callTo.call{ value: nativeValue }(_data.swapCallData);
        if (!success) {
            revert SwapCallFailed(res);
        }

        for (uint256 i = 0; i < length; ) {
            SwapMultiTokenInfo memory tokenInfo = _data.tokenInfo[i];

            // uint256 returnToAmount = LibAsset.getOwnBalance(tokenInfo.to) - initialToBalances[i];
            uint256 returnToAmount = LibAsset.getOwnBalance(tokenInfo.to) - initialBalances[i];
            if (returnToAmount < tokenInfo.minToAmount) revert SlippageTooLow(tokenInfo.minToAmount, returnToAmount);
            uint256 finalFromBalance = LibAsset.getOwnBalance(tokenInfo.from);
            // uint256 leftoverFromAmount = finalFromBalance > initialFromBalances[i] ? finalFromBalance - initialFromBalances[i] : 0;
            uint256 leftoverFromAmount = finalFromBalance > initialBalances[length + i] ? finalFromBalance - initialBalances[i] : 0;

            if (leftoverFromAmount != 0 && !LibAsset.isNativeToken(tokenInfo.from)) LibAsset.transferERC20(tokenInfo.from, msg.sender, leftoverFromAmount);
            LibAsset.transferToken(tokenInfo.to, _recipient, returnToAmount);

            swapInfo[i] = SwapInfo(_data.callTo, tokenInfo.from, tokenInfo.to, tokenInfo.fromAmount, leftoverFromAmount, returnToAmount);

            unchecked {
                ++i;
            }
        }

        emit MultiSwapped(_transactionId, _integrator, msg.sender, _recipient, swapInfo);
    }
}
