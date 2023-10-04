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
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export type SwapInfoStruct = {
  dex: PromiseOrValue<string>;
  fromToken: PromiseOrValue<string>;
  toToken: PromiseOrValue<string>;
  fromAmount: PromiseOrValue<BigNumberish>;
  leftOverFromAmount: PromiseOrValue<BigNumberish>;
  returnToAmount: PromiseOrValue<BigNumberish>;
};

export type SwapInfoStructOutput = [
  string,
  string,
  string,
  BigNumber,
  BigNumber,
  BigNumber
] & {
  dex: string;
  fromToken: string;
  toToken: string;
  fromAmount: BigNumber;
  leftOverFromAmount: BigNumber;
  returnToAmount: BigNumber;
};

export type SwapDataStruct = {
  callTo: PromiseOrValue<string>;
  approveTo: PromiseOrValue<string>;
  from: PromiseOrValue<string>;
  to: PromiseOrValue<string>;
  fromAmount: PromiseOrValue<BigNumberish>;
  minToAmount: PromiseOrValue<BigNumberish>;
  swapCallData: PromiseOrValue<BytesLike>;
  permit: PromiseOrValue<BytesLike>;
};

export type SwapDataStructOutput = [
  string,
  string,
  string,
  string,
  BigNumber,
  BigNumber,
  string,
  string
] & {
  callTo: string;
  approveTo: string;
  from: string;
  to: string;
  fromAmount: BigNumber;
  minToAmount: BigNumber;
  swapCallData: string;
  permit: string;
};

