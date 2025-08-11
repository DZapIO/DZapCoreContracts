// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibValidatable } from "../Libraries/LibValidatable.sol";
import { IBridge } from "../../Shared/Interfaces/IBridge.sol";
import { IDirectTransferAdapter } from "../Interfaces/adapters/IDirectTransferAdapter.sol";

/// @title DZap DirectTransferAdapter
/// @notice Adapter for direct transfer
contract DirectTransferAdapter is IBridge, IDirectTransferAdapter {
    function bridgeViaTransfer(
        bool _updateAmountIn,
        address _from,
        address _user,
        bytes calldata _transactionId,
        bytes calldata _receiver,
        bytes calldata _to,
        bytes calldata _destinationCalldata,
        string calldata _bridge,
        uint256 _amountIn,
        uint256 _destinationChainId,
        address _transferTo
    ) external payable {
        LibValidatable.validateData(_to, _receiver, _amountIn, _destinationChainId);
        if (_updateAmountIn) {
            _amountIn = LibAsset.getOwnBalance(_from);
        }

        if (LibAsset.isNativeToken(_from)) {
            LibAsset.transferNativeToken(_transferTo, _amountIn);
        } else {
            LibAsset.transferERC20WithBalanceCheck(_from, _transferTo, _amountIn);
        }

        emit BridgeStarted(_transactionId, _user, _receiver, _bridge, _transferTo, _from, _to, _amountIn, _destinationChainId, _destinationCalldata);
    }
}
