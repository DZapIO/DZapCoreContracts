/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  WithdrawFacet,
  WithdrawFacetInterface,
} from "../../../../contracts/Shared/Facets/WithdrawFacet";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "contractBalance",
        type: "uint256",
      },
    ],
    name: "InsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "NativeTransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "NoTransferToNullAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "NotAContract",
    type: "error",
  },
  {
    inputs: [],
    name: "NullAddrIsNotAnERC20Token",
    type: "error",
  },
  {
    inputs: [],
    name: "UnAuthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "WithdrawFailed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tokenAddress",
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
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "LogWithdraw",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_callTo",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_callData",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "executeCallAndWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60808060405234610016576106ad908161001c8239f35b600080fdfe608060405260048036101561001357600080fd5b600090813560e01c80631458d7ad146100b85763d9caed121461003557600080fd5b346100b45760603660031901126100b457356001600160a01b039081811681036100b05760243582811681036100ac5761009c927fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c13205416330361009f575b6044359161024b565b80f35b6100a761053e565b610093565b8380fd5b8280fd5b5080fd5b5090346101d05760a03660031901126101d05781356001600160a01b038082168092036100b05760243567ffffffffffffffff8082116101cc57366023830112156101cc57818601359081116101cc5736602482840101116101cc576044359383851685036101c8576064359380851685036101c4577fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c1320541633036101b7575b803b156101a6576024868094848295604051948593018337810182815203925af161018161020b565b5015610195579061009c916084359161024b565b604051631d42c86760e21b81528490fd5b6040516309ee12d560e01b81528790fd5b6101bf61053e565b610158565b8680fd5b8580fd5b8480fd5b80fd5b90601f8019910116810190811067ffffffffffffffff8211176101f557604052565b634e487b7160e01b600052604160045260246000fd5b3d15610246573d9067ffffffffffffffff82116101f5576040519161023a601f8201601f1916602001846101d3565b82523d6000602084013e565b606090565b9190916001600160a01b03908184161561052c57826102ac575b604080516001600160a01b039095168552602085019390935216917f9207361cc2a04b9c7a06691df1eb87c6a63957ae88bf01d0d18c81e3d127209991819081015b0390a2565b80821673eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee8103610348575047831161032957600080808086885af16102e361020b565b5015610317576102a77f9207361cc2a04b9c7a06691df1eb87c6a63957ae88bf01d0d18c81e3d1272099935b935050610265565b604051633d2cec6f60e21b8152600490fd5b60405163cf47918160e01b815260048101849052476024820152604490fd5b604080516370a0823160e01b815230600482015293949293602092908381602481855afa908115610521576000916104f4575b508085116104d75750815163a9059cbb60e01b8482019081526001600160a01b038916602483015260448083018790528252916103b96064836101d3565b83519184830183811067ffffffffffffffff8211176101f55785528583527f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564838701525161041893600091829182855af161041261020b565b916105a3565b80518381159182156104b2575b505090501561045c575050906102a77f9207361cc2a04b9c7a06691df1eb87c6a63957ae88bf01d0d18c81e3d1272099939261030f565b60849250519062461bcd60e51b82526004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b6064820152fd5b83809293500103126104d25782015180151581036104d257808338610425565b600080fd5b8460449184519163cf47918160e01b835260048301526024820152fd5b908482813d831161051a575b61050a81836101d3565b810103126101d05750513861037b565b503d610500565b83513d6000823e3d90fd5b6040516321f7434560e01b8152600490fd5b63ffffffff60e01b600035166000527f5d54ae78bb256b3b2ab9aba21ec80ea50728352673b79651649d3494dfcade6a602052604060002033600052602052600160ff6040600020541615150361059157565b60405163be24598360e01b8152600490fd5b9192901561060557508151156105b7575090565b3b156105c05790565b60405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606490fd5b8251909150156106185750805190602001fd5b6040519062461bcd60e51b82528160208060048301528251908160248401526000935b82851061065e575050604492506000838284010152601f80199101168101030190fd5b848101820151868601604401529381019385935061063b56fea26469706673582212208764475671a2aa1adcb60b2ecfce008137be6a7631674bfe50bf23e3d93875d564736f6c63430008130033";

type WithdrawFacetConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WithdrawFacetConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class WithdrawFacet__factory extends ContractFactory {
  constructor(...args: WithdrawFacetConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<WithdrawFacet> {
    return super.deploy(overrides || {}) as Promise<WithdrawFacet>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): WithdrawFacet {
    return super.attach(address) as WithdrawFacet;
  }
  override connect(signer: Signer): WithdrawFacet__factory {
    return super.connect(signer) as WithdrawFacet__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WithdrawFacetInterface {
    return new utils.Interface(_abi) as WithdrawFacetInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): WithdrawFacet {
    return new Contract(address, _abi, signerOrProvider) as WithdrawFacet;
  }
}
