import { ethers } from 'hardhat'
import { CONTRACTS, ZERO } from '../constants'
import { deployFacetsToReplace, upgradeDiamond } from './utils/diamond'

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

  // const dZapDiamondAddress = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7' // opt
  const dZapDiamondAddress = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7' // arb
  // const dZapDiamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5' // polygon

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
