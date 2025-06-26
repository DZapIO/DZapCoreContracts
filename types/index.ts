import { BigNumber, BigNumberish, ContractFactory } from 'ethers'
import { CHAIN_IDS, RPC_TYPE } from '../config'
import { BRIDGES } from '../config/protocols/bridgeNames'
import { DEXES } from '../config/protocols/dexNames'
import { NODE_ENV_VAR_NAMES } from '../constants'

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

export enum ApiType {
  NONE,
  ETHERSCAN_V1,
  ETHERSCAN_V2,
  BLOCKSCOUT,
  SOURCIFY,
  OTHER,
}

export type ChainId = CHAIN_IDS | string | number | bigint

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
  tokenFee: BigNumberish // ex 1%
  fixedNativeFeeAmount: BigNumberish // ex 0.5 Matic
  dzapTokenShare: BigNumberish // 50%, 50% of the total 1% fee
  dzapFixedNativeShare: BigNumberish // 50%, 50% of the total fixedFeeAmount fee
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
  toContractCallData?: string
  toContractGasLimit?: string
  toApprovalAddress?: string
  toFallbackAddress?: string
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

// Step 2: Define the interface for the inner objects
export interface FacetCut {
  name: string
  action: FacetCutAction
}

// Step 3: Define the interface for the main object with dynamic keys
export interface FacetCuts {
  [address: string]: FacetCut
}

export interface AccessContractObj {
  [key: string]: {
    executor: string
    functionNames: string[]
  }
}

export interface NativeCurrency {
  name: string
  symbol: string
  decimals: number
}

export interface Network {
  chainId: CHAIN_IDS
  chainName: string
  shortName: string
  rpcUrl: string[]
  explorerUrl: string
  apiUrl?: string
  apiType: ApiType
  apiKeyName?: NODE_ENV_VAR_NAMES
  verifyKeyName?: string
  nativeCurrency: NativeCurrency
}

export type Networks = {
  [key in CHAIN_IDS]?: Network
}

export interface SelectorInfo {
  function: string
  functionSig: string
  offset: number
}

export type BridgeConfig = {
  [key in BRIDGES]?: string[]
}

export type DexConfig = {
  [key in DEXES]?: string[]
}

export interface FacetDeployData {
  facetName: string
  constructorArgs: any[]
}

export interface Create3DeploymentConfig {
  deployer: string
  saltKey: string
  contractAddress: string
  creationCode: string
}

export interface ZKCreate2DeploymentConfig {
  deployer: string
  saltKey: string
  contractAddress: string
  bytecode: string
}

export interface DiamondInitArgs {
  permit2: string
  protocolFeeVault: string
  maxTokenFee: BigNumberish
  maxFixedNativeFeeAmount: BigNumberish
}

export interface VerificationData {
  contractName: string
  contractAddress: string
  constructorArguments: any[] // as structs can be passed as constructor arguments
}

export type ZKNetworks = {
  url: string
  chainId: CHAIN_IDS
  ethNetwork: string
  zksync: true
  verifyURL?: string
  enableVerifyURL?: boolean
  deployPaths: string
}

export type ZKChainConfig = {
  name: string
  shortName: string
  shortNameZk: string
  verifyKeyName?: string
  verifyURL?: string
  isTestnet: boolean
}
