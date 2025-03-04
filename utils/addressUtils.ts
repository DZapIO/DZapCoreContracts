import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from 'ethers'
import { getAddress } from 'ethers/lib/utils'
import {
  DZAP_ADDRESS,
  DZAP_STAGING_ADDRESS,
} from '../config/deployment/deployment'

export const isAddressSame = (addressA: string, addressB: string) => {
  return getAddress(addressA) == getAddress(addressB)
}

export const getDZapAddress = (chainId: number) => {
  const environment = process.env.NODE_ENV
  switch (environment) {
    case 'production':
      if (!DZAP_ADDRESS[chainId]) {
        throw new Error(
          `DZap Address is not defined in production environment for ${chainId}`
        )
      }
      return DZAP_ADDRESS[chainId]
    case 'staging':
      if (!DZAP_STAGING_ADDRESS[chainId]) {
        throw new Error(
          `DZap Address is not defined in staging environment for ${chainId}`
        )
      }
      return DZAP_STAGING_ADDRESS[chainId]
    default:
      throw new Error(`Unknown environment: ${environment}`)
  }
}
