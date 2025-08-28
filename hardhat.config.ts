import * as dotenv from 'dotenv'

import { HardhatUserConfig } from 'hardhat/config'

import '@nomicfoundation/hardhat-chai-matchers'
import '@nomicfoundation/hardhat-verify'
import '@typechain/hardhat'
import 'hardhat-contract-sizer'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import 'hardhat-abi-exporter'

// zk
import '@matterlabs/hardhat-zksync-deploy'
import '@matterlabs/hardhat-zksync-solc'

import './tasks/accounts'
import './tasks/clean'

dotenv.config()

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
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
    ],
  },
  zksolc: {
    version: '1.5.12',
    compilerSource: 'binary',
    settings: {
      enableEraVMExtensions: true,
      optimizer: {
        enabled: true,
        mode: 'z',
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
        'WithdrawFacet',
        'AccessManagerFacet',
        'GlobalConfigFacet',
        'Permit2ManagerFacet',
        'WhitelistingManagerFacet',
        'SwapFacet',
        'BridgeFacet',
        'GasLessFacet',
        'GenericBridgeAdapter',
        'DirectTransferAdapter',
        'GasZipAdapter',
        'RelayBridgeAdapter',
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
        'WithdrawFacet',
        'AccessManagerFacet',
        'GlobalConfigFacet',
        'Permit2ManagerFacet',
        'WhitelistingManagerFacet',
        'SwapFacet',
        'BridgeFacet',
        'GasLessFacet',
        'GenericBridgeAdapter',
        'DirectTransferAdapter',
        'GasZipAdapter',
        'RelayBridgeAdapter',
      ],
      flat: true,
      clear: true,
    },
  ],
}

export default config
