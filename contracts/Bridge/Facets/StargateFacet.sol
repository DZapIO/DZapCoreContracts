// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { Swapper } from "../../Shared/Helpers/Swapper.sol";
import { ReentrancyGuard } from "../../Shared/Helpers/ReentrancyGuard.sol";

import { LibDiamond } from "../../Shared/Libraries/LibDiamond.sol";
import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibFees } from "../../Shared/Libraries/LibFees.sol";

import { Validatable } from "../Helpers/Validatable.sol";
import { LibBridgeStorage } from "../Libraries/LibBridgeStorage.sol";

import { IStargateRouter } from "../Interfaces/IStargateRouter.sol";

import { BridgeData, StargateStorage } from "../Types.sol";

import { FeeType, SwapData, SwapInfo } from "../../Shared/Types.sol";
import { AlreadyInitialized, NotInitialized, InformationMismatch, SlippageTooHigh } from "../../Shared/Errors.sol";

contract StargateFacet is ReentrancyGuard, Swapper, Validatable {
    /* ========= CONSTANTS ========= */

    IStargateRouter private immutable router;
    IStargateRouter private immutable nativeRouter;

    /* ========= TYPES ========= */

    struct ChainIdConfig {
        uint256 chainId;
        uint16 layerZeroChainId;
    }

    struct StargateData {
        uint256 srcPoolId;
        uint256 dstPoolId;
        uint256 minAmountLD;
        uint256 dstGasForCall;
        uint256 lzFee;
        address payable refundAddress;
        bytes callTo;
        bytes callData;
        bytes permit;
    }

    /* ========= ERRORS ========= */
    error UnknownLayerZeroChain();

    /* ========= Events ========= */

    event StargateInitialized(ChainIdConfig[] chainIdConfigs);
    event LayerZeroChainIdSet(
        uint256 indexed chainId,
        uint16 layerZeroChainId
    );

    event BridgeTransferStarted(
        bytes32 transactionId,
        address indexed integrator,
        address indexed sender,
        address refundee,
        BridgeData bridgeData
    );

    event SwapAndBridgeTransferStarted(
        bytes32 transactionId,
        address indexed integrator,
        address indexed sender,
        address refundee,
        BridgeData bridgeData,
        SwapInfo swapInfo
    );

    /* ========= CONTRACTOR ========= */

    constructor(IStargateRouter _router, IStargateRouter _nativeRouter) {
        router = _router;
        nativeRouter = _nativeRouter;
    }

    /* ========= RESTRICTED ========= */

    function initStargate(ChainIdConfig[] calldata chainIdConfigs) external {
        LibDiamond.enforceIsContractOwner();

        StargateStorage storage ss = LibBridgeStorage.getStargateStorage();

        if (ss.initialized) {
            revert AlreadyInitialized();
        }

        for (uint256 i = 0; i < chainIdConfigs.length; i++) {
            ss.layerZeroChainId[chainIdConfigs[i].chainId] = chainIdConfigs[i]
                .layerZeroChainId;
        }

        ss.initialized = true;

        emit StargateInitialized(chainIdConfigs);
    }

    function setLayerZeroChainId(
        uint256 _chainId,
        uint16 _layerZeroChainId
    ) external {
        LibDiamond.enforceIsContractOwner();
        StargateStorage storage ss = LibBridgeStorage.getStargateStorage();

        if (!ss.initialized) {
            revert NotInitialized();
        }

        ss.layerZeroChainId[_chainId] = _layerZeroChainId;
        emit LayerZeroChainIdSet(_chainId, _layerZeroChainId);
    }

    /* ========= EXTERNAL ========= */

    function bridgeViaStargate(
        bytes32 _transactionId,
        address _integrator,
        address _refundee,
        BridgeData memory _bridgeData,
        StargateData calldata _stargateData
    )
        external
        payable
        nonReentrant
        refundExcessNative(_refundee)
        doesNotContainSourceSwaps(_bridgeData)
        validateBridgeData(_bridgeData)
    {
        _validateDestinationCallFlag(_bridgeData, _stargateData);

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(
            _integrator,
            FeeType.BRIDGE,
            _bridgeData.from,
            _bridgeData.minAmount,
            _stargateData.permit
        );
        _bridgeData.minAmount -= totalFee;

        _startBridge(_bridgeData, _stargateData);

        LibFees.accrueFixedNativeFees(
            _transactionId,
            _integrator,
            FeeType.BRIDGE
        );

        LibFees.accrueTokenFees(
            _transactionId,
            _integrator,
            FeeType.SWAP,
            _bridgeData.from,
            totalFee - dZapShare,
            dZapShare
        );

        emit BridgeTransferStarted(
            _transactionId,
            _integrator,
            msg.sender,
            _refundee,
            _bridgeData
        );
    }

    function swapAndBridgeViaStargate(
        bytes32 _transactionId,
        address _integrator,
        address _refundee,
        BridgeData memory _bridgeData,
        SwapData calldata _swapData,
        StargateData calldata _stargateData
    )
        external
        payable
        nonReentrant
        refundExcessNative(_refundee)
        containsSourceSwaps(_bridgeData)
        validateBridgeData(_bridgeData)
    {
        _validateDestinationCallFlag(_bridgeData, _stargateData);

        (uint256 totalFee, uint256 dZapShare) = LibAsset.deposit(
            _integrator,
            FeeType.SWAP,
            _swapData
        );

        (uint256 leftoverFromAmount, uint256 returnToAmount) = _executeSwaps(
            _swapData,
            totalFee,
            false
        );

        if (returnToAmount < _bridgeData.minAmount)
            revert SlippageTooHigh(_bridgeData.minAmount, returnToAmount);
        _bridgeData.minAmount = returnToAmount;

        _startBridge(_bridgeData, _stargateData);

        LibFees.accrueFixedNativeFees(
            _transactionId,
            _integrator,
            FeeType.BRIDGE
        );

        LibFees.accrueTokenFees(
            _transactionId,
            _integrator,
            FeeType.SWAP,
            _bridgeData.from,
            totalFee - dZapShare,
            dZapShare
        );

        if (leftoverFromAmount > 0)
            LibAsset.transferToken(
                _swapData.from,
                _refundee,
                leftoverFromAmount
            );

        emit SwapAndBridgeTransferStarted(
            _transactionId,
            _integrator,
            msg.sender,
            _refundee,
            _bridgeData,
            SwapInfo(
                _swapData.callTo,
                _swapData.to,
                _swapData.from,
                _swapData.fromAmount,
                leftoverFromAmount,
                returnToAmount
            )
        );
    }

    /* ========= VIEWS/PURE ========= */

    function quoteLayerZeroFee(
        uint256 _destinationChainId,
        StargateData calldata _stargateData
    ) external view returns (uint256, uint256) {
        return
            router.quoteLayerZeroFee(
                getLayerZeroChainId(_destinationChainId),
                1, // TYPE_SWAP_REMOTE on Bridge
                _stargateData.callTo,
                _stargateData.callData,
                IStargateRouter.lzTxObj(
                    _stargateData.dstGasForCall,
                    0,
                    toBytes(address(0))
                )
            );
    }

    function getLayerZeroChainId(
        uint256 _chainId
    ) private view returns (uint16) {
        StargateStorage storage ss = LibBridgeStorage.getStargateStorage();

        uint16 chainId = ss.layerZeroChainId[_chainId];
        if (chainId == 0) revert UnknownLayerZeroChain();
        return chainId;
    }

    function toBytes(address _address) private pure returns (bytes memory) {
        return abi.encodePacked(_address);
    }

    /* ========= PRIVATE ========= */

    function _validateDestinationCallFlag(
        BridgeData memory _bridgeData,
        StargateData calldata _stargateData
    ) private pure {
        if (
            (_stargateData.callData.length > 0) !=
            _bridgeData.hasDestinationCall
        ) {
            revert InformationMismatch();
        }
    }

    function _startBridge(
        BridgeData memory _bridgeData,
        StargateData calldata _stargateData
    ) private {
        if (LibAsset.isNativeToken(_bridgeData.from)) {
            nativeRouter.swapETHAndCall{ value: _bridgeData.minAmount }(
                getLayerZeroChainId(_bridgeData.destinationChainId),
                _stargateData.refundAddress,
                _stargateData.callTo,
                IStargateRouter.SwapAmount(
                    _bridgeData.minAmount - _stargateData.lzFee,
                    _stargateData.minAmountLD
                ),
                IStargateRouter.lzTxObj(
                    _stargateData.dstGasForCall,
                    0,
                    toBytes(address(0))
                ),
                _stargateData.callData
            );
        } else {
            LibAsset.approveERC20(
                _bridgeData.from,
                address(router),
                _bridgeData.minAmount
            );

            router.swap{ value: _stargateData.lzFee }(
                getLayerZeroChainId(_bridgeData.destinationChainId),
                _stargateData.srcPoolId,
                _stargateData.dstPoolId,
                _stargateData.refundAddress,
                _bridgeData.minAmount,
                _stargateData.minAmountLD,
                IStargateRouter.lzTxObj(
                    _stargateData.dstGasForCall,
                    0,
                    toBytes(address(0))
                ),
                _stargateData.callTo,
                _stargateData.callData
            );
        }
    }
}
