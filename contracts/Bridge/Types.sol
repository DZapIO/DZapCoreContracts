// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

struct CrossChainAllowedList {
    mapping(bytes4 => uint256) selectorToInfo;
    bool isWhitelisted;
}

struct CrossChainStorage {
    mapping(address => CrossChainAllowedList) allowlist;
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
