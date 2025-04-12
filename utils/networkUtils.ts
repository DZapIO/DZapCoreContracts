import axios from 'axios'
import { providers, Wallet } from 'ethers'
import { HardhatUserConfig, HttpNetworkUserConfig } from 'hardhat/types'
import { CHAIN_IDS, NETWORKS } from '../config/networks'
import { ApiType, ChainId } from '../types'
import { getAccountKey } from './walletUtils'
import { MulticallWrapper } from './multicall'
import { getEnvVar, replaceEnvInStr } from './envUtils'
import { dummyKey, NODE_ENV_VAR_NAMES } from '../constants'

export const getHardhatNetworkConfig = (chainId: CHAIN_IDS, accounts?: any) => {
  if (!accounts) accounts = [getAccountKey()]

  return {
    chainId: chainId,
    url: getRpcUrl(chainId),
    accounts,
  }
}

export const getRpcUrl = (chainId: ChainId): string => {
  const network = getNetwork(toChainId(chainId))

  let rpc = network.rpcUrl[0]
  if (!rpc) {
    throw new Error(`No RPC URL defined for chainId ${chainId}`)
  }
  return replaceEnvInStr(rpc)
}

export const getWorkingRpcUrl = async (chainId: CHAIN_IDS): Promise<string> => {
  const network = getNetwork(chainId)

  const rpcUrls = network.rpcUrl.map((url) => {
    return replaceEnvInStr(url)
  })

  const checks = rpcUrls.map((url) => checkRpc(url))

  try {
    const fastestUrl = await Promise.any(checks)
    return fastestUrl
  } catch (error) {
    throw new Error(`No working RPC endpoint found for chainId ${chainId}`)
  }
}

export const getNetworkConfig = (
  chainIds: CHAIN_IDS[],
  accounts?: string[]
) => {
  const config: { [networkName: string]: HttpNetworkUserConfig } = {}
  if (!accounts) {
    const key = getAccountKey()
    if (key === dummyKey) accounts = [Wallet.createRandom().privateKey]
    else accounts = [key]
  }

  chainIds.forEach((chainId) => {
    const network = getNetwork(chainId)
    config[network.shortName] = {
      chainId: chainId,
      url: getRpcUrl(chainId),
      accounts,
    }
  })

  return config
}

export const toChainId = (chainId: string | number | bigint): CHAIN_IDS => {
  // check is chainId is of type CHAIN_IDS
  if (!isValidChainId(chainId)) {
    throw new Error(`Invalid chainId: ${chainId}`)
  }
  return chainId as CHAIN_IDS
}

export const isValidChainId = (chainId: ChainId): boolean => {
  const chainIdStr = chainId.toString()
  return Object.values(CHAIN_IDS).map(String).includes(chainIdStr)
}

export const getNetwork = (chainId: ChainId) => {
  const network = NETWORKS[toChainId(chainId)]
  if (!network) {
    throw new Error(`Network with chainId ${chainId} not found`)
  }
  return network
}

export const getProvider = async (chainId: ChainId) => {
  const rpcUrl = getRpcUrl(chainId)
  return new providers.JsonRpcProvider(rpcUrl)
}

export const getMultiCallProvider = (chainId: CHAIN_IDS) => {
  const rpcUrl = getRpcUrl(chainId)
  return MulticallWrapper.wrap(new providers.JsonRpcProvider(rpcUrl))
}

export const getVerificationConfig = (chainIds: CHAIN_IDS[]) => {
  const config: HardhatUserConfig = {
    etherscan: {
      apiKey: {},
      customChains: [],
    },
    blockscout: {
      enabled: true,
      customChains: [],
    },
  }

  chainIds.forEach((chainId) => {
    const network = getNetwork(chainId)

    if (network.apiType === ApiType.OTHER) {
      if (!network.apiUrl) {
        throw new Error(`No API URL defined for chainId ${chainId}`)
      }

      const apiKey = 'notNeeded'
      config.etherscan!.apiKey![network.shortName] = apiKey

      config.etherscan!.customChains!.push({
        network: network.shortName,
        chainId: chainId,
        urls: {
          apiURL: network.apiUrl,
          browserURL: network.explorerUrl,
        },
      })
    }

    if (network.apiType === ApiType.ETHERSCAN_V1) {
      if (!network.apiKeyName)
        throw new Error(`${network.apiKeyName} is not defined`)

      const apiKey = getEnvVar(network.apiKeyName)

      config.etherscan!.apiKey![network.shortName] = apiKey

      if (network.apiUrl)
        config.etherscan!.customChains!.push({
          network: network.shortName,
          chainId: chainId,
          urls: {
            apiURL: network.apiUrl,
            browserURL: network.explorerUrl,
          },
        })
    }

    if (network.apiType === ApiType.ETHERSCAN_V2) {
      if (!network.apiUrl) {
        throw new Error(`No API URL defined for chainId ${chainId}`)
      }

      config.etherscan!.apiKey![network.shortName] = getEnvVar(
        NODE_ENV_VAR_NAMES.ETHERSCAN_V2_API_KEY
      )

      config.etherscan!.customChains!.push({
        network: network.shortName,
        chainId: chainId,
        urls: {
          apiURL: network.apiUrl,
          browserURL: network.explorerUrl,
        },
      })
    }

    if (network.apiType === ApiType.BLOCKSCOUT) {
      if (!network.apiUrl) {
        throw new Error(`No API URL defined for chainId ${chainId}`)
      }

      config.etherscan!.apiKey![network.shortName] = 'blockscout'
      config.etherscan!.customChains!.push({
        network: network.shortName,
        chainId: chainId,
        urls: {
          apiURL: network.apiUrl,
          browserURL: network.explorerUrl,
        },
      })

      config.blockscout!.customChains!.push({
        network: network.shortName,
        chainId: chainId,
        urls: {
          apiURL: network.apiUrl,
          browserURL: network.explorerUrl,
        },
      })
    }
  })

  return config
}

const checkRpc = async (rpcUrl: string): Promise<string> => {
  try {
    const response = await axios.post(
      rpcUrl,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: [],
      },
      { timeout: 3000 } // adjust timeout as needed
    )

    if (response.data && response.data.result) {
      return rpcUrl
    }
    throw new Error(`Invalid response from ${rpcUrl}`)
  } catch (error) {
    throw new Error(`RPC endpoint ${rpcUrl} failed: ${error}`)
  }
}

export const isZkEvm = (chainId: CHAIN_IDS) => {
  return [
    CHAIN_IDS.ZKSYNC_MAINNET,
    CHAIN_IDS.ZKSYNC_SEPOLIA_TESTNET,
    CHAIN_IDS.ABSTRACT_MAINNET,
    CHAIN_IDS.ABSTRACT_TESTNET,
    CHAIN_IDS.LENS,
    CHAIN_IDS.LENS_TESTNET,
  ].includes(chainId)
}
