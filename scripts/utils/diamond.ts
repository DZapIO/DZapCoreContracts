import { BigNumberish, ContractFactory, Contract } from 'ethers'

export enum FacetCutAction {
  Add,
  Replace,
  Remove,
}

export interface DiamondCutData {
  facetName: string
  contract: ContractFactory
  selectors: string[]
}

export enum FeeType {
  BRIDGE,
  SWAP,
}

export interface FeeInfo {
  tokenFee: BigNumberish // ex 1%
  fixedNativeFeeAmount: BigNumberish // ex 0.5 Matic
  dzapTokenShare: BigNumberish // 50%, 50% of the total 1% fee
  dzapFixedNativeShare: BigNumberish // 50%, 50% of the total fixedFeeAmount fee
}

export interface DiamondCut {
  facetAddress: string
  action: FacetCutAction
  functionSelectors: string[]
}

export function getSelectorsUsingContract(contract, facetName) {
  const signatures = Object.keys(contract.interface.functions)
  const selectors = signatures.reduce((acc, val) => {
    if (val !== 'init(bytes)') {
      acc.push(contract.interface.getSighash(val))
    }
    return acc
  }, [] as string[])
  const faceCutData: DiamondCutData = {
    facetName,
    contract,
    selectors,
  }

  return faceCutData
}

export function removeFromSelectors(
  contract: Contract,
  selectors: string[],
  functionNames: string[]
) {
  return selectors.filter((selector) => {
    for (const functionName of functionNames) {
      if (selector !== contract.interface.getSighash(functionName)) {
        return selector
      }
    }
  })
}
