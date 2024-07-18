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
  // ERC20: 'ERC20',
  ERC20: '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20',
  WNATIVE: 'WNATIVE',
  ERC20Mock: 'ERC20Mock',
  ExchangeMock: 'ExchangeMock',
  BridgeMock: 'BridgeMock',
  Permit2: 'Permit2',
  Executor: 'Executor',
  Receiver: 'Receiver',
  BridgeManagerFacet: 'BridgeManagerFacet',
  BridgeDynamicTransferFacet: 'BridgeDynamicTransferFacet',
  BatchBridgeCallFacet: 'BatchBridgeCallFacet',
  Create2Deployer: 'Create2Deployer',
  SwapTransferFacet: 'SwapTransferFacet',
  BatchSwapFacet: 'BatchSwapFacet',
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
  SlippageTooLow: 'SlippageTooLow',
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
  SwappedSingleToken: 'SwappedSingleToken',
}
