import { ethers } from 'hardhat'
import { forkNetwork, impersonate, updateBalance } from './utils'
import { ADDRESS_ZERO, CONTRACTS, DZAP_NATIVE } from '../constants'
import { IDZapDiamond, SwapFacet, WNATIVE } from '../typechain-types'
import {
  approveToken,
  encodePermitData,
  getRevertMsg,
} from '../scripts/core/helper'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { PermitType } from '../types'

const jsonRpcUrl =
  'https://polygon-mainnet.g.alchemy.com/v2/Ko1ZTIARgSv-ZGDJz2vUrHMsR7NOAdnV'

// const jsonRpcUrl = 'https://mainnet.base.org'
// const jsonRpcUrl =
//   'https://opt-mainnet.g.alchemy.com/v2/Ko1ZTIARgSv-ZGDJz2vUrHMsR7NOAdnV'

// const jsonRpcUrl = 'https://bscrpc.com'
// const jsonRpcUrl =
//   'https://arb-mainnet.g.alchemy.com/v2/Ko1ZTIARgSv-ZGDJz2vUrHMsR7NOAdnV'
// const chainId = 42161

const diamondAddress = '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6'
const integratorAddress = '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad'
const userAddress = '0x2467ebaf6860532384639836ca40706cd8f2cd17'

