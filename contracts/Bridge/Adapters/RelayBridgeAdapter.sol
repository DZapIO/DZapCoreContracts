// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { IBridgeRelayFacet } from "../Interfaces/IBridgeRelayFacet.sol";
import { IBridgeAdapter } from "../Interfaces/IBridgeAdapter.sol";
import { NativeCallFailed, Erc20CallFailed } from "../../Shared/ErrorsNew.sol";

contract RelayBridgeAdapter is IBridgeAdapter {
 
    function bridge(address _srcToken, uint256 _amount, bytes calldata _data) external payable {
        (address relayReceiver, address relaySolver) = IBridgeRelayFacet(address(this)).getRelayAddress();

        if (LibAsset.isNativeToken(_srcToken)) {
            (bool success, bytes memory reason) = relayReceiver.call{value: _amount}(_data);
            if (!success) revert NativeCallFailed(reason);
        } else {
            bytes memory transferCallData = bytes.concat(
                abi.encodeWithSignature("transfer(address,uint256)",relaySolver,_amount),
                _data
            );
            (bool success, bytes memory reason) = address(_srcToken).call(transferCallData);
            if (!success) revert Erc20CallFailed(reason);
        }
    }
}