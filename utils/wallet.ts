import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from 'ethers'

export async function getWallet(privateKey: string, provider: JsonRpcProvider) {
  return new Wallet(privateKey, provider)
}
