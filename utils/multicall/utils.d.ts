import { Signer } from 'ethers'
import { BlockTag, Network, Provider } from '@ethersproject/providers'
export interface MinimalProvider extends Provider {
  network: Network
  perform(method: string, params: any): Promise<any>
}
export declare const getBlockNumber: (blockTag: BlockTag) => number | null
export declare const getMulticall: (
  chainId: number,
  provider: Signer | Provider
) => import('./types').Multicall3 | null
export declare const isProviderCompatible: (
  provider: Provider
) => provider is MinimalProvider
