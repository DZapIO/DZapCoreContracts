/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  InteractionNotificationReceiver,
  InteractionNotificationReceiverInterface,
} from "../../../../contracts/Test/AggregationRouterV5.sol/InteractionNotificationReceiver";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "taker",
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
      {
        internalType: "bytes",
        name: "interactiveData",
        type: "bytes",
      },
    ],
    name: "fillOrderInteraction",
    outputs: [
      {
        internalType: "uint256",
        name: "offeredTakingAmount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class InteractionNotificationReceiver__factory {
  static readonly abi = _abi;
  static createInterface(): InteractionNotificationReceiverInterface {
    return new utils.Interface(
      _abi
    ) as InteractionNotificationReceiverInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): InteractionNotificationReceiver {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as InteractionNotificationReceiver;
  }
}
