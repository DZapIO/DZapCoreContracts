// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { IGasZipFacet } from "../Interfaces/IGasZipFacet.sol";
import { IBridgeAdapter } from "../Interfaces/IBridgeAdapter.sol";
import { NotNativeToken, NativeCallFailed } from "../../Shared/ErrorsNew.sol";

contract GasZipAdapter is IBridgeAdapter {

    function bridge(address _srcToken, uint256 _amount, bytes calldata _data) external payable {
        if(!LibAsset.isNativeToken(_srcToken)) revert NotNativeToken();
        address depositAddress = IGasZipFacet(address(this)).getGasZipDepositAddress();

        (bool success, bytes memory reason) = depositAddress.call{value: _amount}(_data);

        if (!success) revert NativeCallFailed(reason);
    }
}