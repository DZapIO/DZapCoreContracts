import { ChainId } from '../types'
import { getNetwork } from './networkUtils'
import { getNativeBalance } from './providersUitils'

export const logScriptDetails = async (
  scriptName: string,
  chainId: ChainId,
  accountAddress?: string
) => {
  const network = getNetwork(chainId)

  const obj: Record<string, any> = {
    name: scriptName,
    network: network.chainName,
    chainId,
  }

  if (accountAddress) {
    obj.account = accountAddress
    obj.balance = (
      await getNativeBalance(chainId, accountAddress)
    ).formattedBalance
  }

  console.log(obj)
}
