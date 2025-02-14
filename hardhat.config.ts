import * as dotenv from 'dotenv'

import { HardhatUserConfig } from 'hardhat/config'

import '@matterlabs/hardhat-zksync-verify'
import '@matterlabs/hardhat-zksync-deploy'
import '@matterlabs/hardhat-zksync-solc'
import '@nomicfoundation/hardhat-verify'
import '@nomicfoundation/hardhat-chai-matchers'
import '@openzeppelin/hardhat-upgrades'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'hardhat-contract-sizer'
import 'solidity-coverage'
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'
import 'hardhat-abi-exporter'

import './tasks/accounts'
import './tasks/clean'
import { getNetworkConfig, getRpcUrl } from './utils/network'
import { CHAIN_IDS } from './config/networks'

dotenv.config()

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  // defaultNetwork: 'zkTestnet',
  networks: {
    ethereum: getNetworkConfig(CHAIN_IDS.ETH_MAINNET),
    polygon: getNetworkConfig(CHAIN_IDS.POLYGON_MAINNET),
    blast: getNetworkConfig(CHAIN_IDS.BLAST_MAINNET),
    bsc: getNetworkConfig(CHAIN_IDS.BSC_MAINNET),
    arbitrumOne: getNetworkConfig(CHAIN_IDS.ARBITRUM_MAINNET),
    optimism: getNetworkConfig(CHAIN_IDS.OPTIMISM_MAINNET),
    avalanche: getNetworkConfig(CHAIN_IDS.AVALANCHE_MAINNET),
    base: getNetworkConfig(CHAIN_IDS.BASE_MAINNET),
    manta: getNetworkConfig(CHAIN_IDS.MANTA_MAINNET),
    scroll: getNetworkConfig(CHAIN_IDS.SCROLL_MAINNET),
    telos: getNetworkConfig(CHAIN_IDS.TELOS_MAINNET),
    core: getNetworkConfig(CHAIN_IDS.CORE_MAINNET),
    rootstock: getNetworkConfig(CHAIN_IDS.ROOTSTOCK_MAINNET),
    mantle: getNetworkConfig(CHAIN_IDS.MANTLE_MAINNET),
    linea: getNetworkConfig(CHAIN_IDS.LINEA_MAINNET),
    xlayer: getNetworkConfig(CHAIN_IDS.X_LAYER_MAINNET),
    zkSync: getNetworkConfig(CHAIN_IDS.ZKSYNC_MAINNET),
    polygonZk: getNetworkConfig(CHAIN_IDS.POLYGON_ZK_EVM_MAINNET),
    mode: getNetworkConfig(CHAIN_IDS.MODE_MAINNET),
    metis: getNetworkConfig(CHAIN_IDS.METIS_MAINNET),
    celo: getNetworkConfig(CHAIN_IDS.CELO_MAINNET),
    taiko: getNetworkConfig(CHAIN_IDS.TAIKO_MAINNET),
    fire: getNetworkConfig(CHAIN_IDS.FIRE_MAINNET),
    zeta: getNetworkConfig(CHAIN_IDS.ZETACHAIN_MAINNET),
    bobaEth: getNetworkConfig(CHAIN_IDS.BOBA_ETH),
    fraxtal: getNetworkConfig(CHAIN_IDS.FRAXTAL),
    gravity: getNetworkConfig(CHAIN_IDS.GRAVITY),
    arthera: getNetworkConfig(CHAIN_IDS.ARTHERA),
    gnosis: getNetworkConfig(CHAIN_IDS.GNOSIS_MAINNET),
    fuse: getNetworkConfig(CHAIN_IDS.FUSE),
    fantom: getNetworkConfig(CHAIN_IDS.FANTOM_MAINNET),
    moonbeam: getNetworkConfig(CHAIN_IDS.MOONBEAM_MAINNET),
    moonriver: getNetworkConfig(CHAIN_IDS.MOONRIVER),
    cronos: getNetworkConfig(CHAIN_IDS.CRONOS_MAINNET),
    aurora: getNetworkConfig(CHAIN_IDS.AURORA_MAINNET),
    kava: getNetworkConfig(CHAIN_IDS.KAVA_MAINNET),
    zkfair: getNetworkConfig(CHAIN_IDS.ZKFAIR),
    kroma: getNetworkConfig(CHAIN_IDS.KROMA),
    sei: getNetworkConfig(CHAIN_IDS.SEI_EVM_MAINNET),
    zklink: getNetworkConfig(CHAIN_IDS.ZKLINK_MAINNET),
    velas: getNetworkConfig(CHAIN_IDS.VELAS),
    filecoin: getNetworkConfig(CHAIN_IDS.FILECOIN_MAINNET),
    mint: getNetworkConfig(CHAIN_IDS.MINT),
    morph: getNetworkConfig(CHAIN_IDS.MORPH),
    ontology: getNetworkConfig(CHAIN_IDS.ONTOLOGY),
    merlin: getNetworkConfig(CHAIN_IDS.MERLIN_MAINNET),
  },
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: {
          optimizer: {
            enabled: true,
            runs: 300,
          },
          viaIR: true,
        },
      },
      {
        version: '0.8.23',
        settings: {
          optimizer: {
            enabled: true,
            runs: 300,
          },
          viaIR: true,
        },
      },
      {
        version: '0.4.18',
        settings: {
          optimizer: {
            enabled: true,
            runs: 300,
          },
        },
      },
    ],
  },
  zksolc: {
    version: 'latest',
    compilerSource: 'binary',
    settings: {
      optimizer: {
        enabled: true,
        mode: '3',
      },
    },
  },
  mocha: {
    timeout: 400000,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  abiExporter: [
    {
      runOnCompile: true,
      path: 'data/abi/full',
      only: [
        'DZapDiamond',
        'DiamondCutFacet',
        'DiamondInit',
        'DiamondLoupeFacet',
        'OwnershipFacet',
        'AccessManagerFacet',
        'DexManagerFacet',
        'FeesFacet',
        'WithdrawFacet',
        'SwapFacet',
        'BatchSwapFacet',
        'SwapTransferFacet',
        'CrossChainFacet',
        'BatchBridgeCallFacet',
        'BridgeDynamicTransferFacet',
        'BridgeManagerFacet',
        'RelayBridgeFacet',
        'GasZipFacet',
        'DynamicBatchBridgeCallFacet',
        'IBridgeAdapter',
      ],
      flat: true,
      clear: true,
    },
    {
      runOnCompile: true,
      path: 'data/abi/pretty',
      format: 'fullName',
      only: [
        'DZapDiamond',
        'DiamondCutFacet',
        'DiamondInit',
        'DiamondLoupeFacet',
        'OwnershipFacet',
        'AccessManagerFacet',
        'DexManagerFacet',
        'FeesFacet',
        'WithdrawFacet',
        'SwapFacet',
        'SwapTransferFacet',
        'SwapFacetTransfer',
        'CrossChainFacet',
        'BatchBridgeCallFacet',
        'BridgeDynamicTransferFacet',
        'BridgeManagerFacet',
        'RelayBridgeFacet',
        'GasZipFacet',
        'DynamicBatchBridgeCallFacet',
        'IBridgeAdapter',
      ],
      flat: true,
      clear: true,
    },
  ],
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || '',
      bsc: process.env.BSCSCAN_API_KEY || '',
      polygon: process.env.POLYGONSCAN_API_KEY || '',
      arbitrumOne: process.env.ARBITRUM_API_KEY || '',
      optimisticEthereum: process.env.OPTIMISM_API_KEY || '',
      base: process.env.BASE_API_KEY || '',
      scroll: process.env.SCROLL_API_KEY || '',
      core: process.env.CORE_API_KEY || '',
    },
    customChains: [
      {
        network: 'base',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org/',
        },
      },
      {
        network: 'scroll',
        chainId: 534352,
        urls: {
          apiURL: 'https://api.scrollscan.com/api',
          browserURL: 'https://scrollscan.com/',
        },
      },
      {
        network: 'core',
        chainId: 1116,
        urls: {
          apiURL: 'https://openapi.coredao.org/api',
          browserURL: 'https://scan.coredao.org/',
        },
      },
    ],
  },
}

export default config
