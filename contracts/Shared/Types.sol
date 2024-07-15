// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

enum FeeType {
    BRIDGE,
    SWAP
}

enum PermitType {
    PERMIT,
    PERMIT2_TRANSFER_FROM,
    PERMIT2_APPROVE
}

struct AllowList {
    bool isAllowed;
    mapping(bytes4 => bool) selectorAllowList;
}

struct FeeInfo {
    uint256 tokenFee; // ex 1%
    uint256 fixedNativeFeeAmount; // ex 0.5 Matic
    uint256 dzapTokenShare; // 50%, 50% of the total 1% fee
    uint256 dzapFixedNativeShare; // 50%, 50% of the total fixedFeeAmount fee
}

struct IntegratorInfo {
    bool status;
    mapping(FeeType => FeeInfo) feeInfo;
}

struct SwapData {
    address callTo; // router, dex, aggregator
    address approveTo;
    address from;
    address to;
    uint256 fromAmount; // totalAmountWithFee
    uint256 minToAmount; // fro amountWithoutFee
    bytes swapCallData; // from : amountWithoutFee
    bytes permit;
}

struct SwapMultiTokenInfo {
    address from;
    address to;
    uint256 fromAmount;
    uint256 minToAmount;
    bytes permit;
}

struct SwapMultiData {
    address callTo;
    address approveTo;
    bytes swapCallData;
    SwapMultiTokenInfo[] tokenInfo;
}

struct SwapInfo {
    address dex;
    address fromToken;
    address toToken;
    uint256 fromAmount;
    uint256 leftOverFromAmount;
    uint256 returnToAmount;
}
