import * as dotenv from 'dotenv'

import { HardhatUserConfig } from 'hardhat/config'

import '@nomicfoundation/hardhat-verify'
import '@nomicfoundation/hardhat-chai-matchers'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'hardhat-contract-sizer'
import 'solidity-coverage'
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'
import 'hardhat-abi-exporter'

import './tasks/accounts'
import './tasks/clean'

dotenv.config()

const dummyApiKey = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'
const dummyKey =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

const mainnetKey: string = process.env.MAINNET_KEY || dummyKey
const testnetKey: string = process.env.TESTNET_KEY || dummyKey
const alchemyApiKey: string = process.env.ALCHEMY_API_KEY || dummyApiKey

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    mainnet: {
      chainId: 1,
      url: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [mainnetKey],
    },
    polygonMainnet: {
      chainId: 137,
      url: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [mainnetKey],
    },
    arbitrum: {
      chainId: 42161,
      url: `https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [mainnetKey],
    },
    optimism: {
      chainId: 10,
      url: `https://opt-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [mainnetKey],
    },
    bscMainnet: {
      chainId: 56,
      url: 'https://bscrpc.com',
      accounts: [mainnetKey],
    },
    avalanche: {
      chainId: 43114,
      url: `https://api.avax.network/ext/bc/C/rpc`,
      accounts: [mainnetKey],
    },
    scroll: {
      chainId: 534352,
      url: `https://rpc.scroll.io`,
      accounts: [mainnetKey],
    },
    base: {
      chainId: 8453,
      url: `https://mainnet.base.org`,
      accounts: [mainnetKey],
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
        'IDZapDiamond',
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
        'CrossChainFacet',
        'Executor',
        'Receiver',
      ],
      flat: true,
      clear: true,
    },
    {
      runOnCompile: true,
      path: 'data/abi/pretty',
      format: 'fullName',
      only: [
        'IDZapDiamond',
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
        'CrossChainFacet',
        'Executor',
        'Receiver',
      ],
      flat: true,
      clear: true,
    },
  ],
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || dummyApiKey,
      polygon: process.env.POLYGONSCAN_API_KEY || dummyApiKey,
      bsc: process.env.BSCSCAN_API_KEY || dummyApiKey,
      arbitrumOne: process.env.ARBITRUM_API_KEY || dummyApiKey,
      optimisticEthereum: process.env.OPTIMISM_API_KEY || dummyApiKey,
      avalanche: 'avalanche',
      base: process.env.BASE_API_KEY || dummyApiKey,
      scroll: process.env.SCROLL_API_KEY || dummyApiKey,
    },
    customChains: [
      {
        network: 'avalanche',
        chainId: 43114,
        urls: {
          apiURL:
            'https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan',
          browserURL: 'https://avalanche.routescan.io',
        },
      },
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
    ],
  },
  sourcify: {
    enabled: true,
  },
}

export default config
