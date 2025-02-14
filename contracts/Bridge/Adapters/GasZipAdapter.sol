// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../../Shared/Libraries/LibAsset.sol";
import { IGasZipFacet } from "../Interfaces/IGasZipFacet.sol";
import { IBridgeAdapter } from "../Interfaces/IBridgeAdapter.sol";
import { IGasZipRouter } from "../Interfaces/external/IGasZipRouter.sol";
import { NotNativeToken, NativeCallFailed, InvalidReceiver, CannotBridgeToSameNetwork } from "../../Shared/ErrorsNew.sol";

contract GasZipAdapter is IBridgeAdapter {

    function bridge(address _srcToken, uint256 _amount, bytes calldata _data) external payable {
        (bytes32 recipeint,uint256 destChains) = abi.decode(_data, (bytes32, uint256));
        
        if(!LibAsset.isNativeToken(_srcToken)) revert NotNativeToken();
        if (recipeint == bytes32(0)) revert InvalidReceiver();
        if (destChains == block.chainid) revert CannotBridgeToSameNetwork();

        address gasZipRouter = IGasZipFacet(address(this)).getGasZipRouter();

        IGasZipRouter(gasZipRouter).deposit{value: _amount}(destChains, recipeint);
    }
}