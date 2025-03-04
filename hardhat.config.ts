import * as dotenv from 'dotenv'

import { HardhatUserConfig } from 'hardhat/config'

import '@matterlabs/hardhat-zksync-deploy'
import '@matterlabs/hardhat-zksync-solc'
import '@matterlabs/hardhat-zksync-verify'
import '@nomicfoundation/hardhat-chai-matchers'
import '@nomicfoundation/hardhat-verify'
import '@openzeppelin/hardhat-upgrades'
import '@typechain/hardhat'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

import { CHAIN_IDS } from './config/networks'
import './tasks/accounts'
import './tasks/clean'
import {
  getNetworkConfig,
  getRpcUrl,
  getVerificationConfig,
} from './utils/network'

dotenv.config()

const supportedNetworks = [
  CHAIN_IDS.ETH_MAINNET,
  CHAIN_IDS.ARBITRUM_MAINNET,
  CHAIN_IDS.OPTIMISM_MAINNET,
  CHAIN_IDS.ZKSYNC_MAINNET,
  CHAIN_IDS.BASE_MAINNET,
  CHAIN_IDS.POLYGON_MAINNET,
  CHAIN_IDS.BSC_MAINNET,
  CHAIN_IDS.AVALANCHE_MAINNET,
  CHAIN_IDS.MANTA_MAINNET,
  CHAIN_IDS.SCROLL_MAINNET,
  CHAIN_IDS.LINEA_MAINNET,
  CHAIN_IDS.MANTLE_MAINNET,
  CHAIN_IDS.TELOS_MAINNET,
  CHAIN_IDS.CORE_MAINNET,
  CHAIN_IDS.ROOTSTOCK_MAINNET,
  CHAIN_IDS.X_LAYER_MAINNET,
  CHAIN_IDS.POLYGON_ZK_EVM_MAINNET,
  CHAIN_IDS.MODE_MAINNET,
  CHAIN_IDS.METIS_MAINNET,
  CHAIN_IDS.CELO_MAINNET,
  CHAIN_IDS.ZETACHAIN_MAINNET,
  CHAIN_IDS.BLAST_MAINNET,
  CHAIN_IDS.BOBA_ETH,
  CHAIN_IDS.FRAXTAL,
  CHAIN_IDS.GRAVITY,
  CHAIN_IDS.GNOSIS_MAINNET,
  CHAIN_IDS.FUSE,
  CHAIN_IDS.FANTOM_MAINNET,
  CHAIN_IDS.MOONBEAM_MAINNET,
  CHAIN_IDS.MOONRIVER,
  CHAIN_IDS.CRONOS_MAINNET,
  CHAIN_IDS.KAVA_MAINNET,
  CHAIN_IDS.KROMA,
  CHAIN_IDS.AURORA_MAINNET,
  CHAIN_IDS.MINT,
  CHAIN_IDS.ARTHERA,
  CHAIN_IDS.TAIKO_MAINNET,
  CHAIN_IDS.FIRE_MAINNET,
  CHAIN_IDS.BERA_CHAIN_MAINNET,
  CHAIN_IDS.SONIC_MAINNET,
  CHAIN_IDS.MORPH,
  CHAIN_IDS.MERLIN_MAINNET,
]

const networkConfig = getNetworkConfig(supportedNetworks)
const verificationConfig = getVerificationConfig(supportedNetworks)

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  // defaultNetwork: 'zkMainnet',
  networks: {
    ...networkConfig,
    zkTestnet: {
      url: getRpcUrl(CHAIN_IDS.ZKSYNC_SEPOLIA_TESTNET),
      ethNetwork: 'sepolia',
      zksync: true,
    },
    zkMainnet: {
      url: getRpcUrl(CHAIN_IDS.ZKSYNC_MAINNET),
      ethNetwork: 'mainnet',
      zksync: true,
    },
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
    ...verificationConfig.etherscan,
    enabled: true,
  },
  blockscout: {
    ...verificationConfig.blockscout,
    enabled: true,
  },
  sourcify: {
    enabled: true,
    // apiUrl: "https://sourcify.dev/server",
    // browserUrl: "https://repo.sourcify.dev",
  },
}

export default config
