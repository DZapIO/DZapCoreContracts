/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { BaseContract, BigNumber, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../../common";

export interface LibSwapInterface extends utils.Interface {
  functions: {};

  events: {
    "TokenSwapped(bytes32,address,address,address,uint256,uint256,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "TokenSwapped"): EventFragment;
}

export interface TokenSwappedEventObject {
  transactionId: string;
  callTo: string;
  fromAssetId: string;
  toAssetId: string;
  fromAmount: BigNumber;
  toAmount: BigNumber;
  leftoverFromAmount: BigNumber;
  timestamp: BigNumber;
}
export type TokenSwappedEvent = TypedEvent<
  [string, string, string, string, BigNumber, BigNumber, BigNumber, BigNumber],
  TokenSwappedEventObject
>;

export type TokenSwappedEventFilter = TypedEventFilter<TokenSwappedEvent>;

export interface LibSwap extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: LibSwapInterface;

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

  functions: {};

  callStatic: {};

  filters: {
    "TokenSwapped(bytes32,address,address,address,uint256,uint256,uint256,uint256)"(
      transactionId?: null,
      callTo?: null,
      fromAssetId?: null,
      toAssetId?: null,
      fromAmount?: null,
      toAmount?: null,
      leftoverFromAmount?: null,
      timestamp?: null
    ): TokenSwappedEventFilter;
    TokenSwapped(
      transactionId?: null,
      callTo?: null,
      fromAssetId?: null,
      toAssetId?: null,
      fromAmount?: null,
      toAmount?: null,
      leftoverFromAmount?: null,
      timestamp?: null
    ): TokenSwappedEventFilter;
  };

  estimateGas: {};

  populateTransaction: {};
}
