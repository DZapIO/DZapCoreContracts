import {
  Contract,
  ContractFactory,
  formatUnits,
  JsonRpcProvider,
  Provider,
  Signer,
  Wallet,
} from 'ethers'
import { ethers } from 'hardhat'
import { ADAPTERS_DEPLOYMENT_CONFIG } from '../config/deployment/adapters'
import { CONTRACTS, ZERO } from '../constants'
import {
  AccessManagerFacet,
  DiamondCutFacet,
  DiamondInit,
  DiamondLoupeFacet,
  DZapDiamond,
  OwnershipFacet,
  SwapFacet,
  BridgeFacet,
  WithdrawFacet,
  GasLessFacet,
  ValidatorFacet,
  Permit2ManagerFacet,
  WhitelistingManagerFacet,
  VaultManagerFacet,
} from '../typechain-types'
import { Create3DeploymentConfig, ZKCreate2DeploymentConfig } from '../types'
import { isAddressSame } from './addressUtils'
import { getNetwork, getProvider, toChainId } from './networkUtils'

export const getAllDiamondFacets = async (
  contractAddress: string,
  signer?: Signer | Wallet
) => {
  const dZapDiamond = (await ethers.getContractAt(
    CONTRACTS.DZapDiamond,
    contractAddress,
    signer
  )) as unknown as DZapDiamond
  const diamondCutFacet = (await ethers.getContractAt(
    CONTRACTS.DiamondCutFacet,
    contractAddress,
    signer
  )) as unknown as DiamondCutFacet
  const diamondInit = (await ethers.getContractAt(
    CONTRACTS.DiamondInit,
    contractAddress,
    signer
  )) as unknown as DiamondInit
  const diamondLoupeFacet = (await ethers.getContractAt(
    CONTRACTS.DiamondLoupeFacet,
    contractAddress,
    signer
  )) as unknown as DiamondLoupeFacet
  const validatorFacet = (await ethers.getContractAt(
    CONTRACTS.ValidatorFacet,
    contractAddress,
    signer
  )) as unknown as ValidatorFacet
  const whitelistingManagerFacet = (await ethers.getContractAt(
    CONTRACTS.WhitelistingManagerFacet,
    contractAddress,
    signer
  )) as unknown as WhitelistingManagerFacet
  const accessManagerFacet = (await ethers.getContractAt(
    CONTRACTS.AccessManagerFacet,
    contractAddress,
    signer
  )) as unknown as AccessManagerFacet
  const permit2ManagerFacet = (await ethers.getContractAt(
    CONTRACTS.Permit2ManagerFacet,
    contractAddress,
    signer
  )) as unknown as Permit2ManagerFacet
  const vaultManagerFacet = (await ethers.getContractAt(
    CONTRACTS.VaultManagerFacet,
    contractAddress,
    signer
  )) as unknown as VaultManagerFacet
  const withdrawFacet = (await ethers.getContractAt(
    CONTRACTS.WithdrawFacet,
    contractAddress,
    signer
  )) as unknown as WithdrawFacet
  const ownershipFacet = (await ethers.getContractAt(
    CONTRACTS.OwnershipFacet,
    contractAddress,
    signer
  )) as unknown as OwnershipFacet

  const swapFacet = (await ethers.getContractAt(
    CONTRACTS.SwapFacet,
    contractAddress,
    signer
  )) as unknown as SwapFacet
  const bridgeFacet = (await ethers.getContractAt(
    CONTRACTS.BridgeFacet,
    contractAddress,
    signer
  )) as unknown as BridgeFacet

  const gasLessFacet = (await ethers.getContractAt(
    CONTRACTS.GasLessFacet,
    contractAddress,
    signer
  )) as unknown as GasLessFacet

  return {
    dZapDiamond,
    diamondCutFacet,
    diamondInit,
    diamondLoupeFacet,
    validatorFacet,
    whitelistingManagerFacet,
    accessManagerFacet,
    permit2ManagerFacet,
    vaultManagerFacet,
    withdrawFacet,
    ownershipFacet,
    swapFacet,
    bridgeFacet,
    gasLessFacet,
  }
}

export const isContractDeployed = async (contractAddress: string) => {
  const code = await ethers.provider.getCode(contractAddress)
  return code !== '0x'
}

export const getLastCreate3Config = (arr: Create3DeploymentConfig[]) => {
  return arr[arr.length - 1]
}

export const getLastZkCreateConfig = (arr: ZKCreate2DeploymentConfig[]) => {
  return arr[arr.length - 1]
}

export const getGasPrice = async (
  provider: Provider,
  extraFeePercent = 2 // 2% extra
) => {
  const { gasPrice } = await provider.getFeeData()

  if (gasPrice === null) {
    throw new Error('Could not get gasPrice')
  }

  const newGasPrice =
    gasPrice + (gasPrice * BigInt(extraFeePercent)) / BigInt(100)

  // console.log(
  //   'Gas Price:',
  //   formatUnits(gasPrice, 'gwei'),
  //   formatUnits(newGasPrice, 'gwei')
  // )
  return newGasPrice
}

export const estimateDeploymentCost = async (
  factory: ContractFactory,
  provider: JsonRpcProvider,
  constructorArgs: any[] = []
) => {
  const deployTransaction = await factory.getDeployTransaction(
    ...constructorArgs
  )
  const chainId = toChainId((await provider.getNetwork()).chainId)
  const network = getNetwork(chainId)

  try {
    const gasEstimate = await provider.estimateGas(deployTransaction)
    const gasPrice = await getGasPrice(provider)
    const deploymentCost = gasEstimate * gasPrice

    console.log('Estimated Gas:', gasEstimate.toString())
    console.log(
      `Estimated Deployment Cost: ${formatUnits(deploymentCost, 'ether')} ${
        network.nativeCurrency.symbol
      }`
    )

    return deploymentCost
  } catch (error) {
    console.error('Error estimating deployment cost:', error)
    return null
  }
}

export const estimateTxCost = async (
  gasEstimate: bigint,
  provider?: JsonRpcProvider
) => {
  try {
    if (!provider) {
      provider = await getProvider(
        (await ethers.provider.getNetwork()).chainId.toString()
      )
    }
    const { gasPrice } = await provider.getFeeData()

    if (gasPrice === null) {
      throw new Error('Could not get gasPrice')
    }

    const deploymentCost = gasEstimate * gasPrice
    const chainId = toChainId((await provider.getNetwork()).chainId)
    const network = getNetwork(chainId)

    console.log('Estimated Gas:', gasEstimate.toString())
    console.log('Gas Price:', formatUnits(gasPrice, 'gwei'), 'GWEI')
    console.log(
      `Estimated Deployment Cost: ${formatUnits(deploymentCost, 'ether')} ${
        network.nativeCurrency.symbol
      }`
    )

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
    const creationCode = (await ContractFactory.getDeployTransaction()).data
    const adapterDeploymentConfig = getLastCreate3Config(
      ADAPTERS_DEPLOYMENT_CONFIG[adapterName]
    ) as Create3DeploymentConfig
    const salt = ethers.id(adapterDeploymentConfig.saltKey)

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
    const gasEstimate = await create3.deploy.estimateGas(
      salt,
      adapterDeploymentConfig.creationCode
    )

    const deploymentCost = await estimateTxCost(gasEstimate)
    if (deploymentCost)
      totalDeploymentCost = totalDeploymentCost + deploymentCost
  }
  return totalDeploymentCost
}
