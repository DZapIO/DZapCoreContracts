// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title DZap Types

enum PermitType {
    PERMIT, // EIP2612
    PERMIT2_APPROVE,
    PERMIT2_WITNESS_TRANSFER,
    BATCH_PERMIT2_WITNESS_TRANSFER
}

struct InputToken {
    address token;
    uint256 amount;
    bytes permit;
}

struct SwapInfo {
    string dex;
    address callTo;
    address recipient;
    address fromToken;
    address toToken;
    uint256 fromAmount;
    uint256 returnToAmount;
}

struct SwapData {
    address recipient;
    address from;
    address to;
    uint256 fromAmount;
    uint256 minToAmount;
}

struct BridgeSwapData {
    address recipient;
    address from;
    address to;
    uint256 fromAmount;
    uint256 minToAmount;
    bool updateBridgeInAmount;
}

struct SwapExecutionData {
    string dex;
    address callTo;
    address approveTo;
    bytes swapCallData;
    bool isDirectTransfer;
}

struct TokenInfo {
    address token;
    uint256 amount;
}

struct Fees {
    address token;
    uint256 integratorFeeAmount;
    uint256 protocolFeeAmount;
}

struct FeeConfig {
    address integrator;
    Fees[] fees;
}

struct AdapterInfo {
    address adapter;
    bytes adapterData;
}
