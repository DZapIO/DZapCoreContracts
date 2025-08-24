export const CONTRACTS_PATH = {
  DZapDiamond: 'contracts/DZapDiamond.sol:DZapDiamond',
  DiamondCutFacet:
    'contracts/Shared/Facets/DiamondCutFacet.sol:DiamondCutFacet',
  DiamondInit: 'contracts/Shared/Facets/DiamondInit.sol:DiamondInit',
  DiamondLoupeFacet:
    'contracts/Shared/Facets/DiamondLoupeFacet.sol:DiamondLoupeFacet',
  OwnershipFacet: 'contracts/Shared/Facets/OwnershipFacet.sol:OwnershipFacet',
  AccessManagerFacet:
    'contracts/Shared/Facets/AccessManagerFacet.sol:AccessManagerFacet',
  WithdrawFacet: 'contracts/Shared/Facets/WithdrawFacet.sol:WithdrawFacet',
  Permit2ManagerFacet:
    'contracts/Shared/Facets/Permit2ManagerFacet.sol:Permit2ManagerFacet',
  GlobalConfigFacet:
    'contracts/Shared/Facets/GlobalConfigFacet.sol:GlobalConfigFacet',
  WhitelistingManagerFacet:
    'contracts/Shared/Facets/WhitelistingManagerFacet.sol:WhitelistingManagerFacet',
  SwapFacet: 'contracts/Swap/Facets/SwapFacet.sol:SwapFacet',
  BridgeFacet: 'contracts/Bridge/Facets/BridgeFacet.sol:BridgeFacet',
  GasLessFacet: 'contracts/Shared/Facets/GasLessFacet.sol:GasLessFacet',
  DirectTransferAdapter:
    'contracts/Bridge/Adapters/DirectTransferAdapter.sol:DirectTransferAdapter',
  GasZipAdapter: 'contracts/Bridge/Adapters/GasZipAdapter.sol:GasZipAdapter',
  GenericBridgeAdapter:
    'contracts/Bridge/Adapters/GenericBridgeAdapter.sol:GenericBridgeAdapter',
  RelayBridgeAdapter:
    'contracts/Bridge/Adapters/RelayBridgeAdapter.sol:RelayBridgeAdapter',
}

export const CONTRACTS = {
  DiamondCutFacet: 'DiamondCutFacet',
  DiamondInit: 'DiamondInit',
  DZapDiamond: 'DZapDiamond',
  DiamondLoupeFacet: 'DiamondLoupeFacet',
  OwnershipFacet: 'OwnershipFacet',
  AccessManagerFacet: 'AccessManagerFacet',
  WithdrawFacet: 'WithdrawFacet',
  Permit2ManagerFacet: 'Permit2ManagerFacet',
  GlobalConfigFacet: 'GlobalConfigFacet',
  WhitelistingManagerFacet: 'WhitelistingManagerFacet',
  SwapFacet: 'SwapFacet',
  BridgeFacet: 'BridgeFacet',
  GasLessFacet: 'GasLessFacet',
  DirectTransferAdapter: 'DirectTransferAdapter',
  GasZipAdapter: 'GasZipAdapter',
  GenericBridgeAdapter: 'GenericBridgeAdapter',
  RelayBridgeAdapter: 'RelayBridgeAdapter',
  // ERC20: 'ERC20',
  TokenWrapper: 'TokenWrapper',
  ERC20: '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20',
  WNATIVE: 'WNATIVE',
  Permit2: 'Permit2',
  CreateX: 'CreateX',
  Executor: 'Executor',
  Receiver: 'Receiver',
  MockERC20: 'MockERC20',
  MockErc20Dex: 'MockErc20Dex',
  MockBridge: 'MockBridge',
  MockGasZipRouter: 'MockGasZipRouter',
}

export const ERRORS = {
  InitReverted: 'InitReverted',
  FunctionAlreadyExists: 'FunctionAlreadyExists',
  AlreadyInitialized: 'AlreadyInitialized',
  OnlyContractOwner: 'OnlyContractOwner',
  UnauthorizedCaller: 'UnauthorizedCaller',
  UnAuthorized: 'UnAuthorized',
  CannotAuthorizeSelf: 'CannotAuthorizeSelf',
  InsufficientBalance: 'InsufficientBalance',
  SlippageTooHigh: 'SlippageTooHigh',
  TransferAmountMismatch: 'TransferAmountMismatch',
  NoBridgeFromZeroAmount: 'NoBridgeFromZeroAmount',
  NoSwapFromZeroAmount: 'NoSwapFromZeroAmount',
  ZeroAddress: 'ZeroAddress',
  NoTransferToNullAddress: 'NoTransferToNullAddress',
  NullAddrIsNotAValidSpender: 'NullAddrIsNotAValidSpender',
  NullAddrIsNotAValidRecipient: 'NullAddrIsNotAValidRecipient',
  NativeTokenNotSupported: 'NativeTokenNotSupported',
  InvalidEncodedAddress: 'InvalidEncodedAddress',
  NotAContract: 'NotAContract',
  BridgeNotWhitelisted: 'BridgeNotWhitelisted',
  AdapterNotWhitelisted: 'AdapterNotWhitelisted',
  DexNotWhitelisted: 'DexNotWhitelisted',
  InvalidPermitType: 'InvalidPermitType',
  CannotBridgeToSameNetwork: 'CannotBridgeToSameNetwork',
  SwapCallFailed: 'SwapCallFailed',
  BridgeCallFailed: 'BridgeCallFailed',
  AdapterCallFailed: 'AdapterCallFailed',
  NativeCallFailed: 'NativeCallFailed',
  Erc20CallFailed: 'Erc20CallFailed',
  NativeTransferFailed: 'NativeTransferFailed',
  SigDeadlineExpired: 'SigDeadlineExpired',
  UnauthorizedSigner: 'UnauthorizedSigner',
  InvalidPermit: 'InvalidPermit',
  WithdrawFailed: 'WithdrawFailed',
  ReentrancyError: 'ReentrancyError',
  WithdrawFailure: 'WithdrawFailure',
  ExternalCallFailed: 'ExternalCallFailed',
  InvalidSigner: 'InvalidSigner',
  InvalidNonce: 'InvalidNonce',
  SignatureExpired: 'SignatureExpired',
  BridgeCallFailedFromRouter: 'BridgeCallFailedFromRouter',
  ContractIsPaused: 'ContractIsPaused',
  ContractIsNotPaused: 'ContractIsNotPaused',
}

