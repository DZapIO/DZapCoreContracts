import { BlockTag, ContractRunner } from "ethers";
export declare enum MulticallVersion {
    V2 = "2",
    V3 = "3"
}
export declare const getBlockNumber: (blockTag: BlockTag) => number | null;
export declare const getMulticall: (blockNumber: number | null, chainId: number, runner: ContractRunner) => import("./types").Multicall2 | import("./types").Multicall3 | null;
