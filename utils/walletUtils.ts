import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from 'ethers'
import { ENVIRONMENT, NODE_ENV_VAR_NAMES } from '../constants'
import { getEnvVar } from './envUtils'

const dummyKey =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

export async function getWallet(privateKey: string, provider: JsonRpcProvider) {
  return new Wallet(privateKey, provider)
}

export const getAccountKey = (): string => {
  const environment = process.env.NODE_ENV

  switch (environment) {
    case ENVIRONMENT.PRODUCTION:
      return getEnvVar(NODE_ENV_VAR_NAMES.MAINNET_KEY)
    case ENVIRONMENT.STAGING:
      return getEnvVar(NODE_ENV_VAR_NAMES.STAGING_KEY)
    case ENVIRONMENT.DEVELOPMENT:
      return getEnvVar(NODE_ENV_VAR_NAMES.DEV_KEY)
    case ENVIRONMENT.TESTING:
      return getEnvVar(NODE_ENV_VAR_NAMES.TESTING_KEY)
    default:
      throw new Error(`Unknown environment: ${environment}`)
  }
}
