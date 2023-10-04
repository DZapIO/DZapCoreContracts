import { BigNumber, BigNumberish, ContractFactory } from 'ethers'

export enum FacetCutAction {
  Add,
  Replace,
  Remove,
}

export enum FeeType {
  BRIDGE,
  SWAP,
}

export enum PermitType {
  PERMIT,
  PERMIT2_TRANSFER_FROM,
  PERMIT2_APPROVE,
}

export interface DiamondCutData {
  facetName: string
  contract: ContractFactory
  selectors: string[]
}

export interface FeeData {
  totalFee: BigNumber
  dzapFee: BigNumber
  integratorFee: BigNumber
}

export interface FeeInfo {
  tokenFee: BigNumber // ex 1%
  fixedNativeFeeAmount: BigNumber // ex 0.5 Matic
  dzapTokenShare: BigNumber // 50%, 50% of the total 1% fee
  dzapFixedNativeShare: BigNumber // 50%, 50% of the total fixedFeeAmount fee
}

export interface DiamondCut {
  facetAddress: string
  action: FacetCutAction
  functionSelectors: string[]
}

export interface OneInchSwapParams {
  fromTokenAddress: string
  toTokenAddress: string
  amount: BigNumberish
  fromAddress: string
  slippage: number
  destReceiver: string
  disableEstimate: boolean
  compatibility: boolean
}

export interface DzapSwapData {
  callTo: string
  approveTo: string
  from: string
  to: string
  fromAmount: BigNumber
  minToAmount: BigNumber
  swapCallData: string
  permit: string
}

export interface LifiParams {
  fromChain: number
  toChain: number
  fromToken: string
  toToken: string
  fromAddress: string
  toAddress: string
  fromAmount: BigNumber
  slippage: number
  enableSlippageProtection: boolean
  allowBridges?: string[]
}

export interface OpenOceanParams {
  inTokenAddress: string
  outTokenAddress: string
  amount: BigNumberish
  slippage: BigNumberish
  account: string
  gasPrice: number
}

export interface ParaswapParams {
  fromToken: string
  toToken: string
  fromAmount: BigNumber
  sender: string
  receiver: string
}
