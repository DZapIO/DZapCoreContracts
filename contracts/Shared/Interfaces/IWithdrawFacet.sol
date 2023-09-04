// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IWithdrawFacet {
    event LogWithdraw(
        address indexed tokenAddress,
        address to,
        uint256 amount
    );

    function executeCallAndWithdraw(
        address payable _callTo,
        bytes calldata _callData,
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) external;

    function withdraw(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) external;
}
