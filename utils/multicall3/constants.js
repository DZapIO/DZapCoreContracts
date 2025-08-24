"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multicall2DeploymentBlockNumbers = exports.multicall3DeploymentBlockNumbers = exports.multicall3ChainAddress = exports.multicallAddresses = exports.multicall3ZkSyncAddress = exports.multicall3Address = exports.multicall2Address = void 0;
// same address on all networks: https://github.com/mds1/multicall#multicall2-contract-addresses
exports.multicall2Address = "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696";
// same address on all networks: https://www.multicall3.com/deployments
exports.multicall3Address = "0xcA11bde05977b3631167028862bE2a173976CA11";
exports.multicall3ZkSyncAddress = "0xF9cda624FBC7e059355ce98a31693d299FACd963";
exports.multicall3MerlinAddress = "0xa8dcebad1ea2fcf86de386462c14d7629237cc88";
exports.dZapMulticall3 = "0xd74bAE15b413e0a90A7B2C1723F4A9c15cb49f73";
exports.multicall3LensAddress = "0x6b6dEa4D80e3077D076733A04c48F63c3BA49320";
exports.multicallAddresses = new Set([
    exports.multicall2Address.toLowerCase(),
    exports.multicall3Address.toLowerCase(),
    exports.multicall3ZkSyncAddress.toLowerCase(),
]);
exports.multicall3ChainAddress = {
    280: exports.multicall3ZkSyncAddress, // zkSync Era Goerli
    300: exports.multicall3ZkSyncAddress, // zkSync Era Sepolia
    324: exports.multicall3ZkSyncAddress, // zkSync Era
    2741: exports.multicall3ZkSyncAddress,  // zk abstract

    232: exports.multicall3LensAddress,  // zk lens
    4200: exports.multicall3MerlinAddress, // merlin
    5165: exports.dZapMulticall3,  // bahamut
    50: exports.dZapMulticall3, // xdc
};
exports.multicall3DeploymentBlockNumbers = {
    1: 14353601, // Mainnet
    3: 12063863, // Ropsten
    4: 10299530, // Rinkeby
    5: 6507670, // Goerli
    42: 30285908, // Kovan
    11155111: 751532, // Sepolia
    10: 4286263, // Optimism
    420: 49461, // Optimism Goerli
    42161: 7654707, // Arbitrum
    42170: 1746963, // Arbitrum Nova
    421613: 88114, // Arbitrum Goerli
    421611: 88114, // Arbitrum Rinkeby
    421614: 81930, // Arbitrum Sepolia
    137: 25770160, // Polygon
    146: 60, // Fantom Sonic
    80001: 25444704, // Polygon Mumbai
    100: 21022491, // Gnosis
    43114: 11907934, // Avalanche
    43113: 7096959, // Avalanche Fuji
    250: 33001987, // Fantom Opera
    4002: 8328688, // Fantom Testnet
    56: 15921452, // BSC
    97: 17422483, // BSC Tesnet
    1284: 609002, // Moonbeam
    1285: 1597904, // Moonriver
    1287: 1850686, // Moonbase Alpha Testnet
    1666600000: 24185753, // Harmony
    25: 1963112, // Cronos
    122: 16146628, // Fuse
    14: 3002461, // Flare
    280: 5885690, // zkSync Era Goerli
    300: 2292, // zkSync Era Sepolia
    324: 3908235, // zkSync Era
    1101: 57746, // Polygon zkEVM
    1442: 525686, // Polygon zkEVM Testnet
    8453: 5022, // Base
    84531: 1376988, // Base Testnet
    42220: 13112599, // Celo Mainnet
    42787: 14569001 // Celo Alfajores Testnet
};
exports.multicall2DeploymentBlockNumbers = {
    1: 12336033, // Mainnet
    3: 9894101, // Ropsten
    4: 8283206, // Rinkeby
    5: 4489716, // Goerli
    42: 24025820, // Kovan
};
