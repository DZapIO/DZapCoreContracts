/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  SafeCast160,
  SafeCast160Interface,
} from "../../../../contracts/Test/Permit2Mock.sol/SafeCast160";

const _abi = [
  {
    inputs: [],
    name: "UnsafeCast",
    type: "error",
  },
] as const;

const _bytecode =
  "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea2646970667358221220ad99ab16150c6df98bf73448ca8669073e3a2139a813115343876fd37eb6b36f64736f6c63430008130033";

type SafeCast160ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SafeCast160ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class SafeCast160__factory extends ContractFactory {
  constructor(...args: SafeCast160ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<SafeCast160> {
    return super.deploy(overrides || {}) as Promise<SafeCast160>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): SafeCast160 {
    return super.attach(address) as SafeCast160;
  }
  override connect(signer: Signer): SafeCast160__factory {
    return super.connect(signer) as SafeCast160__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SafeCast160Interface {
    return new utils.Interface(_abi) as SafeCast160Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SafeCast160 {
    return new Contract(address, _abi, signerOrProvider) as SafeCast160;
  }
}
