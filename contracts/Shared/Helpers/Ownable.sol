// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Context.sol";

import { UnauthorizedCaller, ZeroAddress } from "../Errors.sol";

abstract contract Ownable is Context {
    address private _owner;

    event GovernanceChanged(
        address indexed formerGov,
        address indexed _newOwner
    );

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        if (owner() != _msgSender()) revert UnauthorizedCaller();
        _;
    }

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor(address _owner) {
        if (_owner == address(0)) revert ZeroAddress();
        _owner = _owner;
        emit GovernanceChanged(address(0), _owner);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`_newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address _newOwner) external virtual onlyOwner {
        if (_newOwner == address(0)) revert ZeroAddress();
        emit GovernanceChanged(_owner, _newOwner);
        _owner = _newOwner;
    }
}
