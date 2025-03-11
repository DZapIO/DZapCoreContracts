import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract, utils } from 'ethers'
import { ethers } from 'hardhat'
import { FunctionFragment, Interface } from 'ethers/lib/utils'
import { delay, isAddressSame } from '.'
import { CHAIN_IDS } from '../config'
import { ADAPTERS_DEPLOYMENT_CONFIG } from '../config/adapters'
import { FACETS_DEPLOYMENT_CONFIG } from '../config/deployment/facets'
import { CONTRACTS, ZERO } from '../constants'
import { BridgeManagerFacet, DiamondLoupeFacet } from '../typechain-types'
import {
  Create3DeploymentConfig,
  DiamondCut,
  DiamondCutData,
  FacetCutAction,
  FacetCuts,
  FacetDeployData,
} from '../types'
import {
  estimateDeploymentCost,
  estimateTxCost,
  getGasPrice,
} from './contractUtils'
import { verify } from './verifyUtils'

export function getSelectorsUsingFunSig(func: string[]) {
  const abiInterface = new utils.Interface(func)
  return func.map((fun) => abiInterface.getSighash(utils.Fragment.from(fun)))
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

export function getSelectorsUsingInterface(iface, facetName) {
  const signatures = Object.keys(iface.functions)
  const selectors = signatures.reduce((acc, val) => {
    if (val !== 'init(bytes)') {
      acc.push(iface.getSighash(val))
    }
    return acc
  }, [] as string[])

  const faceCutData = {
    facetName,
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
  const abiInterface = new utils.Interface([func])
  return abiInterface.getSighash(utils.Fragment.from(func))
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

// export async function getCutData(data: FacetCuts) {
//   console.log('')
//   console.log('Deploying facets...')

//   const cutData: DiamondCut[] = []

//   for (const [address, { name, action }] of Object.entries(data)) {
//     const ContractFactory = await ethers.getContractFactory(name)

//     cutData.push({
//       facetAddress: address,
//       action: action,
//       functionSelectors: getSelectorsUsingContract(ContractFactory, name)
//         .selectors,
//     })
//   }

//   return {
//     cutData,
//   }
// }

export const getSelectors = (abi) => {
  const iface = new utils.Interface(abi)
  const fragments = Object.values(iface.functions)
  return fragments.map((fragment) => {
    return iface.getSighash(fragment.format('sighash'))
  })
}

export const checkSelector = async (
  diamondLoupeFacet: DiamondLoupeFacet,
  facetName: string,
  selectors: string[]
) => {
  const selectorToRemove: string[] = []
  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i]
    try {
      const address = await diamondLoupeFacet.facetAddress(selector)
      if (address == '0x0000000000000000000000000000000000000000') {
        console.log(facetName, 'Not deployed', selector)
        // notDeployedSelectors.push(selector)
      } else {
        selectorToRemove.push(selector)
      }
    } catch (error) {
      // console.log(error)
      console.log(facetName, selector)
    }
  }

  return selectorToRemove
}

// -------------------------------------

export async function upgradeDiamond(
  owner: SignerWithAddress,
  cutData: DiamondCut[],
  diamondAddress: string,
  initData: {
    address: string
    data: string
  }
) {
  console.log('')
  // console.log('Diamond Cut:', inspect(cutData, false, null, true))

  const diamondCut = await ethers.getContractAt(
    CONTRACTS.DiamondCutFacet,
    diamondAddress
  )

  // const estimateGas = await diamondCut
  //   .connect(owner)
  //   .estimateGas.diamondCut(cutData, initData.address, initData.data)
  // console.log('estimateGas', estimateGas.toString())

  let args = {}
  try {
    const gasPrice = await getGasPrice(ethers.provider)
    args = { gasPrice }
  } catch (error) {}

  const tx = await diamondCut
    .connect(owner)
    .diamondCut(cutData, initData.address, initData.data, {
      // ...args,
      // gasLimit: estimateGas.add(estimateGas.mul(12).div(10)),
    })
  // .diamondCut(cutData, initData.address, initData.data)
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

export async function deployToAddFacetsWithConstructorArgs(
  data: FacetDeployData[]
) {
  console.log('')
  console.log('Deploying facets...')
  const cutData: DiamondCut[] = []

  for (let i = 0; i < data.length; ++i) {
    const { facetName, constructorArgs } = data[i]
    console.log({ facetName, constructorArgs })
    console.log('')
    console.log(`Deploying ${facetName}...`)
    const ContractFactory = await ethers.getContractFactory(facetName)

    // await estimateDeploymentCost(
    //   ContractFactory,
    //   ethers.provider,
    //   constructorArgs
    // )
    let args = {}
    try {
      const gasPrice = await getGasPrice(ethers.provider)
      args = { gasPrice }
    } catch (error) {}

    const contract = await ContractFactory.deploy(...constructorArgs, args)
    console.log('hash', contract.deployTransaction.hash)
    await contract.deployTransaction.wait()
    await contract.deployed()

    const tempCutData = {
      facetAddress: contract.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(contract, facetName)
        .selectors,
    }
    cutData.push(tempCutData)

    console.log(`${facetName} deployed: ${contract.address}`)
    console.log(facetName, tempCutData)
  }
  return {
    cutData,
  }
}

export async function estimateDeployCostForFacetsWithConstructorArgs(
  data: FacetDeployData[]
) {
  let totalDeploymentCost = ZERO
  const cutData: DiamondCut[] = []

  for (let i = 0; i < data.length; ++i) {
    console.log('')
    const facetName = data[i].facetName
    const constructorArgs = data[i].constructorArgs
    console.log({ facetName, constructorArgs })
    console.log(`Estimating ${facetName}...`)
    const ContractFactory = await ethers.getContractFactory(facetName)

    const deploymentCost = await estimateDeploymentCost(
      ContractFactory,
      ethers.provider,
      constructorArgs
    )

    if (deploymentCost)
      totalDeploymentCost = totalDeploymentCost.add(deploymentCost)
  }

  return totalDeploymentCost
}

export const whitelistAdapters = async (
  deployer: SignerWithAddress,
  bridgeManager: BridgeManagerFacet,
  adaptersAddress: string[]
) => {
  const adaptersToAdd: string[] = []

  for (let i = 0; i < adaptersAddress.length; ++i) {
    const adapter = adaptersAddress[i]
    const isAdapterWhitelisted = await bridgeManager.isAdapterWhitelisted(
      adapter
    )
    // console.log(i, adapter, await bridgeManager.isAdapterWhitelisted(adapter))
    if (!isAdapterWhitelisted) adaptersToAdd.push(adapter)
  }

  if (adaptersToAdd.length > 0) {
    console.log('\nAdding adapters...')
    const tx = await bridgeManager.connect(deployer).addAdapters(adaptersToAdd)
    console.log('Adapters Add Tx', tx.hash)
    await tx.wait()
  }
}

export const getFaceCutData = async (
  create3: Contract,
  deployerAddress: string,
  facetDeploymnetConfig: typeof FACETS_DEPLOYMENT_CONFIG,
  facets: string[]
) => {
  let faceCut: DiamondCut[] = []

  for (let i = 0; i < facets.length; i++) {
    const facetName = facets[i]
    console.log('')
    console.log(`Get ${facetName}...`)
    const index = facetDeploymnetConfig[facetName].length - 1
    const config = facetDeploymnetConfig[facetName][index]
    const salt = utils.id(config.saltKey)

    const ContractFactory = await ethers.getContractFactory(facetName)
    const computedAddress = await create3.getDeployed(deployerAddress, salt)

    if (!isAddressSame(computedAddress, config.contractAddress)) {
      throw new Error('Address not matched')
    }

    // const creationCode = ContractFactory.getDeployTransaction().data
    // if (creationCode != config.creationCode) {
    //   throw new Error('Creation code not matched')
    // }

    faceCut.push({
      facetAddress: computedAddress,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingInterface(
        ContractFactory.interface,
        facetName
      ).selectors,
    })
  }

  return faceCut
}

export const deployUsingCreate3 = async (
  chainId: CHAIN_IDS,
  create3: Contract,
  deployer: SignerWithAddress,
  contractName: string,
  config: Create3DeploymentConfig,
  constructorArgs: any[] = []
) => {
  console.log('')
  console.log(`Deploy ${contractName}...`)
  const ContractFactory = await ethers.getContractFactory(contractName)
  const creationCode = ContractFactory.getDeployTransaction(
    ...constructorArgs
  ).data
  const salt = utils.id(config.saltKey)
  const computedAddress = await create3.getDeployed(deployer.address, salt)
  console.log('Address', computedAddress)

  if (!isAddressSame(computedAddress, config.contractAddress)) {
    throw new Error('Address not matched')
  }

  if (creationCode != config.creationCode) {
    throw new Error('Creation code not matched')
  }

  try {
    const gasLimitFaceCut = await create3.estimateGas.deploy(salt, creationCode)
    await estimateTxCost(gasLimitFaceCut, ethers.provider)

    const tx = await create3.connect(deployer).deploy(salt, creationCode)
    console.log('Tx hash', tx.hash)
    await tx.wait()
    console.log('Verification afer 15 sec...')
    await delay(15000)
  } catch (error) {
    console.log('Already Deployed')
  }
  await verify(chainId, contractName, computedAddress, constructorArgs)

  const contract = await ethers.getContractAt(contractName, computedAddress)
  return contract
}

export const deployFacetsUsingCreate3 = async (
  chainId: CHAIN_IDS,
  create3: Contract,
  deployer: SignerWithAddress,
  facetDeploymnetConfig: typeof FACETS_DEPLOYMENT_CONFIG,
  facetsToDeploy: string[]
) => {
  let faceCut: DiamondCut[] = []

  for (let i = 0; i < facetsToDeploy.length; i++) {
    const facetName = facetsToDeploy[i]
    console.log('')
    console.log(`Deploying ${facetName}...`)
    const index = facetDeploymnetConfig[facetName].length - 1
    const config = facetDeploymnetConfig[facetName][index]
    const salt = utils.id(config.saltKey)

    const ContractFactory = await ethers.getContractFactory(facetName)

    const creationCode = ContractFactory.getDeployTransaction().data
    const computedAddress = await create3.getDeployed(deployer.address, salt)
    console.log('Address', computedAddress)

    // console.dir(
    //   { facetName, creationCode, computedAddress },
    //   { maxStringLength: null }
    // )

    if (!isAddressSame(computedAddress, config.contractAddress)) {
      throw new Error('Address not matched')
    }

    if (creationCode != config.creationCode) {
      throw new Error('Creation code not matched')
    }

    try {
      const gasLimitFaceCut = await create3.estimateGas.deploy(
        salt,
        creationCode
      )
      await estimateTxCost(gasLimitFaceCut, ethers.provider)

      const tx = await create3.connect(deployer).deploy(salt, creationCode)
      console.log('Tx hash', tx.hash)
      await tx.wait()

      console.log('Verification afer 30 sec...')
      await delay(15000)
    } catch (error) {
      console.log('Already Deployed')
    }
    await verify(chainId, facetName, computedAddress, [])

    faceCut.push({
      facetAddress: computedAddress,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingInterface(
        ContractFactory.interface,
        facetName
      ).selectors,
    })
  }

  return faceCut
}

export const deployFacetsWithArgsUingCreate3 = async (
  chainId: CHAIN_IDS,
  create3: Contract,
  deployer: SignerWithAddress,
  facetDeploymnetConfig: typeof FACETS_DEPLOYMENT_CONFIG,
  facetToDeployWithConstructorArgs: FacetDeployData[]
) => {
  let faceCut: DiamondCut[] = []
  for (let i = 0; i < facetToDeployWithConstructorArgs.length; i++) {
    const { facetName, constructorArgs } = facetToDeployWithConstructorArgs[i]
    console.log('')
    console.log(`Deploying ${facetName}...`)

    const index = facetDeploymnetConfig[facetName].length - 1
    const config = facetDeploymnetConfig[facetName][index]
    const salt = utils.id(config.saltKey)

    const ContractFactory = await ethers.getContractFactory(facetName)

    const creationCode = ContractFactory.getDeployTransaction(
      ...constructorArgs
    ).data
    const computedAddress = await create3.getDeployed(deployer.address, salt)
    console.log('Address', computedAddress)

    // console.dir({ facetName, computedAddress }, { maxStringLength: null })

    if (!isAddressSame(computedAddress, config.contractAddress)) {
      throw new Error('Address not matched')
    }

    if (creationCode != config.creationCode) {
      throw new Error('Creation code not matched')
    }

    try {
      const gasLimitFaceCut = await create3.estimateGas.deploy(
        salt,
        creationCode
      )
      await estimateTxCost(gasLimitFaceCut, ethers.provider)

      const tx = await create3.connect(deployer).deploy(salt, creationCode)
      console.log('Tx hash', tx.hash)
      await tx.wait()
      console.log('Verification afer 15 sec...')
      await delay(15000)
    } catch (error) {
      console.log('Already Deployed')
    }
    await verify(chainId, facetName, computedAddress, constructorArgs)

    faceCut.push({
      facetAddress: computedAddress,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingInterface(
        ContractFactory.interface,
        facetName
      ).selectors,
    })
  }
  return faceCut
}

export const deployAdapter = async (
  chainId: CHAIN_IDS,
  create3: Contract,
  deployer: SignerWithAddress,
  adapterDeploymentConfig: typeof ADAPTERS_DEPLOYMENT_CONFIG,
  adaptersToDeploy: string[]
) => {
  const adapters: string[] = []
  for (let i = 0; i < adaptersToDeploy.length; i++) {
    const adapterName = adaptersToDeploy[i]
    console.log('')
    console.log(`Deploying Adapter ${adapterName}...`)
    const index = adapterDeploymentConfig[adapterName].length - 1
    const config = adapterDeploymentConfig[adapterName][index]
    const salt = utils.id(config.saltKey)

    const ContractFactory = await ethers.getContractFactory(adapterName)

    const creationCode = ContractFactory.getDeployTransaction().data
    const computedAddress = await create3.getDeployed(deployer.address, salt)
    console.log('Address', computedAddress)

    // console.dir(
    //   { adapterName, creationCode, computedAddress },
    //   { maxStringLength: null }
    // )

    if (!isAddressSame(computedAddress, config.contractAddress)) {
      throw new Error('Address not matched')
    }

    if (creationCode != config.creationCode) {
      throw new Error('Creation code not matched')
    }

    try {
      const gasLimitFaceCut = await create3.estimateGas.deploy(
        salt,
        creationCode
      )
      await estimateTxCost(gasLimitFaceCut, ethers.provider)

      const tx = await create3.connect(deployer).deploy(salt, creationCode)
      console.log('Tx hash', tx.hash)
      await tx.wait()
      console.log('Verification afer 15 sec...')
      await delay(15000)
    } catch (error) {
      console.log('Already Deployed')
    }
    await verify(chainId, adapterName, computedAddress, [])

    adapters.push(computedAddress)
  }
  return adapters
}
