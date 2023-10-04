import { ethers } from 'hardhat'
import { CONTRACTS, BPS_MULTIPLIER } from '../constants'
import { getSelectorsUsingContract, upgradeDiamond } from './utils/diamond'
import { DiamondCut, FacetCutAction } from '../types'

async function init() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  // --------------------------------------

  const owner = deployer
  const protocolFeeVaultAddress = deployer.address
  const MAX_TOKEN_FEE = 10 * BPS_MULTIPLIER
  const MAX_FIXED_FEE_AMOUNT = ethers.utils.parseUnits('1')
  const permit2Address = '0x000000000022D473030F116dDEE9F6B43aC78BA3'

  const initArgs = {
    permit2: permit2Address,
    protocolFeeVault: protocolFeeVaultAddress,
    maxTokenFee: MAX_TOKEN_FEE,
    maxFixedNativeFeeAmount: MAX_FIXED_FEE_AMOUNT,
  }

  // --------------------------------------
  // deploy DiamondCutFacet
  const { diamondCutFacet } = await deployDiamondCut()
  // const diamondCutFacet = await ethers.getContractAt(CONTRACTS.DZapDiamond, '')

  // --------------------------------------
  // deploy Diamond
  const { dZapDiamond } = await deployDiamond(
    owner.address,
    diamondCutFacet.address
  )
  // const dZapDiamond = await ethers.getContractAt(
  //   CONTRACTS.DZapDiamond,
  //   ''
  // )

  // --------------------------------------
  // deploy DiamondInit
  // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
  const { diamondInit } = await deployDiamondInit()
  // const diamondInit = await ethers.getContractAt(
  //   CONTRACTS.DiamondInit,
  //   ''
  // )

  // --------------------------------------
  // deploy facets
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
  await upgradeDiamond(owner, cutData, dZapDiamond, initData)

  // --------------------------------------
}

async function deployDiamondCut() {
  console.log('')
  console.log('Deploying diamondCutFacet...')
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
  const diamondCutFacet = await DiamondCutFacet.deploy()
  await diamondCutFacet.deployed()
  console.log('DiamondCutFacet deployed:', diamondCutFacet.address)

  return { diamondCutFacet }
}

async function deployDiamondInit() {
  console.log('')
  console.log('Deploying DiamondInit...')
  const DiamondInit = await ethers.getContractFactory(CONTRACTS.DiamondInit)
  const diamondInit = await DiamondInit.deploy()
  await diamondInit.deployed()
  console.log('DiamondInit deployed:', diamondInit.address)

  return { diamondInit }
}

async function deployDiamond(
  contractOwner: string,
  diamondCutFacetAddress: string
) {
  console.log('')
  console.log('Deploying dZapDiamond...')
  const Diamond = await ethers.getContractFactory('DZapDiamond')
  const dZapDiamond = await Diamond.deploy(
    contractOwner,
    diamondCutFacetAddress
  )
  await dZapDiamond.deployed()
  console.log('DZapDiamond deployed:', dZapDiamond.address)

  return { dZapDiamond }
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

  /* 
  const diamondLoupeFacet = await ethers.getContractAt(
    CONTRACTS.DiamondLoupeFacet,
    '0x77b02b7DCAeea6d2C1503211c80BF466Fd28b772'
  )
  const ownershipFacet = await ethers.getContractAt(
    CONTRACTS.OwnershipFacet,
    '0x7c48359C5E77420eFD353D53221032347185f39e'
  )
  const accessManagerFacet = await ethers.getContractAt(
    'AccessManagerFacet',
    '0x92cc4CeEE7450377B2De1b0b9192B41520d9B6F9'
  )
  const dexManagerFacet = await ethers.getContractAt(
    CONTRACTS.DexManagerFacet,
    '0x26E3eD863606e2cb110C4f112819B3605D82bd8D'
  )
  const feesFacet = await ethers.getContractAt(
    CONTRACTS.FeesFacet,
    '0xc6BB92a1454BCB1AF921955DE1873b4e23b52CB5'
  )
  const withdrawFacet = await ethers.getContractAt(
    CONTRACTS.WithdrawFacet,
    '0x9505F36b63320AF377183F252962f8F397544C66'
  )
  const swapFacet = await ethers.getContractAt(
    CONTRACTS.SwapFacet,
    '0xf37848d6BEA6f32f5584C987853A05291CEb64D9'
  )
  const crossChainFacet = await ethers.getContractAt(
    CONTRACTS.CrossChainFacet,
    '0xEC5F822DbD177F575eE5420C7cA7cD2C10e56F67'
  )
 */

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
        'AccessManagerFacet'
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
    diamondLoupeFacet,
    ownershipFacet,
    accessManagerFacet,
    dexManagerFacet,
    withdrawFacet,
    feesFacet,
    swapFacet,
    crossChainFacet,
  }
}

if (require.main === module) {
  init()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployDiamond = deployDiamond
