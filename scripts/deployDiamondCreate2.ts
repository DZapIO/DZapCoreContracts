import { readFileSync } from 'fs'
import { ethers } from 'hardhat'
import { CONTRACTS } from '../constants'
import { Create2Deployer } from '../typechain-types'
import { parseUnits } from 'ethers/lib/utils'

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

  const create2Address = JSON.parse(
    readFileSync(__dirname + '/../data/address/create2.json', 'utf8')
  )

  const addr = {
    faceCutComputedAddress: '0x3E9fd8DCfD992a5a254C5E43D2e8a7b60BfDA8D8',
    diamondComputedAddress: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  }

  // -------------------------------

  const create2Deployer = (await ethers.getContractAt(
    CONTRACTS.Create2Deployer,
    create2Address[chainId]
  )) as Create2Deployer

  const DiamondCutFacet = await ethers.getContractFactory(
    CONTRACTS.DiamondCutFacet
  )
  const DZapDiamond = await ethers.getContractFactory(CONTRACTS.DZapDiamond)

  const faceCutBytecode = DiamondCutFacet.getDeployTransaction().data as any
  const faceCutSalt = ethers.utils.id('DzapDiamondCut')
  const faceCutValue = 0

  const faceCutComputedAddress = await create2Deployer.computeAddress(
    faceCutSalt,
    ethers.utils.keccak256(faceCutBytecode)
  )

  // -------------------------------

  const owner = deployer.address
  const diamondBytecode = DZapDiamond.getDeployTransaction(
    owner,
    faceCutComputedAddress
  ).data as any
  const diamondCutSalt = ethers.utils.id('DzapDiamond')
  const diamondComputedAddress = await create2Deployer.computeAddress(
    diamondCutSalt,
    ethers.utils.keccak256(diamondBytecode)
  )
  const diaondCutValue = 0

  console.log({
    faceCutComputedAddress,
    diamondComputedAddress,
  })

  if (
    faceCutComputedAddress != addr.faceCutComputedAddress ||
    addr.diamondComputedAddress != diamondComputedAddress
  )
    throw 'address not match'

  // -------------------------------

  const faceCutTx = await create2Deployer.deploy(
    faceCutValue,
    faceCutSalt,
    faceCutBytecode
  )
  console.log(faceCutTx.hash)
  await faceCutTx.wait()

  const diamondTx = await create2Deployer.deploy(
    diaondCutValue,
    diamondCutSalt,
    diamondBytecode
  )
  console.log(diamondTx.hash)
  await diamondTx.wait()
}

if (require.main === module) {
  init()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
