"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulticallWrapper = void 0;
var debounce_1 = __importDefault(require("lodash/debounce"));
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var MulticallWrapper = /** @class */ (function () {
    function MulticallWrapper() {
    }
    /**
     * Returns whether a given provider is a multicall-enabled provider.
     * @param provider The provider to check.
     * @returns A boolean indicating whether the given provider is a multicall-enabled provider.
     */
    MulticallWrapper.isMulticallProvider = function (provider) {
        if (provider._isMulticallProvider)
            return true;
        return false;
    };
    /**
     * Wraps a given ethers provider to enable automatic call batching.
     * @param provider The underlying provider to use to batch calls.
     * @param delay The delay (in milliseconds) to wait before performing the ongoing batch of calls. Defaults to 16ms.
     * @param maxMulticallDataLength The maximum total calldata length allowed in a multicall batch, to avoid having the RPC backend to revert because of too large (or too long) request. Set to 0 to disable this behavior. Defaults to 200k.
     * @returns The multicall provider, which is a proxy to the given provider, automatically batching any call performed with it.
     */
    MulticallWrapper.wrap = function (provider, delay, maxMulticallDataLength) {
        if (delay === void 0) { delay = 16; }
        if (maxMulticallDataLength === void 0) { maxMulticallDataLength = 200000; }
        if (!(0, utils_1.isProviderCompatible)(provider))
            throw Error("Cannot wrap provider for multicall");
        if (MulticallWrapper.isMulticallProvider(provider))
            return provider; // Do not overwrap when given provider is already a multicall provider.
        // Overload provider
        Object.defineProperties(provider, {
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
            multicallDelay: {
                get: function () {
                    return this._multicallDelay;
                },
                set: function (delay) {
                    var _a;
                    (_a = this._debouncedPerformMulticall) === null || _a === void 0 ? void 0 : _a.flush();
                    this._multicallDelay = delay;
                    this._debouncedPerformMulticall = (0, debounce_1.default)(this._performMulticall, delay);
                },
                enumerable: true,
                configurable: false,
            },
        });
        var multicallProvider = provider;
        // Define execution context
        var queuedCalls = [];
        multicallProvider._performMulticall = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _queuedCalls, blockTagCalls;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _queuedCalls = __spreadArray([], queuedCalls, true);
                            if (queuedCalls.length === 0)
                                return [2 /*return*/];
                            queuedCalls = [];
                            blockTagCalls = _queuedCalls.reduce(function (acc, queuedCall) {
                                var _a;
                                var _b;
                                var blockTag = queuedCall.blockTag.toString();
                                return __assign(__assign({}, acc), (_a = {}, _a[blockTag] = [queuedCall].concat((_b = acc[blockTag]) !== null && _b !== void 0 ? _b : []), _a));
                            }, {});
                            return [4 /*yield*/, Promise.all(Object.values(blockTagCalls).map(function (blockTagQueuedCalls) { return __awaiter(_this, void 0, void 0, function () {
                                    var callStructs, currentLength, calls, _a, blockTag, multicall, res_1, error_1;
                                    var _this = this;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                callStructs = blockTagQueuedCalls.map(function (_a) {
                                                    var to = _a.to, data = _a.data;
                                                    return ({
                                                        target: to,
                                                        callData: data,
                                                    });
                                                });
                                                currentLength = 0;
                                                calls = [[]];
                                                callStructs.forEach(function (callStruct) {
                                                    var newLength = currentLength + callStruct.callData.length;
                                                    if (_this.maxMulticallDataLength > 0 && newLength > _this.maxMulticallDataLength) {
                                                        currentLength = callStruct.callData.length;
                                                        calls.push([]);
                                                    }
                                                    else
                                                        currentLength = newLength;
                                                    calls[calls.length - 1].push(callStruct);
                                                });
                                                _a = blockTagQueuedCalls[0], blockTag = _a.blockTag, multicall = _a.multicall;
                                                _b.label = 1;
                                            case 1:
                                                _b.trys.push([1, 3, , 4]);
                                                return [4 /*yield*/, Promise.all(calls.map(function (call) { return multicall.callStatic.tryAggregate(false, call, { blockTag: blockTag }); }))];
                                            case 2:
                                                res_1 = (_b.sent()).flat();
                                                if (res_1.length !== callStructs.length)
                                                    throw new Error("Unexpected multicall response length: received ".concat(res_1.length, "; expected ").concat(callStructs.length));
                                                blockTagQueuedCalls.forEach(function (_a, i) {
                                                    var resolve = _a.resolve;
                                                    resolve(res_1[i].returnData);
                                                });
                                                return [3 /*break*/, 4];
                                            case 3:
                                                error_1 = _b.sent();
                                                blockTagQueuedCalls.forEach(function (_a) {
                                                    var reject = _a.reject;
                                                    reject(error_1);
                                                });
                                                return [3 /*break*/, 4];
                                            case 4: return [2 /*return*/];
                                        }
                                    });
                                }); }))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        // Overload multicall provider delay
        multicallProvider.multicallDelay = delay;
        // Overload `BaseProvider.perform`
        var _perform = provider.perform.bind(provider);
        multicallProvider.perform = function (method, params) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, to, data, blockTag, blockNumber, multicall;
                return __generator(this, function (_c) {
                    if (method !== "call" || !this.isMulticallEnabled)
                        return [2 /*return*/, _perform(method, params)];
                    _a = params, _b = _a.transaction, to = _b.to, data = _b.data, blockTag = _a.blockTag;
                    blockNumber = (0, utils_1.getBlockNumber)(blockTag);
                    multicall = (0, utils_1.getMulticall)(this.network.chainId, provider);
                    if (!to || !data || multicall == null || constants_1.multicallAddresses.has(to.toLowerCase()))
                        return [2 /*return*/, _perform(method, params)];
                    this._debouncedPerformMulticall();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            queuedCalls.push({
                                to: to,
                                data: data,
                                blockTag: blockTag,
                                multicall: multicall,
                                resolve: resolve,
                                reject: reject,
                            });
                        })];
                });
            });
        };
        return multicallProvider;
    };
    return MulticallWrapper;
}());
exports.MulticallWrapper = MulticallWrapper;
exports.default = MulticallWrapper;
