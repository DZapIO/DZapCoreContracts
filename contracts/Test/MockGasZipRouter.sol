// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;


interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function transfer(address, uint256) external returns (bool);
}

contract MockGasZipRouter {

    event Deposit(address from, uint256 chains, uint256 amount, bytes32 to);
    
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function deposit(uint256 chains, bytes32 to) payable external {
        require(msg.value != 0, "No Value");
        emit Deposit(msg.sender, chains, msg.value, to);
    }

    function deposit(uint256 chains, address to) payable external {
        require(msg.value != 0, "No Value");
        emit Deposit(msg.sender, chains, msg.value, bytes32(bytes20(uint160(to))));
    }

    function withdraw(address token) external {
        require(msg.sender == owner);
        if (token == address(0)) {
            owner.call{value: address(this).balance}("");
        } else {
            IERC20(token).transfer(owner, IERC20(token).balanceOf(address(this)));
        }
    }

    function newOwner(address _owner) external {
        require(msg.sender == owner);
        owner = _owner;
    }
}
