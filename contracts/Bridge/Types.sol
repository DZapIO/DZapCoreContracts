// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

struct CallToFunctionInfo {
    bool isAvailable;
    uint256 offset;
}

struct CrossChainStorage {
    mapping(address => mapping(bytes4 => CallToFunctionInfo)) selectorToInfo;
}

struct CrossChainData {
    address callTo;
    address approveTo;
    uint256 extraNative;
    bytes permit;
    bytes callData;
}

struct BridgeData {
    address from;
    address to;
    address receiver;
    bool hasSourceSwaps;
    bool hasDestinationCall;
    uint256 minAmountIn;
    uint256 destinationChainId;
    string bridge;
}
