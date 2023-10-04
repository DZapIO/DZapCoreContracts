import { ethers } from 'hardhat'
import { BPS_MULTIPLIER, CONTRACTS, ZERO } from '../constants'
import { DiamondCut, FacetCutAction, FeeInfo, FeeType } from '../types'
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
  const diamondInitAddress = ''
  // const dZapDiamondAddress = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7' // opt
  // const dZapDiamondAddress = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7' // arb
  // const dZapDiamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5' // polygon

  const dZapDiamond = await ethers.getContractAt(
    CONTRACTS.DZapDiamond,
    dZapDiamondAddress
  )

  const diamondInit = await ethers.getContractAt(
    CONTRACTS.DiamondInit,
    diamondInitAddress
  )

  /* ------------------------------------------- */

  //   const protocolFeeVaultAddress = deployer.address
  //   const MAX_TOKEN_FEE = 10 * BPS_MULTIPLIER
  //   const MAX_FIXED_FEE_AMOUNT = ethers.utils.parseUnits('1')
  //   const permit2Address = '0x000000000022D473030F116dDEE9F6B43aC78BA3'

  //   const initArgs = {
  //     permit2: permit2Address,
  //     protocolFeeVault: protocolFeeVaultAddress,
  //     maxTokenFee: MAX_TOKEN_FEE,
  //     maxFixedNativeFeeAmount: MAX_FIXED_FEE_AMOUNT,
  //   }

  const initArgs = {}

  /* ------------------------------------------- */

  //   const OwnershipFacet = await ethers.getContractFactory(
  //     CONTRACTS.OwnershipFacet
  //   )
  //   const ownershipFacet = await OwnershipFacet.deploy()
  //   await ownershipFacet.deployed()
  //   console.log(`OwnershipFacet deployed: ${ownershipFacet.address}`)

  /* ------------------------------------------- */

  const cutData: DiamondCut[] = [
    // {
    //   facetAddress: ownershipFacet.address,
    //   action: FacetCutAction.Add,
    //   functionSelectors: getSelectorsUsingContract(
    //     ownershipFacet,
    //     CONTRACTS.OwnershipFacet
    //   ).selectors,
    // },
    // {
    //   facetAddress: feesFacet.address,
    //   action: FacetCutAction.Add,
    //   functionSelectors: removeFromSelectors(
    //     feesFacet,
    //     getSelectorsUsingContract(feesFacet, CONTRACTS.FeesFacet).selectors,
    //     ['initialize(address,uint256,uint256)']
    //   ),
    // },
  ]

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

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
