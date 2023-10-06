/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  SwapFacet,
  SwapFacetInterface,
} from "../../../../contracts/Swap/Facets/SwapFacet";

const _abi = [
  {
    inputs: [],
    name: "AllSwapsFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "ContractCallNotAllowed",
    type: "error",
  },
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
    name: "IntegratorNotAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidContract",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPermit",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPermitData",
    type: "error",
  },
  {
    inputs: [],
    name: "NativeTransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "NoSwapFromZeroBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "NoTransferToNullAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "NullAddrIsNotAValidSpender",
    type: "error",
  },
  {
    inputs: [],
    name: "NullAddrIsNotAnERC20Token",
    type: "error",
  },
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
    inputs: [],
    name: "ReentrancyError",
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
    inputs: [
      {
        internalType: "uint256",
        name: "minAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "returnAmount",
        type: "uint256",
      },
    ],
    name: "SlippageTooHigh",
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
    name: "SwapCallFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
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
        indexed: true,
        internalType: "address",
        name: "integrator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "refundee",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "dex",
            type: "address",
          },
          {
            internalType: "address",
            name: "fromToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "toToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "fromAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "leftOverFromAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "returnToAmount",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct SwapInfo[]",
        name: "swapInfo",
        type: "tuple[]",
      },
    ],
    name: "MultiSwapped",
    type: "event",
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
        indexed: true,
        internalType: "address",
        name: "integrator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "refundee",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "dex",
            type: "address",
          },
          {
            internalType: "address",
            name: "fromToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "toToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "fromAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "leftOverFromAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "returnToAmount",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct SwapInfo",
        name: "swapInfo",
        type: "tuple",
      },
    ],
    name: "Swapped",
    type: "event",
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
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_transactionId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_integrator",
        type: "address",
      },
      {
        internalType: "address",
        name: "_refundee",
        type: "address",
      },
      {
        internalType: "address",
        name: "_recipient",
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
        internalType: "struct SwapData[]",
        name: "_data",
        type: "tuple[]",
      },
    ],
    name: "multiSwap",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_transactionId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_integrator",
        type: "address",
      },
      {
        internalType: "address",
        name: "_refundee",
        type: "address",
      },
      {
        internalType: "address",
        name: "_recipient",
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
        internalType: "struct SwapData[]",
        name: "_data",
        type: "tuple[]",
      },
    ],
    name: "multiSwapWithoutRevert",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_transactionId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_integrator",
        type: "address",
      },
      {
        internalType: "address",
        name: "_refundee",
        type: "address",
      },
      {
        internalType: "address",
        name: "_recipient",
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
        name: "_data",
        type: "tuple",
      },
    ],
    name: "swap",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60808060405234610016576123a1908161001c8239f35b600080fdfe6080604052600436101561001257600080fd5b6000803560e01c908163736753851461004a5750806380254d04146100455763ddf39aa81461004057600080fd5b6106a9565b610498565b61005336610420565b939294919060008051602061234c83398151915260018154146103f957600190556001600160a01b038616156103e857479485348103116103e3576001600160a01b0383161580156103dc575b6103ca576100ad816121b7565b91889089905b83821061016f5750501461015d577fad51fe56cc5276f8ece14ee1967cc33a5d5a6248acefdf3764d1a5e4e84f2cbb916100ed85856113b2565b610109604051928392896001600160a01b0333991697856122a3565b0390a3473482038111156101555761012491349003906108cd565b80610145575b82610142600060008051602061234c83398151915255565b80f35b61014e91610c90565b818061012a565b505081610124565b60405163483f15e560e01b8152600490fd5b9091868a610187610181868887612268565b8b611052565b61019e82610199898b8a979697612268565b610ac0565b9490938d8a876102a75791505061029b95506102a19694506101ce93506101c9925088915087612268565b6108da565b6101e460406101de888a89612268565b016108da565b8761024881610238608061020b8c6102048d6101de8360609a8b93612268565b948d612268565b013594610228610219610970565b6001600160a01b039098168852565b6001600160a01b03166020870152565b6001600160a01b03166040850152565b8201528d60808201528d60a0820152610261868961228f565b5261026c858861228f565b5061029661028060406101de888a89612268565b8d608061028e898b8a612268565b013591610ca3565b612243565b92612243565b906100b3565b848b989692948896948a9995966102d76102a19d9f988f60406101de8c6102dd9a6102d194612268565b936108cd565b92611554565b8a826103ae575b61030693508592508d9150610301906101de60609889928d612268565b610ca3565b876103156101c986838a612268565b936103868861037660806103498a61033360406101de838b89612268565b97610343886101de84848a612268565b95612268565b013594610366610357610970565b6001600160a01b03909a168a52565b6001600160a01b03166020890152565b6001600160a01b03166040870152565b840152608083015260a082015261039d828861228f565b526103a8818761228f565b50612243565b60406101de6103c195610301938d612268565b82818f8a6102e4565b60405163d92e233d60e01b8152600490fd5b50876100a0565b6108b7565b63d92e233d60e01b60805260046080fd5b6329f745a760e01b60805260046080fd5b6001600160a01b0381160361041b57565b600080fd5b9060a060031983011261041b576004359160243561043d8161040a565b9160443561044a8161040a565b916064356104578161040a565b9160843567ffffffffffffffff9283821161041b578060238301121561041b57816004013593841161041b5760248460051b8301011161041b576024019190565b60031960a03682011261041b57600435906024356104b58161040a565b604435926104c28461040a565b6064356104ce8161040a565b6084359067ffffffffffffffff821161041b576101008260040195833603011261041b5760008051602061234c833981519152600181541461069757600190556001600160a01b03808716156103ca5747953487039687116103e35781831615801561068f575b6103ca576102d18893868860847f8037eb1559c848161c00ae628d6fc02ac9357c108cf6130f297a2c9460ca51439861060c876105a061057861062d9a87611052565b90976105848985610bb4565b99909861059181846113b2565b6102d78460448a019e8f6108da565b8461067c575b6105fc6105d16105cb6105c560648701946101c98b8d610301896108da565b9a6108da565b926108da565b916105ec6105dd610970565b6001600160a01b03909b168b52565b6001600160a01b031660208a0152565b6001600160a01b03166040880152565b01356060850152608084015260a083015260405194859433991697856109cc565b0390a360009047818111156106755761064692506108cd565b80610665575b610663600060008051602061234c83398151915255565b005b61066e91610c90565b388061064c565b5050610646565b61068a858c6103018b6108da565b6105a6565b506000610535565b6040516329f745a760e01b8152600490fd5b6106b236610420565b60008051602061234c833981519152959291949395600181541461069757600190556001600160a01b0391828716156103ca5747953487039687116103e3578382161580156108af575b6103ca5782939161070d89946121b7565b916000955b80871061075d5750507fad51fe56cc5276f8ece14ee1967cc33a5d5a6248acefdf3764d1a5e4e84f2cbb94509061062d9161074d88886113b2565b60405194859433991697856122a3565b919395808294968a82610771818888612268565b61077b9083611052565b938d858361078a868d8d612268565b9061079491610bb4565b97819791958d8d60409c8d926107a992612268565b016107b3906108da565b916107bd916108cd565b916107c794611554565b8886831515996108879a610893575b93505092505060606107f2858c610301846101de8c8989612268565b6108726108036101c9898686612268565b96610822836101de8b8861081c866101de84848d612268565b98612268565b906108628d6108358c6080998a93612268565b013595610852610843610970565b6001600160a01b03909c168c52565b6001600160a01b031660208b0152565b8801906001600160a01b03169052565b85015283015260a082015261039d828861228f565b94929091899492610712565b6108a495610301936101de92612268565b83818f88868b6107d6565b5060006106fc565b634e487b7160e01b600052601160045260246000fd5b919082039182116103e357565b356108e48161040a565b90565b634e487b7160e01b600052604160045260246000fd5b6080810190811067ffffffffffffffff82111761091957604052565b6108e7565b67ffffffffffffffff811161091957604052565b6040810190811067ffffffffffffffff82111761091957604052565b90601f8019910116810190811067ffffffffffffffff82111761091957604052565b6040519060c0820182811067ffffffffffffffff82111761091957604052565b6040519061099d826108fd565b565b604051906060820182811067ffffffffffffffff82111761091957604052565b6040519061099d82610932565b60609195949261099d9461012083019783526001600160a01b038092166020840152166040820152019060a080916001600160a01b03808251168552806020830151166020860152604082015116604085015260608101516060850152608081015160808501520151910152565b903590601e198136030182121561041b570180359067ffffffffffffffff821161041b5760200191813603831361041b57565b67ffffffffffffffff811161091957601f01601f191660200190565b929192610a9582610a6d565b91610aa3604051938461094e565b82948184528183011161041b578281602093846000960137010152565b906001600160a01b036040830135610ad78161040a565b16158015610b99575b80610b49575b80610b10575b15610afe57610afa91611c4e565b9091565b604051632514e60160e21b8152600490fd5b50610b448235610b1f8161040a565b610b3e610b39610b3260c0870187610a3a565b3691610a89565b611359565b90610c35565b610aec565b5060ff610b928335610b5a8161040a565b6001600160a01b03166000527f87c11dafdbe0f066e67358ee4040ba0de12255453b9477c97fa61212e07ca30c602052604060002090565b5416610ae6565b5060ff610bad6020840135610b5a8161040a565b5416610ae0565b906001600160a01b036040830135610bcb8161040a565b16158015610c1a575b80610c02575b80610bee575b15610afe57610afa91611dc0565b50610bfd8235610b1f8161040a565b610be0565b5060ff610c138335610b5a8161040a565b5416610bda565b5060ff610c2e6020840135610b5a8161040a565b5416610bd4565b610c736001916001600160a01b03166000527f87c11dafdbe0f066e67358ee4040ba0de12255453b9477c97fa61212e07ca30c602052604060002090565b019063ffffffff60e01b1660005260205260ff6040600020541690565b9080610c9a575050565b61099d91610da2565b9291909281610cb3575b50509050565b6001600160a01b03169283610cd557610ccd929350610da2565b803880610cad565b6040516370a0823160e01b815230600482015293602085602481845afa948515610d6d57600095610d3d575b50848311610d1957610d14939450610e31565b610ccd565b60405163cf47918160e01b81526004810184905260248101869052604490fd5b0390fd5b610d5f91955060203d8111610d66575b610d57818361094e565b810190610e16565b9338610d01565b503d610d4d565b610e25565b3d15610d9d573d90610d8382610a6d565b91610d91604051938461094e565b82523d6000602084013e565b606090565b6001600160a01b03811615610e0457478211610de357600080809381935af1610dc9610d72565b5015610dd157565b604051633d2cec6f60e21b8152600490fd5b5060405163cf47918160e01b81526004810191909152476024820152604490fd5b6040516321f7434560e01b8152600490fd5b9081602091031261041b575190565b6040513d6000823e3d90fd5b60405163a9059cbb60e01b60208201526001600160a01b039092166024830152604482019290925261099d91610e7482606481015b03601f19810184528361094e565b6001600160a01b031690610ed4604051610e8d81610932565b6020938482527f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564858301526000808587829751910182855af1610ece610d72565b91610f71565b805191821591848315610f46575b505050905015610eef5750565b6084906040519062461bcd60e51b82526004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b6064820152fd5b919381809450010312610f6d57820151908115158203610f6a575080388084610ee2565b80fd5b5080fd5b91929015610fd35750815115610f85575090565b3b15610f8e5790565b60405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606490fd5b825190915015610fe65750805190602001fd5b60405162461bcd60e51b815260206004820152908190610d3990602483019061102d565b60005b83811061101d5750506000910152565b818101518382015260200161100d565b906020916110468151809281855285808601910161100a565b601f01601f1916010190565b9060ff611091836001600160a01b03166000527fadf38b383de83e03163f4bb9c9eeeeff060c277df907ebce1fd27038d38e2e08602052604060002090565b54161561112057604081016001600160a01b0381356110af8161040a565b166110cc575b5060806110c4610afa93611691565b9101356115f8565b6080820135801561110e57610afa936111066110c4926110ed6080956108da565b6110fa60e0880188610a3a565b92909130903390611152565b9350506110b5565b60405163162908e360e11b8152600490fd5b604051630f52085360e31b8152600490fd5b6003111561113c57565b634e487b7160e01b600052602160045260246000fd5b949390919293810160408282031261041b57813591600383101561041b5760208101359067ffffffffffffffff821161041b57019080601f8301121561041b578160206111a193359101610a89565b906111ab81611132565b806111c45750936111bf61099d9582611b7e565b6111fa565b806111d56001929795939697611132565b036111e75750509061099d9291611a79565b6001600160a01b0361099d951691611730565b916001600160a01b038093169283156112f157811615610e04576040516370a0823160e01b8082526001600160a01b03831660048301526020949092908583602481845afa938415610d6d578787946000966112c8575b506112629084611286979885611303565b6040518095819482938352600483019190916001600160a01b036020820193169052565b03915afa908115610d6d576112a4936000926112ab575b50506108cd565b0361110e57565b6112c19250803d10610d6657610d57818361094e565b388061129d565b611286965090846112e861126293883d8a11610d6657610d57818361094e565b97505090611251565b60405163346fafc360e21b8152600490fd5b9290604051926323b872dd60e01b60208501526001600160a01b03809216602485015216604483015260648201526064815260a081019181831067ffffffffffffffff8411176109195761099d92604052610e74565b805115611367576020015190565b50600090565b9060405161137a816108fd565b6060600382948054845260018101546020850152600281015460408501520154910152565b818102929181159184041417156103e357565b6113ee826001600160a01b03166000527fadf38b383de83e03163f4bb9c9eeeeff060c277df907ebce1fd27038d38e2e08602052604060002090565b6114006113fc825460ff1690565b1590565b6111205761141e600161142392016001600052602052604060002090565b61136d565b916020830151600093816114d3575b507f5a5e26d1ba5745deaa746a9beb2d7bfa1e6b4e772d13d55a574f5c1e162d39de9161148f61146f866001600160a01b039481611494576108cd565b604080516001815260208101989098528701529116939081906060820190565b0390a3565b6114ce826114c97fadf38b383de83e03163f4bb9c9eeeeff060c277df907ebce1fd27038d38e2e0b546001600160a01b031690565b610da2565b6108cd565b6001600160a01b039194509161148f61146f61152061151760607f5a5e26d1ba5745deaa746a9beb2d7bfa1e6b4e772d13d55a574f5c1e162d39de9701518961139f565b620f4240900490565b8761152c82809a6108cd565b61153c575b945050505091611432565b61154f61154983836108cd565b86610da2565b611531565b92916080917fdbff15bf7c10a4fcd5d083f8297e5e7653625aab6c4c8548c23686f8118a132593806115e8575b866115ae575b60405196600188526001600160a01b038094166020890152604088015260608701521693a3565b6115e3876001600160a01b037fadf38b383de83e03163f4bb9c9eeeeff060c277df907ebce1fd27038d38e2e0b541685610ca3565b611587565b6115f3818385610ca3565b611581565b90916000926000928151908161160d57505050565b60409295506108e49394509061162291611627565b930151835b906000198183098183029182808310920391808303921461168557620f4240908282111561041b577fde8f6cefed634549b62c77574f722e1ac57e23f24d8fd5cb790fb65668c26139940990828211900360fa1b910360061c170290565b5050620f424091500490565b60036001600160a01b03916060604093849283516116ae816108fd565b6000938185809352826020820152828782015201521681527fadf38b383de83e03163f4bb9c9eeeeff060c277df907ebce1fd27038d38e2e086020526001828220016001825260205220825192611704846108fd565b81548452600182015460208501526002820154908401520154606082015290565b600091031261041b57565b9293906001600160a01b037fa5e67a2ca7abbd3d386941b8010a32368804ac328a911a128f9ea68fdba5470f541691858151806117d9575b505050813b1561041b57604051631b63c28b60e11b81526001600160a01b039485166004820152908416602482015291831660448301529190921660648301526000908290818381608481015b03925af18015610d6d576117c65750565b806117d361099d9261091e565b80611725565b6118426117f484602080611824956118339801019101611910565b979293611814611805979297610990565b6001600160a01b039099168952565b6001600160a01b03166020880152565b65ffffffffffff166040860152565b65ffffffffffff166060840152565b61184a61099f565b9182523060208301526040820152833b1561041b576040516302b67b5760e41b8152916000918391829161188391903360048501611967565b038183875af18015610d6d5761189b575b8581611768565b806117d36118a89261091e565b38611894565b519065ffffffffffff8216820361041b57565b909291926118ce81610a6d565b916118dc604051938461094e565b82948284528282011161041b57602061099d93019061100a565b9080601f8301121561041b5781516108e4926020016118c1565b91909160a08184031261041b5780516119288161040a565b92611935602083016118ae565b92611942604084016118ae565b92606081015192608082015167ffffffffffffffff811161041b576108e492016118f6565b906108e493926040916001600160a01b03809116845281518181511660208601528160208201511684860152606065ffffffffffff9182868201511682880152015116608085015260208201511660a0840152015160c0820152610100908160e0820152019061102d565b9160608383031261041b57825192602081015192604082015167ffffffffffffffff811161041b576108e492016118f6565b9192611a626108e4959460406001600160a01b0394611a37878251602080916001600160a01b0381511684520151910152565b60208181015188840152910151606087015281516001600160a01b03166080870152015160a0850152565b1660c0820152610100908160e0820152019061102d565b7fa5e67a2ca7abbd3d386941b8010a32368804ac328a911a128f9ea68fdba5470f549092916001600160a01b0391611abd90831691602080825183010191016119d2565b939091921691611add611ace6109bf565b6001600160a01b039097168752565b846020870152611aeb61099f565b95865260208601526040850152611b006109bf565b308152926020840152803b1561041b576117b593600080946040519687958694859363187945bd60e11b8552339160048601611a04565b906004916323f2ebc360e21b8152611b58825180936020868501910161100a565b010190565b9060049163d505accf60e01b8152611b58825180936020868501910161100a565b90805180611b8b57505050565b60009060e08103611be8575050600091829182604051611bc181611bb3602082019586611b5d565b03601f19810183528261094e565b51925af1611bcd610d72565b505b15611bd657565b60405163ddafbaef60e01b8152600490fd5b90929061010003611c1d57829182604051611c0b81611bb3602082019586611b37565b51925af1611c17610d72565b50611bcf565b604051636abdccad60e11b8152600490fd5b908092918237016000815290565b9060206108e492818152019061102d565b90611c646113fc611c5e846108da565b3b151590565b611dae576080820135908115611d9c57611c7d916108cd565b6040820190611c93611c8e836108da565b611eaf565b9160608401611ca4611c8e826108da565b906000611cc0611cb3856108da565b6001600160a01b03161590565b15611d745750600080855b611cd4896108da565b90611ce260c08b018b610a3a565b9190611cf360405180948193611c2f565b03925af1611cff610d72565b5015611d665760a0916114ce611c8e611d17936108da565b940135808510611d455750611d429291611d36611c8e611d3c936108da565b926108cd565b906108cd565b91565b604051633b5d56ed60e11b8152600481019190915260248101859052604490fd5b505050505050600090600090565b60008091611d9787611d85886108da565b611d9160208d016108da565b90611f0c565b611ccb565b60405163391b81e760e21b8152600490fd5b6040516303777f6960e51b8152600490fd5b90611dd06113fc611c5e846108da565b611dae576080820135908115611d9c57611de9916108cd565b6040820190611dfa611c8e836108da565b9160608401611e0b611c8e826108da565b906000611e1a611cb3856108da565b15611e995750600080855b611e2e896108da565b90611e3c60c08b018b610a3a565b9190611e4d60405180948193611c2f565b03925af1611e59610d72565b9015611e72575060a0916114ce611c8e611d17936108da565b80611e7f610d39926120be565b5060405163729a0b5b60e01b815291829160048301611c3d565b60008091611eaa87611d85886108da565b611e25565b6000906001600160a01b031680611ec65750504790565b6020602491604051928380926370a0823160e01b82523060048301525afa918215610d6d5791611ef4575090565b6108e4915060203d8111610d6657610d57818361094e565b906001600160a01b03809216918215611f6a57811615611fac57604051636eb1769f60e11b81523060048201526001600160a01b038216602482015292602084604481865afa938415610d6d57600094611f8c575b50808410611f70575b50505050565b611f8393611f7d916108cd565b91611fda565b38808080611f6a565b611fa591945060203d8111610d6657610d57818361094e565b9238611f61565b6040516363ba9bff60e01b8152600490fd5b90601f82018092116103e357565b60040190816004116103e357565b604051636eb1769f60e11b81523060048201526001600160a01b03831660248201529192602083806044810103816001600160a01b0386165afa928315610d6d57600093612067575b5082018092116103e35760405163095ea7b360e01b60208201526001600160a01b039093166024840152604483019190915261099d9190610e748260648101610e66565b61208091935060203d8111610d6657610d57818361094e565b9138612023565b60208183031261041b5780519067ffffffffffffffff821161041b57019080601f8301121561041b5781516108e4926020016118c1565b908151916044831061219b5760031990838201908482116103e357816120e381611fbe565b106121895780516120f383611fcc565b1161217757816121235750505090506108e460405160008152602081016040525b60208082518301019101612087565b9390600460405193601f8316801560051b9182828801019586010197010101945b80831061216457508252601f01601f19166040529091506108e490612114565b8551835260209586019590920191612144565b604051633b99b53d60e01b8152600490fd5b6040516323d5783d60e11b8152600490fd5b9150565b67ffffffffffffffff81116109195760051b60200190565b906121c18261219f565b60406121cf8151928361094e565b83825281936121e0601f199161219f565b019060005b8281106121f25750505050565b81519060c082019180831067ffffffffffffffff84111761091957602092845260008152826000818301526000858301526000606083015260006080830152600060a08301528287010152016121e5565b60001981146103e35760010190565b634e487b7160e01b600052603260045260246000fd5b919081101561228a5760051b8101359060fe198136030182121561041b570190565b612252565b805182101561228a5760209160051b010190565b60a090929192608081019381526001600160a01b038095602096879516858401521660408201526080606082015285518094520193019160005b8281106122eb575050505090565b909192938260c08261233f600194895160a080916001600160a01b03808251168552806020830151166020860152604082015116604085015260608101516060850152608081015160808501520151910152565b019501939291016122dd56fea4b36ced7e8b039500cc9c7c393a04e0c8af96ee265b143e79175cc5679ca539a26469706673582212205fe40c3c61088ca84f87e727aab259bf7a587c32f327e53b30042a641540fa8364736f6c63430008130033";

type SwapFacetConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SwapFacetConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class SwapFacet__factory extends ContractFactory {
  constructor(...args: SwapFacetConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<SwapFacet> {
    return super.deploy(overrides || {}) as Promise<SwapFacet>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): SwapFacet {
    return super.attach(address) as SwapFacet;
  }
  override connect(signer: Signer): SwapFacet__factory {
    return super.connect(signer) as SwapFacet__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SwapFacetInterface {
    return new utils.Interface(_abi) as SwapFacetInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SwapFacet {
    return new Contract(address, _abi, signerOrProvider) as SwapFacet;
  }
}
