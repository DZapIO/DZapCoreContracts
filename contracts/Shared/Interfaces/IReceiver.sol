pragma solidity 0.8.19;

import { SwapData } from "../Types.sol";

interface IReceiver {
    // event StargateRouterSet(address indexed router);
    event ExecutorSet(address indexed executor);
    event RecoverGasSet(uint256 indexed recoverGas);

    event DZapTransferRecovered(
        bytes32 indexed transactionId,
        address receivingAssetId,
        address receiver,
        uint256 amount,
        uint256 timestamp
    );

    // function setStargateRouter(address _sgRouter) external;

    function setExecutor(address _executor) external;

    function setRecoverGas(uint256 _recoverGas) external;

    // function sgReceive(
    //     uint16, // _srcChainId unused
    //     bytes memory, // _srcAddress unused
    //     uint256, // _nonce unused
    //     address _token,
    //     uint256 _amountLD,
    //     bytes memory _payload
    // ) external;

    function swapAndCompleteBridgeTokens(
        bytes32 _transactionId,
        address payable _receiver,
        SwapData calldata _swapData
    ) external payable;

    function pullToken(
        address assetId,
        address receiver,
        uint256 amount
    ) external;
}
