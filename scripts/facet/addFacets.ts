import { ethers } from 'hardhat'
import { CONTRACTS } from '../../constants'
import { DiamondCut } from '../../types'
import { deployToAddFacets, upgradeDiamond } from '../utils/diamond'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'add facet',
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

  const { cutData } = await deployToAddFacets([CONTRACTS.BatchBridgeCallFacet])

  /* ------------------------------------------- */
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
