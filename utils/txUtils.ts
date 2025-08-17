import { ChainId } from '../types'
import { getNetwork } from './networkUtils'

export const getExplorerUrl = (chainId: ChainId) => {
  const { explorerUrl } = getNetwork(chainId)
  return explorerUrl
}

export const getTxUrl = (chainId: ChainId, txHash: string) => {
  const { explorerUrl } = getNetwork(chainId)
  return `${explorerUrl}/tx/${txHash}`
}

export const getContractUrl = (chainId: ChainId, address: string) => {
  const { explorerUrl } = getNetwork(chainId)
  return `${explorerUrl}/address/${address}`
}
