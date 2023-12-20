import { readFileSync } from 'fs'
import { ethers } from 'hardhat'
import { CONTRACTS } from '../constants'
import { Create2Deployer } from '../typechain-types'

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

  const create2Address = JSON.parse(
    readFileSync(__dirname + '/../data/address/create2.json', 'utf8')
  )

  /* ------------------------------------------- */

  const diamondAddress = ''
  const executorAddress = ''

  const create2Deployer = (await ethers.getContractAt(
    CONTRACTS.Create2Deployer,
    create2Address[chainId]
  )) as Create2Deployer

  /* ------------------------------------------- */

  const Executor = await ethers.getContractFactory(CONTRACTS.Executor)
  const bytecode = (await Executor.getDeployTransaction(diamondAddress)
    .data) as any
  const salt = ethers.utils.id('DzapExecutor')

  const value = 0

  const computedAddress = await create2Deployer.computeAddress(
    salt,
    ethers.utils.keccak256(bytecode)
  )

  console.log('Computed Address', computedAddress)

  if (executorAddress && executorAddress != computedAddress)
    throw 'address not match'

  /* ------------------------------------------- */

  const tx = await create2Deployer.deploy(value, salt, bytecode)
  console.log(tx.hash)
  await tx.wait()

  /* ------------------------------------------- */
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
