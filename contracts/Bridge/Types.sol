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
    string bridge;
    address from;
    address to;
    address receiver;
    uint256 minAmount; // amount after swap, swap -> bridge
    uint256 destinationChainId;
    bool hasSourceSwaps;
    bool hasDestinationCall;
}
