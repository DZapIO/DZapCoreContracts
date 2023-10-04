import { ethers } from 'hardhat'
import { CONTRACTS } from '../constants'

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
  // const dZapDiamondAddress = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7' // opt
  // const dZapDiamondAddress = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7' // arb
  // const dZapDiamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5' // polygon

  const dZapDiamond = await ethers.getContractAt(
    CONTRACTS.DZapDiamond,
    dZapDiamondAddress
  )

  const crossChainFacet = await ethers.getContractAt(
    CONTRACTS.CrossChainFacet,
    dZapDiamond.address
  )

  /* ------------------------------------------- */

  const routers = [
    '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
    '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
    '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
    '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
  ]
  const selectors = ['0xbe1eace7', '0xed178619', '0x8dc9932d', '0x83f31917']
  const info = [
    {
      isAvailable: true,
      offset: 0,
    },
    {
      isAvailable: true,
      offset: 0,
    },
    {
      isAvailable: true,
      offset: 0,
    },
    {
      isAvailable: true,
      offset: 0,
    },
  ]
  const integratorAddress = ''

  /* ------------------------------------------- */
  console.log('')
  console.log('Adding bridge selectors...')

  const tx = await crossChainFacet
    .connect(deployer)
    .updateSelectorInfo(routers, selectors, info)

  console.log('tx:', tx.hash)

  const receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Bridge Selector Update failed: ${tx.hash}`)
  }
  console.log('Bridge Selector Updated')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
