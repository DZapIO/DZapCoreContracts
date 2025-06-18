"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// same address on all networks: https://www.multicall3.com/deployments
exports.multicall3Address = "0xcA11bde05977b3631167028862bE2a173976CA11";
exports.multicall3ZkSyncAddress = "0xF9cda624FBC7e059355ce98a31693d299FACd963";
exports.multicall3MerlinAddress = "0xa8dcebad1ea2fcf86de386462c14d7629237cc88";
exports.dZapMulticall3 = "0xd74bAE15b413e0a90A7B2C1723F4A9c15cb49f73";
exports.multicall3LensAddress = "0x6b6dEa4D80e3077D076733A04c48F63c3BA49320";
exports.multicallAddresses = new Set([
    exports.multicall3Address.toLowerCase(),
    exports.multicall3MerlinAddress.toLowerCase(),
    exports.multicall3ZkSyncAddress.toLowerCase(),
]);
exports.multicall3ChainAddress = {
    280: exports.multicall3ZkSyncAddress,
    324: exports.multicall3ZkSyncAddress, // zkSync Era
    4200: exports.multicall3MerlinAddress, // zkSync Era
    5165: exports.dZapMulticall3, 
    2741: exports.multicall3ZkSyncAddress,  // abstract
    232: exports.multicall3LensAddress,  // lens
};
exports.multicall3DeploymentBlockNumbers = {
    1: 14353601,
    3: 12063863,
    4: 10299530,
    5: 6507670,
    42: 30285908,
    11155111: 751532,
    10: 4286263,
    420: 49461,
    42161: 7654707,
    42170: 1746963,
    421613: 88114,
    421611: 88114,
    137: 25770160,
    80001: 25444704,
    100: 21022491,
    43114: 11907934,
    43113: 7096959,
    250: 33001987,
    4002: 8328688,
    56: 15921452,
    97: 17422483,
    1284: 609002,
    1285: 1597904,
    1287: 1850686,
    1666600000: 24185753,
    25: 1963112,
    122: 16146628,
    14: 3002461,
    280: 5885690,
    324: 3908235, // zkSync Era
    4200: 11997883,
};
