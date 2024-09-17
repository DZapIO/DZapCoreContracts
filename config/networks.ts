export enum NETWORK_NAMES {
  ETH_MAINNET = 'ETH_MAINNET',
  ETH_RINKEBY = 'ETH_RINKEBY',
  ETH_KOVAN = 'ETH_KOVAN',
  BSC_MAINNET = 'BSC_MAINNET',
  BSC_TESTNET = 'BSC_TESTNET',
  POLYGON_MAINNET = 'POLYGON_MAINNET',
  POLYGON_MUMBAI = 'POLYGON_MUMBAI',
  POLYGON_ZK_EVM_MAINNET = 'POLYGON_ZK_EVM_MAINNET',
  POLYGON_ZK_EVM_TESTNET = 'POLYGON_ZK_EVM_TESTNET',
  AVALANCHE_MAINNET = 'AVALANCHE_MAINNET',
  AVALANCHE_TESTNET = 'AVALANCHE_TESTNET',
  HECO_MAINNET = 'HECO_MAINNET',
  HECO_TESTNET = 'HECO_TESTNET',
  OKEX_MAINNET = 'OKEX_MAINNET',
  OKEX_TESTNET = 'OKEX_TESTNET',
  BOBA_ETH = 'BOBA_ETH',
  BOBA_BNB = 'BOBA_BNB',
  BOBA_AVALANCHE = 'BOBA_AVALANCHE',
  BOBA_RINKEBY = 'BOBA_RINKEBY',
  MILKOMEDA_MAINNET = 'MILKOMEDA_MAINNET',
  MILKOMEDA_DEVNET = 'MILKOMEDA_DEVNET',
  BTC_MAINNET = 'BTC_MAINNET',
  BTC_MUTINY = 'BTC_MUTINY',
  BTC_TESTNET4 = 'BTC_TESTNET4',
  AURORA_MAINNET = 'AURORA_MAINNET',
  AURORA_TESTNET = 'AURORA_TESTNET',
  TELOS_MAINNET = 'TELOS_MAINNET',
  TELOS_TESTNET = 'TELOS_TESTNET',
  SHARDEUM_TESTNET_2 = 'SHARDEUM_TESTNET_2',
  KAVA_MAINNET = 'KAVA_MAINNET',
  SCROLL_SEPOLIA = 'SCROLL_SEPOLIA',
  SEPOLIA_TESTNET = 'SEPOLIA_TESTNET',
  ZKSYNC_MAINNET = 'ZKSYNC_MAINNET',
  ARBITRUM_MAINNET = 'ARBITRUM_MAINNET',
  ARBITRUM_NOVA = 'ARBITRUM_NOVA',
  OPTIMISM_MAINNET = 'OPTIMISM_MAINNET',
  ZETACHAIN_ATHENS_2 = 'ZETACHAIN_ATHENS_2',
  POLYGON_ZK = 'POLYGON_ZK',
  TRON_MAINNET = 'TRON_MAINNET',
  TRON_TESTNET = 'TRON_TESTNET',
  LINEA_TESTNET = 'LINEA_TESTNET',
  LINEA_MAINNET = 'LINEA_MAINNET',
  MANTLE_MAINNET = 'MANTLE_MAINNET',
  MANTLE_TESTNET = 'MANTLE_TESTNET',
  BASE_MAINNET = 'BASE_MAINNET',
  SCROLL_MAINNET = 'SCROLL_MAINNET',
  MANTA_MAINNET = 'MANTA_MAINNET',
  METIS_MAINNET = 'METIS_MAINNET',
  OKX_X1_TESTNET = 'OKX_X1_TESTNET',
  BAHAMUT_MAINNET = 'BAHAMUT_MAINNET',
  MODE_MAINNET = 'MODE_MAINNET',
  ROOTSTOCK_MAINNET = 'ROOTSTOCK_MAINNET',
  BLAST_MAINNET = 'BLAST_MAINNET',
  MERLIN_MAINNET = 'MERLIN_MAINNET',
  ZKLINK_MAINNET = 'ZKLINK_MAINNET',
  CORE_MAINNET = 'CORE_MAINNET',
  TON_MAINNET = 'TON_MAINNET',
  TAIKO_MAINNET = 'TAIKO_MAINNET',
  SEI_EVM_MAINNET = 'SEI_EVM_MAINNET',
  ZETACHAIN_MAINNET = 'ZETACHAIN_MAINNET',
  CRONOS_MAINNET = 'CRONOS_MAINNET',
  BOB_MAINNET = 'BOB_MAINNET',
  BEVM_MAINNET = 'BEVM_MAINNET',
  GNOSIS_MAINNET = 'GNOSIS_MAINNET',
  OPBNB_MAINNET = 'OPBNB_MAINNET',
  FANTOM_MAINNET = 'FANTOM_MAINNET',
  CONFLUX_E_SPACE_MAINNET = 'CONFLUX_E_SPACE_MAINNET',
  X_LAYER_MAINNET = 'X_LAYER_MAINNET',
  X_LAYER_TESTNET = 'X_LAYER_TESTNET',
  HARDHAT = 'HARDHAT',
  GANACHE = 'GANACHE',
  FRAXTAL = 'FRAXTAL',
}

