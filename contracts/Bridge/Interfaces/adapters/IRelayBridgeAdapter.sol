// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

struct RelayData {
    uint256 amountIn;
    bytes32 requestId;
}

interface IRelayBridgeAdapter {
    /* ========= EVENT ========= */

    event RelayBridgeTransferStarted(
        bytes indexed transactionId,
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
        bool _updateAmountIn,
        address _from,
        address _user,
        bytes calldata _transactionId,
        bytes calldata _receiver,
        bytes calldata _to,
        bytes calldata _destinationCalldata,
        RelayData memory _relayData,
        uint256 _destinationChainId
    ) external payable;
}
