import { ContractTransactionReceipt, Interface } from 'ethers'
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

export const getLogFromReceipt = (
  receipt: ContractTransactionReceipt,
  contractAddress: string,
  contractInterface: Interface,
  eventName: string
) => {
  const relevantLogs = receipt.logs.filter(
    (log) => log.address.toLowerCase() === contractAddress.toLowerCase()
  )

  for (const log of relevantLogs) {
    try {
      const parsed = contractInterface.parseLog(log)

      if (parsed?.name === eventName) {
        console.log(eventName + ' event:', parsed.args)
      }
    } catch (e) {
      // Log doesn't match this interface, skip
    }
  }
}
