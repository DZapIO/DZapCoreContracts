// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAllowList } from "../../Shared/Libraries/LibAllowList.sol";
import { LibGlobalStorage } from "../../Shared/Libraries/LibGlobalStorage.sol";
import { LibValidator } from "../../Shared/Libraries/LibValidator.sol";
import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";

import { AdapterInfo } from "../Types.sol";
import { FeeConfig } from "../../Shared/Types.sol";
import { AdapterNotWhitelisted, AdapterCallFailed } from "../../Shared/Errors.sol";

/// @title DZap LibBridge
/// @notice This library contains helpers for bridging tokens
library LibBridge {
    /// @notice Returns true if the adapter is whitelisted
    function isAdapterWhitelisted(address _adapter) internal view returns (bool) {
        return LibAllowList.isAdapterWhitelisted(_adapter);
    }

    /// @notice Returns true if the bridge is whitelisted
    function isBridgeWhitelisted(address _bridge) internal view returns (bool) {
        return LibAllowList.isBridgeWhitelisted(_bridge);
    }

    /// @notice Verifies and takes fee
    function verifyAndTakeFee(
        address _user,
        uint256 _deadline,
        bytes32 _transactionIdHash,
        bytes32 _adapterInfoHash,
        bytes calldata _feeData,
        bytes calldata _signature
    ) internal returns (address integrator) {
        LibValidator.handleFeeVerification(_user, _deadline, _transactionIdHash, keccak256(_feeData), _adapterInfoHash, _signature);

        return takeFee(_feeData);
    }

    /// @notice Takes fee
    function takeFee(bytes calldata _feeData) internal returns (address integrator) {
        FeeConfig memory feeInfo = abi.decode(_feeData, (FeeConfig));
        address protocolFeeVault = LibGlobalStorage.getProtocolFeeVault();
        uint256 i;
        uint256 length = feeInfo.fees.length;

        for (i; i < length; ) {
            LibAsset.transferToken(feeInfo.fees[i].token, feeInfo.integrator, feeInfo.fees[i].integratorFeeAmount);
            LibAsset.transferToken(feeInfo.fees[i].token, protocolFeeVault, feeInfo.fees[i].protocolFeeAmount);
            unchecked {
                ++i;
            }
        }

        return feeInfo.integrator;
    }

    /// @notice Bridges tokens
    function bridge(AdapterInfo[] calldata _adapterInfo) internal {
        uint256 i;
        uint256 length = _adapterInfo.length;
        for (i; i < length; ) {
            bridge(_adapterInfo[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Refunds excess tokens
    function refundExcessTokens(AdapterInfo[] calldata _adapterInfo) internal {
        uint256 i;
        uint256 length = _adapterInfo.length;
        for (i; i < length; ) {
            refundExcessTokens(_adapterInfo[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Bridges tokens
    function bridge(AdapterInfo calldata _adapterInfo) internal {
        address adapter = _adapterInfo.adapter;
        if (!isAdapterWhitelisted(adapter)) revert AdapterNotWhitelisted(adapter);

        (bool success, bytes memory res) = adapter.delegatecall(_adapterInfo.adapterData);
        if (!success) revert AdapterCallFailed(adapter, res);
    }

    /// @notice Refunds excess tokens
    function refundExcessTokens(AdapterInfo calldata _adapterInfo) internal {
        (, , bool _updateAmountIn, address _from) = abi.decode(_adapterInfo.adapterData[4:], (bytes32, address, bool, address));
        if (_updateAmountIn) {
            if (LibAsset.isNativeToken(_from)) {
                uint256 initialBalance = address(this).balance - msg.value;
                LibAsset.transferNativeToken(LibGlobalStorage.getRefundVault(), initialBalance);
            } else {
                uint256 initialBalance = LibAsset.getErc20Balance(_from, address(this));
                LibAsset.transferERC20(_from, LibGlobalStorage.getRefundVault(), initialBalance);
            }
        }
    }
}
