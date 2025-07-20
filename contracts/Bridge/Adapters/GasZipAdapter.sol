// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { IGasZipRouter } from "../Interfaces/external/IGasZipRouter.sol";
import { IGasZipAdapter, GasZipData } from "../Interfaces/adapters/IGasZipAdapter.sol";
import { NullAddrIsNotAValidRecipient, NoBridgeFromZeroAmount, NativeTokenNotSupported } from "../../Shared/Errors.sol";

contract GasZipAdapter is IGasZipAdapter {
    // ------------------- STORAGE ------------------- //

    IGasZipRouter private immutable _GAS_ZIP_ROUTER; // for native transfers

    // ------------------- CONSTRUCTOR -------------------//

    constructor(address _depositAddress) {
        _GAS_ZIP_ROUTER = IGasZipRouter(_depositAddress);
    }

    // ------------------- VIEW -------------------//

    function getGasZipRouter() external view returns (address) {
        return address(_GAS_ZIP_ROUTER);
    }

    // ------------------- EXTERNAL -------------------//

    function bridgeViaGasZip(
        bool _updateAmountIn,
        address _from,
        bytes calldata _transactionId,
        GasZipData memory _gasZipData,
        address _user,
        bool _hasDestinationCall
    ) external payable {
        if (!LibAsset.isNativeToken(_from)) revert NativeTokenNotSupported();
        if (_updateAmountIn) {
            _gasZipData.depositAmount = address(this).balance;
        }
        _startBridge(_gasZipData);

        emit GasZipBridgeTransferStarted(_transactionId, _user, _gasZipData, _hasDestinationCall);
    }

    function _startBridge(GasZipData memory _gasZipData) private {
        if (_gasZipData.recipient == bytes32(0)) revert NullAddrIsNotAValidRecipient();
        if (_gasZipData.depositAmount == 0) revert NoBridgeFromZeroAmount();

        _GAS_ZIP_ROUTER.deposit{ value: _gasZipData.depositAmount }(_gasZipData.destChains, _gasZipData.recipient);
    }
}
