"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMulticall = exports.getBlockNumber = exports.MulticallVersion = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const types_1 = require("./types");
var MulticallVersion;
(function (MulticallVersion) {
    MulticallVersion["V2"] = "2";
    MulticallVersion["V3"] = "3";
})(MulticallVersion || (exports.MulticallVersion = MulticallVersion = {}));
const getBlockNumber = (blockTag) => {
    if ((0, ethers_1.isHexString)(blockTag))
        return parseInt(blockTag, 16);
    else if (typeof blockTag === "bigint")
        return (0, ethers_1.toNumber)(blockTag);
    else if (typeof blockTag === "number")
        return blockTag;
    else if (blockTag === "earliest")
        return 0;
    return null;
};
exports.getBlockNumber = getBlockNumber;
const getMulticall = (blockNumber, chainId, runner) => {
    var _a, _b;
    if (blockNumber != null) {
        if (blockNumber <= ((_a = constants_1.multicall3DeploymentBlockNumbers[chainId]) !== null && _a !== void 0 ? _a : Infinity)) {
            if (blockNumber <= ((_b = constants_1.multicall2DeploymentBlockNumbers[chainId]) !== null && _b !== void 0 ? _b : Infinity))
                return null;
            return types_1.Multicall2__factory.connect(constants_1.multicall2Address, runner);
        }
    }
    return types_1.Multicall3__factory.connect(constants_1.multicall3ChainAddress[chainId] || constants_1.multicall3Address, runner);
};
exports.getMulticall = getMulticall;
