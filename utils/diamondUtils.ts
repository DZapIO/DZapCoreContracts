import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract, utils, Wallet } from 'ethers'
import { FunctionFragment, Interface } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { delay, getContractUrl, getProvider, getTxUrl, isAddressSame } from '.'
import { CHAIN_IDS } from '../config'
import { FACETS_DEPLOYMENT_CONFIG } from '../config/deployment/facets'
import { GAS_ZIP_ADDRESS } from '../config/facets/gasZip'
import { RELAYER_ADDRESS } from '../config/facets/relay'
import { CONTRACTS, ZERO } from '../constants'
import { BridgeManagerFacet, DiamondLoupeFacet } from '../typechain-types'
import {
  Create3DeploymentConfig,
  DiamondCut,
  DiamondCutData,
  FacetCutAction,
  FacetDeployData,
} from '../types'
import {
  estimateDeploymentCost,
  estimateTxCost,
  getGasPrice,
  getLastCreate3Config,
} from './contractUtils'
import { verify } from './verifyUtils'
import { ADAPTERS_DEPLOYMENT_CONFIG } from '../config/deployment/adapters'

const catchCreate3Error = (error: any) => {
  const reason = error?.reason
  if (typeof reason === 'string' && reason.includes('DEPLOYMENT_FAILED')) {
    console.log('Already Deployed')
  } else {
    throw error
  }
}

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
      console.log(facetName, selector)
    }
  }

  return selectorToRemove
}

// -------------------------------------

