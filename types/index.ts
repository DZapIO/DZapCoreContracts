import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { BigNumberish, ContractFactory, Wallet } from 'ethers'
import { CHAIN_IDS } from '../config'
import { BRIDGES } from '../config/protocols/bridgeNames'
import { DEXES } from '../config/protocols/dexNames'
import { NODE_ENV_VAR_NAMES } from '../constants'
import {
  DirectTransferAdapter,
  GasZipAdapter,
  GenericBridgeAdapter,
  MockERC20,
  Permit2,
  RelayBridgeAdapter,
  WNATIVE,
} from '../typechain-types'

// ----------------

export * from './encoding'
export * from './signatures'

// ----------------

export enum FacetCutAction {
  Add,
  Replace,
  Remove,
}

export enum PermitType {
  PERMIT, // EIP2612
  PERMIT2_APPROVE,
  PERMIT2_WITNESS_TRANSFER,
  BATCH_PERMIT2_WITNESS_TRANSFER,
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
  totalFee: bigint
  dzapFee: bigint
  integratorFee: bigint
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

export interface SwapData {
  recipient: string
  from: string
  to: string
  fromAmount: bigint
  minToAmount: bigint
}

export interface BridgeSwapData {
  recipient: string
  from: string
  to: string
  fromAmount: bigint
  minToAmount: bigint
  updateBridgeInAmount: boolean
}

export interface SwapExecutionData {
  dex: string
  callTo: string
  approveTo: string
  swapCallData: string
  isDirectTransfer: boolean
}

export interface AdapterInfo {
  adapter: string
  adapterData: string
}

export interface RelayData {
  amountIn: bigint
  requestId: string
}

export interface GasZipData {
  depositAmount: bigint
  destChains: BigNumberish
  recipient: string
}

export interface Fees {
  token: string
  integratorFeeAmount: bigint
  protocolFeeAmount: bigint
}

export interface DZapFeeData {
  integrator: string
  fees: Fees[]
}

export type SwapInfoTuple = [
  string, // dex
  string, // callTo
  string, // recipient
  string, // from
  string, // to
  bigint, // fromAmount
  bigint // minToAmount
]

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

export interface DZapDiamondInitArgs {
  protocolFeeVault: string
  feeValidator: string
  refundVault: string
  permit2: string
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

export interface DZapDiamondInitArgs {
  protocolFeeVault: string
  feeValidator: string
  refundVault: string
  permit2: string
}

export interface PermitDetails {
  token: string
  amount: BigNumberish
  expiration: BigNumberish
  nonce: BigNumberish
}

export interface PermitSingle {
  details: PermitDetails
  spender: string
  sigDeadline: BigNumberish
}

export interface TokenPermissions {
  token: string
  amount: BigNumberish
}

export interface TokenInfo {
  token: string
  amount: bigint
}

export interface InputToken {
  token: string
  amount: BigNumberish
  permit: string
}

export interface DZapTransferWitness {
  owner: string
  recipient: string
}

export interface PermitTransferFrom {
  permitted: TokenPermissions
  nonce: BigNumberish
  deadline: BigNumberish
}

export interface SignatureTransferDetails {
  to: string
  requestedAmount: BigNumberish
}

export interface DZapSwapWitness {
  txId: string
  user: string
  executorFeesHash: string
  swapDataHash: string
}

export interface DZapBridgeWitness {
  txId: string
  user: string
  executorFeesHash: string
  swapDataHash: string
  adapterDataHash: string
}

export interface PermitBatchTransferFrom {
  permitted: TokenPermissions[]
  nonce: BigNumberish
  deadline: BigNumberish
}

export interface DZapPermit2TranferWitness extends PermitTransferFrom {
  spender: string
  witness: DZapTransferWitness
}

export interface DZapPermit2BatchTranferWitness
  extends PermitBatchTransferFrom {
  spender: string
  witness: DZapTransferWitness
}

export interface DZapPermit2BatchSwapWitness extends PermitBatchTransferFrom {
  spender: string
  witness: DZapSwapWitness
}

export interface DZapPermit2BatchBridgeWitness extends PermitBatchTransferFrom {
  spender: string
  witness: DZapBridgeWitness
}

/// ------------

export interface Eip2612SigArgs {
  chainId: number
  signer: Wallet | HardhatEthersSigner
  token: MockERC20
  spender: string
  amount: BigInt
  deadline: bigint
  version?: string
  nonce?: BigNumberish
  name?: string
}

export interface Permit2ApproveSigArgs {
  chainId: number
  signer: Wallet | HardhatEthersSigner
  permit2: Permit2
  token: string
  spender: string
  amount: bigint
  sigDeadline: bigint
  expiration: bigint
  userNonce?: number | bigint
}

export interface Permit2TransferFromWitnessSigArgs {
  chainId: number
  signer: Wallet | HardhatEthersSigner
  permit2: Permit2
  token: string
  recipient: string
  spender: string
  amount: BigNumberish
  deadline: BigNumberish
  nonce?: BigNumberish
}

export interface Permit2BatchTransferFromWitnessSigArgs {
  chainId: number
  signer: Wallet | HardhatEthersSigner
  permit2: Permit2
  tokenInfo: TokenPermissions[]
  recipient: string
  spender: string
  deadline: BigNumberish
  nonce?: BigNumberish
}

export interface DZapFeeSignatureArgs {
  chainId: number
  signer: Wallet | HardhatEthersSigner
  dZapAddress: string
  userAddress: string
  transactionId: string
  feeData: DZapFeeData
  adapterInfo: AdapterInfo | AdapterInfo[]
  deadline: bigint
  version?: string
  nonce?: bigint
  salt?: string
}

export interface DZapGasLessSwapSignatureArgs {
  chainId: number
  signer: Wallet | HardhatEthersSigner
  dZapAddress: string
  transactionId: string
  executorFeeInfo: TokenInfo | TokenInfo[]
  swapData: SwapData | SwapData[]
  deadline: bigint
  version?: string
  nonce?: bigint
  salt?: string
}

export interface DZapGasLessSwapBridgeSignatureArgs {
  chainId: number
  signer: Wallet | HardhatEthersSigner
  dZapAddress: string
  transactionId: string
  executorFeeInfo: TokenInfo | TokenInfo[]
  swapData?: BridgeSwapData | BridgeSwapData[]
  adapterInfo: AdapterInfo | AdapterInfo[]
  deadline: bigint
  version?: string
  nonce?: bigint
  salt?: string
}

export interface GasLessPermit2SwapWitnessArgs {
  chainId: number
  signer: Wallet | HardhatEthersSigner
  permit2: Permit2
  spender: string
  transactionId: string
  executorFeeInfo: TokenInfo[]
  tokenInfo: TokenPermissions[]
  swapData: SwapData[]
  deadline: BigNumberish
  nonce?: bigint
}

export interface GasLessPermit2BridgeWitnessArgs {
  chainId: number
  signer: Wallet | HardhatEthersSigner
  permit2: Permit2
  spender: string
  transactionId: string
  executorFeeInfo: TokenInfo[]
  tokenInfo: TokenPermissions[]
  swapData: BridgeSwapData[]
  adapterInfo: AdapterInfo[]
  deadline: BigNumberish
  nonce?: bigint
}

export interface SignedGasLessBridgeDataArgs {
  chainId: number
  signer: Wallet | HardhatEthersSigner
  dZapAddress: string
  transactionId: string
  executorFeeInfo: TokenInfo
  adapterInfo: AdapterInfo
  deadline: bigint
  version?: string
  nonce?: bigint
  salt?: string
}

export interface SignedGasLessSwapBridgeDataArgs {
  chainId: number
  signer: Wallet | HardhatEthersSigner
  dZapAddress: string
  transactionId: string
  executorFeeInfo: TokenInfo
  swapData: SwapData | SwapData[]
  adapterInfo: AdapterInfo | AdapterInfo[]
  deadline: bigint
  version?: string
  nonce?: bigint
  salt?: string
}

/// ------------

export interface GenericBridgeData {
  updateAmountIn: boolean
  from: string
  transactionId: string
  callData: string
  receiver: string
  to: string
  bridge: string
  amountIn: bigint
  offset: bigint | number
  extraNative: bigint
  destinationChainId: number
  user: string
  callTo: string
  approveTo: string
  hasDestinationCall: boolean
}

export interface DirectTransferAdapterData {
  updateAmountIn: boolean
  from: string
  transactionId: string
  receiver: string
  to: string
  bridge: string
  amountIn: bigint
  destinationChainId: number
  user: string
  transferTo: string
  hasDestinationCall: boolean
}

export interface RelayBridgeAdapterData {
  updateAmountIn: boolean
  from: string
  transactionId: string
  receiver: string
  to: string
  relayData: RelayData
  destinationChainId: number
  user: string
  hasDestinationCall: boolean
}

export interface GasZipAdapterData {
  updateAmountIn: boolean
  from: string
  transactionId: string
  gasZipData: GasZipData
  user: string
  hasDestinationCall: boolean
}

export type BridgeAdapterData =
  | GenericBridgeData
  | DirectTransferAdapterData
  | RelayBridgeAdapterData
  | GasZipAdapterData
export enum BridgeAdapterType {
  GenericBridgeAdapter,
  DirectTransferAdapter,
  RelayBridgeAdapter,
  GasZipAdapter,
}

export type AdapterInfoArgs =
  | {
      type: BridgeAdapterType.GenericBridgeAdapter
      adapter: GenericBridgeAdapter
      bridgeData: GenericBridgeData
    }
  | {
      type: BridgeAdapterType.DirectTransferAdapter
      adapter: DirectTransferAdapter
      bridgeData: DirectTransferAdapterData
    }
  | {
      type: BridgeAdapterType.RelayBridgeAdapter
      adapter: RelayBridgeAdapter
      bridgeData: RelayBridgeAdapterData
    }
  | {
      type: BridgeAdapterType.GasZipAdapter
      adapter: GasZipAdapter
      bridgeData: GasZipAdapterData
    }

/// ------------

export interface Erc20Token extends MockERC20 {
  address: string
}

export interface WNativeToken extends WNATIVE {
  address: string
}
