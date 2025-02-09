// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { LibBridgeStorage } from "../Libraries/LibBridgeStorage.sol";

import { IBridgeAdapter } from "../Interfaces/IBridgeAdapter.sol";
import { BridgeCallFailed, NotAContract, UnAuthorizedCall } from "../../Shared/ErrorsNew.sol";

contract GenericBridgeAdapter is IBridgeAdapter {
    function bridge(address _srcToken, uint256 _amount, bytes calldata _data) external payable {
        (
            address callTo,
            address approveTo,
            bytes memory callData,
            uint256 extraNative
        ) = abi.decode(_data, (address, address, bytes, uint256));
       
        _validateData(callTo);

        uint256 nativeValue;
        if (LibAsset.isNativeToken(_srcToken)) {
            nativeValue = _amount;
        } else {
            LibAsset.approveERC20(_srcToken, approveTo, _amount);
        }

        (bool success, bytes memory res) = callTo.call{ value: nativeValue + extraNative }(callData);

        if (!success) {
            revert BridgeCallFailed(res);
        }
    }

    function _validateData(address _callTo) internal view {
        if (!LibAsset.isContract(_callTo)) revert NotAContract();
        if (!LibBridgeStorage.getCrossChainStorage().allowlist[_callTo].isWhitelisted) revert UnAuthorizedCall(_callTo);
    }

}