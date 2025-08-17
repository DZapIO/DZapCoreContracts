import { getAddress } from 'ethers'
import {
  DZAP_ADDRESS,
  DZAP_STAGING_ADDRESS,
  DZAP_TESTING_ADDRESS,
} from '../config/deployment/deployment'
import { ENVIRONMENT } from '../constants'
import { ethers } from 'hardhat'

export const isAddressSame = (addressA: string, addressB: string) => {
  return getAddress(addressA) == getAddress(addressB)
}

export const getDZapAddress = (chainId: number) => {
  const environment = process.env.NODE_ENV
  switch (environment) {
    case ENVIRONMENT.PRODUCTION:
      if (!DZAP_ADDRESS[chainId]) {
        throw new Error(
          `DZap Address is not defined in production environment for ${chainId}`,
        )
      }
      return DZAP_ADDRESS[chainId]
    case ENVIRONMENT.STAGING:
      if (!DZAP_STAGING_ADDRESS[chainId]) {
        throw new Error(
          `DZap Address is not defined in staging environment for ${chainId}`,
        )
      }
      return DZAP_STAGING_ADDRESS[chainId]
    case ENVIRONMENT.DEVELOPMENT:
      if (!DZAP_TESTING_ADDRESS[chainId]) {
        throw new Error(
          `DZap Address is not defined in staging environment for ${chainId}`,
        )
      }
      return DZAP_TESTING_ADDRESS[chainId]
    default:
      throw new Error(`Unknown environment: ${environment}`)
  }
}
