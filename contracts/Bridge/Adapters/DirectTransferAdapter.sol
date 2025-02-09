// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { IBridgeAdapter } from "../Interfaces/IBridgeAdapter.sol";

contract DirectTransferAdapter is IBridgeAdapter {

    function bridge(address _srcToken, uint256 _amount, bytes calldata _data) external payable {
        address transferTo = abi.decode(_data, (address));
        if (LibAsset.isNativeToken(_srcToken)) {
            LibAsset.transferNativeToken(transferTo, _amount);
        } else {
            LibAsset.transferERC20(_srcToken, transferTo, _amount);
        }
    }
}