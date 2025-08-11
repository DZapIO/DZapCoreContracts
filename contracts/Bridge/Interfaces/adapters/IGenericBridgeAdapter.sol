// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IGenericBridgeAdapter {
    /* ========= EXTERNAL ========= */

    function bridgeViaGeneric(
        bool _updateAmountIn,
        address _from,
        address _user,
        bytes calldata _transactionId,
        bytes calldata _callData,
        bytes calldata _receiver,
        bytes calldata _to,
        bytes calldata _destinationCalldata,
        string calldata _bridge,
        uint256 _amountIn,
        uint256 _offset,
        uint256 _extraNative,
        uint256 _destinationChainId,
        address _callTo,
        address _approveTo
    ) external payable;
}
