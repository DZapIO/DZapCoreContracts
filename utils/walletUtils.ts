import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from 'ethers'

const dummyKey =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

export async function getWallet(privateKey: string, provider: JsonRpcProvider) {
  return new Wallet(privateKey, provider)
}

export const getAccountKey = (): string => {
  const environment = process.env.NODE_ENV

  switch (environment) {
    case 'production':
      if (!process.env.MAINNET_KEY) {
        throw new Error('MAINNET_KEY is not defined in production environment')
      }
      return process.env.MAINNET_KEY
    case 'staging':
      if (!process.env.STAGING_KEY) {
        throw new Error('STAGING_KEY is not defined in staging environment')
      }
      return process.env.STAGING_KEY
    case 'development':
      // if (!process.env.DEV_KEY) {
      //   throw new Error('TESTNET_KEY is not defined in development environment')
      // }
      return process.env.DEV_KEY || dummyKey
    default:
      throw new Error(`Unknown environment: ${environment}`)
  }
}
