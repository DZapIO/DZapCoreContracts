/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  ERC1820Implementer,
  ERC1820ImplementerInterface,
} from "../../../../../@openzeppelin/contracts/utils/introspection/ERC1820Implementer";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "interfaceHash",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "canImplementInterfaceForAddress",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608080604052346100155760e2908161001b8239f35b600080fdfe6080806040526004361015601257600080fd5b600090813560e01c63249cb3fa14602857600080fd5b3460a857604036600319011260a85760243573ffffffffffffffffffffffffffffffffffffffff811680910360a45791602092600435825281845260408220908252835260ff60408220541660001460a057507fa2ef4600d742022d532d4747cb3547474667d6f13804902513b2ec01c848f4b48152f35b8152f35b8280fd5b5080fdfea264697066735822122055ba33a1735578e989300df4b10bf5a1281bc3f66a7f27a76261694c74e5013264736f6c63430008130033";

type ERC1820ImplementerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ERC1820ImplementerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ERC1820Implementer__factory extends ContractFactory {
  constructor(...args: ERC1820ImplementerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ERC1820Implementer> {
    return super.deploy(overrides || {}) as Promise<ERC1820Implementer>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ERC1820Implementer {
    return super.attach(address) as ERC1820Implementer;
  }
  override connect(signer: Signer): ERC1820Implementer__factory {
    return super.connect(signer) as ERC1820Implementer__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC1820ImplementerInterface {
    return new utils.Interface(_abi) as ERC1820ImplementerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC1820Implementer {
    return new Contract(address, _abi, signerOrProvider) as ERC1820Implementer;
  }
}