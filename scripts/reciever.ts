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
  const executor = '0xA43f6E1282Bc46AD18732E2d76B846C169682725'
  const recoverGas = ZERO

  const Receiver = await ethers.getContractFactory(CONTRACTS.Receiver)
  const receiver = await Receiver.deploy(owner, executor, recoverGas)
  await receiver.deployed

  console.log('Receiver deployed at', receiver.address)

  /* ------------------------------------------- */
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
