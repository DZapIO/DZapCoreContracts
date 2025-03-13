import { getNetwork } from './networkUtils'

export const getExplorerUrl = (chainId: number) => {
  const { explorerUrl } = getNetwork(chainId)
  return explorerUrl
}

export const getTxUrl = (chainId: number, txHash: string) => {
  const { explorerUrl } = getNetwork(chainId)
  return `${explorerUrl}/tx/${txHash}`
}

export const getContractUrl = (chainId: number, address: string) => {
  const { explorerUrl } = getNetwork(chainId)
  return `${explorerUrl}/address/${address}`
}
