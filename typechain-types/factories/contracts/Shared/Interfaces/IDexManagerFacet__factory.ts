/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IDexManagerFacet,
  IDexManagerFacetInterface,
} from "../../../../contracts/Shared/Interfaces/IDexManagerFacet";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "dexAddress",
        type: "address",
      },
    ],
    name: "DexAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "dexAddress",
        type: "address",
      },
    ],
    name: "DexRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "dex",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes4",
        name: "functionSignature",
        type: "bytes4",
      },
      {
        indexed: true,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "FunctionSignatureApprovalChanged",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_dex",
        type: "address",
      },
    ],
    name: "addDex",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_dexs",
        type: "address[]",
      },
    ],
    name: "batchAddDex",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_dexs",
        type: "address[]",
      },
    ],
    name: "batchRemoveDex",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_dex",
        type: "address",
      },
    ],
    name: "isContractApproved",
    outputs: [
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_dex",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "_signature",
        type: "bytes4",
      },
    ],
    name: "isFunctionApproved",
    outputs: [
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_dex",
        type: "address",
      },
    ],
    name: "removeDex",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_dex",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "_signature",
        type: "bytes4",
      },
      {
        internalType: "bool",
        name: "_approval",
        type: "bool",
      },
    ],
    name: "setFunctionApprovalBySignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IDexManagerFacet__factory {
  static readonly abi = _abi;
  static createInterface(): IDexManagerFacetInterface {
    return new utils.Interface(_abi) as IDexManagerFacetInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IDexManagerFacet {
    return new Contract(address, _abi, signerOrProvider) as IDexManagerFacet;
  }
}
