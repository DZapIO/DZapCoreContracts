/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  LibBytes,
  LibBytesInterface,
} from "../../../../contracts/Shared/Libraries/LibBytes";

const _abi = [
  {
    inputs: [],
    name: "AddressOutOfBounds",
    type: "error",
  },
  {
    inputs: [],
    name: "SliceOutOfBounds",
    type: "error",
  },
  {
    inputs: [],
    name: "SliceOverflow",
    type: "error",
  },
  {
    inputs: [],
    name: "UintOutOfBounds",
    type: "error",
  },
] as const;

const _bytecode =
  "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea2646970667358221220a41c55b5ed6ad90deda62d666d0ca3c4d798b922d4f57df3677a222b6836464064736f6c63430008130033";

type LibBytesConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: LibBytesConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class LibBytes__factory extends ContractFactory {
  constructor(...args: LibBytesConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<LibBytes> {
    return super.deploy(overrides || {}) as Promise<LibBytes>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): LibBytes {
    return super.attach(address) as LibBytes;
  }
  override connect(signer: Signer): LibBytes__factory {
    return super.connect(signer) as LibBytes__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): LibBytesInterface {
    return new utils.Interface(_abi) as LibBytesInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LibBytes {
    return new Contract(address, _abi, signerOrProvider) as LibBytes;
  }
}