export async function upgradeDiamond(
  chainId,
  owner: SignerWithAddress | Wallet,
  cutData: DiamondCut[],
  diamondAddress: string,
  initData: {
    address: string
    data: string
  }
) {
  console.log('')
  console.log('Diamond Cut')
  console.dir({ cutData }, { depth: null })
  const provider = await getProvider(chainId)

  const diamondCut = await ethers.getContractAt(
    CONTRACTS.DiamondCutFacet,
    diamondAddress,
    owner
  )
  const gasLimit = await diamondCut.estimateGas.diamondCut(
    cutData,
    initData.address,
    initData.data
  )
  await estimateTxCost(gasLimit, provider)
  const gasPrice = await getGasPrice(provider)
  const { data } = await diamondCut.populateTransaction.diamondCut(
    cutData,
    initData.address,
    initData.data
  )
  const tx = await owner.sendTransaction({
    to: diamondCut.address,
    data,
    // gasPrice,
    // gasLimit,
  })

  console.log('Diamond cut tx: ', tx.hash)
  const receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')
  return tx.hash
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
  chainId: CHAIN_IDS,
  signer: SignerWithAddress | Wallet,
  data: FacetDeployData[]
) {
  console.log('')
  console.log('Deploying facets...')
  const cutData: DiamondCut[] = []
  const provider = await getProvider(chainId)

  for (let i = 0; i < data.length; ++i) {
    const { facetName, constructorArgs } = data[i]
    console.log({ facetName, constructorArgs })
    console.log('')
    console.log(`Deploying ${facetName}...`)
    const ContractFactory = await ethers.getContractFactory(facetName, signer)

    // await estimateDeploymentCost(
    //   ContractFactory,
    //   provider,
    //   constructorArgs
    // )
    const gasPrice = await getGasPrice(provider)
    const contract = await ContractFactory.deploy(...constructorArgs, {
      gasPrice,
    })
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
  chainId: CHAIN_IDS,
  signer: SignerWithAddress | Wallet,
  data: FacetDeployData[]
) {
  let totalDeploymentCost = ZERO
  const provider = await getProvider(chainId)

  for (let i = 0; i < data.length; ++i) {
    console.log('')
    const facetName = data[i].facetName
    const constructorArgs = data[i].constructorArgs
    console.log({ facetName, constructorArgs })
    console.log(`Estimating ${facetName}...`)
    const ContractFactory = await ethers.getContractFactory(facetName, signer)

    const deploymentCost = await estimateDeploymentCost(
      ContractFactory,
      provider,
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
  console.log('WhitelistAdapters...')
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
  facets: string[]
) => {
  let faceCut: DiamondCut[] = []

  for (let i = 0; i < facets.length; i++) {
    const facetName = facets[i]
    console.log('')
    console.log(`Get ${facetName}...`)
    const config = getLastCreate3Config(FACETS_DEPLOYMENT_CONFIG[facetName])
    const salt = utils.id(config.saltKey)

    const ContractFactory = await ethers.getContractFactory(facetName)
    const computedAddress = await create3.getDeployed(deployerAddress, salt)

    if (!isAddressSame(computedAddress, config.contractAddress)) {
      throw new Error('Address not matched')
    }

    // const creationCode = ContractFactory.getDeployTransaction().data
    // if (creationCode != config.creationCode) {
    // console.dir({ creationCode }, { maxStringLength: null })
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
  deployer: SignerWithAddress | Wallet,
  contractName: string,
  config: Create3DeploymentConfig,
  constructorArgs: any[] = [],
  verifyContract = true
) => {
  console.log('')
  console.log(`Deploy ${contractName}...`)
  const provider = await getProvider(chainId)
  const ContractFactory = await ethers.getContractFactory(
    contractName,
    deployer
  )
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
    console.dir({ creationCode }, { maxStringLength: null })
    throw new Error('Creation code not matched')
  }

  try {
    const gasLimitFaceCut = await create3.estimateGas.deploy(salt, creationCode)
    await estimateTxCost(gasLimitFaceCut, provider)

    const tx = await create3.connect(deployer).deploy(salt, creationCode)
    console.log('Tx hash', getTxUrl(chainId, tx.hash))
    console.log('Contract address', getContractUrl(chainId, computedAddress))

    await tx.wait()
    if (verifyContract) {
      await delay(15000)
    }
  } catch (error) {
    catchCreate3Error(error)
  }
  if (verifyContract) {
    await verify(chainId, contractName, computedAddress, constructorArgs)
  }

  const contract = await ethers.getContractAt(contractName, computedAddress)
  return contract
}

export const deployFacetsUsingCreate3 = async (
  chainId: CHAIN_IDS,
  create3: Contract,
  deployer: SignerWithAddress | Wallet,
  facetsToDeploy: string[],
  verifyContract = true
) => {
  let faceCut: DiamondCut[] = []
  const provider = await getProvider(chainId)

  for (let i = 0; i < facetsToDeploy.length; i++) {
    const facetName = facetsToDeploy[i]
    console.log('')
    console.log(`Deploying ${facetName}...`)
    const config = getLastCreate3Config(FACETS_DEPLOYMENT_CONFIG[facetName])
    const salt = utils.id(config.saltKey)

    const ContractFactory = await ethers.getContractFactory(facetName, deployer)

    const creationCode = ContractFactory.getDeployTransaction().data
    const computedAddress = await create3.getDeployed(deployer.address, salt)
    console.log('Address', computedAddress)

    if (!isAddressSame(computedAddress, config.contractAddress)) {
      throw new Error('Address not matched')
    }

    if (creationCode != config.creationCode) {
      console.dir({ creationCode }, { maxStringLength: null })
      throw new Error('Creation code not matched')
    }

    try {
      const gasPrice = await getGasPrice(provider)
      const gasLimit = await create3.estimateGas.deploy(salt, creationCode)
      await estimateTxCost(gasLimit, provider)

      const { data } = await create3.populateTransaction.deploy(
        salt,
        creationCode
      )

      const tx = await deployer.sendTransaction({
        to: create3.address,
        data,
        gasPrice,
        gasLimit,
      })

      console.log('Tx hash', getTxUrl(chainId, tx.hash))
      console.log('Contract address', getContractUrl(chainId, computedAddress))
      await tx.wait()
    } catch (error: any) {
      catchCreate3Error(error)
    }

    if (verifyContract) {
      await verify(chainId, facetName, computedAddress, [])
    }

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
  deployer: SignerWithAddress | Wallet,
  facetToDeployWithConstructorArgs: FacetDeployData[],
  verifyContract = true
) => {
  let faceCut: DiamondCut[] = []
  const provider = await getProvider(chainId)

  for (let i = 0; i < facetToDeployWithConstructorArgs.length; i++) {
    const { facetName, constructorArgs } = facetToDeployWithConstructorArgs[i]
    console.log('')
    console.log(`Deploying ${facetName}...`)

    const config = getLastCreate3Config(FACETS_DEPLOYMENT_CONFIG[facetName])
    const salt = utils.id(config.saltKey)

    const ContractFactory = await ethers.getContractFactory(facetName, deployer)

    const creationCode = ContractFactory.getDeployTransaction(
      ...constructorArgs
    ).data
    const computedAddress = await create3.getDeployed(deployer.address, salt)
    console.log('Address', computedAddress)

    // console.dir({ facetName, computedAddress }, { maxStringLength: null })

    if (!isAddressSame(computedAddress, config.contractAddress)) {
      throw new Error('Address not matched')
    }

    // if (creationCode != config.creationCode) {
    //   console.dir({ creationCode }, { maxStringLength: null })
    //   throw new Error('Creation code not matched')
    // }

    try {
      // const gasLimit = await create3.estimateGas.deploy(salt, creationCode)
      const gasPrice = await getGasPrice(provider)
      // await estimateTxCost(gasLimit, provider)

      // const tx = await create3
      //   .connect(deployer)
      // .deploy(salt, creationCode, { gasPrice })
      // .deploy(salt, creationCode, { gasPrice, gasLimit })

      const { data } = await create3.populateTransaction.deploy(
        salt,
        creationCode
      )
      const tx = await deployer.sendTransaction({
        to: create3.address,
        data,
        gasPrice,
      })
      console.log('Tx hash', getTxUrl(chainId, tx.hash))
      console.log('Contract address', getContractUrl(chainId, computedAddress))
      await tx.wait()

      if (verifyContract) {
        console.log('Verification afer 5 sec...')
        await delay(5000)
      }
    } catch (error) {
      catchCreate3Error(error)
    }
    if (verifyContract) {
      await verify(chainId, facetName, computedAddress, constructorArgs)
    }

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
  deployer: SignerWithAddress | Wallet,
  adaptersToDeploy: string[],
  verifyContract = true
) => {
  const adapters: string[] = []
  for (let i = 0; i < adaptersToDeploy.length; i++) {
    const adapterName = adaptersToDeploy[i]
    console.log('')
    console.log(`Deploying Adapter ${adapterName}...`)
    const config = getLastCreate3Config(ADAPTERS_DEPLOYMENT_CONFIG[adapterName])
    const salt = utils.id(config.saltKey)
    const provider = await getProvider(chainId)

    const ContractFactory = await ethers.getContractFactory(
      adapterName,
      deployer
    )

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
      console.dir({ creationCode }, { maxStringLength: null })
      throw new Error('Creation code not matched')
    }

    try {
      const gasLimitFaceCut = await create3.estimateGas.deploy(
        salt,
        creationCode
      )
      await estimateTxCost(gasLimitFaceCut, provider)

      const tx = await create3.connect(deployer).deploy(salt, creationCode)
      console.log('Tx hash', getTxUrl(chainId, tx.hash))
      console.log('Contract address', getContractUrl(chainId, computedAddress))
      await tx.wait()
      if (verifyContract) {
        await delay(15000)
      }
    } catch (error) {
      catchCreate3Error(error)
    }
    if (verifyContract) {
      await verify(chainId, adapterName, computedAddress, [])
    }

    adapters.push(computedAddress)
  }
  return adapters
}

export const getOptionalFacetDeploymentData = (chainId: CHAIN_IDS) => {
  const relayAddress = RELAYER_ADDRESS[chainId]
  const gasZipAddress = GAS_ZIP_ADDRESS[chainId]

  const facetToDeployWithConstructorArgs: FacetDeployData[] = []
  const adaptersToDeploy: string[] = []
  const constructorArgsObj: Record<string, string[]> = {
    [CONTRACTS.RelayBridgeFacet]: [],
    [CONTRACTS.GasZipFacet]: [],
  }

  if (
    relayAddress &&
    relayAddress.relayerReceiver != '' &&
    relayAddress.relayerSender != ''
  ) {
    const constructorArgs = [
      relayAddress.relayerReceiver,
      relayAddress.relayerSolver,
    ]
    facetToDeployWithConstructorArgs.push({
      facetName: CONTRACTS.RelayBridgeFacet,
      constructorArgs,
    })
    adaptersToDeploy.push(CONTRACTS.RelayBridgeAdapter)
    constructorArgsObj[CONTRACTS.RelayBridgeFacet] = constructorArgs
  }

  if (gasZipAddress && gasZipAddress.contractAddress != '') {
    const constructorArgs = [gasZipAddress.contractAddress]
    facetToDeployWithConstructorArgs.push({
      facetName: CONTRACTS.GasZipFacet,
      constructorArgs,
    })
    adaptersToDeploy.push(CONTRACTS.GasZipAdapter)
    constructorArgsObj[CONTRACTS.GasZipFacet] = constructorArgs
  }

  return {
    facetToDeployWithConstructorArgs,
    adaptersToDeploy,
    constructorArgsObj,
  }
}

export const getRelayFacetDeploymentData = (chainId: CHAIN_IDS) => {
  const relayAddress = RELAYER_ADDRESS[chainId]
  const adaptersToDeploy: string[] = []
  const facetToDeployWithConstructorArgs: FacetDeployData[] = []
  let constructorArgs: string[] = []
  if (
    relayAddress &&
    relayAddress.relayerReceiver != '' &&
    relayAddress.relayerSender != ''
  ) {
    constructorArgs = [relayAddress.relayerReceiver, relayAddress.relayerSolver]
    facetToDeployWithConstructorArgs.push({
      facetName: CONTRACTS.RelayBridgeFacet,
      constructorArgs,
    })
    adaptersToDeploy.push(CONTRACTS.RelayBridgeAdapter)
  }

  return { facetToDeployWithConstructorArgs, adaptersToDeploy, constructorArgs }
}

export const getGasZipFacetDeploymentData = (chainId: CHAIN_IDS) => {
  const gasZipAddress = GAS_ZIP_ADDRESS[chainId]
  const adaptersToDeploy: string[] = []
  const facetToDeployWithConstructorArgs: FacetDeployData[] = []
  let constructorArgs: string[] = []

  if (gasZipAddress && gasZipAddress.contractAddress != '') {
    constructorArgs = [gasZipAddress.contractAddress]
    facetToDeployWithConstructorArgs.push({
      facetName: CONTRACTS.GasZipFacet,
      constructorArgs,
    })
    adaptersToDeploy.push(CONTRACTS.GasZipAdapter)
  }

  return { facetToDeployWithConstructorArgs, adaptersToDeploy, constructorArgs }
}
