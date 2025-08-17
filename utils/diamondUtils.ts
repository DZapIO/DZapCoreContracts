import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { Contract, FunctionFragment, id, Interface, Wallet } from 'ethers'
import { ethers } from 'hardhat'
import { delay, getContractUrl, getProvider, getTxUrl, isAddressSame } from '.'
import { CHAIN_IDS } from '../config'
import { GAS_ZIP_ADDRESS } from '../config/adapters/gasZip'
import { RELAYER_ADDRESS } from '../config/adapters/relay'
import { ADAPTERS_DEPLOYMENT_CONFIG_TESTING } from '../config/deployment/adapters'
import {
  FACETS_DEPLOYMENT_CONFIG,
  FACETS_DEPLOYMENT_CONFIG_TESTING,
} from '../config/deployment/facets'
import { CONTRACTS, ZERO } from '../constants'
import { DiamondLoupeFacet, WhitelistingManagerFacet } from '../typechain-types'
import {
  Create3DeploymentConfig,
  DiamondCut,
  DiamondCutData,
  DiamondCutDetails,
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
import { ABIS } from '../config/abis'

const catchCreate3Error = (error: any) => {
  let reason = error?.reason
  if (!reason) {
    reason = error._stack
  }
  if (typeof reason === 'string' && reason.includes('DEPLOYMENT_FAILED')) {
    console.log('Already Deployed')
  } else {
    throw error
  }
}

export function getSelectorsUsingFunSig(func: string[]) {
  const abiInterface = new Interface(func)
  const selectors: string[] = []
  for (const functionName of func) {
    const selector = abiInterface.getFunction(functionName)?.selector
    if (!selector)
      throw Error(`Selector not found : ${functionName} ${selector}`)
    selectors.push(selector)
  }

  return selectors
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

export function getAllFunSelectorsUsingInterface(
  iface: Interface,
  skipReadOnly = false
) {
  const fragments = iface.fragments as FunctionFragment[]
  const funFragments = fragments.filter((fragment) =>
    skipReadOnly
      ? fragment.type === 'function' && fragment.constant === false
      : fragment.type === 'function'
  )
  const signatures = funFragments.map((fragment) => fragment.format('sighash'))
  const selectors = signatures.reduce((acc, val) => {
    if (val !== 'init(bytes)') {
      const selector = iface.getFunction(val)?.selector
      if (!selector) throw Error(`Selector not found : ${val} ${selector}`)
      acc.push(selector)
    }
    return acc
  }, [] as string[])

  return selectors
}

export function removeFromSelectors(
  contract: Contract,
  selectors: string[],
  functionNames: string[]
) {
  return selectors.filter((selector) => {
    for (const functionName of functionNames) {
      const iSelector = contract.interface.getFunction(functionName)?.selector
      if (!iSelector)
        throw Error(`Selector not found : ${functionName} ${selector}`)

      if (selector !== iSelector) {
        return selector
      }
    }
  })
}

export function getSelector(func: string) {
  const abiInterface = new Interface([func])
  const selector = abiInterface.getFunction(func)?.selector

  if (!selector) throw Error(`Selector not found : ${func}`)

  return selector
}

export function getSighash(fragments: FunctionFragment[]) {
  return fragments.map((fragment) => fragment.selector)
}

export function get(faceCutData: DiamondCutData, functionNames: string[]) {
  faceCutData.selectors = faceCutData.selectors.filter((selector) => {
    for (const functionName of functionNames) {
      const iSelector =
        faceCutData.contract.interface.getFunction(functionName)?.selector
      if (!iSelector)
        throw Error(`Selector not found : ${functionName} ${selector}`)

      if (selector !== iSelector) {
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
  const iface = new ethers.Interface(abi)
  return iface.fragments
    .filter((fragment) => fragment.type === 'function')
    .map((fragment) => {
      const funcFragment = fragment
      return funcFragment.format('sighash')
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
  chainId: CHAIN_IDS,
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
  const gasLimit = await diamondCut.diamondCut.estimateGas(
    cutData,
    initData.address,
    initData.data
  )
  await estimateTxCost(gasLimit, provider)
  const gasPrice = await getGasPrice(provider)
  const { data } = await diamondCut.diamondCut.populateTransaction(
    cutData,
    initData.address,
    initData.data
  )
  const tx = await owner.sendTransaction({
    to: await diamondCut.getAddress(),
    data,
    // gasPrice,
    // gasLimit,
  })

  console.log('Diamond cut tx: ', tx.hash)
  const receipt = await tx.wait()
  if (receipt && !receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')
  return { txHash: tx.hash, blockNumber: receipt?.blockNumber }
}

export async function deployFacetsToReplace(facetNames: string[]) {
  const cutData: DiamondCut[] = []
  console.log('')
  console.log('Deploying NewFacets:')
  for (let i = 0; i < facetNames.length; i++) {
    const facetName = facetNames[i]
    console.log(`Deploying ${facetName}...`)
    const Facet = await ethers.getContractFactory(facetName)
    const facet = await Facet.deploy()
    console.log('hash', facet.deploymentTransaction()?.hash)
    await facet.waitForDeployment()

    cutData.push({
      // facetAddress: await facet.getAddress(),
      facetAddress: await facet.getAddress(),
      action: FacetCutAction.Replace,
      functionSelectors: getAllFunSelectorsUsingInterface(facet.interface),
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
    console.log('hash', contract.deploymentTransaction()?.hash)
    await contract.waitForDeployment()
    const tempCutData = {
      facetAddress: await contract.getAddress(),
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
    console.log('hash', contract.deploymentTransaction()?.hash)
    await contract.waitForDeployment()

    const tempCutData = {
      facetAddress: await contract.getAddress(),
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
      totalDeploymentCost = totalDeploymentCost + deploymentCost
  }

  return totalDeploymentCost
}

export const whitelistAdapters = async (
  deployer: SignerWithAddress,
  bridgeManager: WhitelistingManagerFacet,
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
    console.log('\nAdding adapters...', adaptersToAdd)
    const tx = await bridgeManager.connect(deployer).addAdapters(adaptersToAdd)
    console.log('Adapters Add Tx', tx.hash)
    await tx.wait()
  }
}

export const getFaceCutData = async (
  create3: any,
  deployerAddress: string,
  facets: string[]
) => {
  let faceCut: DiamondCut[] = []

  for (let i = 0; i < facets.length; i++) {
    const facetName = facets[i]
    console.log('')
    console.log(`Get ${facetName}...`)
    const config = getLastCreate3Config(FACETS_DEPLOYMENT_CONFIG[facetName])
    const salt = id(config.saltKey)

    const ContractFactory = await ethers.getContractFactory(facetName)
    const computedAddress = await create3.getDeployed(deployerAddress, salt)

    if (!isAddressSame(computedAddress, config.contractAddress)) {
      throw new Error('Address not matched')
    }

    // const creationCode = (await ContractFactory.getDeployTransaction()).data
    // if (creationCode != config.creationCode) {
    // console.dir({ creationCode }, { maxStringLength: null })
    //   throw new Error('Creation code not matched')
    // }

    faceCut.push({
      facetAddress: computedAddress,
      action: FacetCutAction.Add,
      functionSelectors: getAllFunSelectorsUsingInterface(
        ContractFactory.interface
      ),
    })
  }

  return faceCut
}

export const deployUsingCreate3 = async (
  chainId: CHAIN_IDS,
  create3: any,
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
  const creationCode = (
    await ContractFactory.getDeployTransaction(...constructorArgs)
  ).data
  const salt = id(config.saltKey)
  const computedAddress = await create3.getDeployed(deployer.address, salt)
  console.log('Address', computedAddress)

  if (!isAddressSame(computedAddress, config.contractAddress)) {
    throw new Error('Address not matched')
  }

  // if (creationCode != config.creationCode) {
  //   console.dir({ creationCode }, { maxStringLength: null })
  //   throw new Error('Creation code not matched')
  // }

  try {
    const gasLimitFaceCut = await create3.deploy.estimateGas(salt, creationCode)
    await estimateTxCost(gasLimitFaceCut, provider)

    //@ts-ignore
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
  create3Address: string,
  deployer: SignerWithAddress | Wallet,
  facetsToDeploy: string[],
  verifyContract = true
) => {
  const create3 = await ethers.getContractAt(
    ABIS.Create3FactoryAbi,
    create3Address,
    deployer
  )

  let faceCutData: DiamondCut[] = []
  let faceCutDetails: DiamondCutDetails[] = []
  const provider = await getProvider(chainId)

  for (let i = 0; i < facetsToDeploy.length; i++) {
    const facetName = facetsToDeploy[i]
    console.log('')
    console.log(`Deploying ${facetName}...`)
    const config = getLastCreate3Config(
      FACETS_DEPLOYMENT_CONFIG_TESTING[facetName]
    )
    // const config = getLastCreate3Config(FACETS_DEPLOYMENT_CONFIG[facetName])
    const salt = id(config.saltKey)

    const ContractFactory = await ethers.getContractFactory(facetName, deployer)

    const creationCode = (await ContractFactory.getDeployTransaction()).data
    const computedAddress = await create3.getDeployed(deployer.address, salt)
    console.log('Address', computedAddress)

    if (!isAddressSame(computedAddress, config.contractAddress)) {
      throw new Error('Address not matched')
    }

    // if (creationCode != config.creationCode) {
    //   console.dir({ creationCode }, { maxStringLength: null })
    //   throw new Error('Creation code not matched')
    // }

    try {
      const gasPrice = await getGasPrice(provider)
      const gasLimit = await create3.deploy.estimateGas(salt, creationCode)
      await estimateTxCost(gasLimit, provider)

      const { data } = await create3.deploy.populateTransaction(
        salt,
        creationCode
      )

      const tx = await deployer.sendTransaction({
        to: await create3.getAddress(),
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

    const functionSelectors = getAllFunSelectorsUsingInterface(
      ContractFactory.interface
    )

    faceCutData.push({
      facetAddress: computedAddress,
      action: FacetCutAction.Add,
      functionSelectors,
    })

    faceCutDetails.push({
      facetAddress: computedAddress,
      action: FacetCutAction.Add,
      functionSelectors,
      facetName,
    })
  }

  return { faceCutData, faceCutDetails }
}

export const deployWithArgsUsingCreate3 = async (
  chainId: CHAIN_IDS,
  create3Address: string,
  deployer: SignerWithAddress | Wallet,
  args: FacetDeployData[],
  create3DeploymentConfig: { [key: string]: Create3DeploymentConfig[] },
  verifyContract = true
) => {
  const create3 = await ethers.getContractAt(
    ABIS.Create3FactoryAbi,
    create3Address,
    deployer
  )

  let faceCut: DiamondCut[] = []
  const provider = await getProvider(chainId)
  const contractsAddress: string[] = []

  for (let i = 0; i < args.length; i++) {
    const { facetName, constructorArgs } = args[i]
    console.log('')
    console.log(`Deploying ${facetName}...`)

    const config = getLastCreate3Config(create3DeploymentConfig[facetName])
    const salt = id(config.saltKey)

    const ContractFactory = await ethers.getContractFactory(facetName, deployer)

    const creationCode = (
      constructorArgs.length > 0
        ? await ContractFactory.getDeployTransaction(...constructorArgs)
        : await ContractFactory.getDeployTransaction()
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
      // const gasLimit = await create3.deploy.estimateGas(salt, creationCode)
      const gasPrice = await getGasPrice(provider)
      // await estimateTxCost(gasLimit, provider)

      // const tx = await create3
      //   .connect(deployer)
      // .deploy(salt, creationCode, { gasPrice })
      // .deploy(salt, creationCode, { gasPrice, gasLimit })

      const { data } = await create3.deploy.populateTransaction(
        salt,
        creationCode
      )
      const tx = await deployer.sendTransaction({
        to: await create3.getAddress(),
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

    contractsAddress.push(computedAddress)

    faceCut.push({
      facetAddress: computedAddress,
      action: FacetCutAction.Add,
      functionSelectors: getAllFunSelectorsUsingInterface(
        ContractFactory.interface
      ),
    })
  }
  return { faceCut, contractsAddress }
}

export const deployAdapter = async (
  chainId: CHAIN_IDS,
  create3: any,
  deployer: SignerWithAddress | Wallet,
  adaptersToDeploy: string[],
  verifyContract = true
) => {
  const adapters: string[] = []
  for (let i = 0; i < adaptersToDeploy.length; i++) {
    const adapterName = adaptersToDeploy[i]
    console.log('')
    console.log(`Deploying Adapter ${adapterName}...`)
    // const config = getLastCreate3Config(ADAPTERS_DEPLOYMENT_CONFIG[adapterName])
    const config = getLastCreate3Config(
      ADAPTERS_DEPLOYMENT_CONFIG_TESTING[adapterName]
    )
    const salt = id(config.saltKey)
    const provider = await getProvider(chainId)

    const ContractFactory = await ethers.getContractFactory(
      adapterName,
      deployer
    )

    const creationCode = (await ContractFactory.getDeployTransaction()).data
    const computedAddress = await create3.getDeployed(deployer.address, salt)
    console.log('Address', computedAddress)

    // console.dir(
    //   { adapterName, creationCode, computedAddress },
    //   { maxStringLength: null }
    // )

    if (!isAddressSame(computedAddress, config.contractAddress)) {
      throw new Error('Address not matched')
    }

    // if (creationCode != config.creationCode) {
    //   console.dir({ creationCode }, { maxStringLength: null })
    //   throw new Error('Creation code not matched')
    // }

    try {
      const gasLimitFaceCut = await create3.deploy.estimateGas(
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

export const getOptionalAdapterDeploymentData = (chainId: CHAIN_IDS) => {
  const relayAddress = RELAYER_ADDRESS[chainId]
  const gasZipAddress = GAS_ZIP_ADDRESS[chainId]

  const deployWithConstructorArgs: FacetDeployData[] = []
  const adaptersToDeploy: string[] = []
  const constructorArgsObj: Record<string, string[]> = {
    [CONTRACTS.RelayBridgeAdapter]: [],
    [CONTRACTS.GasZipAdapter]: [],
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
    deployWithConstructorArgs.push({
      facetName: CONTRACTS.RelayBridgeAdapter,
      constructorArgs,
    })
    adaptersToDeploy.push(CONTRACTS.RelayBridgeAdapter)
    constructorArgsObj[CONTRACTS.RelayBridgeAdapter] = constructorArgs
  }

  if (gasZipAddress && gasZipAddress.contractAddress != '') {
    const constructorArgs = [gasZipAddress.contractAddress]
    deployWithConstructorArgs.push({
      facetName: CONTRACTS.GasZipAdapter,
      constructorArgs,
    })
    adaptersToDeploy.push(CONTRACTS.GasZipAdapter)
    constructorArgsObj[CONTRACTS.GasZipAdapter] = constructorArgs
  }

  return {
    deployWithConstructorArgs,
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
      facetName: CONTRACTS.RelayBridgeAdapter,
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
      facetName: CONTRACTS.GasZipAdapter,
      constructorArgs,
    })
    adaptersToDeploy.push(CONTRACTS.GasZipAdapter)
  }

  return { facetToDeployWithConstructorArgs, adaptersToDeploy, constructorArgs }
}
