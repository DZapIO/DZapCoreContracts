import * as dotenv from 'dotenv'

import { HardhatUserConfig } from 'hardhat/config'

import '@nomiclabs/hardhat-waffle'
import 'hardhat-gas-reporter'
import '@typechain/hardhat'
import 'hardhat-contract-sizer'
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
const scanApiKey: string = process.env.BSCSCAN_API_KEY || dummyApiKey

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    polygonMainnet: {
      chainId: 137,
      url: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [testnetKey],
    },
    polygonTestnet: {
      chainId: 80001,
      url: 'https://polygon-mumbai.g.alchemy.com/v2/xOgHYlzhaxkYwc3BUv_ut5J4JoOsldhN',
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
      ],
      flat: true,
      clear: true,
    },
  ],
}

export default config
