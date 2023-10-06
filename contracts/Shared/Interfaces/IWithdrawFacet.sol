// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IWithdrawFacet {
    event LogWithdraw(address indexed tokenAddress, address to, uint256 amount);

    /// @notice Execute call data and withdraw asset.
    /// @param _callTo The address to execute the calldata on.
    /// @param _callData The data to execute.
    /// @param _token Asset to be withdrawn.
    /// @param _to address to withdraw to.
    /// @param _amount amount of asset to withdraw.
    function executeCallAndWithdraw(address payable _callTo, bytes calldata _callData, address _token, address _to, uint256 _amount) external;

    /// @notice Withdraw asset.
    /// @param _token Asset to be withdrawn.
    /// @param _to address to withdraw to.
    /// @param _amount amount of asset to withdraw.
    function withdraw(address _token, address _to, uint256 _amount) external;
}
