"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProviderCompatible = exports.getMulticall = exports.getBlockNumber = void 0;
var utils_1 = require("ethers/lib/utils");
var constants_1 = require("./constants");
var types_1 = require("./types");
var getBlockNumber = function (blockTag) {
    if ((0, utils_1.isHexString)(blockTag))
        return parseInt(blockTag, 16);
    else if (typeof blockTag === "number")
        return blockTag;
    else if (blockTag === "earliest")
        return 0;
    return null;
};
exports.getBlockNumber = getBlockNumber;
var getMulticall = function (chainId, provider) {
    return types_1.Multicall3__factory.connect(constants_1.multicall3ChainAddress[chainId] || constants_1.multicall3Address, provider);
};
exports.getMulticall = getMulticall;
var isProviderCompatible = function (provider) {
    var candidate = provider;
    return candidate._isProvider && !!candidate.perform;
};
exports.isProviderCompatible = isProviderCompatible;