export enum RPC_TYPE {
  ALCHEMY,
  INFURA,
  OTHER,
}

export enum CHAIN_IDS {
  ARBITRUM_MAINNET = 42161,
  ARBITRUM_NOVA = 42170,
  AURORA_MAINNET = 1313161554,
  AURORA_TESTNET = 1313161555,
  AVALANCHE_MAINNET = 43114,
  AVALANCHE_TESTNET = 43113,
  BAHAMUT_MAINNET = 5165,
  BASE_MAINNET = 8453,
  BEVM_MAINNET = 11501,
  BITLAYER_MAINNET = 200901,
  BLAST_MAINNET = 81457,
  BOB_MAINNET = 60808,
  BOBA_AVALANCHE = 43288,
  BOBA_BNB = 56288,
  BOBA_ETH = 288,
  BOBA_RINKEBY = 28,
  BSC_MAINNET = 56,
  BSC_TESTNET = 97,
  BTC_MAINNET = 3652501241,
  BTC_MUTINY = 2782866891,
  BTC_TESTNET4 = 675223068,
  CELO_MAINNET = 42220,
  CONFLUX_E_SPACE_MAINNET = 1030,
  CONFLUX_E_SPACE_TESTNET = 71,
  CORE_MAINNET = 1116,
  CRONOS_MAINNET = 25,
  DOGECHAIN_MAINNET = 2000,
  ETH_KOVAN = 42,
  ETH_MAINNET = 1,
  ETH_RINKEBY = 4,
  FANTOM_MAINNET = 250,
  FILECOIN_MAINNET = 314,
  FIRE_MAINNET = 995,
  GANACHE = 1337,
  GNOSIS_MAINNET = 100,
  HARDHAT = 31337,
  HECO_MAINNET = 128,
  HECO_TESTNET = 256,
  KAVA_MAINNET = 2222,
  KYOTO_MAINNET = 1997,
  LINEA_MAINNET = 59144,
  LINEA_TESTNET = 59140,
  LISK_MAINNET = 1135,
  MANTA_MAINNET = 169,
  MANTLE_MAINNET = 5000,
  MANTLE_TESTNET = 5001,
  MERLIN_MAINNET = 4200,
  METIS_MAINNET = 1088,
  MILKOMEDA_DEVNET = 200101,
  MILKOMEDA_MAINNET = 2001,
  MODE_MAINNET = 34443,
  MOONBEAM_MAINNET = 1284,
  MOONRIVER = 1285,
  OASIS_SAPPHIRE_MAINNET = 23294,
  OKEX_TESTNET = 65,
  OKX_MAINNET = 66,
  OKX_X1_TESTNET = 195,
  OPBNB_MAINNET = 204,
  OPTIMISM_MAINNET = 10,
  POLYGON_MAINNET = 137,
  POLYGON_MUMBAI = 80001,
  POLYGON_ZK = 1101,
  POLYGON_ZK_EVM_MAINNET = 1101,
  POLYGON_ZK_EVM_TESTNET = 1442,
  ROOLUX_MAINNET = 570,
  ROOTSTOCK_MAINNET = 30,
  SAAKURU_MAINNET = 7225878,
  SCROLL_MAINNET = 534352,
  SCROLL_SEPOLIA = 534351,
  SEI_EVM_MAINNET = 1329,
  SEPOLIA_TESTNET = 11155111,
  SHARDEUM_TESTNET_2 = 8081,
  TAIKO_MAINNET = 167000,
  TELOS_MAINNET = 40,
  TELOS_TESTNET = 41,
  TON_MAINNET = 8888888,
  TRON_MAINNET = 728126428,
  TRON_TESTNET = 2494104990,
  ZETACHAIN_ATHENS_2 = 7001,
  ZETACHAIN_MAINNET = 7000,
  ZKLINK_MAINNET = 810180,
  ZKSYNC_MAINNET = 324,
  ZKSYNC_SEPOLIA_TESTNET = 300,
  X_LAYER_MAINNET = 196,
  X_LAYER_TESTNET = 195,
  FRAXTAL = 252,
}