export const EVENTS = {
  OwnershipTransferred: 'OwnershipTransferred',
  LogWithdraw: 'LogWithdraw',
  DZapTokenSwapped: 'DZapTokenSwapped',
  DZapBatchTokenSwapped: 'DZapBatchTokenSwapped',

  GasZipBridgeTransferStarted: 'GasZipBridgeTransferStarted',
  DZapGasLessStarted: 'DZapGasLessStarted',
  DZapBridgeStarted: 'DZapBridgeStarted',
  BridgeStarted: 'BridgeStarted',
  RelayBridgeTransferStarted: 'RelayBridgeTransferStarted',

  ExecutionAllowed: 'ExecutionAllowed',
  ExecutionDenied: 'ExecutionDenied',

  RefundVaultUpdated: 'RefundVaultUpdated',
  ProtocolFeeVaultUpdated: 'ProtocolFeeVaultUpdated',
  Permit2Updated: 'Permit2Updated',
  FeeValidatorUpdated: 'FeeValidatorUpdated',

  DexAdded: 'DexAdded',
  DexRemoved: 'DexRemoved',
  DexesAdded: 'DexesAdded',
  DexesRemoved: 'DexesRemoved',
  BridgeAdded: 'BridgeAdded',
  BridgeRemoved: 'BridgeRemoved',
  BridgesAdded: 'BridgesAdded',
  BridgesRemoved: 'BridgesRemoved',
  AdapterAdded: 'AdapterAdded',
  AdapterRemoved: 'AdapterRemoved',
  AdaptersAdded: 'AdaptersAdded',
  AdaptersRemoved: 'AdaptersRemoved',
  Paused: 'Paused',
  Unpaused: 'Unpaused',
}

export const FunctionNames = {
  singleSwap:
    'swap(bytes32,address,bytes,(address,address,address,uint256,uint256),(string,address,address,bytes,bool))',
  batchSwap:
    'swap(bytes32,address,(address,uint256,bytes)[],(address,address,address,uint256,uint256)[],(string,address,address,bytes,bool)[],bool)',
  batchSwapWithBatchPermit2:
    'swap(bytes32,address,bytes,((address,uint256)[],uint256,uint256),(address,address,address,uint256,uint256)[],(string,address,address,bytes,bool)[],bool)',
  singleBridge:
    'bridge(bytes32,bytes,bytes,uint256,(address,uint256,bytes),(address,bytes))',
  singleSwapAndBridge:
    'bridge(bytes32,bytes,bytes,uint256,(address,uint256,bytes),(address,address,address,uint256,uint256,bool),(string,address,address,bytes,bool),(address,bytes))',
  batchSwapAndBridge:
    'bridge(bytes32,bytes,bytes,uint256,(address,uint256,bytes)[],(address,address,address,uint256,uint256,bool)[],(string,address,address,bytes,bool)[],(address,bytes)[])',
  batchSwapAndBridgeWithPermit2BatchWitnessTransfer:
    'bridge(bytes32,bytes,bytes,bytes,uint256,((address,uint256)[],uint256,uint256),(address,address,address,uint256,uint256,bool)[],(string,address,address,bytes,bool)[],(address,bytes)[])',
  executeMultiSwap:
    'executeMultiSwap(bytes32,address,address,uint256,bytes,(address,uint256,bytes)[],(address,uint256)[],(address,address,address,uint256,uint256)[],(string,address,address,bytes,bool)[])',
  executeMultiSwapWithPermit2BatchWitnessTransfer:
    'executeMultiSwap(bytes32,address,address,bytes,((address,uint256)[],uint256,uint256),(address,uint256)[],(address,address,address,uint256,uint256)[],(string,address,address,bytes,bool)[])',
  executeMultiBridge:
    'executeMultiBridge(bytes32,bytes,bytes,bytes,uint256,uint256,address,(address,uint256,bytes)[],(address,uint256)[],(address,address,address,uint256,uint256,bool)[],(string,address,address,bytes,bool)[],(address,bytes)[])',
  executeMultiBridgeWithPermit2BatchWitnessTransfer:
    'executeMultiBridge(bytes32,bytes,bytes,bytes,uint256,address,((address,uint256)[],uint256,uint256),(address,uint256)[],(address,address,address,uint256,uint256,bool)[],(string,address,address,bytes,bool)[],(address,bytes)[])',
} as const
