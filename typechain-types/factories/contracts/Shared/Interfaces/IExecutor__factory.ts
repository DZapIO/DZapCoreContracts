/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IExecutor,
  IExecutorInterface,
} from "../../../../contracts/Shared/Interfaces/IExecutor";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "transactionId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "DzapTransferCompleted",
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
        internalType: "address payable",
        name: "_receiver",
        type: "address",
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
        internalType: "struct SwapData",
        name: "_swapData",
        type: "tuple",
      },
    ],
    name: "swapAndCompleteBridgeTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export class IExecutor__factory {
  static readonly abi = _abi;
  static createInterface(): IExecutorInterface {
    return new utils.Interface(_abi) as IExecutorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IExecutor {
    return new Contract(address, _abi, signerOrProvider) as IExecutor;
  }
}
