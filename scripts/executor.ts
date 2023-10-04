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

  const diamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'

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
