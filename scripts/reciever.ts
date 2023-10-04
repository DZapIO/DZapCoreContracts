import { ethers } from 'hardhat'
import { CONTRACTS, ZERO } from '../constants'

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

  const owner = deployer.address
  const executor = ''

  const Receiver = await ethers.getContractFactory(CONTRACTS.Receiver)
  const receiver = await Receiver.deploy(owner, executor)
  await receiver.deployed

  console.log('Receiver deployed at', receiver.address)

  /* ------------------------------------------- */
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
