import { ethers } from 'hardhat'
import { CONTRACTS } from '../constants'
import { OwnershipFacet } from '../typechain-types'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'transferOwnership',
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  /* ------------------------------------------- */

  const dZapDiamondAddress = ''

  const dZapDiamond = (await ethers.getContractAt(
    CONTRACTS.OwnershipFacet,
    dZapDiamondAddress,
    deployer
  )) as OwnershipFacet

  /* ------------------------------------------- */

  const newOwner = ''
  const tx = await dZapDiamond.transferOwnership(newOwner)
  console.log(tx.hash)
  await tx.wait()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
