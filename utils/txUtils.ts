import { getNetwork } from './network'

export const getTxUrl = (chainId: number, txHash: string) => {
  const { explorerUrl } = getNetwork(chainId)
  return `${explorerUrl}/tx/${txHash}`
}
