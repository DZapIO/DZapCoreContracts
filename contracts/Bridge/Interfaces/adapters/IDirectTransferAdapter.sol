// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IDirectTransferAdapter {
    /* ========= EXTERNAL ========= */

    function bridgeViaTransfer(
        bytes32 _transactionId,
        address _user,
        bool _updateAmountIn,
        address _from,
        address _transferTo,
        uint256 _amountIn,
        uint256 _destinationChainId,
        string calldata _bridge,
        bytes calldata _receiver,
        bytes calldata _to,
        bytes calldata _destinationCalldata
    ) external payable;
}