const abi = [
  // 'function bridge(bytes32 _transactionId, address _integrator, address _refundee, tuple(string bridge, address from, address to, address receiver, uint256 minAmount, uint256 destinationChainId, bool hasSourceSwaps, bool hasDestinationCall) _bridgeData, tuple(address callTo, address approveTo, uint256 extraNative, bytes permit, bytes callData) _genericData) payable',
  // 'function bridgeViaTransfer(bytes32 _transactionId, address _integrator, address _refundee, tuple(string bridge, address from, address to, address receiver, uint256 minAmount, uint256 destinationChainId, bool hasSourceSwaps, bool hasDestinationCall) _bridgeData, tuple(address destination) _transferData, bytes _permit) payable',
  // 'function bridgeTokensToNonEVM(bytes32,address,address,(string,address,bytes,bytes,uint256,uint256,bool,bool),(address,address,uint256,bytes,bytes))',

  {
    inputs: [],
    name: 'AllSwapsFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AlreadyInitialized',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'reason',
        type: 'bytes',
      },
    ],
    name: 'BridgeCallFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CannotAuthorizeSelf',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CannotBridgeToSameNetwork',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ContractCallNotAllowed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FeeTooHigh',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InformationMismatch',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'contractBalance',
        type: 'uint256',
      },
    ],
    name: 'InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'IntegratorNotActive',
    type: 'error',
  },
  {
    inputs: [],
    name: 'IntegratorNotAllowed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidAmount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidContract',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDestinationChain',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidFee',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidFixedNativeFee',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidReceiver',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSendingToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSwapDetails',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NativeTokenNotSupported',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NativeTransferFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoSwapFromZeroBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoTransferToNullAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotAContract',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotInitialized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NullAddrIsNotAValidSpender',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NullAddrIsNotAnERC20Token',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OnlyContractOwner',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ShareTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'minAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'returnAmount',
        type: 'uint256',
      },
    ],
    name: 'SlippageTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'reason',
        type: 'bytes',
      },
    ],
    name: 'SwapCallFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TokenInformationMismatch',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnAuthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnAuthorizedCallToFunction',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnauthorizedCaller',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WithdrawFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroAddress',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct BridgeData',
        name: 'bridgeData',
        type: 'tuple',
      },
    ],
    name: 'BridgeTransferStarted',
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
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes4',
        name: 'method',
        type: 'bytes4',
      },
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
      {
        indexed: true,
        internalType: 'bytes4',
        name: 'method',
        type: 'bytes4',
      },
    ],
    name: 'ExecutionDenied',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'dex',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes4',
        name: 'functionSignature',
        type: 'bytes4',
      },
      {
        indexed: true,
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'FunctionSignatureApprovalChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'refundee',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'dex',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'fromToken',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'toToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'leftOverFromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'returnToAmount',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct SwapInfo[]',
        name: 'swapInfo',
        type: 'tuple[]',
      },
    ],
    name: 'MultiSwapped',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct BridgeData[]',
        name: 'bridgeData',
        type: 'tuple[]',
      },
    ],
    name: 'MultiTokenBridgeTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'routers',
        type: 'address[]',
      },
      {
        indexed: false,
        internalType: 'bytes4[]',
        name: 'selectors',
        type: 'bytes4[]',
      },
      {
        components: [
          {
            internalType: 'bool',
            name: 'isAvailable',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'offset',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct CallToFunctionInfo[]',
        name: 'info',
        type: 'tuple[]',
      },
    ],
    name: 'SelectorToInfoUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
    ],
    name: 'SetDzapFixedNativeFeeAmount',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
    ],
    name: 'SetDzapTokenFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
    ],
    name: 'SetFixedNativeFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum FeeType[]',
        name: 'feeType',
        type: 'uint8[]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'tokenFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'fixedNativeFeeAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'dzapTokenShare',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'dzapFixedNativeShare',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct FeeInfo[]',
        name: 'info',
        type: 'tuple[]',
      },
    ],
    name: 'SetIntegrator',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
    ],
    name: 'SetMaxPlatformFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
    ],
    name: 'SetPlatformFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct BridgeData[]',
        name: 'bridgeData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'dex',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'fromToken',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'toToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'leftOverFromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'returnToAmount',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct SwapInfo[]',
        name: 'swapInfo',
        type: 'tuple[]',
      },
    ],
    name: 'SwapBridgeTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'refundee',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'dex',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'fromToken',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'toToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'leftOverFromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'returnToAmount',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct SwapInfo',
        name: 'swapInfo',
        type: 'tuple',
      },
    ],
    name: 'Swapped',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_dex',
        type: 'address',
      },
    ],
    name: 'addDex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: '_selector',
        type: 'bytes4',
      },
      {
        internalType: 'address',
        name: '_executor',
        type: 'address',
      },
    ],
    name: 'addressCanExecuteMethod',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_dexs',
        type: 'address[]',
      },
    ],
    name: 'batchAddDex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_dexs',
        type: 'address[]',
      },
    ],
    name: 'batchRemoveDex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        internalType: 'struct BridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'extraNative',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
        ],
        internalType: 'struct CrossChainData',
        name: '_genericData',
        type: 'tuple',
      },
    ],
    name: 'bridge',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        internalType: 'struct BridgeData[]',
        name: '_bridgeData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'extraNative',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
        ],
        internalType: 'struct CrossChainData[]',
        name: '_genericData',
        type: 'tuple[]',
      },
    ],
    name: 'bridgeMultipleTokens',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'enum FeeType',
        name: '_feeType',
        type: 'uint8',
      },
    ],
    name: 'calcFixedNativeFees',
    outputs: [
      {
        internalType: 'uint256',
        name: 'fixedNativeFeeAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'dzapShare',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'enum FeeType',
        name: '_feeType',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'calcTokenFees',
    outputs: [
      {
        internalType: 'uint256',
        name: 'totalFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'dzapShare',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_router',
        type: 'address',
      },
      {
        internalType: 'bytes4',
        name: '_selector',
        type: 'bytes4',
      },
    ],
    name: 'getSelectorInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'bool',
            name: 'isAvailable',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'offset',
            type: 'uint256',
          },
        ],
        internalType: 'struct CallToFunctionInfo',
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
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'enum FeeType',
        name: '_feeType',
        type: 'uint8',
      },
    ],
    name: 'integratorFeeInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'tokenFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'fixedNativeFeeAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'dzapTokenShare',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'dzapFixedNativeShare',
            type: 'uint256',
          },
        ],
        internalType: 'struct FeeInfo',
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
        internalType: 'address',
        name: '_dex',
        type: 'address',
      },
    ],
    name: 'isContractApproved',
    outputs: [
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_dex',
        type: 'address',
      },
      {
        internalType: 'bytes4',
        name: '_signature',
        type: 'bytes4',
      },
    ],
    name: 'isFunctionApproved',
    outputs: [
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
    ],
    name: 'isIntegratorAllowed',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxFixedNativeFeeAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '_maxFixedNativeFee',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxTokenFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_refundee',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'minToAmount',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'swapCallData',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
        ],
        internalType: 'struct SwapData[]',
        name: '_data',
        type: 'tuple[]',
      },
    ],
    name: 'multiSwap',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_refundee',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'minToAmount',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'swapCallData',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
        ],
        internalType: 'struct SwapData[]',
        name: '_data',
        type: 'tuple[]',
      },
    ],
    name: 'multiSwapWithoutRevert',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'protocolFeeVault',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_dex',
        type: 'address',
      },
    ],
    name: 'removeDex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
    ],
    name: 'removeIntegrator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4[]',
        name: '_selector',
        type: 'bytes4[]',
      },
      {
        internalType: 'address[]',
        name: '_executor',
        type: 'address[]',
      },
      {
        internalType: 'bool[]',
        name: '_canExecute',
        type: 'bool[]',
      },
    ],
    name: 'setBatchCanExecute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: '_selector',
        type: 'bytes4',
      },
      {
        internalType: 'address',
        name: '_executor',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: '_canExecute',
        type: 'bool',
      },
    ],
    name: 'setCanExecute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_dex',
        type: 'address',
      },
      {
        internalType: 'bytes4',
        name: '_signature',
        type: 'bytes4',
      },
      {
        internalType: 'bool',
        name: '_approval',
        type: 'bool',
      },
    ],
    name: 'setFunctionApprovalBySignature',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'enum FeeType[]',
        name: '_feeTypes',
        type: 'uint8[]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'tokenFee',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'fixedNativeFeeAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'dzapTokenShare',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'dzapFixedNativeShare',
            type: 'uint256',
          },
        ],
        internalType: 'struct FeeInfo[]',
        name: '_feeInfo',
        type: 'tuple[]',
      },
    ],
    name: 'setIntegratorInfo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_protocolFeeVault',
        type: 'address',
      },
    ],
    name: 'setProtocolFeeVault',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_refundee',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'minToAmount',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'swapCallData',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
        ],
        internalType: 'struct SwapData',
        name: '_data',
        type: 'tuple',
      },
    ],
    name: 'swap',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        internalType: 'struct BridgeData[]',
        name: '_bridgeData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'minToAmount',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'swapCallData',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
        ],
        internalType: 'struct SwapData[]',
        name: '_swapData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'extraNative',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
        ],
        internalType: 'struct CrossChainData[]',
        name: '_genericData',
        type: 'tuple[]',
      },
    ],
    name: 'swapAndBridge',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_routers',
        type: 'address[]',
      },
      {
        internalType: 'bytes4[]',
        name: '_selectors',
        type: 'bytes4[]',
      },
      {
        components: [
          {
            internalType: 'bool',
            name: 'isAvailable',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'offset',
            type: 'uint256',
          },
        ],
        internalType: 'struct CallToFunctionInfo[]',
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
        internalType: 'bytes',
        name: 'reason',
        type: 'bytes',
      },
    ],
    name: 'BridgeCallFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CannotBridgeToSameNetwork',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ContractCallNotAllowed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InformationMismatch',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'contractBalance',
        type: 'uint256',
      },
    ],
    name: 'InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'IntegratorNotAllowed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidAmount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidContract',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidLength',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPermit',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPermitData',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSwapDetails',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NativeTransferFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoSwapFromZeroBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoTransferToNullAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotAContract',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NullAddrIsNotAValidSpender',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NullAddrIsNotAnERC20Token',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'leftOverAmount',
        type: 'uint256',
      },
    ],
    name: 'PartialSwap',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ReentrancyError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'minAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'returnAmount',
        type: 'uint256',
      },
    ],
    name: 'SlippageTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'reason',
        type: 'bytes',
      },
    ],
    name: 'SwapCallFailed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    name: 'UnAuthorizedCall',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroAddress',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'to',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'receiver',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct GenericBridgeData',
        name: 'bridgeData',
        type: 'tuple',
      },
    ],
    name: 'BridgeTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'to',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'receiver',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct GenericBridgeData[]',
        name: 'bridgeData',
        type: 'tuple[]',
      },
    ],
    name: 'MultiTokenBridgeTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'to',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'receiver',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct GenericBridgeData[]',
        name: 'bridgeData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'dex',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'fromToken',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'toToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'leftOverFromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'returnToAmount',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct SwapInfo[]',
        name: 'swapInfo',
        type: 'tuple[]',
      },
    ],
    name: 'SwapBridgeTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'dex',
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
      {
        indexed: false,
        internalType: 'uint256',
        name: 'leftoverFromAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'SwappedTokens',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'to',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'receiver',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        internalType: 'struct GenericBridgeData[]',
        name: '_bridgeData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'extraNative',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
        ],
        internalType: 'struct CrossChainData[]',
        name: '_genericData',
        type: 'tuple[]',
      },
    ],
    name: 'bridgeMultipleTokensToNonEVM',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'to',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'receiver',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        internalType: 'struct GenericBridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'extraNative',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
        ],
        internalType: 'struct CrossChainData',
        name: '_genericData',
        type: 'tuple',
      },
    ],
    name: 'bridgeTokensToNonEVM',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'to',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'receiver',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        internalType: 'struct GenericBridgeData[]',
        name: '_bridgeData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'minToAmount',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'swapCallData',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
        ],
        internalType: 'struct SwapData[]',
        name: '_swapData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'extraNative',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
        ],
        internalType: 'struct CrossChainData[]',
        name: '_genericData',
        type: 'tuple[]',
      },
    ],
    name: 'swapAndBridgeToNonEVM',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'CannotBridgeToSameNetwork',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ContractCallNotAllowed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InformationMismatch',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'contractBalance',
        type: 'uint256',
      },
    ],
    name: 'InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'IntegratorNotAllowed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidAmount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidContract',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidLength',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPermit',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPermitData',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSwapDetails',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NativeTransferFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoSwapFromZeroBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoTransferToNullAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NullAddrIsNotAValidSpender',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NullAddrIsNotAnERC20Token',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'leftOverAmount',
        type: 'uint256',
      },
    ],
    name: 'PartialSwap',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ReentrancyError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'minAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'returnAmount',
        type: 'uint256',
      },
    ],
    name: 'SlippageTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'reason',
        type: 'bytes',
      },
    ],
    name: 'SwapCallFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroAddress',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'to',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'receiver',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct GenericBridgeData',
        name: 'bridgeData',
        type: 'tuple',
      },
    ],
    name: 'BridgeTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'to',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'receiver',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct GenericBridgeData[]',
        name: 'bridgeData',
        type: 'tuple[]',
      },
    ],
    name: 'MultiTokenBridgeTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'integrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'to',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'receiver',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct GenericBridgeData[]',
        name: 'bridgeData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'dex',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'fromToken',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'toToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'leftOverFromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'returnToAmount',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct SwapInfo[]',
        name: 'swapInfo',
        type: 'tuple[]',
      },
    ],
    name: 'SwapBridgeTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transactionId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'dex',
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
      {
        indexed: false,
        internalType: 'uint256',
        name: 'leftoverFromAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'SwappedTokens',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'to',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'receiver',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        internalType: 'struct GenericBridgeData[]',
        name: '_bridgeData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
          {
            internalType: 'address',
            name: 'transferTo',
            type: 'address',
          },
        ],
        internalType: 'struct TransferData[]',
        name: '_transferData',
        type: 'tuple[]',
      },
    ],
    name: 'bridgeMultipleTokensViaTransfer',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'to',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'receiver',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        internalType: 'struct GenericBridgeData',
        name: '_bridgeData',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
          {
            internalType: 'address',
            name: 'transferTo',
            type: 'address',
          },
        ],
        internalType: 'struct TransferData',
        name: '_transferData',
        type: 'tuple',
      },
    ],
    name: 'bridgeViaTransfer',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_transactionId',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_integrator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_refundee',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'bridge',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'to',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'receiver',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'destinationChainId',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'hasSourceSwaps',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'hasDestinationCall',
            type: 'bool',
          },
        ],
        internalType: 'struct GenericBridgeData[]',
        name: '_bridgeData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
          {
            internalType: 'address',
            name: 'transferTo',
            type: 'address',
          },
        ],
        internalType: 'struct TransferData[]',
        name: '_transferData',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'callTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'approveTo',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'fromAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'minToAmount',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'swapCallData',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'permit',
            type: 'bytes',
          },
        ],
        internalType: 'struct SwapData[]',
        name: '_swapData',
        type: 'tuple[]',
      },
    ],
    name: 'swapAndBridgeViaTransfer',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'CannotAuthorizeSelf',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnAuthorized',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'bridges',
        type: 'address[]',
      },
    ],
    name: 'BridgeAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'bridges',
        type: 'address[]',
      },
      {
        indexed: false,
        internalType: 'bytes4[]',
        name: 'selectors',
        type: 'bytes4[]',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'info',
        type: 'uint256[]',
      },
    ],
    name: 'SelectorToInfoUpdated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_bridge',
        type: 'address',
      },
      {
        internalType: 'bytes4',
        name: '_selector',
        type: 'bytes4',
      },
    ],
    name: 'getSelectorInfo',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_bridge',
        type: 'address',
      },
    ],
    name: 'isWhitelisted',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_bridgeAddresses',
        type: 'address[]',
      },
      {
        internalType: 'bytes4[]',
        name: '_selectors',
        type: 'bytes4[]',
      },
      {
        internalType: 'uint256[]',
        name: '_offset',
        type: 'uint256[]',
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
        internalType: 'address[]',
        name: '_bridgeAddresses',
        type: 'address[]',
      },
    ],
    name: 'whiteListAggregatorsAndBridges',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

