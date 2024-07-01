import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { FunctionFragment, Interface } from 'ethers/lib/utils'
import {
  DiamondCut,
  DiamondCutData,
  FacetCutAction,
  FacetCuts,
} from '../../types'
import { CONTRACTS } from '../../constants'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

export function getSelectorsUsingFunSig(func: string[]) {
  const abiInterface = new ethers.utils.Interface(func)
  return func.map((fun) =>
    abiInterface.getSighash(ethers.utils.Fragment.from(fun))
  )
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

export function getSelector(func: string) {
  const abiInterface = new ethers.utils.Interface([func])
  return abiInterface.getSighash(ethers.utils.Fragment.from(func))
}

export function getSighash(
  fragments: FunctionFragment[],
  abiInterface: Interface
) {
  return fragments.map((fragment) => abiInterface.getSighash(fragment))
}

export function get(faceCutData: DiamondCutData, functionNames: string[]) {
  faceCutData.selectors = faceCutData.selectors.filter((selector) => {
    for (const functionName of functionNames) {
      if (
        selector === faceCutData.contract.interface.getSighash(functionName)
      ) {
        return selector
      }
    }
  })

  return faceCutData
}

// -------------------------------------

export async function upgradeDiamond(
  owner: SignerWithAddress,
  cutData: DiamondCut[],
  diamond,
  initData: {
    address: string
    data: string
  }
) {
  console.log('')
  console.log('Diamond Cut:', cutData)
  const diamondCut = await ethers.getContractAt(
    CONTRACTS.DiamondCutFacet,
    diamond.address
  )

  const estimateGas = await diamondCut
    .connect(owner)
    .estimateGas.diamondCut(cutData, initData.address, initData.data)
  console.log('estimateGas', estimateGas.toString())

  const tx = await diamondCut
    .connect(owner)
    .diamondCut(cutData, initData.address, initData.data)
  console.log('Diamond cut tx: ', tx.hash)
  const receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')
}

export async function deployFacetsToReplace(facetNames: string[]) {
  const cutData: DiamondCut[] = []
  console.log('')
  console.log('Deploying NewFacets:')
  for (let i = 0; i < facetNames.length; i++) {
    const facetName = facetNames[i]
    const Facet = await ethers.getContractFactory(facetName)
    const facet = await Facet.deploy()
    await facet.deployed()
    console.log(`${facetName} deployed: ${facet.address}`)

    cutData.push({
      facetAddress: facet.address,
      action: FacetCutAction.Replace,
      functionSelectors: getSelectorsUsingContract(facet, facetName).selectors,
    })
  }

  console.log('cutData', JSON.stringify(cutData, null, 2))

  return { cutData }
}

export async function deployToAddFacets(facetNames: string[]) {
  console.log('')
  console.log('Deploying facets...')

  const cutData: DiamondCut[] = []

  for (let i = 0; i < facetNames.length; i++) {
    console.log('')
    console.log(`Deploying ${facetNames[i]}...`)
    const ContractFactory = await ethers.getContractFactory(facetNames[i])
    const contract = await ContractFactory.deploy()
    console.log('hash', contract.deployTransaction.hash)
    await contract.deployed()
    const tempCutData = {
      facetAddress: contract.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(contract, facetNames[i])
        .selectors,
    }

    cutData.push(tempCutData)

    console.log(`${facetNames[i]} deployed: ${contract.address}`)
    console.log(facetNames[i], tempCutData)
  }

  return {
    cutData,
  }
}

export async function getCutData(data: FacetCuts) {
  console.log('')
  console.log('Deploying facets...')

  const cutData: DiamondCut[] = []

  for (const [address, { name, action }] of Object.entries(data)) {
    const ContractFactory = await ethers.getContractFactory(name)

    cutData.push({
      facetAddress: address,
      action: action,
      functionSelectors: getSelectorsUsingContract(ContractFactory, name)
        .selectors,
    })
  }

  return {
    cutData,
  }
}
