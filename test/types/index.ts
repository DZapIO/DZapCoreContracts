import { BigNumber } from 'ethers'

export interface GenericBridgeData {
  bridge: string
  from: string
  to: string
  receiver: string
  minAmountIn: BigNumber
  destinationChainId: number
  hasSourceSwaps: boolean
  hasDestinationCall: boolean
}

export interface BridgeData {
  bridge: string
  from: string
  to: string
  receiver: string
  hasSourceSwaps: boolean
  hasDestinationCall: boolean
  minAmountIn: BigNumber
  destinationChainId: number
}

export interface CrossChainData {
  callTo: string
  approveTo: string
  extraNative: BigNumber
  permit: string
  callData: string
}

export interface RelayData {
  requestId: string
  permit: string
}

export interface GasZipData {
  data: string
  depositAmount: string
}

export interface AdapterData {
  adapter: string
  data: string
  permit: string
}

export interface TransferData {
  transferTo: string
  permit: string
}

export interface SwapData {
  callTo: string
  approveTo: string
  from: string
  to: string
  fromAmount: BigNumber
  minToAmount: BigNumber
  swapCallData: string
  permit: string
}
