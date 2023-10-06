/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  Swapper,
  SwapperInterface,
} from "../../../../contracts/Shared/Helpers/Swapper";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "leftOverAmount",
        type: "uint256",
      },
    ],
    name: "PartialSwap",
    type: "error",
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
        indexed: false,
        internalType: "address",
        name: "dex",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "fromAssetId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "toAssetId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fromAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "toAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "leftoverFromAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "SwappedTokens",
    type: "event",
  },
] as const;

const _bytecode =
  "0x60808060405234601357603a908160198239f35b600080fdfe600080fdfea26469706673582212200a3ff9875434906457d5e78948b47b1aa5da09a57eac3954281e262798857e7564736f6c63430008130033";

type SwapperConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SwapperConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Swapper__factory extends ContractFactory {
  constructor(...args: SwapperConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Swapper> {
    return super.deploy(overrides || {}) as Promise<Swapper>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Swapper {
    return super.attach(address) as Swapper;
  }
  override connect(signer: Signer): Swapper__factory {
    return super.connect(signer) as Swapper__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SwapperInterface {
    return new utils.Interface(_abi) as SwapperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Swapper {
    return new Contract(address, _abi, signerOrProvider) as Swapper;
  }
}