describe.skip('Fork.test.ts', () => {
  it('bridge ', async () => {
    await forkNetwork(jsonRpcUrl)
    const user = await impersonate('0x99BCEBf44433E901597D9fCb16E799a4847519f6')

    const data1 =
      '0xced8ddd80000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000072000000000000000000000000099bcebf44433e901597d9fcb16e799a4847519f6000000000000000000000000000000000000000000000000000000000000210500000000000000000000000000000000000000000000000000000000000000550000000000000000000000000000000000000000000000000000018f85d6580a00000000000000000000000000000000000000000000000000000000000002200000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000000000000000000000000000000000000002aea5400000000000000000000000003c499c542cef5e3811e1192ce70d8cc03d5c335900000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000002668adc000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000006f05b59d3b2000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000006abc800000000000000000000000000000000000000000000000000000000000002600000000000000000000000000000000000000000000000000000000000000004647a617000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044101000000000000000000000000000000000000000000000000000000000000002000000000000000000000000099bcebf44433e901597d9fcb16e799a4847519f6000000000000000000000000a9c430de6a91132330a09be41f9f19bf45702f7400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000340000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca00000000000000000000000000000000000000000000000000000000021f7f1b000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000004647a6170000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000032aed3bce901da12ca8489788f3a99fce1056e14000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca00000000000000000000000000000000000000000000000000000000025f613600000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000164c04b8d59000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000a9c430de6a91132330a09be41f9f19bf45702f74000000000000000000000000000000000000000000000000000000006647282800000000000000000000000000000000000000000000000000000000025f613600000000000000000000000000000000000000000000000000000000021f7f1b0000000000000000000000000000000000000000000000000000000000000064833589fcd6edb6e08f4c7c32d4f71b54bda029133d70b2f31f75dc84acdd5e1588695221959b2d37420000000000000000000000000000000000000606e6736ca9e922766279a22b75a600fe8b8473b6d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc450000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000003c499c542cef5e3811e1192ce70d8cc03d5c33590000000000000000000000000000000000000000000000000000000002aea54000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000104b858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000cf2dba4e5c9f1b47ac09dc712a0f7bd8ee31a15d0000000000000000000000000000000000000000000000000000000002aea5400000000000000000000000000000000000000000000000000000000002668adc000000000000000000000000000000000000000000000000000000000000002b2791bca1f2de4661ed88a30c99a7a9449aa841740000643c499c542cef5e3811e1192ce70d8cc03d5c335900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    const data =
      '0xced8ddd8000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000006c000000000000000000000000099bcebf44433e901597d9fcb16e799a4847519f6000000000000000000000000000000000000000000000000000000000000210500000000000000000000000000000000000000000000000000000000000000110000000000000000000000000000000000000000000000000000018f85dcba0600000000000000000000000000000000000000000000000000000000000002200000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000000000000000000000000000000000000002b6d8120000000000000000000000003c499c542cef5e3811e1192ce70d8cc03d5c335900000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000002b35d0a000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000006f05b59d3b20000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000066f700000000000000000000000000000000000000000000000000000000000000260000000000000000000000000000000000000000000000000000000000000000a554e495a454e2d434c490000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003e101000000000000000000000000000000000000000000000000000000000000002000000000000000000000000099bcebf44433e901597d9fcb16e799a4847519f6000000000000000000000000a9c430de6a91132330a09be41f9f19bf45702f7400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000002e0000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca0000000000000000000000000000000000000000000000000000000002a8ce6c000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000a554e495a454e2d434c4900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000002626664c2603336e57b271c5c0b26f421741e481000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca0000000000000000000000000000000000000000000000000000000002ac600100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000104b858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000a9c430de6a91132330a09be41f9f19bf45702f740000000000000000000000000000000000000000000000000000000002ac60010000000000000000000000000000000000000000000000000000000002a8ce6c000000000000000000000000000000000000000000000000000000000000002b833589fcd6edb6e08f4c7c32d4f71b54bda02913000064d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc450000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000003c499c542cef5e3811e1192ce70d8cc03d5c33590000000000000000000000000000000000000000000000000000000002b6d81200000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000104b858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000cf2dba4e5c9f1b47ac09dc712a0f7bd8ee31a15d0000000000000000000000000000000000000000000000000000000002b6d8120000000000000000000000000000000000000000000000000000000002b35d0a000000000000000000000000000000000000000000000000000000000000002b2791bca1f2de4661ed88a30c99a7a9449aa841740000643c499c542cef5e3811e1192ce70d8cc03d5c335900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    const from = '0x99BCEBf44433E901597D9fCb16E799a4847519f6'
    // const to = '0x07d0ac7671D4242858D0cebcd34ec03907685947'
    const to = '0xCf2DBA4e5C9f1B47AC09dc712A0F7bD8eE31A15d'
    const value = '500000000000000000'

    const token = await ethers.getContractAt(
      '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20',
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
    )
    await token.connect(user).approve(from, parseUnits('100', 18))
    await user.sendTransaction({
      from,
      to,
      data,
      value,
    })
  })

  it('bridge myana', async () => {
    await forkNetwork(jsonRpcUrl)
    const user = await impersonate('0x99BCEBf44433E901597D9fCb16E799a4847519f6')

    const args = {
      transactionId:
        '0x3078393942432d3735313966362d313731353933363539363831370000000000',
      integrator: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      refundee: '0x99BCEBf44433E901597D9fCb16E799a4847519f6',
      bridgeData: {
        bridge: 'debridge',
        from: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        to: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
        receiver: '0x99BCEBf44433E901597D9fCb16E799a4847519f6',
        minAmount: '45000000',
        destinationChainId: 8453,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      },
      crossChaindata: {
        callTo: '0xCf2DBA4e5C9f1B47AC09dc712A0F7bD8eE31A15d',
        approveTo: '0xCf2DBA4e5C9f1B47AC09dc712A0F7bD8eE31A15d',
        extraNative: '500000000000000000',
        permit:
          '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
        callData:
          '0xced8ddd800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000780000000000000000000000000f708e11a7c94abde8f6217b13e6fe39c8b9cc0a6000000000000000000000000000000000000000000000000000000000000210500000000000000000000000000000000000000000000000000000000000000550000000000000000000000000000000000000000000000000000018f85ca6cf100000000000000000000000000000000000000000000000000000000000002200000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000000000000000000000000000000000000002aea5400000000000000000000000003c499c542cef5e3811e1192ce70d8cc03d5c335900000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000002668ad9000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000006f05b59d3b20000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000075e8200000000000000000000000000000000000000000000000000000000000002600000000000000000000000000000000000000000000000000000000000000004647a61700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004a1010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f708e11a7c94abde8f6217b13e6fe39c8b9cc0a6000000000000000000000000a9c430de6a91132330a09be41f9f19bf45702f7400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca00000000000000000000000000000000000000000000000000000000021eedf4000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000004647a61700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000cf77a3ba9a5ca399b7c97c74d54e5b1beb874e43000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca00000000000000000000000000000000000000000000000000000000025eae7900000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c4cac88ea900000000000000000000000000000000000000000000000000000000025eae7900000000000000000000000000000000000000000000000000000000021eedf400000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000a9c430de6a91132330a09be41f9f19bf45702f74000000000000000000000000000000000000000000000000000000006647251a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000b79dd08ea68a908a97220c76d19a6aa9cbde43760000000000000000000000000000000000000000000000000000000000000001000000000000000000000000420dd381b31aef6683db6b902084cb0ffece40da000000000000000000000000b79dd08ea68a908a97220c76d19a6aa9cbde4376000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000420dd381b31aef6683db6b902084cb0ffece40da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc450000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000003c499c542cef5e3811e1192ce70d8cc03d5c33590000000000000000000000000000000000000000000000000000000002aea54000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000104b858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000cf2dba4e5c9f1b47ac09dc712a0f7bd8ee31a15d0000000000000000000000000000000000000000000000000000000002aea5400000000000000000000000000000000000000000000000000000000002668ad9000000000000000000000000000000000000000000000000000000000000002b2791bca1f2de4661ed88a30c99a7a9449aa841740000643c499c542cef5e3811e1192ce70d8cc03d5c335900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      },
    }

    const value = '500000000000000000'

    // const dzap = await ethers.getContractAt(abi, diamondAddress)
    const dzap = await ethers.getContractAt(abi, diamondAddress)

    await dzap
      .connect(user)
      .bridge(
        args.transactionId,
        args.integrator,
        args.refundee,
        args.bridgeData,
        args.crossChaindata,
        { value }
      )
    // await dzap
    //   .connect(user)
    //   .bridgeTokensToNonEVM(
    //     args.transactionId,
    //     args.integrator,
    //     args.refundee,
    //     args.bridgeData,
    //     args.crossChaindata
    //   )
  })

  it('bridge unizen', async () => {
    await forkNetwork(jsonRpcUrl)
    const user = await impersonate('0x99BCEBf44433E901597D9fCb16E799a4847519f6')

    const args = {
      transactionId:
        '0x3078393942432d3735313966362d313731353835303637343139370000000000',
      integrator: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      refundee: '0x99BCEBf44433E901597D9fCb16E799a4847519f6',
      bridgeData: {
        bridge: 'unizen',
        from: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        to: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        receiver: '0x99BCEBf44433E901597D9fCb16E799a4847519f6',
        minAmount: '48999100',
        destinationChainId: 42161,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      },
      crossChaindata: {
        callTo: '0x07d0ac7671D4242858D0cebcd34ec03907685947',
        approveTo: '0x07d0ac7671D4242858D0cebcd34ec03907685947',
        extraNative: '500000000000000000',
        permit:
          '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
        callData:
          '0xced8ddd8000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000006c000000000000000000000000099bcebf44433e901597d9fcb16e799a4847519f6000000000000000000000000000000000000000000000000000000000000a4b100000000000000000000000000000000000000000000000000000000000000550000000000000000000000000000000000000000000000000000018f80ab411900000000000000000000000000000000000000000000000000000000000002200000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000000000000000000000000000000000000002ebaabc0000000000000000000000003c499c542cef5e3811e1192ce70d8cc03d5c3359000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000029d03f2000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e5831000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000006f05b59d3b2000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000007755d00000000000000000000000000000000000000000000000000000000000002600000000000000000000000000000000000000000000000000000000000000004647a61700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003e101000000000000000000000000000000000000000000000000000000000000002000000000000000000000000099bcebf44433e901597d9fcb16e799a4847519f6000000000000000000000000a9c430de6a91132330a09be41f9f19bf45702f7400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000000000000000000000000000002dc8be8a9532a5000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000004647a6170000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e583100000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000000000000000000000000000000000000295059000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000104b858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000a9c430de6a91132330a09be41f9f19bf45702f740000000000000000000000000000000000000000000000000000000002950590000000000000000000000000000000000000000000000000002dc8be8a9532a5000000000000000000000000000000000000000000000000000000000000002baf88d065e77c8cc2239327c5edb3a432268e58310001f482af49447d8a07e3bd95bd0d56f35241523fbab100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc450000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000003c499c542cef5e3811e1192ce70d8cc03d5c33590000000000000000000000000000000000000000000000000000000002ebaabc00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000104b858183f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000080000000000000000000000000cf2dba4e5c9f1b47ac09dc712a0f7bd8ee31a15d0000000000000000000000000000000000000000000000000000000002ebaabc00000000000000000000000000000000000000000000000000000000029d03f2000000000000000000000000000000000000000000000000000000000000002b2791bca1f2de4661ed88a30c99a7a9449aa841740000643c499c542cef5e3811e1192ce70d8cc03d5c335900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      },
    }

    const dzap = await ethers.getContractAt(abi, diamondAddress)

    await dzap.bridge(
      args.transactionId,
      args.integrator,
      args.refundee,
      args.bridgeData,
      args.crossChaindata
    )
  })

  it('getRevertMsg', async () => {
    const msg = getRevertMsg(
      '0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000315472616e7366657248656c7065723a3a7472616e7366657246726f6d3a207472616e7366657246726f6d206661696c6564000000000000000000000000000000'
    )
    console.log(msg)
  })

  it('cusmon err', async () => {
    const data =
      '0x43373c4f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'

    // const mayanInterface = []

    const dzap = await ethers.getContractAt(abi, diamondAddress)
    const decodedError = dzap.interface.parseError(data)
    console.log('decodedError', decodedError)
  })

  it('test', async () => {
    await forkNetwork(jsonRpcUrl)

    const dZap = (await ethers.getContractAt(
      'IDZapDiamond',
      diamondAddress
    )) as IDZapDiamond

    const user = await impersonate('0x5ff934972bADf8433AEb486efDD36411A24376B7')
    await updateBalance(user.address)
    const transactionId = ethers.utils.formatBytes32String('dummyId')
    const refundee = user.address

    const data = {
      bridgeData: [
        {
          bridge: 'stargate',
          from: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          to: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          receiver: '0x5ff934972bADf8433AEb486efDD36411A24376B7',
          minAmount: '572900',
          destinationChainId: 137,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ],
      genericData: [
        {
          callTo: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
          approveTo: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
          extraNative: '0x5c5543c9479b',
          permit:
            '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
          callData:
            '0xed178619000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000d80b4cf0128daa5039c281096f65a75cf336cdf032b3cb4c380acf6e40c3b218a2f000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca0000000000000000000000005ff934972badf8433aeb486efdd36411a24376b700000000000000000000000000000000000000000000000000000000000854db000000000000000000000000000000000000000000000000000000000000008900000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000873746172676174650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004647a617000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000006352a56caadc4f1e25cd6c75970fa768a3304e640000000000000000000000006352a56caadc4f1e25cd6c75970fa768a3304e64000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca000000000000000000000000000000000000000000000000000000000008bde400000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000a0490411a3200000000000000000000000081f30003e1d02901b160dd9c9a4f4209febdac39000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca000000000000000000000000ab067c01c7f5734da168c699ae9d23a4512c9fdb0000000000000000000000005ff934972badf8433aeb486efdd36411a24376b7000000000000000000000000000000000000000000000000000000000008bde400000000000000000000000000000000000000000000000000000000000854db000000000000000000000000000000000000000000000000000000000008c51c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000933a06c631ed8b5e4f3848c91a1cfc45e5c7eab3000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000004a000000000000000000000000000000000000000000000000000000000000005c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000064cac460ee80000000000000003b74a460ab067c01c7f5734da168c699ae9d23a4512c9fdb000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda0291300000000000000000000000081f30003e1d02901b160dd9c9a4f4209febdac3900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000002449f865422000000000000000000000000420000000000000000000000000000000000000600000000000000000000000000000001000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000104e5b07cdb000000000000000000000000f6c0a374a483101e04ef5f7ac9bd15d9142bac950000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000081f30003e1d02901b160dd9c9a4f4209febdac3900000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000002e4200000000000000000000000000000000000006000064d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca0000030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000648a6a1e85000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca000000000000000000000000353c1f0bc78fbbc245b3c93ef77b1dcc5b77d2a0000000000000000000000000000000000000000000000000000000000008c51c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000001a49f865422000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca00000000000000000000000000000001000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000064d1660f99000000000000000000000000d9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca0000000000000000000000005ff934972badf8433aeb486efdd36411a24376b7000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000007e904000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005c5543c9479b0000000000000000000000005ff934972badf8433aeb486efdd36411a24376b70000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000145ff934972badf8433aeb486efdd36411a24376b70000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        },
      ],
      value: '101521279240091',
    }

    let err
    try {
      await dZap
        .connect(user)
        .bridge(
          transactionId,
          integratorAddress,
          refundee,
          data.bridgeData[0],
          data.genericData[0],
          {
            value: data.value,
          }
        )
    } catch (error: any) {
      err = error
      console.log('err', err)

      if (error.data) {
        const decodedError = dZap.interface.parseError(error.data)
        console.log('decodedError', decodedError)

        if (decodedError.args.reason) {
          const revertMessage = getRevertMsg(decodedError.args.reason)
          console.log('revertMessage', revertMessage)
          throw revertMessage
        } else {
          throw decodedError
        }
      } else {
        console.log('final error', error)
      }
    }
  })
  it('openocean', async () => {
    await forkNetwork(jsonRpcUrl)

    const dZap = (await ethers.getContractAt(
      CONTRACTS.SwapFacet,
      diamondAddress
    )) as SwapFacet

    const user = await impersonate('0x5ff934972bADf8433AEb486efDD36411A24376B7')
    await updateBalance(user.address)

    // await approveToken(
    //   user,
    //   '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    //   dZap.address,
    //   BigNumber.from('521600000000000000')
    // )

    const swapData = [
      {
        callTo: '0xCa423977156BB05b13A2BA3b76Bc5419E2fE9680',
        approveTo: '0xCa423977156BB05b13A2BA3b76Bc5419E2fE9680',
        from: '0x296f55f8fb28e498b858d0bcda06d955b2cb3f97',
        to: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        fromAmount: '78699999',
        minToAmount: '31907',
        swapCallData:
          '0x83bd37f9000f00000404b0dddf027de5028f5c0001926fAAfcE6148884CD5cF98Cd1878f865E8911Bf00000001F708e11A7C94abdE8f6217B13e6fE39C8b9cC0a60006808403010203000c0100010201020600000001ff0000000000000000000000000000000ca747e5c527e857d8a71b53b6efbad2866b9e04296f55f8fb28e498b858d0bcda06d955b2cb3f97000000000000000000000000000000000000000000000000',
        permit:
          '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
      },
    ]
    // const value = '1000000000000000000'
    const value = '0'

    console.log(encodePermitData('0x', PermitType.PERMIT))

    await dZap
      .connect(user)
      .multiSwap(
        ethers.utils.formatBytes32String('dummyId'),
        integratorAddress,
        user.address,
        user.address,
        swapData,
        {
          value: value,
        }
      )

    // let err
    // try {
    //   await dZap
    //     .connect(user)
    //     .multiSwap(
    //       ethers.utils.formatBytes32String('dummyId'),
    //       integratorAddress,
    //       user.address,
    //       user.address,
    //       swapData,
    //       {
    //         value: value,
    //       }
    //     )
    // } catch (error: any) {
    //   err = error
    //   console.log('err', err)

    //   if (error.data) {
    //     const decodedError = dZap.interface.parseError(error.data)
    //     console.log('decodedError', decodedError)

    //     if (decodedError.args.reason) {
    //       const revertMessage = getRevertMsg(decodedError.args.reason)
    //       console.log('revertMessage', revertMessage)
    //       throw revertMessage
    //     } else {
    //       throw decodedError
    //     }
    //   } else {
    //     console.log('final error', error)
    //   }
    // }
  })
  it('test', async () => {
    await forkNetwork(jsonRpcUrl)

    const dZap = (await ethers.getContractAt(
      CONTRACTS.SwapFacet,
      diamondAddress
    )) as SwapFacet

    const user = await impersonate('0x12480616436DD6D555f88B8d94bB5156E28825B1')
    await updateBalance('')

    const transactionRequest = {
      data: '0x80254d043078313234382d3838323562312d31373033373337383531363434000000000000000000000000000000000045dd5ec28dbf5296dffae428d7f484ab02ee7bad00000000000000000000000012480616436dd6d555f88b8d94bb5156e28825b100000000000000000000000012480616436dd6d555f88b8d94bb5156e28825b100000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000def171fe48cf0115b1d80b88dc8eab59176fee57000000000000000000000000216b4b4ba9f3e719726886d34a177484278bfcae000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb900000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab100000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000017338e6c5326c000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000005e000000000000000000000000000000000000000000000000000000000000004a454e3f31b0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb900000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab100000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000017338e6c5326c000000000000000000000000000000000000000000000000000176f8d46a191200000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000003800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000f708e11a7c94abde8f6217b13e6fe39c8b9cc0a600000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000000000000000000000000658d4e5c3f3b8df6ac0c46e187baf2bbbd1385bd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9000000000000000000000000eff23b4be1091b53205e35f3afcd9c7182bf30620000000000000000000000000000000000000000000000000000000000000108a9059cbb000000000000000000000000eff23b4be1091b53205e35f3afcd9c7182bf306200000000000000000000000000000000000000000000000000000000000f42407dc20382000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb900000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab100000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000def171fe48cf0115b1d80b88dc8eab59176fee57000000000000000000000000d5b927956057075377263aab7f8afc12f85100db00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004400000000000000000000000000000000000000000000000000000000000001080000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
      to: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
      from: '0x12480616436dd6d555f88b8d94bb5156e28825b1',
      chainId: 42161,
      value: '0',
      gasLimit: '7209598',
    }
    const { data, from, to, value, gasLimit } = transactionRequest
    let err
    try {
      return await user.sendTransaction({
        from,
        to,
        data,
        value,
        gasLimit,
        // gasPrice: ethers.utils.parseUnits('105', 'gwei'),
      })
    } catch (error: any) {
      err = error
      console.log('err', err)

      if (error.data) {
        const decodedError = dZap.interface.parseError(error.data)
        console.log('decodedError', decodedError)

        if (decodedError.args.reason) {
          const revertMessage = getRevertMsg(decodedError.args.reason)
          console.log('revertMessage', revertMessage)
          throw revertMessage
        } else {
          throw decodedError
        }
      } else {
        console.log('final error', error)
      }
    }
  })
  it('test', async () => {
    await forkNetwork(jsonRpcUrl)

    const dZap = (await ethers.getContractAt(
      'IDZapDiamond',
      diamondAddress
    )) as IDZapDiamond

    const user = await impersonate('0x12480616436dd6d555f88b8d94bb5156e28825b1')
    await updateBalance(user.address, '11735473494975274')

    const transactionRequest = {
      // data: '0x80254d043078313234382d3838323542312d31373033363836343835313035000000000000000000000000000000000045dd5ec28dbf5296dffae428d7f484ab02ee7bad00000000000000000000000012480616436dd6d555f88b8d94bb5156e28825b100000000000000000000000012480616436dd6d555f88b8d94bb5156e28825b100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf12700000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf12700000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000004d0e30db0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      // to: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
      // from: '0x12480616436DD6D555f88B8d94bB5156E28825B1',
      // chainId: 137,
      // value: '1000000000000000000',
      // gasLimit: '172761',

      // data: '0x80254d043078313234382d3838323542312d31373033363839353931373633000000000000000000000000000000000045dd5ec28dbf5296dffae428d7f484ab02ee7bad00000000000000000000000012480616436dd6d555f88b8d94bb5156e28825b100000000000000000000000012480616436dd6d555f88b8d94bb5156e28825b100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf12700000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf12700000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000016345785d8a00000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000242e1a7d4d000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
      // to: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
      // from: '0x12480616436DD6D555f88B8d94bB5156E28825B1',
      // chainId: 137,
      // value: '0',
      // gasLimit: '235207',
      data: '0x80254d043078313234382d3838323562312d31373033373337353238363635000000000000000000000000000000000045dd5ec28dbf5296dffae428d7f484ab02ee7bad00000000000000000000000012480616436dd6d555f88b8d94bb5156e28825b100000000000000000000000012480616436dd6d555f88b8d94bb5156e28825b100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000006131b5fae19ea4f9d964eac0408e4408b66337b50000000000000000000000006131b5fae19ea4f9d964eac0408e4408b66337b50000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000c2132d05d31c914a87c6611c10748aeb04b58e8f000000000000000000000000000000000000000000000000073af6bd57fa8000000000000000000000000000000000000000000000000000000000000008840700000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000be00000000000000000000000000000000000000000000000000000000000000aa4e21fd0e90000000000000000000000000000000000000000000000000000000000000020000000000000000000000000f081470f5c6fbccf48cc4e5b82dd926409dcdd67000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000062000000000000000000000000000000000000000000000000000000000000008600000000000000000000000000000000000000000000000000000000000000560000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000c2132d05d31c914a87c6611c10748aeb04b58e8f000000000000000000000000f708e11a7c94abde8f6217b13e6fe39c8b9cc0a600000000000000000000000000000000000000000000000000000000658cfd6800000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000002a000000000000000000000000000000000000000000000000000000000000000408cc7a56b0000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000ba12222222228d8ba445958a75a0704d566bf2c8791f47f9b1d9c95853ab6e9d866e9e6c7d05689d000100000000000000000ce60000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf12700000000000000000000000003a29cab2e124919d14a6f735b6033a3aad2b260f000000000000000000000000000000000000000000000000073af6bd57fa8000000000000000000000000000000000000000000000000000000000000000004063407a490000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000f081470f5c6fbccf48cc4e5b82dd926409dcdd670000000000000000000000003245f123129707bb2abe9c1c22aeae82ccdc975f0000000000000000000000003a29cab2e124919d14a6f735b6033a3aad2b260f0000000000000000000000005d066d022ede10efa2717ed3d79f22f949f8c175000000000000000000000000000000000000000000000000b5ed43e424c689e200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004063407a490000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000f081470f5c6fbccf48cc4e5b82dd926409dcdd67000000000000000000000000160fbf00ab5fbf0200c0cd4929aeaa2add25fb5b0000000000000000000000005d066d022ede10efa2717ed3d79f22f949f8c175000000000000000000000000c2132d05d31c914a87c6611c10748aeb04b58e8f00000000000000000000000000000000000000000000000007d5d6dea4febf010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000100000000000000000000000000089a0c0000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000c2132d05d31c914a87c6611c10748aeb04b58e8f000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000f708e11a7c94abde8f6217b13e6fe39c8b9cc0a6000000000000000000000000000000000000000000000000073af6bd57fa800000000000000000000000000000000000000000000000000000000000000897d8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000f081470f5c6fbccf48cc4e5b82dd926409dcdd670000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000073af6bd57fa800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e77b22536f75726365223a22222c22416d6f756e74496e555344223a22302e353432383832222c22416d6f756e744f7574555344223a22302e35363432383737323339393939393939222c22526566657272616c223a22222c22466c616773223a332c22496e74656772697479496e666f223a7b224b65794944223a2231222c225369676e6174757265223a2259564c735543523055365237305736714f66395162545955787849656353494f356f70504a622b4d786767365355336f54665554593842506a69574b502f59434151736a5043684a794f41516d417a43497437395741416b2b415151706f2b6e644a595948693578745a2f5470445130454353666b54706955797737576e6d7a314a58685135656157434a2b6349744a4a66764674634d2f4141685836774c754455694e7553555631334a6a484265644f756d36463138457379542f43337353352b593046464857724a7270324c41633833356d38436c2b445a4854662b547873434a524d7332526d592b3430613056475470584f4a6d6758714b36654d4a37584c4c4768446e747a63614d3056486f5a4c58416f334e43365532685a37756d5066454c376d3759733448472f38465878324a646d7977715a2b2f484537514443716f4237525a77414b53554e5236367468767675773d3d227d7d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
      to: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
      from: '0x12480616436dd6d555f88b8d94bb5156e28825b1',
      chainId: 137,
      value: '0',
      gasLimit: '857628',
    }
    const { data, from, to, value } = transactionRequest
    let err
    try {
      return await user.sendTransaction({
        from,
        to,
        data,
        value,
        maxFeePerGas: '2000000000',
        maxPriorityFeePerGas: '1200000000',
        // gasPrice: ethers.utils.parseUnits('105', 'gwei'),
      })
    } catch (error: any) {
      err = error
      console.log('err', err)

      if (error.data) {
        const decodedError = dZap.interface.parseError(error.data)
        console.log('decodedError', decodedError)

        if (decodedError.args.reason) {
          const revertMessage = getRevertMsg(decodedError.args.reason)
          console.log('revertMessage', revertMessage)
          throw revertMessage
        } else {
          throw decodedError
        }
      } else {
        console.log('final error', error)
      }
    }
  })

  it('test', async () => {
    // const data = '0x7a904298'
    const data = '0x483f15e5'

    const dZap = (await ethers.getContractAt(
      CONTRACTS.SwapFacet,
      diamondAddress
    )) as SwapFacet

    const decodedError = dZap.interface.parseError(data)
    console.log('decodedError', decodedError)
    if (decodedError.name) throw decodedError.name

    if (decodedError.args.reason) {
      const revertMessage = getRevertMsg(decodedError.args.reason)
      console.log('revertMessage', revertMessage)
      throw revertMessage
    } else {
      throw decodedError
    }
  })

  it('test', async () => {
    await forkNetwork(jsonRpcUrl)

    const dZap = (await ethers.getContractAt(
      'IDZapDiamond',
      diamondAddress
    )) as IDZapDiamond

    const ownerAddress = await dZap.owner()

    const wNativeAddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
    const wNative = (await ethers.getContractAt(
      CONTRACTS.WNATIVE,
      wNativeAddress
    )) as WNATIVE
    const owner = await impersonate(ownerAddress)
    await updateBalance(ownerAddress)

    await dZap.connect(owner).addDex(wNativeAddress)

    await dZap
      .connect(owner)
      .batchSetFunctionApprovalBySignature(
        [wNativeAddress, wNativeAddress],
        ['0xd0e30db0', '0x2e1a7d4d'],
        [true, true]
      )

    const amount = parseUnits('.1')

    const swapData = [
      {
        callTo: wNativeAddress,
        approveTo: ADDRESS_ZERO,
        from: DZAP_NATIVE,
        to: wNativeAddress,
        fromAmount: amount,
        minToAmount: amount,
        swapCallData: (
          await wNative.populateTransaction.deposit({
            value: amount,
          })
        ).data as string,
        permit:
          '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
      },
    ]

    const user = owner

    let err
    try {
      await dZap
        .connect(user)
        .multiSwap(
          ethers.utils.formatBytes32String('dummyId'),
          integratorAddress,
          user.address,
          user.address,
          swapData,
          {
            value: amount,
          }
        )
    } catch (error: any) {
      err = error
      console.log('err', err)

      if (error.data) {
        const decodedError = dZap.interface.parseError(error.data)
        console.log('decodedError', decodedError)

        if (decodedError.args.reason) {
          const revertMessage = getRevertMsg(decodedError.args.reason)
          console.log('revertMessage', revertMessage)
          // throw revertMessage
        } else {
          // throw decodedError
        }
      } else {
        console.log('final error', error)
      }
    }
  })

  it('test', async () => {
    await forkNetwork(jsonRpcUrl)

    const dZap = (await ethers.getContractAt(
      'IDZapDiamond',
      diamondAddress
    )) as IDZapDiamond

    const wNativeAddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
    const wNative = (await ethers.getContractAt(
      CONTRACTS.WNATIVE,
      wNativeAddress
    )) as WNATIVE

    const ownerAddress = await dZap.owner()

    const owner = await impersonate(ownerAddress)
    await updateBalance(ownerAddress)

    const user = await impersonate('0x12480616436DD6D555f88B8d94bB5156E28825B1')
    await updateBalance((await user).address)

    // await wNative.connect(user).deposit({ value: parseUnits('1') })
    const amount = parseUnits('.1')

    await dZap.connect(owner).batchAddDex([wNativeAddress])
    await dZap
      .connect(owner)
      .batchSetFunctionApprovalBySignature(
        [wNativeAddress, wNativeAddress],
        ['0xd0e30db0', '0x2e1a7d4d'],
        [true, true]
      )

    const data = (await wNative.populateTransaction.withdraw(amount))
      .data as string

    const swapData = [
      {
        callTo: wNativeAddress,
        approveTo: wNativeAddress,
        from: wNativeAddress,
        to: DZAP_NATIVE,
        fromAmount: amount.toString(),
        minToAmount: amount.toString(),
        swapCallData: data,
        permit:
          '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
      },
    ]

    console.log({ swapData })

    // await wNative.connect(user).approve(dZap.address, amount)

    let err
    try {
      await dZap
        .connect(user)
        .multiSwap(
          ethers.utils.formatBytes32String('dummyId'),
          integratorAddress,
          user.address,
          user.address,
          swapData
        )
    } catch (error: any) {
      err = error
      console.log('err', err)

      if (error.data) {
        const decodedError = dZap.interface.parseError(error.data)
        console.log('decodedError', decodedError)

        if (decodedError.args.reason) {
          const revertMessage = getRevertMsg(decodedError.args.reason)
          console.log('revertMessage', revertMessage)
          // throw revertMessage
        } else {
          // throw decodedError
        }
      } else {
        console.log('final error', error)
      }
    }
  })
})
