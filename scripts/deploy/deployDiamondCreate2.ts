import { ethers } from 'hardhat'
import { CREATE2_ADDRESS } from '../../config/create2'
import { DEPLOYMENT_CONFIG } from '../../config/deployment'
import { CONTRACTS } from '../../constants'
import { Create2Deployer } from '../../typechain-types'

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

  const create2Address = CREATE2_ADDRESS[chainId]
  const config = DEPLOYMENT_CONFIG['0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6']

  // -------------------------------

  const create2Deployer = (await ethers.getContractAt(
    CONTRACTS.Create2Deployer,
    create2Address
  )) as Create2Deployer

  // --------------------------------

  const DiamondCutFacet = await ethers.getContractFactory(
    CONTRACTS.DiamondCutFacet
  )
  const DZapDiamond = await ethers.getContractFactory(CONTRACTS.DZapDiamond)

  // --------------------------------

  const faceCutSalt = ethers.utils.id(config.faceCut.saltKey)
  const faceCutValue = config.faceCut.value

  const owner = deployer.address
  const diamondCutSalt = ethers.utils.id(config.diamond.saltKey)
  const diamondCutValue = config.diamond.value

  // -------------------------------

  const faceCutBytecode = DiamondCutFacet.getDeployTransaction().data as any
  const faceCutComputedAddress = await create2Deployer.computeAddress(
    faceCutSalt,
    ethers.utils.keccak256(faceCutBytecode)
  )

  // -------------------------------

  const diamondBytecode = DZapDiamond.getDeployTransaction(
    owner,
    faceCutComputedAddress
  ).data as any

  const diamondComputedAddress = await create2Deployer.computeAddress(
    diamondCutSalt,
    ethers.utils.keccak256(diamondBytecode)
  )

  // -------------------------------

  console.log({
    owner,
    faceCutComputedAddress,
    diamondComputedAddress,
  })

  if (
    faceCutComputedAddress != config.faceCut.address ||
    diamondComputedAddress != config.diamond.address
  )
    throw 'address not match'

  // -------------------------------

  // const faceCutGasEstimate = await create2Deployer.estimateGas.deploy(
  //   faceCutValue,
  //   faceCutSalt,
  //   faceCutBytecode
  // )

  // console.log({ faceCutGasEstimate: faceCutGasEstimate.toString() })

  console.log('Deploying DiamondCutFacet...')
  const faceCutTx = await create2Deployer.deploy(
    faceCutValue,
    faceCutSalt,
    faceCutBytecode
  )
  console.log('faceCutTx', faceCutTx.hash)
  await faceCutTx.wait()
  console.log('DiamondCutFacet deployed')

  // // -------------------------------

  console.log('Deploying DzapDiamond...')

  const diamondTx = await create2Deployer.deploy(
    diamondCutValue,
    diamondCutSalt,
    diamondBytecode
  )
  console.log('diamondTx', diamondTx.hash)
  await diamondTx.wait()
  console.log('DzapDiamond deployed')
}

if (require.main === module) {
  init()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
