// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibFees } from "../../Shared/Libraries/LibFees.sol";
import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibBridge } from "../Libraries/LibBridge.sol";
import { LibValidatable } from "../Libraries/LibValidatable.sol";
import { LibBridgeStorage } from "../Libraries/LibBridgeStorage.sol";

import { RefundNative } from "../../Shared/Helpers/RefundNative.sol";

import { IBatchBridgeCallFacet } from "../Interfaces/IBatchBridgeCallFacet.sol";
import { IBridgeAdapter } from "../Interfaces/IBridgeAdapter.sol";

import { FeeType, SwapData, SwapInfo, FeeInfo } from "../../Shared/Types.sol";
import { GenericBridgeData, AdapterData } from "../Types.sol";
import {  AdapterCallFailed, AdapterNotWhitelisted } from "../../Shared/ErrorsNew.sol";

/// @title BatchBridgeCallFacet Facet
/// @notice Batches multiple bridge facets
contract BatchBridgeCallFacet is IBatchBridgeCallFacet, RefundNative {
    function batchBridge(
        bytes32 _transactionId, 
        address _integrator, 
        GenericBridgeData[] memory _bridgeData,
        AdapterData[] calldata _data
    ) external payable refundExcessNative(msg.sender) {
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);
        uint256 length = _data.length;
        
        for (uint256 i; i < length; ) {
            GenericBridgeData memory bridgeData = _bridgeData[i];
            address adapter = _data[i].adapter;

            if(!LibBridgeStorage.getCrossChainStorage().adaptersAllowlist[adapter]) revert AdapterNotWhitelisted(adapter);
            
            LibValidatable.validateData(bridgeData);

            (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(feeInfo, bridgeData.from, bridgeData.minAmountIn, _data[i].permit);
            bridgeData.minAmountIn -= totalFee;

            LibFees.accrueTokenFees(_integrator, bridgeData.from, totalFee - dZapShare, dZapShare);

            (bool success, bytes memory res) = adapter.delegatecall(
                abi.encodeWithSelector(
                    IBridgeAdapter.bridge.selector,
                    bridgeData.from,      
                    bridgeData.minAmountIn, 
                    _data[i].data
                )
            );    
            if(!success) revert AdapterCallFailed(res);

            unchecked {
                ++i;
            }
        } 

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);
        emit BatchBridgeTransferStart(_transactionId, _integrator, msg.sender, _bridgeData);
    } 


    function batchSwapAndBridge(
        bytes32 _transactionId, 
        address _integrator, 
        GenericBridgeData[] memory _bridgeData,
        SwapData[] calldata _swapData,
        AdapterData[] calldata _data
    ) external payable refundExcessNative(msg.sender) {
        uint256 length = _data.length;
        uint256 i;
        uint256 swapCount;
        FeeInfo memory feeInfo = LibFees.getIntegratorFeeInfo(_integrator, FeeType.BRIDGE);
        SwapInfo[] memory swapInfo = new SwapInfo[](_swapData.length);
        
        for (i; i < length; ) {
            GenericBridgeData memory bridgeData = _bridgeData[i];
            address adapter = _data[i].adapter;

            if(!LibBridgeStorage.getCrossChainStorage().adaptersAllowlist[adapter]) revert AdapterNotWhitelisted(adapter);
            
            LibValidatable.validateData(bridgeData);

            if(bridgeData.hasSourceSwaps) {
                swapInfo[swapCount] = LibBridge.swap(_integrator, feeInfo, bridgeData, _swapData[swapCount]);

                unchecked {
                    ++swapCount;
                }
            } else {
                (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(feeInfo, bridgeData.from, bridgeData.minAmountIn, _data[i].permit);
                bridgeData.minAmountIn -= totalFee;

                LibFees.accrueTokenFees(_integrator, bridgeData.from, totalFee - dZapShare, dZapShare);
            }
            (bool success, bytes memory res) = adapter.delegatecall(
                abi.encodeWithSelector(
                    IBridgeAdapter.bridge.selector,
                    bridgeData.from,      
                    bridgeData.minAmountIn, 
                    _data[i].data
                )
            );    

            if(!success) revert AdapterCallFailed(res);
            unchecked {
                ++i;
            }
        } 

        LibFees.accrueFixedNativeFees(_integrator, FeeType.BRIDGE);
        emit BatchSwapAndBridgeTransferStart(_transactionId, _integrator, msg.sender, _bridgeData, swapInfo);
    } 
}
