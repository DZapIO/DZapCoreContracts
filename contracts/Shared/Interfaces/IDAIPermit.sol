// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IDAIPermit {
    /// @dev Sets the allowance of `spender` over ``holder``'s tokens,
    /// given ``holder``'s signed approval.
    function permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s) external;
}
