// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { SwapData, SwapInfo } from "../../Shared/Types.sol";

interface ISwapFacet {
    /* ========= EVENTS ========= */

    event Swapped(bytes32 transactionId, address indexed integrator, address indexed sender, address refundee, address recipient, SwapInfo swapInfo);

    event MultiSwapped(bytes32 transactionId, address indexed integrator, address indexed sender, address refundee, address recipient, SwapInfo[] swapInfo);

    /* ========= EXTERNAL ========= */

    /// @notice Swap tokenA to tokenB
    /// @param _transactionId the transaction id associated with the operation
    /// @param _integrator the address of the integrator
    /// @param _refundee the address of the refundee
    /// @param _recipient the address of the recipient
    /// @param _data an object containing swap related data
    function swap(bytes32 _transactionId, address _integrator, address _refundee, address _recipient, SwapData calldata _data) external payable;

    /// @notice Swap multiple tokens in single tx
    /// @param _transactionId the transaction id associated with the operation
    /// @param _integrator the address of the integrator
    /// @param _refundee the address of the refundee
    /// @param _recipient the address of the recipient
    /// @param _data an array of object containing swap related data
    function multiSwap(bytes32 _transactionId, address _integrator, address _refundee, address _recipient, SwapData[] calldata _data) external payable;

    /// @notice Swap multiple tokens in single tx without reverting the is if a part of swap fails
    /// @param _transactionId the transaction id associated with the operation
    /// @param _integrator the address of the integrator
    /// @param _refundee the address of the refundee
    /// @param _recipient the address of the recipient
    function multiSwapWithoutRevert(
        bytes32 _transactionId,
        address _integrator,
        address _refundee,
        address _recipient,
        SwapData[] calldata _data
    ) external payable;
}
