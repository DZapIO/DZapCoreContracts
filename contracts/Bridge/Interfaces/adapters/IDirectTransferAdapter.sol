// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IDirectTransferAdapter {
    /* ========= EXTERNAL ========= */

    function bridgeViaTransfer(
        bool _updateAmountIn,
        address _from,
        address _user,
        bytes calldata _transactionId,
        bytes calldata _receiver,
        bytes calldata _to,
        bytes calldata _destinationCalldata,
        string calldata _bridge,
        uint256 _amountIn,
        uint256 _destinationChainId,
        address _transferTo
    ) external payable;
}
