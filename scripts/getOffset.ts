import { FormatTypes } from 'ethers/lib/utils'
import { ethers } from 'hardhat'

const abi = [
  {
    anonymous: false,
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'facetAddress', type: 'address' },
          {
            internalType: 'enum IDiamondCut.FacetCutAction',
            name: 'action',
            type: 'uint8',
          },
          {
            internalType: 'bytes4[]',
            name: 'functionSelectors',
            type: 'bytes4[]',
          },
        ],
        indexed: false,
        internalType: 'struct IDiamondCut.FacetCut[]',
        name: '_diamondCut',
        type: 'tuple[]',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_init',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '_calldata',
        type: 'bytes',
      },
    ],
    name: 'DiamondCut',
    type: 'event',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'facetAddress', type: 'address' },
          {
            internalType: 'enum IDiamondCut.FacetCutAction',
            name: 'action',
            type: 'uint8',
          },
          {
            internalType: 'bytes4[]',
            name: 'functionSelectors',
            type: 'bytes4[]',
          },
        ],
        internalType: 'struct IDiamondCut.FacetCut[]',
        name: '_diamondCut',
        type: 'tuple[]',
      },
      { internalType: 'address', name: '_init', type: 'address' },
      { internalType: 'bytes', name: '_calldata', type: 'bytes' },
    ],
    name: 'diamondCut',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes4', name: '_functionSelector', type: 'bytes4' },
    ],
    name: 'facetAddress',
    outputs: [
      { internalType: 'address', name: 'facetAddress_', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'facetAddresses',
    outputs: [
      { internalType: 'address[]', name: 'facetAddresses_', type: 'address[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_facet', type: 'address' }],
    name: 'facetFunctionSelectors',
    outputs: [
      {
        internalType: 'bytes4[]',
        name: 'facetFunctionSelectors_',
        type: 'bytes4[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'facets',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'facetAddress', type: 'address' },
          {
            internalType: 'bytes4[]',
            name: 'functionSelectors',
            type: 'bytes4[]',
          },
        ],
        internalType: 'struct IDiamondLoupe.Facet[]',
        name: 'facets_',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: '_interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_from',
        type: 'address',
      },
      { indexed: true, internalType: 'address', name: '_to', type: 'address' },
    ],
    name: 'OwnershipTransferRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [],
    name: 'cancelOwnershipTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'confirmOwnershipTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: 'owner_', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_assetAddress',
        type: 'address',
      },
      { indexed: false, internalType: 'address', name: '_to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'LogWithdraw',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address payable', name: '_callTo', type: 'address' },
      { internalType: 'bytes', name: '_callData', type: 'bytes' },
      { internalType: 'address', name: '_assetAddress', type: 'address' },
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'executeCallAndWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_assetAddress', type: 'address' },
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'dexAddress',
        type: 'address',
      },
    ],
    name: 'DexAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'dexAddress',
        type: 'address',
      },
    ],
    name: 'DexRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes4',
        name: 'functionSignature',
        type: 'bytes4',
      },
      { indexed: true, internalType: 'bool', name: 'approved', type: 'bool' },
    ],
    name: 'FunctionSignatureApprovalChanged',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'address', name: '_dex', type: 'address' }],
    name: 'addDex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'approvedDexs',
    outputs: [
      { internalType: 'address[]', name: 'addresses', type: 'address[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address[]', name: '_dexs', type: 'address[]' }],
    name: 'batchAddDex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address[]', name: '_dexs', type: 'address[]' }],
    name: 'batchRemoveDex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes4[]', name: '_signatures', type: 'bytes4[]' },
      { internalType: 'bool', name: '_approval', type: 'bool' },
    ],
    name: 'batchSetFunctionApprovalBySignature',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_contract', type: 'address' }],
    name: 'isContractApproved',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: '_signature', type: 'bytes4' }],
    name: 'isFunctionApproved',
    outputs: [{ internalType: 'bool', name: 'approved', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_dex', type: 'address' }],
    name: 'removeDex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes4', name: '_signature', type: 'bytes4' },
      { internalType: 'bool', name: '_approval', type: 'bool' },
    ],
    name: 'setFunctionApprovalBySignature',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      { indexed: true, internalType: 'bytes4', name: 'method', type: 'bytes4' },
    ],
    name: 'ExecutionAllowed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      { indexed: true, internalType: 'bytes4', name: 'method', type: 'bytes4' },
    ],
    name: 'ExecutionDenied',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'bytes4', name: '_selector', type: 'bytes4' },
      { internalType: 'address', name: '_executor', type: 'address' },
    ],
    name: 'addressCanExecuteMethod',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes4', name: '_selector', type: 'bytes4' },
      { internalType: 'address', name: '_executor', type: 'address' },
      { internalType: 'bool', name: '_canExecute', type: 'bool' },
    ],
    name: 'setCanExecute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'fee', type: 'uint256' },
    ],
    name: 'SetFixedNativeFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'fee', type: 'uint256' },
    ],
    name: 'SetMaxRubicPlatformFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'fee', type: 'uint256' },
    ],
    name: 'SetRubicPlatformFee',
    type: 'event',
  },
  {
    inputs: [],
    name: 'RubicPlatformFee',
    outputs: [
      { internalType: 'uint256', name: '_RubicPlatformFee', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'address', name: '_integrator', type: 'address' },
    ],
    name: 'calcTokenFees',
    outputs: [
      { internalType: 'uint256', name: 'totalFee', type: 'uint256' },
      { internalType: 'uint256', name: 'RubicFee', type: 'uint256' },
      { internalType: 'uint256', name: 'integratorFee', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feeTreasure',
    outputs: [
      { internalType: 'address', name: '_feeTreasure', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'fixedNativeFee',
    outputs: [
      { internalType: 'uint256', name: '_fixedNativeFee', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_feeTreasure', type: 'address' },
      {
        internalType: 'uint256',
        name: '_maxRubicPlatformFee',
        type: 'uint256',
      },
      { internalType: 'uint256', name: '_maxFixedNativeFee', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_integrator', type: 'address' }],
    name: 'integratorToFeeInfo',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'isIntegrator', type: 'bool' },
          { internalType: 'uint32', name: 'tokenFee', type: 'uint32' },
          { internalType: 'uint32', name: 'RubicTokenShare', type: 'uint32' },
          {
            internalType: 'uint32',
            name: 'RubicFixedCryptoShare',
            type: 'uint32',
          },
          { internalType: 'uint128', name: 'fixedFeeAmount', type: 'uint128' },
        ],
        internalType: 'struct IFeesFacet.IntegratorFeeInfo',
        name: '_info',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxFixedNativeFee',
    outputs: [
      { internalType: 'uint256', name: '_maxFixedNativeFee', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxRubicPlatformFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '_maxRubicPlatformFee',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_feeTreasure', type: 'address' },
    ],
    name: 'setFeeTreasure',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_fixedNativeFee', type: 'uint256' },
    ],
    name: 'setFixedNativeFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_integrator', type: 'address' },
      {
        components: [
          { internalType: 'bool', name: 'isIntegrator', type: 'bool' },
          { internalType: 'uint32', name: 'tokenFee', type: 'uint32' },
          { internalType: 'uint32', name: 'RubicTokenShare', type: 'uint32' },
          {
            internalType: 'uint32',
            name: 'RubicFixedCryptoShare',
            type: 'uint32',
          },
          { internalType: 'uint128', name: 'fixedFeeAmount', type: 'uint128' },
        ],
        internalType: 'struct IFeesFacet.IntegratorFeeInfo',
        name: '_info',
        type: 'tuple',
      },
    ],
    name: 'setIntegratorInfo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_maxFee', type: 'uint256' }],
    name: 'setMaxRubicPlatformFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_platformFee', type: 'uint256' },
    ],
    name: 'setRubicPlatformFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'receivingAssetId',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'RubicTransferCompleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'receivingAssetId',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'RubicTransferRecovered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        indexed: false,
        internalType: 'struct IRubic.BridgeData',
        name: 'bridgeData',
        type: 'tuple',
      },
    ],
    name: 'RubicTransferStarted',
    type: 'event',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'bytes', name: 'firstSwapCalldata', type: 'bytes' },
          { internalType: 'bytes', name: 'secondSwapCalldata', type: 'bytes' },
          {
            internalType: 'address',
            name: 'intermediateToken',
            type: 'address',
          },
          { internalType: 'address', name: 'bridgingToken', type: 'address' },
          { internalType: 'address', name: 'firstDexRouter', type: 'address' },
          { internalType: 'address', name: 'secondDexRouter', type: 'address' },
          { internalType: 'address', name: 'relayRecipient', type: 'address' },
          { internalType: 'bytes', name: 'otherSideCalldata', type: 'bytes' },
        ],
        internalType: 'struct SymbiosisFacet.SymbiosisData',
        name: '_symbiosisData',
        type: 'tuple',
      },
    ],
    name: 'startBridgeTokensViaSymbiosis',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' },
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'bytes', name: 'firstSwapCalldata', type: 'bytes' },
          { internalType: 'bytes', name: 'secondSwapCalldata', type: 'bytes' },
          {
            internalType: 'address',
            name: 'intermediateToken',
            type: 'address',
          },
          { internalType: 'address', name: 'bridgingToken', type: 'address' },
          { internalType: 'address', name: 'firstDexRouter', type: 'address' },
          { internalType: 'address', name: 'secondDexRouter', type: 'address' },
          { internalType: 'address', name: 'relayRecipient', type: 'address' },
          { internalType: 'bytes', name: 'otherSideCalldata', type: 'bytes' },
        ],
        internalType: 'struct SymbiosisFacet.SymbiosisData',
        name: '_symbiosisData',
        type: 'tuple',
      },
    ],
    name: 'swapAndStartBridgeTokensViaSymbiosis',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'toChainToken', type: 'address' },
          {
            internalType: 'uint256',
            name: 'expectedToChainTokenAmount',
            type: 'uint256',
          },
          { internalType: 'uint32', name: 'slippage', type: 'uint32' },
        ],
        internalType: 'struct XYFacet.XYData',
        name: '_xyData',
        type: 'tuple',
      },
    ],
    name: 'startBridgeTokensViaXY',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' },
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'address', name: 'toChainToken', type: 'address' },
          {
            internalType: 'uint256',
            name: 'expectedToChainTokenAmount',
            type: 'uint256',
          },
          { internalType: 'uint32', name: 'slippage', type: 'uint32' },
        ],
        internalType: 'struct XYFacet.XYData',
        name: '_xyData',
        type: 'tuple',
      },
    ],
    name: 'swapAndStartBridgeTokensViaXY',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint16',
        name: 'layerZeroChainId',
        type: 'uint16',
      },
    ],
    name: 'LayerZeroChainIdSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'uint16', name: 'poolId', type: 'uint16' },
        ],
        indexed: false,
        internalType: 'struct StargateFacet.PoolIdConfig[]',
        name: 'poolIdConfigs',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'uint256', name: 'chainId', type: 'uint256' },
          { internalType: 'uint16', name: 'layerZeroChainId', type: 'uint16' },
        ],
        indexed: false,
        internalType: 'struct StargateFacet.ChainIdConfig[]',
        name: 'chainIdConfigs',
        type: 'tuple[]',
      },
    ],
    name: 'StargateInitialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
    ],
    name: 'StargatePoolIdSet',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_destinationChainId', type: 'uint256' },
      {
        components: [
          { internalType: 'uint256', name: 'dstPoolId', type: 'uint256' },
          { internalType: 'uint256', name: 'minAmountLD', type: 'uint256' },
          { internalType: 'uint256', name: 'dstGasForCall', type: 'uint256' },
          { internalType: 'uint256', name: 'lzFee', type: 'uint256' },
          {
            internalType: 'address payable',
            name: 'refundAddress',
            type: 'address',
          },
          { internalType: 'bytes', name: 'callTo', type: 'bytes' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct StargateFacet.StargateData',
        name: '_stargateData',
        type: 'tuple',
      },
    ],
    name: 'quoteLayerZeroFee',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_chainId', type: 'uint256' },
      { internalType: 'uint16', name: '_layerZeroChainId', type: 'uint16' },
    ],
    name: 'setLayerZeroChainId',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint16', name: '_poolId', type: 'uint16' },
    ],
    name: 'setStargatePoolId',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'dstPoolId', type: 'uint256' },
          { internalType: 'uint256', name: 'minAmountLD', type: 'uint256' },
          { internalType: 'uint256', name: 'dstGasForCall', type: 'uint256' },
          { internalType: 'uint256', name: 'lzFee', type: 'uint256' },
          {
            internalType: 'address payable',
            name: 'refundAddress',
            type: 'address',
          },
          { internalType: 'bytes', name: 'callTo', type: 'bytes' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct StargateFacet.StargateData',
        name: '_stargateData',
        type: 'tuple',
      },
    ],
    name: 'startBridgeTokensViaStargate',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' },
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'uint256', name: 'dstPoolId', type: 'uint256' },
          { internalType: 'uint256', name: 'minAmountLD', type: 'uint256' },
          { internalType: 'uint256', name: 'dstGasForCall', type: 'uint256' },
          { internalType: 'uint256', name: 'lzFee', type: 'uint256' },
          {
            internalType: 'address payable',
            name: 'refundAddress',
            type: 'address',
          },
          { internalType: 'bytes', name: 'callTo', type: 'bytes' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct StargateFacet.StargateData',
        name: '_stargateData',
        type: 'tuple',
      },
    ],
    name: 'swapAndStartBridgeTokensViaStargate',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'referrer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'fromAssetId',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'toAssetId',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fromAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'toAmount',
        type: 'uint256',
      },
    ],
    name: 'RubicSwappedGeneric',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_transactionId', type: 'bytes32' },
      { internalType: 'address', name: '_integrator', type: 'address' },
      { internalType: 'address', name: '_referrer', type: 'address' },
      { internalType: 'address payable', name: '_receiver', type: 'address' },
      { internalType: 'uint256', name: '_minAmount', type: 'uint256' },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' },
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]',
      },
    ],
    name: 'swapTokensGeneric',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: '_routers',
        type: 'address[]',
      },
      {
        indexed: false,
        internalType: 'bytes4[]',
        name: '_selectors',
        type: 'bytes4[]',
      },
      {
        components: [
          { internalType: 'bool', name: 'isAvailable', type: 'bool' },
          { internalType: 'uint256', name: 'offset', type: 'uint256' },
        ],
        indexed: false,
        internalType: 'struct LibMappings.ProviderFunctionInfo[]',
        name: '_infos',
        type: 'tuple[]',
      },
    ],
    name: 'SelectorToInfoUpdated',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: '_router', type: 'address' },
      { internalType: 'bytes4', name: '_selector', type: 'bytes4' },
    ],
    name: 'getSelectorInfo',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'isAvailable', type: 'bool' },
          { internalType: 'uint256', name: 'offset', type: 'uint256' },
        ],
        internalType: 'struct LibMappings.ProviderFunctionInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'router', type: 'address' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct GenericCrossChainFacet.GenericCrossChainData',
        name: '_genericData',
        type: 'tuple',
      },
    ],
    name: 'startBridgeTokensViaGenericCrossChain',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' },
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'address', name: 'router', type: 'address' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct GenericCrossChainFacet.GenericCrossChainData',
        name: '_genericData',
        type: 'tuple',
      },
    ],
    name: 'swapAndStartBridgeTokensViaGenericCrossChain',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: '_routers', type: 'address[]' },
      { internalType: 'bytes4[]', name: '_selectors', type: 'bytes4[]' },
      {
        components: [
          { internalType: 'bool', name: 'isAvailable', type: 'bool' },
          { internalType: 'uint256', name: 'offset', type: 'uint256' },
        ],
        internalType: 'struct LibMappings.ProviderFunctionInfo[]',
        name: '_infos',
        type: 'tuple[]',
      },
    ],
    name: 'updateSelectorInfo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'address payable',
            name: 'destination',
            type: 'address',
          },
        ],
        internalType: 'struct TransferFacet.TransferData',
        name: '_transferData',
        type: 'tuple',
      },
    ],
    name: 'startBridgeTokensViaTransfer',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' },
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'address payable',
            name: 'destination',
            type: 'address',
          },
        ],
        internalType: 'struct TransferFacet.TransferData',
        name: '_transferData',
        type: 'tuple',
      },
    ],
    name: 'swapAndStartBridgeTokensViaTransfer',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'router', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'uint256', name: 'extraNative', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct GenericCrossChainFacet.GenericCrossChainData',
        name: '_genericData',
        type: 'tuple',
      },
    ],
    name: 'startBridgeTokensViaGenericCrossChain',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'transactionId', type: 'bytes32' },
          { internalType: 'string', name: 'bridge', type: 'string' },
          { internalType: 'address', name: 'integrator', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'refundee', type: 'address' },
          { internalType: 'uint256', name: 'minAmount', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasSourceSwaps', type: 'bool' },
          { internalType: 'bool', name: 'hasDestinationCall', type: 'bool' },
        ],
        internalType: 'struct IRubic.BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'callTo', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'address', name: 'sendingAssetId', type: 'address' },
          {
            internalType: 'address',
            name: 'receivingAssetId',
            type: 'address',
          },
          { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'bool', name: 'requiresDeposit', type: 'bool' },
        ],
        internalType: 'struct LibSwap.SwapData[]',
        name: '_swapData',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'address', name: 'router', type: 'address' },
          { internalType: 'address', name: 'approveTo', type: 'address' },
          { internalType: 'uint256', name: 'extraNative', type: 'uint256' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct GenericCrossChainFacet.GenericCrossChainData',
        name: '_genericData',
        type: 'tuple',
      },
    ],
    name: 'swapAndStartBridgeTokensViaGenericCrossChain',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
]

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [signer] = await ethers.getSigners()

  console.log(`Deploying with account ${signer.address} on ${chainId}`)
  console.log(
    'Account balance signer:',
    ethers.utils.formatUnits(await signer.getBalance())
  )

  /* ------------------------------------------- */
  const contract = await ethers.getContractAt(
    abi,
    '0x6aa981bff95edfea36bdae98c26b274ffcafe8d3'
  )

  const info = await contract.getSelectorInfo(
    '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5',
    '0xbe1eace7'
  )

  console.log(info)

  //   const iface = new ethers.utils.Interface(abi)

  //   console.log(iface.format(FormatTypes.minimal).slice(0, 24))
  //   console.log(iface.format(FormatTypes.minimal).slice(24))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
