/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  OrderRFQMixin,
  OrderRFQMixinInterface,
} from "../../../../contracts/Test/AggregationRouterV5.sol/OrderRFQMixin";

const _abi = [
  {
    inputs: [],
    name: "ETHTransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMsgValue",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidatedOrder",
    type: "error",
  },
  {
    inputs: [],
    name: "MakingAmountExceeded",
    type: "error",
  },
  {
    inputs: [],
    name: "OrderExpired",
    type: "error",
  },
  {
    inputs: [],
    name: "RFQBadSignature",
    type: "error",
  },
  {
    inputs: [],
    name: "RFQPrivateOrder",
    type: "error",
  },
  {
    inputs: [],
    name: "RFQSwapWithZeroAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "RFQZeroTargetIsForbidden",
    type: "error",
  },
  {
    inputs: [],
    name: "SafePermitBadLength",
    type: "error",
  },
  {
    inputs: [],
    name: "SafeTransferFromFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "TakingAmountExceeded",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "orderHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "makingAmount",
        type: "uint256",
      },
    ],
    name: "OrderFilledRFQ",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "orderInfo",
        type: "uint256",
      },
    ],
    name: "cancelOrderRFQ",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "orderInfo",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "additionalMask",
        type: "uint256",
      },
    ],
    name: "cancelOrderRFQ",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "info",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "makerAsset",
            type: "address",
          },
          {
            internalType: "address",
            name: "takerAsset",
            type: "address",
          },
          {
            internalType: "address",
            name: "maker",
            type: "address",
          },
          {
            internalType: "address",
            name: "allowedSender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "makingAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "takingAmount",
            type: "uint256",
          },
        ],
        internalType: "struct OrderRFQLib.OrderRFQ",
        name: "order",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "flagsAndAmount",
        type: "uint256",
      },
    ],
    name: "fillOrderRFQ",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "info",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "makerAsset",
            type: "address",
          },
          {
            internalType: "address",
            name: "takerAsset",
            type: "address",
          },
          {
            internalType: "address",
            name: "maker",
            type: "address",
          },
          {
            internalType: "address",
            name: "allowedSender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "makingAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "takingAmount",
            type: "uint256",
          },
        ],
        internalType: "struct OrderRFQLib.OrderRFQ",
        name: "order",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "vs",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "flagsAndAmount",
        type: "uint256",
      },
    ],
    name: "fillOrderRFQCompact",
    outputs: [
      {
        internalType: "uint256",
        name: "filledMakingAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "filledTakingAmount",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "orderHash",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "info",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "makerAsset",
            type: "address",
          },
          {
            internalType: "address",
            name: "takerAsset",
            type: "address",
          },
          {
            internalType: "address",
            name: "maker",
            type: "address",
          },
          {
            internalType: "address",
            name: "allowedSender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "makingAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "takingAmount",
            type: "uint256",
          },
        ],
        internalType: "struct OrderRFQLib.OrderRFQ",
        name: "order",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "flagsAndAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "fillOrderRFQTo",
    outputs: [
      {
        internalType: "uint256",
        name: "filledMakingAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "filledTakingAmount",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "orderHash",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "info",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "makerAsset",
            type: "address",
          },
          {
            internalType: "address",
            name: "takerAsset",
            type: "address",
          },
          {
            internalType: "address",
            name: "maker",
            type: "address",
          },
          {
            internalType: "address",
            name: "allowedSender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "makingAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "takingAmount",
            type: "uint256",
          },
        ],
        internalType: "struct OrderRFQLib.OrderRFQ",
        name: "order",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "flagsAndAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "permit",
        type: "bytes",
      },
    ],
    name: "fillOrderRFQToWithPermit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "maker",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "slot",
        type: "uint256",
      },
    ],
    name: "invalidatorForOrderRFQ",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

export class OrderRFQMixin__factory {
  static readonly abi = _abi;
  static createInterface(): OrderRFQMixinInterface {
    return new utils.Interface(_abi) as OrderRFQMixinInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): OrderRFQMixin {
    return new Contract(address, _abi, signerOrProvider) as OrderRFQMixin;
  }
}
