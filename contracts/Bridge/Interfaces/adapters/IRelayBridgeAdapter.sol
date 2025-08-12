// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

struct RelayData {
    uint256 amountIn;
    bytes32 requestId;
}

interface IRelayBridgeAdapter {
    /* ========= EVENT ========= */

    event RelayBridgeTransferStarted(
        bytes32 indexed transactionId,
        address indexed user,
        bytes reciever,
        address from,
        bytes to,
        RelayData relayData,
        uint256 destinationChainId,
        bytes destinationCalldata
    );

    /* ========= VIEW ========= */

    function getRelayAddress() external view returns (address receiver, address solver);

    /* ========= EXTERNAL ========= */

    function bridgeViaRelay(
        bytes32 _transactionId,
        address _user,
        bool _updateAmountIn,
        address _from,
        uint256 _destinationChainId,
        bytes calldata _receiver,
        bytes calldata _to,
        bytes calldata _destinationCalldata,
        RelayData memory _relayData
    ) external payable;
}
