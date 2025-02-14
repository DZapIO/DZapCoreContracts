import { CHAIN_IDS } from '../../config'

export enum GasZipReceiver {
  MsgSender,
  EvmReceiver,
  SolanaReceiver,
  MoveReceiver,
  XrpReceiver,
  InitiaReceiver,
  NonEVMReceiver,
}

export const GasZipChainIds = {
  [CHAIN_IDS.ETH_MAINNET]: 255,
  [CHAIN_IDS.ARBITRUM_MAINNET]: 57,
  [CHAIN_IDS.BASE_MAINNET]: 54,
  [CHAIN_IDS.ZKSYNC_MAINNET]: 51,
  [CHAIN_IDS.POLYGON_MAINNET]: 17,
}
