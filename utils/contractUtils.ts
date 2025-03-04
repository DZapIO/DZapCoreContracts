import { ethers } from 'hardhat'
import { CONTRACTS, ZERO } from '../constants'
import { BigNumber, Contract, ContractFactory, providers, Signer } from 'ethers'
import {
  AccessManagerFacet,
  BatchBridgeCallFacet,
  BatchSwapFacet,
  BridgeManagerFacet,
  CrossChainFacet,
  DexManagerFacet,
  DiamondCutFacet,
  DiamondInit,
  DiamondLoupeFacet,
  DZapDiamond,
  FeesFacet,
  GasZipFacet,
  OwnershipFacet,
  RelayBridgeFacet,
  SwapFacet,
  SwapTransferFacet,
  WithdrawFacet,
} from '../typechain-types'
import { formatUnits } from 'ethers/lib/utils'
import { isAddressSame } from './addressUtils'
import { ADAPTERS_DEPLOYMENT_CONFIG } from '../config/deployment/adapters'
import { Create3DeploymentConfig } from '../types'

export const getAllDiamondFacets = async (
  contractAddress: string,
  signer: Signer
) => {
  const dZapDiamond = (await ethers.getContractAt(
    CONTRACTS.DZapDiamond,
    contractAddress,
    signer
  )) as DZapDiamond
  const diamondCutFacet = (await ethers.getContractAt(
    CONTRACTS.DiamondCutFacet,
    contractAddress,
    signer
  )) as DiamondCutFacet
  const diamondInit = (await ethers.getContractAt(
    CONTRACTS.DiamondInit,
    contractAddress,
    signer
  )) as DiamondInit
  const diamondLoupeFacet = (await ethers.getContractAt(
    CONTRACTS.DiamondLoupeFacet,
    contractAddress,
    signer
  )) as DiamondLoupeFacet

  const feesFacet = (await ethers.getContractAt(
    CONTRACTS.FeesFacet,
    contractAddress,
    signer
  )) as FeesFacet
  const accessManagerFacet = (await ethers.getContractAt(
    CONTRACTS.AccessManagerFacet,
    contractAddress,
    signer
  )) as AccessManagerFacet
  const withdrawFacet = (await ethers.getContractAt(
    CONTRACTS.WithdrawFacet,
    contractAddress,
    signer
  )) as WithdrawFacet
  const ownershipFacet = (await ethers.getContractAt(
    CONTRACTS.OwnershipFacet,
    contractAddress,
    signer
  )) as OwnershipFacet

  const dexManagerFacet = (await ethers.getContractAt(
    CONTRACTS.DexManagerFacet,
    contractAddress,
    signer
  )) as DexManagerFacet
  const bridgeManagerFacet = (await ethers.getContractAt(
    CONTRACTS.BridgeManagerFacet,
    contractAddress,
    signer
  )) as BridgeManagerFacet

  const swapFacet = (await ethers.getContractAt(
    CONTRACTS.SwapFacet,
    contractAddress,
    signer
  )) as SwapFacet
  const swapTransferFacet = (await ethers.getContractAt(
    CONTRACTS.SwapTransferFacet,
    contractAddress,
    signer
  )) as SwapTransferFacet
  const batchSwapFacet = (await ethers.getContractAt(
    CONTRACTS.BatchSwapFacet,
    contractAddress,
    signer
  )) as BatchSwapFacet

  const crossChainFacet = (await ethers.getContractAt(
    CONTRACTS.CrossChainFacet,
    contractAddress,
    signer
  )) as CrossChainFacet
  const relayBridgeFacet = (await ethers.getContractAt(
    CONTRACTS.RelayBridgeFacet,
    contractAddress,
    signer
  )) as RelayBridgeFacet
  const gasZipFacet = (await ethers.getContractAt(
    CONTRACTS.GasZipFacet,
    contractAddress,
    signer
  )) as GasZipFacet
  const batchBridgeCallFacet = (await ethers.getContractAt(
    CONTRACTS.BatchBridgeCallFacet,
    contractAddress,
    signer
  )) as BatchBridgeCallFacet

  return {
    dZapDiamond,
    diamondCutFacet,
    diamondInit,
    diamondLoupeFacet,
    feesFacet,
    dexManagerFacet,
    bridgeManagerFacet,
    accessManagerFacet,
    withdrawFacet,
    ownershipFacet,
    swapFacet,
    swapTransferFacet,
    batchSwapFacet,
    crossChainFacet,
    relayBridgeFacet,
    gasZipFacet,
    batchBridgeCallFacet,
  }
}

