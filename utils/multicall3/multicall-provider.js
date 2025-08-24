"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulticallWrapper = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class MulticallWrapper {
    /**
     * Returns whether a given provider is a multicall-enabled provider.
     * @param provider The provider to check.
     * @returns A boolean indicating whether the given provider is a multicall-enabled provider.
     */
    static isMulticallProvider(provider) {
        if (provider._isMulticallProvider)
            return true;
        return false;
    }
    /**
     * Wraps a given ethers provider to enable automatic call batching.
     * @param provider The underlying provider to use to batch calls.
     * @param maxMulticallDataLength The maximum total calldata length allowed in a multicall batch, to avoid having the RPC backend to revert because of too large (or too long) request. Set to 0 to disable this behavior. Defaults to 0. Typically 480k for Alchemy.
     * @returns The multicall provider, which is a proxy to the given provider, automatically batching any call performed with it.
     */
    static wrap(provider, maxMulticallDataLength = 0, cache = true) {
        if (MulticallWrapper.isMulticallProvider(provider))
            return provider; // Do not overwrap when given provider is already a multicall provider.
        // Overload provider
        const multicallProvider = Object.defineProperties(provider, {
            _isMulticallProvider: {
                value: true,
                writable: false,
                enumerable: true,
                configurable: false,
            },
            _provider: {
                value: provider,
                writable: false,
                enumerable: true,
                configurable: false,
            },
            cache: {
                value: cache,
                writable: false,
                enumerable: true,
                configurable: false,
            },
            maxMulticallDataLength: {
                value: maxMulticallDataLength,
                writable: true,
                enumerable: true,
                configurable: true,
            },
            isMulticallEnabled: {
                value: true,
                writable: true,
                enumerable: true,
                configurable: true,
            },
        });
        // Define execution context
        const dataLoader = new dataloader_1.default(function (reqs) {
            return __awaiter(this, void 0, void 0, function* () {
                const blockTagReqs = {};
                reqs.forEach(({ call, multicall }, index) => {
                    const blockTag = call.blockTag.toString();
                    if (!blockTagReqs[blockTag])
                        blockTagReqs[blockTag] = [];
                    blockTagReqs[blockTag].push({ call, multicall, index });
                });
                const results = new Array(reqs.length);
                yield Promise.all(Object.values(blockTagReqs).map((blockTagReqs) => __awaiter(this, void 0, void 0, function* () {
                    const callStructs = blockTagReqs.map(({ call }) => ({
                        target: call.to,
                        callData: call.data,
                    }));
                    // Split call in parts of max length to avoid too-long requests
                    let currentLength = 0;
                    const calls = [];
                    if (multicallProvider.maxMulticallDataLength > 0) {
                        calls.push([]);
                        callStructs.forEach((callStruct) => {
                            const newLength = currentLength + callStruct.callData.length;
                            if (newLength > multicallProvider.maxMulticallDataLength) {
                                currentLength = callStruct.callData.length;
                                calls.push([]);
                            }
                            else
                                currentLength = newLength;
                            calls[calls.length - 1].push(callStruct);
                        });
                    }
                    else
                        calls.push(callStructs);
                    const { call: { blockTag }, multicall, } = blockTagReqs[0];
                    try {
                        const res = (yield Promise.all(calls.map((call) => multicall.tryAggregate.staticCall(false, call, { blockTag })))).flat();
                        if (res.length !== callStructs.length)
                            throw new Error(`Unexpected multicall response length: received ${res.length}; expected ${callStructs.length}`);
                        blockTagReqs.forEach(({ index }, i) => {
                            results[index] = res[i].returnData;
                        });
                    }
                    catch (error) {
                        blockTagReqs.forEach(({ index }) => {
                            results[index] = error;
                        });
                    }
                })));
                return results;
            });
        }, {
            cache,
            cacheKeyFn: ({ call }) => (call.to + call.data + call.blockTag.toString()).toLowerCase(),
        });
        // Overload `Provider._perform`
        const _perform = provider._perform.bind(provider);
        multicallProvider._perform = function (req) {
            return __awaiter(this, void 0, void 0, function* () {
                if (req.method !== "call" || !this.isMulticallEnabled)
                    return _perform(req);
                const { transaction: { to, data }, blockTag, } = req;
                if (!to || !data || constants_1.multicallAddresses.has(to.toString().toLowerCase()))
                    return _perform(req);
                const network = yield this._detectNetwork();
                const blockNumber = (0, utils_1.getBlockNumber)(blockTag);
                const multicall = (0, utils_1.getMulticall)(blockNumber, Number(network.chainId), provider);
                if (multicall == null)
                    return _perform(req);
                const request = {
                    call: { to, data, blockTag, blockNumber },
                    multicall,
                };
                return dataLoader.load(request).then((value) => {
                    if (blockNumber == null)
                        dataLoader.clear(request);
                    return value;
                });
            });
        };
        return multicallProvider;
    }
}
exports.MulticallWrapper = MulticallWrapper;
exports.default = MulticallWrapper;
