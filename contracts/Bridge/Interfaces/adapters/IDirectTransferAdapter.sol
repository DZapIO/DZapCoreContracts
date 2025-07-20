// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IDirectTransferAdapter {
    /* ========= EXTERNAL ========= */

    function bridgeViaTransfer(
        bool _updateAmountIn,
        address _from,
        bytes calldata _transactionId,
        bytes calldata _receiver,
        bytes calldata _to,
        string calldata _bridge,
        uint256 _amountIn,
        uint256 _destinationChainId,
        address _user,
        address _transferTo,
        bool _hasDestinationCall
    ) external payable;
}
