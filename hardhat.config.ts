import * as dotenv from 'dotenv'

import { HardhatUserConfig } from 'hardhat/config'

import '@nomiclabs/hardhat-etherscan'
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

dotenv.config()

const dummyApiKey = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'
const dummyKey =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

const mainnetKey: string = process.env.MAINNET_KEY || dummyKey
const testnetKey: string = process.env.TESTNET_KEY || dummyKey
const testnetKeyOld: string = process.env.TESTNET_KEY_OLD || dummyKey
const alchemyApiKey: string = process.env.ALCHEMY_API_KEY || dummyApiKey
const scanApiKey: string = process.env.BSCSCAN_API_KEY || dummyApiKey

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    mainnet: {
      chainId: 1,
      url: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [testnetKey],
    },
    polygonMainnet: {
      chainId: 137,
      url: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [testnetKey],
    },
    polygonTestnet: {
      chainId: 80001,
      url: `https://rpc-mumbai.maticvigil.com`,
      accounts: [testnetKey],
    },
    arbitrum: {
      chainId: 42161,
      url: `https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [testnetKey],
    },
    optimism: {
      chainId: 10,
      url: `https://opt-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [testnetKey],
    },
    bscMainnet: {
      chainId: 56,
      url: 'https://bscrpc.com',
      accounts: [testnetKey],
    },
    avalanche: {
      chainId: 43114,
      url: `https://api.avax.network/ext/bc/C/rpc`,
      accounts: [testnetKey],
    },
    scroll: {
      chainId: 534352,
      url: `https://rpc.scroll.io`,
      accounts: [testnetKey],
    },
    base: {
      chainId: 8453,
      url: `https://mainnet.base.org`,
      accounts: [testnetKey],
    },
    zk: {
      chainId: 324,
      url: `https://mainnet.era.zksync.io`,
      accounts: [testnetKey],
    },
    mantel: {
      chainId: 5000,
      url: `https://mantle-rpc.publicnode.com`,
      accounts: [testnetKey],
    },
    manta: {
      chainId: 169,
      url: `https://pacific-rpc.manta.network/http`,
      accounts: [testnetKey],
    },
    blast: {
      chainId: 81457,
      url: `https://mantle-rpc.publicnode.com`,
      accounts: [testnetKey],
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
        'BatchBridgeCallFacet',
        'BridgeDynamicTransferFacet',
        'BridgeManagerFacet',
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
        'CrossChainFacet',
        'BatchBridgeCallFacet',
        'BridgeDynamicTransferFacet',
        'BridgeManagerFacet',
      ],
      flat: true,
      clear: true,
    },
  ],
}

export default config
