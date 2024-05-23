import { BigNumber } from 'ethers'
import { ethers, network } from 'hardhat'

export const CONTRACTS = {
  DiamondCutFacet: 'DiamondCutFacet',
  DiamondInit: 'DiamondInit',
  DZapDiamond: 'DZapDiamond',
  DiamondLoupeFacet: 'DiamondLoupeFacet',
  OwnershipFacet: 'OwnershipFacet',
  AccessManagerFacet: 'AccessManagerFacet',
  DexManagerFacet: 'DexManagerFacet',
  FeesFacet: 'FeesFacet',
  WithdrawFacet: 'WithdrawFacet',
  SwapFacet: 'SwapFacet',
  CrossChainFacet: 'CrossChainFacet',
  StargateFacet: 'StargateFacet',
  ERC20: 'ERC20',
  WNATIVE: 'WNATIVE',
  ERC20Mock: 'ERC20Mock',
  ExchangeMock: 'ExchangeMock',
  BridgeMock: 'BridgeMock',
  Permit2: 'Permit2',
  Executor: 'Executor',
  Receiver: 'Receiver',
  BridgeManagerFacet: 'BridgeManagerFacet',
  BridgeDynamicTransferFacet: 'BridgeDynamicTransferFacet',
  GenericCrossChainFacet: 'GenericCrossChainFacet',
  BatchBridgeCallFacet: 'BatchBridgeCallFacet',
}

export const ERRORS = {
  InitReverted: 'InitReverted',
  AlreadyInitialized: 'AlreadyInitialized',
  OnlyContractOwner: 'OnlyContractOwner',
  CannotAuthorizeSelf: 'CannotAuthorizeSelf',
  UnAuthorized: 'UnAuthorized',
  ZeroAddress: 'ZeroAddress',
  ShareTooHigh: 'ShareTooHigh',
  FeeTooHigh: 'FeeTooHigh',
  InvalidFee: 'InvalidFee',
  IntegratorNotActive: 'IntegratorNotActive',
  InvalidContract: 'InvalidContract',
  IntegratorNotAllowed: 'IntegratorNotAllowed',
  InvalidAmount: 'InvalidAmount',
  ContractCallNotAllowed: 'ContractCallNotAllowed',
  NoSwapFromZeroBalance: 'NoSwapFromZeroBalance',
  InformationMismatch: 'InformationMismatch',
  NotAContract: 'NotAContract',
  CannotBridgeToSameNetwork: 'CannotBridgeToSameNetwork',
  InvalidReceiver: 'InvalidReceiver',
  UnAuthorizedCallToFunction: 'UnAuthorizedCallToFunction',
  BridgeCallFailed: 'BridgeCallFailed',
  SlippageTooHigh: 'SlippageTooHigh',
  UnauthorizedCaller: 'UnauthorizedCaller',
  SwapCallFailed: 'SwapCallFailed',
  BridgeNotAdded: 'BridgeNotAdded',
  UnAuthorizedCall: 'UnAuthorizedCall',
}

export const EVENTS = {
  DexAdded: 'DexAdded',
  DexRemoved: 'DexRemoved',
  FunctionSignatureApprovalChanged: 'FunctionSignatureApprovalChanged',
  OwnershipTransferred: 'OwnershipTransferred',
  LogWithdraw: 'LogWithdraw',
  Swapped: 'Swapped',
  MultiSwapped: 'MultiSwapped',
  AllSwapsFailed: 'AllSwapsFailed',
  SelectorToInfoUpdated: 'SelectorToInfoUpdated',
  BridgeTransferStarted: 'BridgeTransferStarted',
  MultiTokenBridgeTransferStarted: 'MultiTokenBridgeTransferStarted',
  SwapBridgeTransferStarted: 'SwapBridgeTransferStarted',
  ExecutorSet: 'ExecutorSet',
  RecoverGasSet: 'RecoverGasSet',
  DZapTransferRecovered: 'DZapTransferRecovered',
  TokensRecovered: 'TokensRecovered',
  TokenSwapped: 'TokenSwapped',
  BridgeAdded: 'BridgeAdded',
  BridgeRemoved: 'BridgeRemoved',
  BatchBridgeTransferStart: 'BatchBridgeTransferStart',
}

export const BPS_MULTIPLIER = 10000
export const BPS_DENOMINATOR = 100 * BPS_MULTIPLIER
export const ZERO_ADDRESS = ethers.constants.AddressZero
export const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const DZAP_NATIVE = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const ZERO = BigNumber.from(0)

export const DEFAULT_BYTES = '0x'
export const ADDRESS_ZERO = ethers.constants.AddressZero
export const MAX_DEADLINE = ethers.constants.MaxInt256
export const DEFAULT_ERC20_PERMIT_VERSION = '1'
export const HARDHAT_CHAIN_ID = network.config.chainId as number

export const MAX_TOKEN_FEE = 10 * BPS_MULTIPLIER
export const MAX_FIXED_FEE_AMOUNT = ethers.utils.parseUnits('1')
