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

  const diamondAddress = ''

  const Executor = await ethers.getContractFactory(CONTRACTS.Executor)
  const executor = await Executor.deploy(diamondAddress)
  await executor.deployed

  console.log('Executor deployed at', executor.address)

  /* ------------------------------------------- */
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
