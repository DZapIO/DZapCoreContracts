/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IDAIPermit,
  IDAIPermitInterface,
} from "../../../../contracts/Shared/Interfaces/IDAIPermit";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "holder",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IDAIPermit__factory {
  static readonly abi = _abi;
  static createInterface(): IDAIPermitInterface {
    return new utils.Interface(_abi) as IDAIPermitInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IDAIPermit {
    return new Contract(address, _abi, signerOrProvider) as IDAIPermit;
  }
}
