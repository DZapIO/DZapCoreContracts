import { ethers } from 'hardhat'
import { CONTRACTS, ZERO } from '../constants'
import { DexManagerFacet, FeesFacet, SwapFacet } from '../typechain-types'

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

  const diamondAddress = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7'

  const swapFacet = (await ethers.getContractAt(
    CONTRACTS.SwapFacet,
    diamondAddress
  )) as SwapFacet
  const feesFacet = (await ethers.getContractAt(
    CONTRACTS.FeesFacet,
    diamondAddress
  )) as FeesFacet
  const dexManagerFacet = (await ethers.getContractAt(
    CONTRACTS.DexManagerFacet,
    diamondAddress
  )) as DexManagerFacet

  /* ------------------------------------------- */

  const exchange = '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57'
  const selector = '0x54e3f31b'
  const integrator = '0x12480616436dd6d555f88b8d94bb5156e28825b1'

  console.log(
    'isContractApproved',
    await dexManagerFacet.isContractApproved(exchange)
  )

  console.log(
    'isFunctionApproved',
    await dexManagerFacet.isFunctionApproved(exchange, selector)
  )

  console.log(
    'isIntegratorAllowed',
    await feesFacet.isIntegratorAllowed(integrator)
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
