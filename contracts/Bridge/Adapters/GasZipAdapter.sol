// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { IGasZipRouter } from "../Interfaces/external/IGasZipRouter.sol";
import { IGasZipAdapter, GasZipData } from "../Interfaces/adapters/IGasZipAdapter.sol";
import { NullAddrIsNotAValidRecipient, NoBridgeFromZeroAmount, NativeTokenNotSupported } from "../../Shared/Errors.sol";

/**
 * @title GasZipAdapter
 * @author DZap
 * @notice Contract for GasZip bridge adapter
 */
contract GasZipAdapter is IGasZipAdapter {
    // ------------------- STORAGE ------------------- //

    IGasZipRouter private immutable _GAS_ZIP_ROUTER;

    // ------------------- CONSTRUCTOR -------------------//

    constructor(address _depositAddress) {
        _GAS_ZIP_ROUTER = IGasZipRouter(_depositAddress);
    }

    // ------------------- VIEW -------------------//

    /// @inheritdoc IGasZipAdapter
    function getGasZipRouter() external view returns (address) {
        return address(_GAS_ZIP_ROUTER);
    }

    // ------------------- EXTERNAL -------------------//

    /// @inheritdoc IGasZipAdapter
    function bridgeViaGasZip(
        bytes32 _transactionId,
        address _user,
        bool _updateAmountIn,
        address _from,
        bytes calldata _destinationCalldata,
        GasZipData memory _gasZipData
    ) external payable {
        if (!LibAsset.isNativeToken(_from)) revert NativeTokenNotSupported();
        if (_updateAmountIn) {
            _gasZipData.depositAmount = address(this).balance;
        }
        _startBridge(_gasZipData);

        emit GasZipBridgeTransferStarted(_transactionId, _user, _gasZipData, _destinationCalldata);
    }

    function _startBridge(GasZipData memory _gasZipData) private {
        if (_gasZipData.recipient == bytes32(0)) revert NullAddrIsNotAValidRecipient();
        if (_gasZipData.depositAmount == 0) revert NoBridgeFromZeroAmount();

        _GAS_ZIP_ROUTER.deposit{ value: _gasZipData.depositAmount }(_gasZipData.destChains, _gasZipData.recipient);
    }
}
