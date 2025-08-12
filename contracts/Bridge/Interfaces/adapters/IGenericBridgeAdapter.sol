// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IGenericBridgeAdapter {
    /* ========= EXTERNAL ========= */

    function bridgeViaGeneric(
        bytes32 _transactionId,
        address _user,
        bool _updateAmountIn,
        address _from,
        address _callTo,
        address _approveTo,
        uint256 _amountIn,
        uint256 _offset,
        uint256 _extraNative,
        uint256 _destinationChainId,
        string calldata _bridge,
        bytes calldata _receiver,
        bytes calldata _to,
        bytes calldata _callData,
        bytes calldata _destinationCalldata
    ) external payable;
}
