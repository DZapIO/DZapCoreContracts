// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibValidatable } from "../Libraries/LibValidatable.sol";
import { IRelayBridgeAdapter, RelayData } from "../Interfaces/adapters/IRelayBridgeAdapter.sol";
import { NativeCallFailed, Erc20CallFailed, InsufficientBalance, AmountExceedsMaximum } from "../../Shared/Errors.sol";

/**
 * @title RelayBridgeAdapter
 * @author DZap
 * @notice Contract for Relay protocol bridge adapter
 */
contract RelayBridgeAdapter is IRelayBridgeAdapter {
    // ------------------- Storage ------------------- //

    address public immutable _RELAY_RECEIVER; // for native transfers
    address public immutable _RELAY_SOLVER; // for ERC20 transfers

    // ------------------- Constructor -------------------//

    constructor(address _relayReceiver, address _relaySolver) {
        _RELAY_RECEIVER = _relayReceiver;
        _RELAY_SOLVER = _relaySolver;
    }

    // ------------------- VIEW -------------------//

    /// @inheritdoc IRelayBridgeAdapter
    function getRelayAddress() external view returns (address receiver, address solver) {
        return (_RELAY_RECEIVER, _RELAY_SOLVER);
    }

    // ------------------- EXTERNAL -------------------//

    /// @inheritdoc IRelayBridgeAdapter
    function bridgeViaRelay(
        bytes32 _transactionId,
        address _user,
        uint256 _maxAmountIn,
        address _from,
        uint256 _destinationChainId,
        bytes calldata _receiver,
        bytes calldata _to,
        bytes calldata _destinationCalldata,
        RelayData memory _relayData
    ) external payable {
        LibValidatable.validateData(_to, _receiver, _relayData.amountIn, _destinationChainId);

        if (_maxAmountIn > 0) {
            uint256 contractBalance = LibAsset.getOwnBalance(_from);
            if (_relayData.amountIn > _maxAmountIn) revert AmountExceedsMaximum();
            if (contractBalance < _relayData.amountIn) revert InsufficientBalance(_relayData.amountIn, contractBalance);
            _relayData.amountIn = contractBalance > _maxAmountIn ? _maxAmountIn : contractBalance;
        }

        if (LibAsset.isNativeToken(_from)) {
            (bool success, bytes memory reason) = _RELAY_RECEIVER.call{ value: _relayData.amountIn }(abi.encode(_relayData.requestId));
            if (!success) revert NativeCallFailed(reason);
        } else {
            bytes memory transferCallData = bytes.concat(
                abi.encodeWithSignature("transfer(address,uint256)", _RELAY_SOLVER, _relayData.amountIn),
                abi.encode(_relayData.requestId)
            );
            (bool success, bytes memory reason) = _from.call(transferCallData);
            if (!success) revert Erc20CallFailed(reason);
        }

        emit RelayBridgeTransferStarted(_transactionId, _user, _receiver, _from, _to, _relayData, _destinationChainId, _destinationCalldata);
    }
}
