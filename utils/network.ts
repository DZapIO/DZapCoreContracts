import axios from 'axios'
import { providers } from 'ethers'
import { HardhatUserConfig, HttpNetworkUserConfig } from 'hardhat/types'
import { CHAIN_IDS, NETWORKS } from '../config/networks'
import { ApiType } from '../types'
import { getAccountKey } from './wallet'
import { MulticallWrapper } from 'ethers-multicall-provider'

export const getHardhatNetworkConfig = (chainId: CHAIN_IDS, accounts?: any) => {
  if (!accounts) accounts = [getAccountKey()]

  return {
    chainId: chainId,
    url: getRpcUrl(chainId),
    accounts,
  }
}

export const getRpcUrl = (chainId: CHAIN_IDS): string => {
  const network = getNetwork(chainId)

  let rpc = network.rpcUrl[0]
  if (!rpc) {
    throw new Error(`No RPC URL defined for chainId ${chainId}`)
  }

  rpc = rpc.replace(/\$\{(\w+)\}/g, (_, envVar) => {
    const value = process.env[envVar]
    if (!value) {
      throw new Error(`Environment variable ${envVar} is not set`)
    }
    return value
  })

  return rpc
}

export const getWorkingRpcUrl = async (chainId: CHAIN_IDS): Promise<string> => {
  const network = getNetwork(chainId)

  const rpcUrls = network.rpcUrl.map((url) => {
    return url.replace(/\$\{(\w+)\}/g, (_, envVar) => {
      const value = process.env[envVar]
      if (!value) {
        throw new Error(`Environment variable ${envVar} is not set`)
      }
      return value
    })
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
  if (!accounts) accounts = [getAccountKey()]

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

export const getNetwork = (chainId: CHAIN_IDS) => {
  const network = NETWORKS[chainId]
  if (!network) {
    throw new Error(`Network with chainId ${chainId} not found`)
  }
  return network
}

export const getProvider = async (chainId: CHAIN_IDS) => {
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

    if (network.apiType === ApiType.ETHERSCAN_V2) {
      if (!network.apiUrl) {
        throw new Error(`No API URL defined for chainId ${chainId}`)
      }

      config.etherscan!.apiKey![network.shortName] =
        process.env.ETHERSCAN_V2_API_KEY || ''

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
  ].includes(chainId)
}