export interface ISwapFacetInterface extends utils.Interface {
  functions: {
    "multiSwap(bytes32,address,address,address,(address,address,address,address,uint256,uint256,bytes,bytes)[])": FunctionFragment;
    "multiSwapWithoutRevert(bytes32,address,address,address,(address,address,address,address,uint256,uint256,bytes,bytes)[])": FunctionFragment;
    "swap(bytes32,address,address,address,(address,address,address,address,uint256,uint256,bytes,bytes))": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "multiSwap" | "multiSwapWithoutRevert" | "swap"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "multiSwap",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      SwapDataStruct[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "multiSwapWithoutRevert",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      SwapDataStruct[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "swap",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      SwapDataStruct
    ]
  ): string;

  decodeFunctionResult(functionFragment: "multiSwap", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "multiSwapWithoutRevert",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;

  events: {
    "MultiSwapped(bytes32,address,address,address,address,tuple[])": EventFragment;
    "Swapped(bytes32,address,address,address,address,tuple)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "MultiSwapped"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Swapped"): EventFragment;
}

export interface MultiSwappedEventObject {
  transactionId: string;
  integrator: string;
  sender: string;
  refundee: string;
  recipient: string;
  swapInfo: SwapInfoStructOutput[];
}
export type MultiSwappedEvent = TypedEvent<
  [string, string, string, string, string, SwapInfoStructOutput[]],
  MultiSwappedEventObject
>;

export type MultiSwappedEventFilter = TypedEventFilter<MultiSwappedEvent>;

export interface SwappedEventObject {
  transactionId: string;
  integrator: string;
  sender: string;
  refundee: string;
  recipient: string;
  swapInfo: SwapInfoStructOutput;
}
export type SwappedEvent = TypedEvent<
  [string, string, string, string, string, SwapInfoStructOutput],
  SwappedEventObject
>;

export type SwappedEventFilter = TypedEventFilter<SwappedEvent>;

export interface ISwapFacet extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ISwapFacetInterface;

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
    multiSwap(
      _transactionId: PromiseOrValue<BytesLike>,
      _integrator: PromiseOrValue<string>,
      _refundee: PromiseOrValue<string>,
      _recipient: PromiseOrValue<string>,
      _data: SwapDataStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    multiSwapWithoutRevert(
      _transactionId: PromiseOrValue<BytesLike>,
      _integrator: PromiseOrValue<string>,
      _refundee: PromiseOrValue<string>,
      _recipient: PromiseOrValue<string>,
      _data: SwapDataStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    swap(
      _transactionId: PromiseOrValue<BytesLike>,
      _integrator: PromiseOrValue<string>,
      _refundee: PromiseOrValue<string>,
      _recipient: PromiseOrValue<string>,
      _data: SwapDataStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  multiSwap(
    _transactionId: PromiseOrValue<BytesLike>,
    _integrator: PromiseOrValue<string>,
    _refundee: PromiseOrValue<string>,
    _recipient: PromiseOrValue<string>,
    _data: SwapDataStruct[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  multiSwapWithoutRevert(
    _transactionId: PromiseOrValue<BytesLike>,
    _integrator: PromiseOrValue<string>,
    _refundee: PromiseOrValue<string>,
    _recipient: PromiseOrValue<string>,
    _data: SwapDataStruct[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  swap(
    _transactionId: PromiseOrValue<BytesLike>,
    _integrator: PromiseOrValue<string>,
    _refundee: PromiseOrValue<string>,
    _recipient: PromiseOrValue<string>,
    _data: SwapDataStruct,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    multiSwap(
      _transactionId: PromiseOrValue<BytesLike>,
      _integrator: PromiseOrValue<string>,
      _refundee: PromiseOrValue<string>,
      _recipient: PromiseOrValue<string>,
      _data: SwapDataStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    multiSwapWithoutRevert(
      _transactionId: PromiseOrValue<BytesLike>,
      _integrator: PromiseOrValue<string>,
      _refundee: PromiseOrValue<string>,
      _recipient: PromiseOrValue<string>,
      _data: SwapDataStruct[],
      overrides?: CallOverrides
    ): Promise<void>;

    swap(
      _transactionId: PromiseOrValue<BytesLike>,
      _integrator: PromiseOrValue<string>,
      _refundee: PromiseOrValue<string>,
      _recipient: PromiseOrValue<string>,
      _data: SwapDataStruct,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "MultiSwapped(bytes32,address,address,address,address,tuple[])"(
      transactionId?: null,
      integrator?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null,
      refundee?: null,
      recipient?: null,
      swapInfo?: null
    ): MultiSwappedEventFilter;
    MultiSwapped(
      transactionId?: null,
      integrator?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null,
      refundee?: null,
      recipient?: null,
      swapInfo?: null
    ): MultiSwappedEventFilter;

    "Swapped(bytes32,address,address,address,address,tuple)"(
      transactionId?: null,
      integrator?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null,
      refundee?: null,
      recipient?: null,
      swapInfo?: null
    ): SwappedEventFilter;
    Swapped(
      transactionId?: null,
      integrator?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null,
      refundee?: null,
      recipient?: null,
      swapInfo?: null
    ): SwappedEventFilter;
  };

  estimateGas: {
    multiSwap(
      _transactionId: PromiseOrValue<BytesLike>,
      _integrator: PromiseOrValue<string>,
      _refundee: PromiseOrValue<string>,
      _recipient: PromiseOrValue<string>,
      _data: SwapDataStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    multiSwapWithoutRevert(
      _transactionId: PromiseOrValue<BytesLike>,
      _integrator: PromiseOrValue<string>,
      _refundee: PromiseOrValue<string>,
      _recipient: PromiseOrValue<string>,
      _data: SwapDataStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    swap(
      _transactionId: PromiseOrValue<BytesLike>,
      _integrator: PromiseOrValue<string>,
      _refundee: PromiseOrValue<string>,
      _recipient: PromiseOrValue<string>,
      _data: SwapDataStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    multiSwap(
      _transactionId: PromiseOrValue<BytesLike>,
      _integrator: PromiseOrValue<string>,
      _refundee: PromiseOrValue<string>,
      _recipient: PromiseOrValue<string>,
      _data: SwapDataStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    multiSwapWithoutRevert(
      _transactionId: PromiseOrValue<BytesLike>,
      _integrator: PromiseOrValue<string>,
      _refundee: PromiseOrValue<string>,
      _recipient: PromiseOrValue<string>,
      _data: SwapDataStruct[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    swap(
      _transactionId: PromiseOrValue<BytesLike>,
      _integrator: PromiseOrValue<string>,
      _refundee: PromiseOrValue<string>,
      _recipient: PromiseOrValue<string>,
      _data: SwapDataStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
