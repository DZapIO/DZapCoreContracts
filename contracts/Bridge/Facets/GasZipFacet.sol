// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibSwap } from "../../Shared/Libraries/LibSwap.sol";
import { LibValidatable } from "../Libraries/LibValidatable.sol";

import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { IGasZipFacet } from "../Interfaces/IGasZipFacet.sol";
import { IGasZipRouter } from "../Interfaces/external/IGasZipRouter.sol";

import { GasZipData } from "../Types.sol";
import { FeeType, SwapData, SwapInfo } from "../../Shared/Types.sol";
import { NativeCallFailed, NotNativeToken, InvalidAmount, CannotBridgeToSameNetwork, InvalidReceiver } from "../../Shared/ErrorsNew.sol";

/// @title GasZipFacet
/// @notice Provides functionality for bridging tokens across chains using gasZip
contract GasZipFacet is IGasZipFacet, RefundNative {
    // ------------------- STORAGE ------------------- //

    IGasZipRouter private immutable _GAS_ZIP_ROUTER; // for native transfers
    
    // ------------------- CONSTRUCTOR -------------------//

    constructor(address _depositAddress) {
        _GAS_ZIP_ROUTER = IGasZipRouter(_depositAddress);
    }

    // ------------------- VIEW -------------------//

    function getGasZipRouter() external view returns(address) {
        return address(_GAS_ZIP_ROUTER);
    }

    // ------------------- EXTERNAL -------------------//

    function bridgeTokensViaGasZip(
        bytes32 _transactionId,
        address _integrator, 
        GasZipData memory _gasZipData
    ) external payable refundExcessNative(msg.sender) {
        _startBridge(_integrator, _gasZipData);

        emit GasZipBridgeTransferStarted(_transactionId, _integrator, msg.sender, _gasZipData);
    }
    
    function swapAndBridgeTokensViaGasZip(
        bytes32 _transactionId,
        address _integrator, 
        SwapData[] calldata _swapData,
        GasZipData memory _gasZipData
    ) external payable refundExcessNative(msg.sender) {
        uint256 length = _swapData.length;
        SwapInfo[] memory swapInfo = new SwapInfo[](_swapData.length);

        for (uint256 i = 0; i < length; ) {
            LibValidatable.validateSwapData(_swapData[i]);
            if(!LibAsset.isNativeToken(_swapData[i].to)) revert NotNativeToken();

            LibAsset.permitAndTransferFromErc20(_swapData[i].from, msg.sender, address(this), _swapData[i].fromAmount, _swapData[i].permit);

            (uint256 leftoverFromAmount, uint256 returnToAmount) = LibSwap.swapErc20ToNative(_swapData[i], address(this));
            _gasZipData.depositAmount += returnToAmount;

            if (leftoverFromAmount != 0) LibAsset.transferToken(_swapData[i].from, msg.sender, leftoverFromAmount);
            
            swapInfo[i] = SwapInfo(_swapData[i].callTo, _swapData[i].from, _swapData[i].to, _swapData[i].fromAmount, leftoverFromAmount, returnToAmount);

            unchecked {
                ++i;
            }
        }
        _startBridge(_integrator, _gasZipData);

        emit GasZipSwapBridgeTransferStarted(_transactionId, _integrator, msg.sender, _gasZipData, swapInfo);
    }

    // ------------------- Internal -------------------//

    function _startBridge(address _integrator, GasZipData memory _gasZipData) private {
        (uint256 fixedFee, uint256 totalDZapShare) = LibFees.calcFixedNativeFees(FeeType.BRIDGE, _integrator);
        (uint256 tokenFee, uint256 dZapShare) = LibFees.calculateTokenFees(_gasZipData.depositAmount, LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE));

        _gasZipData.depositAmount -= tokenFee;
        totalDZapShare += dZapShare;
        uint256 totalIntegratorFee = fixedFee + tokenFee - totalDZapShare; 

        if (_gasZipData.recipeint == bytes32(0)) revert InvalidReceiver();
        if(_gasZipData.depositAmount == 0) revert InvalidAmount();
        if (_gasZipData.destChains == block.chainid) revert CannotBridgeToSameNetwork();

        _GAS_ZIP_ROUTER.deposit{value: _gasZipData.depositAmount}(_gasZipData.destChains, _gasZipData.recipeint);

        LibFees.accrueTokenFees(_integrator, LibAsset._NATIVE_TOKEN, totalIntegratorFee, totalDZapShare);
    }
}