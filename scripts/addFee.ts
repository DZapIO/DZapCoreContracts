import { ethers } from 'hardhat'
import { CONTRACTS, PROTOCOL_FEE_VAULT, ZERO } from '../constants'
import { FeeInfo, FeeType } from '../types'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'fee',
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

  const integratorAddress = PROTOCOL_FEE_VAULT

  /* ------------------------------------------- */

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
