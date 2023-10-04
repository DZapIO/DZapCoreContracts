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
} from "../../common";

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

export interface ReceiverInterface extends utils.Interface {
  functions: {
    "executor()": FunctionFragment;
    "owner()": FunctionFragment;
    "recoverToken(address,address,uint256)": FunctionFragment;
    "setExecutor(address)": FunctionFragment;
    "swapAndCompleteBridgeTokens(bytes32,address,(address,address,address,address,uint256,uint256,bytes,bytes))": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "executor"
      | "owner"
      | "recoverToken"
      | "setExecutor"
      | "swapAndCompleteBridgeTokens"
      | "transferOwnership"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "executor", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "recoverToken",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "setExecutor",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "swapAndCompleteBridgeTokens",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>, SwapDataStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "executor", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "recoverToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setExecutor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "swapAndCompleteBridgeTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;

  events: {
    "DZapTransferRecovered(bytes32,address,address,uint256,uint256)": EventFragment;
    "ExecutorSet(address)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
    "RecoverGasSet(uint256)": EventFragment;
    "TokensRecovered(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "DZapTransferRecovered"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ExecutorSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RecoverGasSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TokensRecovered"): EventFragment;
}

export interface DZapTransferRecoveredEventObject {
  transactionId: string;
  receivingAssetId: string;
  receiver: string;
  amount: BigNumber;
  timestamp: BigNumber;
}
export type DZapTransferRecoveredEvent = TypedEvent<
  [string, string, string, BigNumber, BigNumber],
  DZapTransferRecoveredEventObject
>;

export type DZapTransferRecoveredEventFilter =
  TypedEventFilter<DZapTransferRecoveredEvent>;

export interface ExecutorSetEventObject {
  executor: string;
}
export type ExecutorSetEvent = TypedEvent<[string], ExecutorSetEventObject>;

export type ExecutorSetEventFilter = TypedEventFilter<ExecutorSetEvent>;

export interface OwnershipTransferredEventObject {
  oldOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface RecoverGasSetEventObject {
  recoverGas: BigNumber;
}
export type RecoverGasSetEvent = TypedEvent<
  [BigNumber],
  RecoverGasSetEventObject
>;

export type RecoverGasSetEventFilter = TypedEventFilter<RecoverGasSetEvent>;

export interface TokensRecoveredEventObject {
  token: string;
  receiver: string;
  amount: BigNumber;
}
export type TokensRecoveredEvent = TypedEvent<
  [string, string, BigNumber],
  TokensRecoveredEventObject
>;

export type TokensRecoveredEventFilter = TypedEventFilter<TokensRecoveredEvent>;

export interface Receiver extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ReceiverInterface;

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
    executor(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    recoverToken(
      _token: PromiseOrValue<string>,
      _receiver: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setExecutor(
      _executor: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    swapAndCompleteBridgeTokens(
      _transactionId: PromiseOrValue<BytesLike>,
      _receiver: PromiseOrValue<string>,
      _swapData: SwapDataStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  executor(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  recoverToken(
    _token: PromiseOrValue<string>,
    _receiver: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setExecutor(
    _executor: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  swapAndCompleteBridgeTokens(
    _transactionId: PromiseOrValue<BytesLike>,
    _receiver: PromiseOrValue<string>,
    _swapData: SwapDataStruct,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    _newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    executor(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    recoverToken(
      _token: PromiseOrValue<string>,
      _receiver: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setExecutor(
      _executor: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    swapAndCompleteBridgeTokens(
      _transactionId: PromiseOrValue<BytesLike>,
      _receiver: PromiseOrValue<string>,
      _swapData: SwapDataStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    transferOwnership(
      _newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "DZapTransferRecovered(bytes32,address,address,uint256,uint256)"(
      transactionId?: PromiseOrValue<BytesLike> | null,
      receivingAssetId?: null,
      receiver?: null,
      amount?: null,
      timestamp?: null
    ): DZapTransferRecoveredEventFilter;
    DZapTransferRecovered(
      transactionId?: PromiseOrValue<BytesLike> | null,
      receivingAssetId?: null,
      receiver?: null,
      amount?: null,
      timestamp?: null
    ): DZapTransferRecoveredEventFilter;

    "ExecutorSet(address)"(
      executor?: PromiseOrValue<string> | null
    ): ExecutorSetEventFilter;
    ExecutorSet(
      executor?: PromiseOrValue<string> | null
    ): ExecutorSetEventFilter;

    "OwnershipTransferred(address,address)"(
      oldOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      oldOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;

    "RecoverGasSet(uint256)"(
      recoverGas?: PromiseOrValue<BigNumberish> | null
    ): RecoverGasSetEventFilter;
    RecoverGasSet(
      recoverGas?: PromiseOrValue<BigNumberish> | null
    ): RecoverGasSetEventFilter;

    "TokensRecovered(address,address,uint256)"(
      token?: null,
      receiver?: PromiseOrValue<string> | null,
      amount?: null
    ): TokensRecoveredEventFilter;
    TokensRecovered(
      token?: null,
      receiver?: PromiseOrValue<string> | null,
      amount?: null
    ): TokensRecoveredEventFilter;
  };

  estimateGas: {
    executor(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    recoverToken(
      _token: PromiseOrValue<string>,
      _receiver: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setExecutor(
      _executor: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    swapAndCompleteBridgeTokens(
      _transactionId: PromiseOrValue<BytesLike>,
      _receiver: PromiseOrValue<string>,
      _swapData: SwapDataStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    executor(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    recoverToken(
      _token: PromiseOrValue<string>,
      _receiver: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setExecutor(
      _executor: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    swapAndCompleteBridgeTokens(
      _transactionId: PromiseOrValue<BytesLike>,
      _receiver: PromiseOrValue<string>,
      _swapData: SwapDataStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
