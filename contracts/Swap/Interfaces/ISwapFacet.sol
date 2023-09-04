// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { SwapData, SwapInfo } from "../../Shared/Types.sol";

interface ISwapFacet {
    /* ========= EVENTS ========= */

    event Swapped(
        bytes32 transactionId,
        address indexed integrator,
        address indexed sender,
        address refundee,
        address recipient,
        SwapInfo swapInfo
    );

    event MultiSwapped(
        bytes32 transactionId,
        address indexed integrator,
        address indexed sender,
        address refundee,
        address recipient,
        SwapInfo[] swapInfo
    );

    /* ========= EXTERNAL ========= */

    function swap(
        bytes32 _transactionId,
        address _refundee,
        address _integrator,
        address _recipient,
        SwapData calldata _data
    ) external payable;

    function multiSwap(
        bytes32 _transactionId,
        address _integrator,
        address _refundee,
        address _recipient,
        SwapData[] calldata _data
    ) external payable;

    function multiSwapWithoutRevert(
        bytes32 _transactionId,
        address _integrator,
        address _refundee,
        address _recipient,
        SwapData[] calldata _data
    ) external payable;
}
