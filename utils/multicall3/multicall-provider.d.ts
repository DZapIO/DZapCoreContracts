import { BlockTag, AbstractProvider } from "ethers";
import { Multicall2, Multicall3 } from "./types";
export interface ContractCall {
    to: string;
    data: string;
    blockTag: BlockTag;
}
export interface ContractCallRequest {
    call: ContractCall;
    multicall: Multicall2 | Multicall3;
}
export type MulticallProvider<T extends AbstractProvider = AbstractProvider> = T & {
    readonly _isMulticallProvider: boolean;
    readonly cache: boolean;
    maxMulticallDataLength: number;
    isMulticallEnabled: boolean;
};
export declare class MulticallWrapper {
    /**
     * Returns whether a given provider is a multicall-enabled provider.
     * @param provider The provider to check.
     * @returns A boolean indicating whether the given provider is a multicall-enabled provider.
     */
    static isMulticallProvider<T extends AbstractProvider>(provider: T): provider is MulticallProvider<T>;
    /**
     * Wraps a given ethers provider to enable automatic call batching.
     * @param provider The underlying provider to use to batch calls.
     * @param maxMulticallDataLength The maximum total calldata length allowed in a multicall batch, to avoid having the RPC backend to revert because of too large (or too long) request. Set to 0 to disable this behavior. Defaults to 0. Typically 480k for Alchemy.
     * @returns The multicall provider, which is a proxy to the given provider, automatically batching any call performed with it.
     */
    static wrap<T extends AbstractProvider>(provider: T, maxMulticallDataLength?: number, cache?: boolean): MulticallProvider<T>;
}
export default MulticallWrapper;
