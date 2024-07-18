// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { SwapData, SwapInfo } from "../../Shared/Types.sol";

interface IBatchSwapFacet {
    /* ========= EVENTS ========= */

    event MultiSwapped(bytes32 transactionId, address indexed integrator, address indexed sender, address recipient, SwapInfo[] swapInfo);

    /* ========= EXTERNAL ========= */

    function batchSwap(bytes32 _transactionId, address _integrator, address _recipient, SwapData[] calldata _data, bool[] calldata _isDirectTransfer) external payable;
}
