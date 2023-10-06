/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  PayableOverrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  DZapDiamond,
  DZapDiamondInterface,
} from "../../contracts/DZapDiamond";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_contractOwner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_diamondCutFacet",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "CalldataEmptyButInitNotZero",
    type: "error",
  },
  {
    inputs: [],
    name: "FacetAddressIsNotZero",
    type: "error",
  },
  {
    inputs: [],
    name: "FacetAddressIsZero",
    type: "error",
  },
  {
    inputs: [],
    name: "FacetContainsNoCode",
    type: "error",
  },
  {
    inputs: [],
    name: "FunctionAlreadyExists",
    type: "error",
  },
  {
    inputs: [],
    name: "FunctionDoesNotExist",
    type: "error",
  },
  {
    inputs: [],
    name: "FunctionIsImmutable",
    type: "error",
  },
  {
    inputs: [],
    name: "IncorrectFacetCutAction",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "reason",
        type: "bytes",
      },
    ],
    name: "InitReverted",
    type: "error",
  },
  {
    inputs: [],
    name: "InitZeroButCalldataNotEmpty",
    type: "error",
  },
  {
    inputs: [],
    name: "NoSelectorsInFace",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x60806001600160401b03601f610c0138819003918201601f1916840191838311858410176105da57808592604094855283398101031261062a5761004e60206100478461066d565b930161066d565b916001600160a01b03168015610618577fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c132080546001600160a01b0319811683179091556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a36100c761064e565b916001835260005b602081106105f057506100e061064e565b60018152602036818301376307e4c70760e21b6100fc82610681565b5261010561062f565b6001600160a01b03909216825260006020830152604082015261012783610681565b5261013182610681565b506040519060208201908111828210176105da576040526000808252825b805182101561047957602061016483836106a4565b510151600381101561046357806102a157506001600160a01b0361018883836106a4565b515116604061019784846106a4565b51015180511561028f57811561027d576001600160a01b0382166000908152600080516020610be183398151915260205260409020546001600160601b039390841690811561026f575b6000915b835183101561025b576001600160e01b031961020184866106a4565b51166000818152600080516020610ba183398151915260205260409020549091906001600160a01b03166102495760018161023f888a94849661079d565b01169201916101e5565b60405163a023275d60e01b8152600490fd5b50959492505050600191505b01909161014f565b610278846106df565b6101e1565b604051636347641d60e11b8152600490fd5b6040516307bc559560e41b8152600490fd5b600181036103a657506001600160a01b036102bc83836106a4565b5151169260406102cc84846106a4565b51015180511561028f57841561027d576001600160a01b0385166000908152600080516020610be183398151915260205260409020546001600160601b0393908416908115610398575b6000915b8351831015610389576001600160e01b031961033684866106a4565b51166000818152600080516020610ba183398151915260205260409020546001600160a01b031690898214610249578261037f8b6001958461037a88968e98610888565b61079d565b011692019161031a565b50955050509160019150610267565b6103a1876106df565b610316565b600203610451576001600160a01b036103bf83836106a4565b5151169060406103cf84836106a4565b5101519182511561028f5761043f5760005b82518110156104335760019061042d6001600160e01b031961040383876106a4565b511680600052600080516020610ba1833981519152602052838060a01b0360406000205416610888565b016103e1565b50929160019150610267565b604051633ce4ef9160e11b8152600490fd5b60405163e548e6b560e01b8152600490fd5b634e487b7160e01b600052602160045260246000fd5b905060405190606082016060835281518091526080830190602060808260051b8601019301916000905b8282106105425750505050600060208301528181036040830152825180825260005b81811061052d57508282826000602080957f8faa70878671ccd212d20771b795c50af8fd3ff6cf27f4bde57e5d4de0aeb6739897010152601f801991011601030190a15161051b5760405160c29081610adf8239f35b6040516304c08b4360e51b8152600490fd5b806020809287010151828286010152016104c5565b858503607f19018152835180516001600160a01b0316865260208101519495939492939192906003821015610463576040916020840152015190606060408201526020608060608301928451809452019201906000905b8082106105b7575050506020806001929601920192019092916104a3565b82516001600160e01b031916845260209384019390920191600190910190610599565b634e487b7160e01b600052604160045260246000fd5b6020906105fb61062f565b6000815260008382015260606040820152828287010152016100cf565b60405163d92e233d60e01b8152600490fd5b600080fd5b60405190606082016001600160401b038111838210176105da57604052565b60408051919082016001600160401b038111838210176105da57604052565b51906001600160a01b038216820361062a57565b80511561068e5760200190565b634e487b7160e01b600052603260045260246000fd5b805182101561068e5760209160051b010190565b600080516020610bc1833981519152805482101561068e5760005260206000200190600090565b803b1561076957600080516020610bc183398151915280546001600160a01b0383166000908152600080516020610be1833981519152602052604090206001018190559190680100000000000000008310156105da5782610748916001610767950190556106b8565b90919082549060031b9160018060a01b03809116831b921b1916179055565b565b6040516271a80360e91b8152600490fd5b919091805483101561068e57600052601c60206000208360031c019260021b1690565b6001600160e01b031981166000818152600080516020610ba183398151915260208190526040822080546001600160a01b031660a09690961b6001600160a01b031916959095179094559194939092906001600160a01b0316808352600080516020610be18339815191526020526040832080549194919068010000000000000000821015610874579661083e826040979899600161085b9501815561077a565b90919063ffffffff83549160031b9260e01c831b921b1916179055565b82526020522080546001600160a01b0319169091179055565b634e487b7160e01b85526041600452602485fd5b9091906001600160a01b039081168015610acc57308114610aba5763ffffffff60e01b809416600092818452600080516020610ba1833981519152926020918483526040948587205460a01c90838852600080516020610be18339815191529586865287892054926000199b8c8501948511610aa657908991888c898c89808703610a38575b505090525050508787525087892080548015610a24578c0190610931828261077a565b63ffffffff82549160031b1b19169055558852845286868120551561095b575b5050505050509050565b600080516020610bc18339815191528054898101908111610a1057838852858552826001888a200154918083036109de575b50505080549889156109ca57600197989901916109a9836106b8565b909182549160031b1b19169055558552528220015580388080808080610951565b634e487b7160e01b88526031600452602488fd5b6109e7906106b8565b90549060031b1c166109fc81610748846106b8565b88528585526001878920015538828161098d565b634e487b7160e01b88526011600452602488fd5b634e487b7160e01b8b52603160045260248bfd5b610a99978461083e93610a578a9487610a6d9952828a5284842061077a565b90549060031b1c60e01b9788968352522061077a565b168b52838852898b2080546001600160a01b031660a09290921b6001600160a01b031916919091179055565b873880888c898c8961090e565b634e487b7160e01b8b52601160045260248bfd5b60405163c3c5ec3760e01b8152600490fd5b604051631535ac5f60e31b8152600490fdfe60806040523615608a57600080356001600160e01b03191681527fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c602052604081205473ffffffffffffffffffffffffffffffffffffffff168015607957818091368280378136915af43d82803e156075573d90f35b3d90fd5b631535ac5f60e31b60805260046080fd5b00fea2646970667358221220e8e86efb8ee77b86665fa5c5559071a2104f16237d867d1f302bb954f0f1998d64736f6c63430008130033c8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131cc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131ec8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131d";

type DZapDiamondConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DZapDiamondConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DZapDiamond__factory extends ContractFactory {
  constructor(...args: DZapDiamondConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _contractOwner: PromiseOrValue<string>,
    _diamondCutFacet: PromiseOrValue<string>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<DZapDiamond> {
    return super.deploy(
      _contractOwner,
      _diamondCutFacet,
      overrides || {}
    ) as Promise<DZapDiamond>;
  }
  override getDeployTransaction(
    _contractOwner: PromiseOrValue<string>,
    _diamondCutFacet: PromiseOrValue<string>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _contractOwner,
      _diamondCutFacet,
      overrides || {}
    );
  }
  override attach(address: string): DZapDiamond {
    return super.attach(address) as DZapDiamond;
  }
  override connect(signer: Signer): DZapDiamond__factory {
    return super.connect(signer) as DZapDiamond__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DZapDiamondInterface {
    return new utils.Interface(_abi) as DZapDiamondInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DZapDiamond {
    return new Contract(address, _abi, signerOrProvider) as DZapDiamond;
  }
}
