// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

struct CrossChainAllowedList {
    mapping(bytes4 => uint256) selectorToInfo;
    bool isWhitelisted;
}

struct CrossChainStorage {
    mapping(address => CrossChainAllowedList) allowlist;
}

struct TransferData {
    address transferTo;
    bytes permit;
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
    bool hasSourceSwaps;
    bool hasDestinationCall;
    uint256 minAmountIn;
    uint256 destinationChainId;
}

struct GenericBridgeData {
    string bridge;
    bytes to;
    bytes receiver;
    address from;
    bool hasSourceSwaps;
    bool hasDestinationCall;
    uint256 minAmountIn;
    uint256 destinationChainId;
}
