// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { SwapData, SwapInfo } from "../../Shared/Types.sol";

interface IMultiSwapFacet {
    /* ========= EVENTS ========= */

    event MultiSwapped(bytes32 transactionId, address indexed integrator, address indexed sender, address recipient, SwapInfo[] swapInfo);

    /* ========= EXTERNAL ========= */
}
