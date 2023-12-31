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

export interface PreInteractionNotificationReceiverInterface
  extends utils.Interface {
  functions: {
    "fillOrderPreInteraction(bytes32,address,address,uint256,uint256,uint256,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "fillOrderPreInteraction"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "fillOrderPreInteraction",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "fillOrderPreInteraction",
    data: BytesLike
  ): Result;

  events: {};
}

export interface PreInteractionNotificationReceiver extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PreInteractionNotificationReceiverInterface;

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
    fillOrderPreInteraction(
      orderHash: PromiseOrValue<BytesLike>,
      maker: PromiseOrValue<string>,
      taker: PromiseOrValue<string>,
      makingAmount: PromiseOrValue<BigNumberish>,
      takingAmount: PromiseOrValue<BigNumberish>,
      remainingAmount: PromiseOrValue<BigNumberish>,
      interactiveData: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  fillOrderPreInteraction(
    orderHash: PromiseOrValue<BytesLike>,
    maker: PromiseOrValue<string>,
    taker: PromiseOrValue<string>,
    makingAmount: PromiseOrValue<BigNumberish>,
    takingAmount: PromiseOrValue<BigNumberish>,
    remainingAmount: PromiseOrValue<BigNumberish>,
    interactiveData: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    fillOrderPreInteraction(
      orderHash: PromiseOrValue<BytesLike>,
      maker: PromiseOrValue<string>,
      taker: PromiseOrValue<string>,
      makingAmount: PromiseOrValue<BigNumberish>,
      takingAmount: PromiseOrValue<BigNumberish>,
      remainingAmount: PromiseOrValue<BigNumberish>,
      interactiveData: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    fillOrderPreInteraction(
      orderHash: PromiseOrValue<BytesLike>,
      maker: PromiseOrValue<string>,
      taker: PromiseOrValue<string>,
      makingAmount: PromiseOrValue<BigNumberish>,
      takingAmount: PromiseOrValue<BigNumberish>,
      remainingAmount: PromiseOrValue<BigNumberish>,
      interactiveData: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    fillOrderPreInteraction(
      orderHash: PromiseOrValue<BytesLike>,
      maker: PromiseOrValue<string>,
      taker: PromiseOrValue<string>,
      makingAmount: PromiseOrValue<BigNumberish>,
      takingAmount: PromiseOrValue<BigNumberish>,
      remainingAmount: PromiseOrValue<BigNumberish>,
      interactiveData: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
