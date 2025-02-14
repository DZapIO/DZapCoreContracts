import { CHAIN_IDS, NETWORKS, RPC_TYPE } from '../config/networks'
import { dummyKey } from '../constants/others'

const key: string =
  (process.env.IS_PROD
    ? process.env.IS_PROD == 'true'
      ? process.env.MAINNET_KEY
      : process.env.STAGING_KEY
    : process.env.TESTNET_KEY) || dummyKey

export const getRpcUrl = (chainId: CHAIN_IDS): string => {
  const network = NETWORKS[chainId]
  let rpc = network.rpcUrl

  if (network.rpcType == RPC_TYPE.ALCHEMY) {
    rpc = `${rpc}/${process.env.ALCHEMY_API_KEY}`
  } else if (network.rpcType == RPC_TYPE.INFURA) {
    rpc = `${rpc}/${process.env.INFURA_API_KEY}`
  } else if (network.rpcType == RPC_TYPE.BLAST_API) {
    rpc = `${rpc}/${process.env.BLAST_API_KEY}`
  }

  return rpc
}

export const getNetworkConfig = (chainId: CHAIN_IDS, accounts?: any) => {
  if (!accounts) accounts = [key]

  return {
    chainId: chainId,
    url: getRpcUrl(chainId),
    accounts,
  }
}

export const getChainName = (chainId: CHAIN_IDS) => {
  return NETWORKS[chainId].chainName
}
