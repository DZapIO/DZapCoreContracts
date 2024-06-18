import { ethers } from 'hardhat'
import { CONTRACTS } from '../../constants'
import { deployFacetsToReplace, upgradeDiamond } from './../utils/diamond'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'replaceFacet',
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
  // replace facets
  console.log('')
  console.log('Replacing Facets...')
  const { cutData } = await deployFacetsToReplace([CONTRACTS.CrossChainFacet])

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
