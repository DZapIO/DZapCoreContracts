pragma solidity 0.8.19;

import { SwapData } from "../Types.sol";

interface IExecutor {
    event DzapTransferCompleted(
        bytes32 indexed transactionId,
        address from,
        address to,
        address receiver,
        uint256 amount,
        uint256 timestamp
    );

    function swapAndCompleteBridgeTokens(
        bytes32 _transactionId,
        address payable _receiver,
        SwapData calldata _swapData
    ) external payable;
}
