import { ethers } from 'hardhat'
import { CONTRACTS, ZERO } from '../constants'
import { FeeInfo, FeeType } from '../types'

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

  const feesFacet = await ethers.getContractAt(
    CONTRACTS.FeesFacet,
    dZapDiamond.address
  )

  /* ------------------------------------------- */

  const feeInfo: FeeInfo[] = [
    {
      tokenFee: ZERO,
      fixedNativeFeeAmount: ZERO,
      dzapTokenShare: ZERO,
      dzapFixedNativeShare: ZERO,
    },
    {
      tokenFee: ZERO,
      fixedNativeFeeAmount: ZERO,
      dzapTokenShare: ZERO,
      dzapFixedNativeShare: ZERO,
    },
  ]

  const integratorAddress = ''

  /* ------------------------------------------- */
  // setting facets
  console.log('')
  console.log('Setting Fee...')

  const tx = await feesFacet
    .connect(deployer)
    .setIntegratorInfo(
      integratorAddress,
      [FeeType.SWAP, FeeType.BRIDGE],
      feeInfo
    )

  console.log('tx:', tx.hash)

  const receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Setting Fee failed: ${tx.hash}`)
  }
  console.log('Completed Setting Fee')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