export const NETWORKS = {
  [CHAIN_IDS.ARBITRUM_MAINNET]: {
    chainId: CHAIN_IDS.ARBITRUM_MAINNET,
    rpcUrl: 'https://arb-mainnet.g.alchemy.com/v2',
    rpcType: RPC_TYPE.ALCHEMY,
  },
  [CHAIN_IDS.AVALANCHE_MAINNET]: {
    chainId: CHAIN_IDS.AVALANCHE_MAINNET,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.BASE_MAINNET]: {
    chainId: CHAIN_IDS.BASE_MAINNET,
    rpcUrl: 'https://base-mainnet.g.alchemy.com/v2',
    rpcType: RPC_TYPE.ALCHEMY,
  },
  [CHAIN_IDS.BLAST_MAINNET]: {
    chainId: CHAIN_IDS.BLAST_MAINNET,
    rpcUrl: 'https://rpc.blast.io',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.BSC_MAINNET]: {
    chainId: CHAIN_IDS.BSC_MAINNET,
    rpcUrl: 'https://bscrpc.com',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.BSC_TESTNET]: {
    chainId: CHAIN_IDS.BSC_TESTNET,
    rpcUrl: 'https://bsc-testnet.public.blastapi.io',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.CELO_MAINNET]: {
    chainId: CHAIN_IDS.CELO_MAINNET,
    rpcUrl: 'https://forno.celo.org',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.CORE_MAINNET]: {
    chainId: CHAIN_IDS.CORE_MAINNET,
    rpcUrl: 'https://rpc.coredao.org/',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.ETH_MAINNET]: {
    chainId: CHAIN_IDS.ETH_MAINNET,
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2',
    rpcType: RPC_TYPE.ALCHEMY,
  },
  [CHAIN_IDS.GANACHE]: {
    chainId: CHAIN_IDS.GANACHE,
    rpcUrl: '',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.HARDHAT]: {
    chainId: CHAIN_IDS.HARDHAT,
    rpcUrl: '',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.LINEA_MAINNET]: {
    chainId: CHAIN_IDS.LINEA_MAINNET,
    rpcUrl: 'https://rpc.linea.build ',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.MANTA_MAINNET]: {
    chainId: CHAIN_IDS.MANTA_MAINNET,
    rpcUrl: 'https://pacific-rpc.manta.network/http',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.MANTLE_MAINNET]: {
    chainId: CHAIN_IDS.MANTLE_MAINNET,
    rpcUrl: 'https://mantle-rpc.publicnode.com',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.METIS_MAINNET]: {
    chainId: CHAIN_IDS.METIS_MAINNET,
    rpcUrl: 'https://metis-pokt.nodies.app',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.MODE_MAINNET]: {
    chainId: CHAIN_IDS.MODE_MAINNET,
    rpcUrl: 'https://mainnet.mode.network',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.OPTIMISM_MAINNET]: {
    chainId: CHAIN_IDS.OPTIMISM_MAINNET,
    rpcUrl: 'https://opt-mainnet.g.alchemy.com/v2',
    rpcType: RPC_TYPE.ALCHEMY,
  },
  [CHAIN_IDS.POLYGON_MAINNET]: {
    chainId: CHAIN_IDS.POLYGON_MAINNET,
    rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2',
    rpcType: RPC_TYPE.ALCHEMY,
  },
  [CHAIN_IDS.POLYGON_ZK_EVM_MAINNET]: {
    chainId: CHAIN_IDS.POLYGON_ZK_EVM_MAINNET,
    rpcUrl: 'https://zkevm-rpc.com',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.ROOTSTOCK_MAINNET]: {
    chainId: CHAIN_IDS.ROOTSTOCK_MAINNET,
    rpcUrl: 'https://public-node.rsk.co',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.SCROLL_MAINNET]: {
    chainId: CHAIN_IDS.SCROLL_MAINNET,
    rpcUrl: 'https://rpc.scroll.io',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.SEPOLIA_TESTNET]: {
    chainId: CHAIN_IDS.SEPOLIA_TESTNET,
    rpcUrl: 'https://rpc.sepolia.org',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.TAIKO_MAINNET]: {
    chainId: CHAIN_IDS.TAIKO_MAINNET,
    rpcUrl: 'https://rpc.mainnet.taiko.xyz',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.TELOS_MAINNET]: {
    chainId: CHAIN_IDS.TELOS_MAINNET,
    rpcUrl: 'https://mainnet15.telos.net/evm',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.X_LAYER_MAINNET]: {
    chainId: CHAIN_IDS.X_LAYER_MAINNET,
    rpcUrl: 'https://xlayerrpc.okx.com',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.ZKSYNC_MAINNET]: {
    chainId: CHAIN_IDS.ZKSYNC_MAINNET,
    rpcUrl: 'https://mainnet.era.zksync.io',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.ZKSYNC_SEPOLIA_TESTNET]: {
    chainId: CHAIN_IDS.ZKSYNC_SEPOLIA_TESTNET,
    rpcUrl: 'https://sepolia.era.zksync.dev',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.FIRE_MAINNET]: {
    chainId: CHAIN_IDS.FIRE_MAINNET,
    rpcUrl: 'https://rpc.5ire.network',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.ZETACHAIN_MAINNET]: {
    chainId: CHAIN_IDS.ZETACHAIN_MAINNET,
    rpcUrl: 'https://zetachain-mainnet.public.blastapi.io',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.BOBA_ETH]: {
    chainId: CHAIN_IDS.BOBA_ETH,
    rpcUrl: 'https://mainnet.boba.network',
    rpcType: RPC_TYPE.OTHER,
  },
  [CHAIN_IDS.FRAXTAL]: {
    chainId: CHAIN_IDS.FRAXTAL,
    rpcUrl: 'https://rpc.frax.com',
    rpcType: RPC_TYPE.OTHER,
  },
}