export const getLastCreate3Config = (arr: Create3DeploymentConfig[]) => {
  return arr[arr.length - 1]
}

export const getGasPrice = async (
  provider: providers.Provider,
  extraFeePercent = 5 // 5% extra
) => {
  const { gasPrice } = await provider.getFeeData()

  if (gasPrice === null) {
    throw new Error('Could not get gasPrice')
  }

  const newGasPrice = gasPrice.add(gasPrice.mul(extraFeePercent).div(100))

  console.log(
    'Gas Price:',
    formatUnits(gasPrice, 'gwei'),
    formatUnits(newGasPrice, 'gwei')
  )
  return newGasPrice
}

export const estimateDeploymentCost = async (
  factory: ContractFactory,
  provider: providers.JsonRpcProvider,
  constructorArgs: any[] = []
) => {
  const deployTransaction = await factory.getDeployTransaction(
    ...constructorArgs
  )

  try {
    const gasEstimate = await provider.estimateGas(deployTransaction)
    const gasPrice = await getGasPrice(provider)
    const deploymentCost = gasEstimate.mul(gasPrice)

    console.log('Estimated Gas:', gasEstimate.toString())
    console.log(
      'Estimated Deployment Cost:',
      formatUnits(deploymentCost, 'ether')
    )

    return deploymentCost
  } catch (error) {
    console.error('Error estimating deployment cost:', error)
    return null
  }
}

export const estimateTxCost = async (
  gasEstimate: BigNumber,
  provider: providers.JsonRpcProvider
) => {
  try {
    // const gasEstimate = await provider.estimateGas(txRequest);
    const { gasPrice } = await provider.getFeeData()

    if (gasPrice === null) {
      throw new Error('Could not get gasPrice')
    }

    const deploymentCost = gasEstimate.mul(gasPrice)

    console.log('Estimated Gas:', gasEstimate.toString())
    console.log('Gas Price:', formatUnits(gasPrice, 'gwei'), 'GWEI')
    console.log(
      'Estimated Deployment Cost:',
      formatUnits(deploymentCost, 'ether'),
      'ETH'
    ) // Or other currency

    return deploymentCost
  } catch (error) {
    console.error('Error estimating deployment cost:', error)
    return null
  }
}

export const validateAndEstimateAdapterDeploymentCost = async (
  adaptersToDeploy: string[],
  deployAddress: string,
  create3: Contract
) => {
  let totalDeploymentCost = ZERO
  for (let i = 0; i < adaptersToDeploy.length; i++) {
    console.log('')
    const adapterName = adaptersToDeploy[i]
    console.log(`Checking and estimating ${adapterName}...`)
    const ContractFactory = await ethers.getContractFactory(adapterName)
    const creationCode = ContractFactory.getDeployTransaction().data
    const adapterDeploymentConfig = getLastCreate3Config(
      ADAPTERS_DEPLOYMENT_CONFIG[adapterName]
    )
    const salt = ethers.utils.id(adapterDeploymentConfig.saltKey)

    if (!adapterDeploymentConfig)
      throw Error(`Adapter ${adapterName} not found in AdapterDeploymentConfig`)
    if (adapterDeploymentConfig.creationCode != creationCode) {
      throw new Error(`${adapterName} CreationCode not matched`)
    }

    const computedAddress = await create3.getDeployed(deployAddress, salt)
    if (!isAddressSame(deployAddress, adapterDeploymentConfig.deployer)) {
      throw new Error(`${adapterName} Deployer Address not matched`)
    }
    if (
      !isAddressSame(computedAddress, adapterDeploymentConfig.contractAddress)
    ) {
      throw new Error(`${adapterName} Address not matched`)
    }
    const gasEstimate = await create3.estimateGas.deploy(
      salt,
      adapterDeploymentConfig.creationCode
    )

    const deploymentCost = await estimateTxCost(gasEstimate, ethers.provider)
    if (deploymentCost)
      totalDeploymentCost = totalDeploymentCost.add(deploymentCost)
  }
  return totalDeploymentCost
}
