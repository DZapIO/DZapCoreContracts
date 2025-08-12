// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { IBridge } from "../../Shared/Interfaces/IBridge.sol";
import { LibValidatable } from "../Libraries/LibValidatable.sol";
import { IGenericBridgeAdapter } from "../Interfaces/adapters/IGenericBridgeAdapter.sol";
import { BridgeCallFailed } from "../../Shared/Errors.sol";

/**
 * @title GenericBridgeAdapter
 * @author DZap
 * @notice Universal adapter for most bridge protocols
 * @dev Provides standardized contract for integrating various bridge protocols
 */
contract GenericBridgeAdapter is IBridge, IGenericBridgeAdapter {
    /// @inheritdoc IGenericBridgeAdapter
    function bridgeViaGeneric(
        bytes32 _transactionId,
        address _user,
        bool _updateAmountIn,
        address _from,
        address _callTo,
        address _approveTo,
        uint256 _amountIn,
        uint256 _offset,
        uint256 _extraNative,
        uint256 _destinationChainId,
        string calldata _bridge,
        bytes calldata _receiver,
        bytes calldata _to,
        bytes calldata _callData,
        bytes calldata _destinationCalldata
    ) external payable {
        LibValidatable.validateData(_callTo, _amountIn, _destinationChainId);

        uint256 nativeValue;
        if (LibAsset.isNativeToken(_from)) {
            if (_updateAmountIn) {
                _amountIn = LibAsset.getOwnBalance(_from) - _extraNative;
            }
            nativeValue = _amountIn;
        } else {
            if (_updateAmountIn) {
                _amountIn = LibAsset.getOwnBalance(_from);
            }
            LibAsset.maxApproveERC20(_from, _approveTo, _amountIn);
        }

        (bool success, bytes memory res) = _callTo.call{ value: nativeValue + _extraNative }(
            _updateAmountIn ? bytes.concat(_callData[:_offset], abi.encode(_amountIn), _callData[_offset + 32:]) : _callData
        );

        if (!success) {
            revert BridgeCallFailed(_callTo, bytes4(_callData), res);
        }

        emit BridgeStarted(_transactionId, _user, _receiver, _bridge, _callTo, _from, _to, _amountIn, _destinationChainId, _destinationCalldata);
    }
}
