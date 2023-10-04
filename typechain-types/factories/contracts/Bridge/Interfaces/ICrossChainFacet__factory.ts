/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ICrossChainFacet,
  ICrossChainFacetInterface,
} from "../../../../contracts/Bridge/Interfaces/ICrossChainFacet";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "transactionId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "integrator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "refundee",
        type: "address",
      },
      {
        components: [
          {
            internalType: "string",
            name: "bridge",
            type: "string",
          },
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "minAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "destinationChainId",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "hasSourceSwaps",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "hasDestinationCall",
            type: "bool",
          },
        ],
        indexed: false,
        internalType: "struct BridgeData",
        name: "bridgeData",
        type: "tuple",
      },
    ],
    name: "BridgeTransferStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "transactionId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "integrator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "refundee",
        type: "address",
      },
      {
        components: [
          {
            internalType: "string",
            name: "bridge",
            type: "string",
          },
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "minAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "destinationChainId",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "hasSourceSwaps",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "hasDestinationCall",
            type: "bool",
          },
        ],
        indexed: false,
        internalType: "struct BridgeData[]",
        name: "bridgeData",
        type: "tuple[]",
      },
    ],
    name: "MultiTokenBridgeTransferStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address[]",
        name: "routers",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "bytes4[]",
        name: "selectors",
        type: "bytes4[]",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "isAvailable",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "offset",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct CallToFunctionInfo[]",
        name: "info",
        type: "tuple[]",
      },
    ],
    name: "SelectorToInfoUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "transactionId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "integrator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "refundee",
        type: "address",
      },
      {
        components: [
          {
            internalType: "string",
            name: "bridge",
            type: "string",
          },
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "minAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "destinationChainId",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "hasSourceSwaps",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "hasDestinationCall",
            type: "bool",
          },
        ],
        indexed: false,
        internalType: "struct BridgeData[]",
        name: "bridgeData",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "dex",
            type: "address",
          },
          {
            internalType: "address",
            name: "fromToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "toToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "fromAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "leftOverFromAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "returnToAmount",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct SwapInfo[]",
        name: "swapInfo",
        type: "tuple[]",
      },
    ],
    name: "SwapBridgeTransferStarted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_transactionId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_integrator",
        type: "address",
      },
      {
        internalType: "address",
        name: "_refundee",
        type: "address",
      },
      {
        components: [
          {
            internalType: "string",
            name: "bridge",
            type: "string",
          },
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "minAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "destinationChainId",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "hasSourceSwaps",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "hasDestinationCall",
            type: "bool",
          },
        ],
        internalType: "struct BridgeData",
        name: "_bridgeData",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "address",
            name: "callTo",
            type: "address",
          },
          {
            internalType: "address",
            name: "approveTo",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "extraNative",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "permit",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
        ],
        internalType: "struct CrossChainData",
        name: "_genericData",
        type: "tuple",
      },
    ],
    name: "bridge",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_transactionId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_integrator",
        type: "address",
      },
      {
        internalType: "address",
        name: "_refundee",
        type: "address",
      },
      {
        components: [
          {
            internalType: "string",
            name: "bridge",
            type: "string",
          },
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "minAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "destinationChainId",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "hasSourceSwaps",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "hasDestinationCall",
            type: "bool",
          },
        ],
        internalType: "struct BridgeData[]",
        name: "_bridgeData",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "callTo",
            type: "address",
          },
          {
            internalType: "address",
            name: "approveTo",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "extraNative",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "permit",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
        ],
        internalType: "struct CrossChainData[]",
        name: "_genericData",
        type: "tuple[]",
      },
    ],
    name: "bridgeMultipleTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_transactionId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_integrator",
        type: "address",
      },
      {
        internalType: "address",
        name: "_refundee",
        type: "address",
      },
      {
        components: [
          {
            internalType: "string",
            name: "bridge",
            type: "string",
          },
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "minAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "destinationChainId",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "hasSourceSwaps",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "hasDestinationCall",
            type: "bool",
          },
        ],
        internalType: "struct BridgeData[]",
        name: "_bridgeData",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "callTo",
            type: "address",
          },
          {
            internalType: "address",
            name: "approveTo",
            type: "address",
          },
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "fromAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minToAmount",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "swapCallData",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "permit",
            type: "bytes",
          },
        ],
        internalType: "struct SwapData[]",
        name: "_swapData",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "callTo",
            type: "address",
          },
          {
            internalType: "address",
            name: "approveTo",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "extraNative",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "permit",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
        ],
        internalType: "struct CrossChainData[]",
        name: "_genericData",
        type: "tuple[]",
      },
    ],
    name: "swapAndBridge",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export class ICrossChainFacet__factory {
  static readonly abi = _abi;
  static createInterface(): ICrossChainFacetInterface {
    return new utils.Interface(_abi) as ICrossChainFacetInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ICrossChainFacet {
    return new Contract(address, _abi, signerOrProvider) as ICrossChainFacet;
  }
}
