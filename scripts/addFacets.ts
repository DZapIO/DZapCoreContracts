import { ethers } from 'hardhat'
import { CONTRACTS } from '../constants'
import { DiamondCut } from '../types'
import { upgradeDiamond } from './utils/diamond'

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
    address: ethers.constants.AddressZero,
    data: '0x',
  }
  await upgradeDiamond(deployer, cutData, dZapDiamond, initData)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
