pragma solidity 0.8.19;

import { SwapData } from "../Types.sol";

interface IReceiver {
    event ExecutorSet(address indexed executor);
    event RecoverGasSet(uint256 indexed recoverGas);
    event TokensRecovered(
        address token,
        address indexed receiver,
        uint256 amount
    );

    event DZapTransferRecovered(
        bytes32 indexed transactionId,
        address receivingAssetId,
        address receiver,
        uint256 amount,
        uint256 timestamp
    );

    function setExecutor(address _executor) external;

    function swapAndCompleteBridgeTokens(
        bytes32 _transactionId,
        address payable _receiver,
        SwapData calldata _swapData
    ) external payable;

    function recoverToken(
        address token,
        address receiver,
        uint256 amount
    ) external;
}
