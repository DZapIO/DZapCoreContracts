import { readFileSync } from 'fs'
import { ethers } from 'hardhat'
import { CONTRACTS } from '../constants'
import { Create2Deployer } from '../typechain-types'

async function init() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  // -------------------------------

  console.log('')
  console.log('Deploying diamondCutFacet...')
  const DiamondCutFacet = await ethers.getContractFactory(
    CONTRACTS.DiamondCutFacet,
    deployer
  )
  const diamondCutFacet = await DiamondCutFacet.deploy()
  await diamondCutFacet.deployed()
  console.log('DiamondCutFacet deployed:', diamondCutFacet.address)

  // -------------------------------

  const owner = deployer.address
  console.log('')
  console.log('Deploying dZapDiamond...')
  const Diamond = await ethers.getContractFactory('DZapDiamond', deployer)
  const dZapDiamond = await Diamond.deploy(owner, diamondCutFacet.address)
  await dZapDiamond.deployed()
  console.log('DZapDiamond deployed:', dZapDiamond.address)

  // -------------------------------
}

if (require.main === module) {
  init()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
