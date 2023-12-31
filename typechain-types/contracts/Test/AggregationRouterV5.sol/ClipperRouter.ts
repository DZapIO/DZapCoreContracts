/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export interface ClipperRouterInterface extends utils.Interface {
  functions: {
    "clipperSwap(address,address,address,uint256,uint256,uint256,bytes32,bytes32)": FunctionFragment;
    "clipperSwapTo(address,address,address,address,uint256,uint256,uint256,bytes32,bytes32)": FunctionFragment;
    "clipperSwapToWithPermit(address,address,address,address,uint256,uint256,uint256,bytes32,bytes32,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "clipperSwap"
      | "clipperSwapTo"
      | "clipperSwapToWithPermit"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "clipperSwap",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "clipperSwapTo",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "clipperSwapToWithPermit",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "clipperSwap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "clipperSwapTo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "clipperSwapToWithPermit",
    data: BytesLike
  ): Result;

  events: {};
}

export interface ClipperRouter extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ClipperRouterInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    clipperSwap(
      clipperExchange: PromiseOrValue<string>,
      srcToken: PromiseOrValue<string>,
      dstToken: PromiseOrValue<string>,
      inputAmount: PromiseOrValue<BigNumberish>,
      outputAmount: PromiseOrValue<BigNumberish>,
      goodUntil: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      vs: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    clipperSwapTo(
      clipperExchange: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      srcToken: PromiseOrValue<string>,
      dstToken: PromiseOrValue<string>,
      inputAmount: PromiseOrValue<BigNumberish>,
      outputAmount: PromiseOrValue<BigNumberish>,
      goodUntil: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      vs: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    clipperSwapToWithPermit(
      clipperExchange: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      srcToken: PromiseOrValue<string>,
      dstToken: PromiseOrValue<string>,
      inputAmount: PromiseOrValue<BigNumberish>,
      outputAmount: PromiseOrValue<BigNumberish>,
      goodUntil: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      vs: PromiseOrValue<BytesLike>,
      permit: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  clipperSwap(
    clipperExchange: PromiseOrValue<string>,
    srcToken: PromiseOrValue<string>,
    dstToken: PromiseOrValue<string>,
    inputAmount: PromiseOrValue<BigNumberish>,
    outputAmount: PromiseOrValue<BigNumberish>,
    goodUntil: PromiseOrValue<BigNumberish>,
    r: PromiseOrValue<BytesLike>,
    vs: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  clipperSwapTo(
    clipperExchange: PromiseOrValue<string>,
    recipient: PromiseOrValue<string>,
    srcToken: PromiseOrValue<string>,
    dstToken: PromiseOrValue<string>,
    inputAmount: PromiseOrValue<BigNumberish>,
    outputAmount: PromiseOrValue<BigNumberish>,
    goodUntil: PromiseOrValue<BigNumberish>,
    r: PromiseOrValue<BytesLike>,
    vs: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  clipperSwapToWithPermit(
    clipperExchange: PromiseOrValue<string>,
    recipient: PromiseOrValue<string>,
    srcToken: PromiseOrValue<string>,
    dstToken: PromiseOrValue<string>,
    inputAmount: PromiseOrValue<BigNumberish>,
    outputAmount: PromiseOrValue<BigNumberish>,
    goodUntil: PromiseOrValue<BigNumberish>,
    r: PromiseOrValue<BytesLike>,
    vs: PromiseOrValue<BytesLike>,
    permit: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    clipperSwap(
      clipperExchange: PromiseOrValue<string>,
      srcToken: PromiseOrValue<string>,
      dstToken: PromiseOrValue<string>,
      inputAmount: PromiseOrValue<BigNumberish>,
      outputAmount: PromiseOrValue<BigNumberish>,
      goodUntil: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      vs: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    clipperSwapTo(
      clipperExchange: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      srcToken: PromiseOrValue<string>,
      dstToken: PromiseOrValue<string>,
      inputAmount: PromiseOrValue<BigNumberish>,
      outputAmount: PromiseOrValue<BigNumberish>,
      goodUntil: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      vs: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    clipperSwapToWithPermit(
      clipperExchange: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      srcToken: PromiseOrValue<string>,
      dstToken: PromiseOrValue<string>,
      inputAmount: PromiseOrValue<BigNumberish>,
      outputAmount: PromiseOrValue<BigNumberish>,
      goodUntil: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      vs: PromiseOrValue<BytesLike>,
      permit: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    clipperSwap(
      clipperExchange: PromiseOrValue<string>,
      srcToken: PromiseOrValue<string>,
      dstToken: PromiseOrValue<string>,
      inputAmount: PromiseOrValue<BigNumberish>,
      outputAmount: PromiseOrValue<BigNumberish>,
      goodUntil: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      vs: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    clipperSwapTo(
      clipperExchange: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      srcToken: PromiseOrValue<string>,
      dstToken: PromiseOrValue<string>,
      inputAmount: PromiseOrValue<BigNumberish>,
      outputAmount: PromiseOrValue<BigNumberish>,
      goodUntil: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      vs: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    clipperSwapToWithPermit(
      clipperExchange: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      srcToken: PromiseOrValue<string>,
      dstToken: PromiseOrValue<string>,
      inputAmount: PromiseOrValue<BigNumberish>,
      outputAmount: PromiseOrValue<BigNumberish>,
      goodUntil: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      vs: PromiseOrValue<BytesLike>,
      permit: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    clipperSwap(
      clipperExchange: PromiseOrValue<string>,
      srcToken: PromiseOrValue<string>,
      dstToken: PromiseOrValue<string>,
      inputAmount: PromiseOrValue<BigNumberish>,
      outputAmount: PromiseOrValue<BigNumberish>,
      goodUntil: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      vs: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    clipperSwapTo(
      clipperExchange: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      srcToken: PromiseOrValue<string>,
      dstToken: PromiseOrValue<string>,
      inputAmount: PromiseOrValue<BigNumberish>,
      outputAmount: PromiseOrValue<BigNumberish>,
      goodUntil: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      vs: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    clipperSwapToWithPermit(
      clipperExchange: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      srcToken: PromiseOrValue<string>,
      dstToken: PromiseOrValue<string>,
      inputAmount: PromiseOrValue<BigNumberish>,
      outputAmount: PromiseOrValue<BigNumberish>,
      goodUntil: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      vs: PromiseOrValue<BytesLike>,
      permit: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
