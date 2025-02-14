// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { GasZipData } from "../Types.sol";
import { SwapInfo, SwapData } from "../../Shared/Types.sol";

interface IGasZipFacet {
    /* ========= EVENTS ========= */

    event GasZipBridgeTransferStarted(
        bytes32 indexed transactionId,
        address indexed integrator, 
        address indexed sender, 
        GasZipData gasZipData 
    );
    
    event GasZipSwapBridgeTransferStarted(
        bytes32 indexed transactionId,
        address indexed integrator, 
        address indexed sender, 
        GasZipData gasZipData,
        SwapInfo[] swapInfo
    );

    /* ========= View ========= */

    function getGasZipRouter() external view returns(address);

    /* ========= EXTERNAL ========= */

    function bridgeTokensViaGasZip(
        bytes32 _transactionId,
        address _integrator, 
        GasZipData memory _gasZipData
    ) external payable;

    function swapAndBridgeTokensViaGasZip(
        bytes32 _transactionId,
        address _integrator, 
        SwapData[] calldata _swapData,
        GasZipData memory _gasZipData
    ) external payable;
}
