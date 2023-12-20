import { ethers } from 'hardhat'
import {
  CONTRACTS,
  MAX_FIXED_FEE_AMOUNT,
  MAX_TOKEN_FEE,
  PERMIT2_ADDRESS,
  DZAP_INTEGRATOR,
} from '../constants'
import { DiamondCut, FacetCutAction } from '../types'
import { getSelectorsUsingContract, upgradeDiamond } from './utils/diamond'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'executor',
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  /* ------------------------------------------- */

  const dZapDiamondAddress = ''

  const dZapDiamond = await ethers.getContractAt(
    CONTRACTS.DZapDiamond,
    dZapDiamondAddress
  )

  /* ------------------------------------------- */

  console.log('')
  console.log('Deploying DiamondInit...')
  const DiamondInit = await ethers.getContractFactory(CONTRACTS.DiamondInit)
  const diamondInit = await DiamondInit.deploy()
  await diamondInit.deployed()
  console.log('DiamondInit deployed:', diamondInit.address)

  /* ------------------------------------------- */

  const protocolFeeVaultAddress = DZAP_INTEGRATOR

  const MAX_FIXED_FEE = ethers.utils.parseUnits(MAX_FIXED_FEE_AMOUNT[chainId])
  const initArgs = {
    permit2: PERMIT2_ADDRESS,
    protocolFeeVault: protocolFeeVaultAddress,
    maxTokenFee: MAX_TOKEN_FEE,
    maxFixedNativeFeeAmount: MAX_FIXED_FEE,
  }

  /* ------------------------------------------- */

  const { cutData } = await deployFacets()

  // --------------------------------------
  // upgrade diamond with facets
  const initData = {
    address: diamondInit.address,
    data: (
      await diamondInit.populateTransaction.initialize(
        ...Object.values(initArgs)
      )
    ).data as string,
  }
  await upgradeDiamond(deployer, cutData, dZapDiamond, initData)
}

async function deployFacets() {
  console.log('')
  console.log('Deploying facets...')

  const DiamondLoupeFacet = await ethers.getContractFactory(
    CONTRACTS.DiamondLoupeFacet
  )
  const diamondLoupeFacet = await DiamondLoupeFacet.deploy()
  await diamondLoupeFacet.deployed()
  console.log(`DiamondLoupeFacet deployed: ${diamondLoupeFacet.address}`)

  const OwnershipFacet = await ethers.getContractFactory(
    CONTRACTS.OwnershipFacet
  )
  const ownershipFacet = await OwnershipFacet.deploy()
  await ownershipFacet.deployed()
  console.log(`OwnershipFacet deployed: ${ownershipFacet.address}`)

  const AccessManagerFacet = await ethers.getContractFactory(
    'AccessManagerFacet'
  )
  const accessManagerFacet = await AccessManagerFacet.deploy()
  await accessManagerFacet.deployed()
  console.log(`AccessManagerFacet deployed: ${accessManagerFacet.address}`)

  const DexManagerFacet = await ethers.getContractFactory(
    CONTRACTS.DexManagerFacet
  )
  const dexManagerFacet = await DexManagerFacet.deploy()
  await dexManagerFacet.deployed()
  console.log(`DexManagerFacet deployed: ${dexManagerFacet.address}`)

  const FeesFacet = await ethers.getContractFactory(CONTRACTS.FeesFacet)
  const feesFacet = await FeesFacet.deploy()
  await feesFacet.deployed()
  console.log(`FeesFacet deployed: ${feesFacet.address}`)

  const WithdrawFacet = await ethers.getContractFactory(CONTRACTS.WithdrawFacet)
  const withdrawFacet = await WithdrawFacet.deploy()
  await withdrawFacet.deployed()
  console.log(`WithdrawFacet deployed: ${withdrawFacet.address}`)

  const SwapFacet = await ethers.getContractFactory(CONTRACTS.SwapFacet)
  const swapFacet = await SwapFacet.deploy()
  await swapFacet.deployed()
  console.log(`SwapFacet deployed: ${swapFacet.address}`)

  const CrossChainFacet = await ethers.getContractFactory(
    CONTRACTS.CrossChainFacet
  )
  const crossChainFacet = await CrossChainFacet.deploy()
  await crossChainFacet.deployed()
  console.log(`CrossChainFacet deployed: ${crossChainFacet.address}`)

  const cutData: DiamondCut[] = [
    {
      facetAddress: diamondLoupeFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        diamondLoupeFacet,
        CONTRACTS.DiamondLoupeFacet
      ).selectors,
    },
    {
      facetAddress: ownershipFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        ownershipFacet,
        CONTRACTS.OwnershipFacet
      ).selectors,
    },
    {
      facetAddress: accessManagerFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        accessManagerFacet,
        CONTRACTS.AccessManagerFacet
      ).selectors,
    },
    {
      facetAddress: dexManagerFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        dexManagerFacet,
        CONTRACTS.DexManagerFacet
      ).selectors,
    },
    {
      facetAddress: feesFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        feesFacet,
        CONTRACTS.FeesFacet
      ).selectors,
    },

    {
      facetAddress: withdrawFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        withdrawFacet,
        CONTRACTS.WithdrawFacet
      ).selectors,
    },
    {
      facetAddress: swapFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        swapFacet,
        CONTRACTS.SwapFacet
      ).selectors,
    },
    {
      facetAddress: crossChainFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        crossChainFacet,
        CONTRACTS.CrossChainFacet
      ).selectors,
    },
  ]

  return {
    cutData,
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
