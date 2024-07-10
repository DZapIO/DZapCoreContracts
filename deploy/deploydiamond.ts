import { Deployer } from '@matterlabs/hardhat-zksync-deploy'
import * as ethers from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { CONTRACTS } from '../constants'
import getWallet from './utils/getWallet'
import verify from './utils/verify'

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = await getWallet(hre)
  const deployer = new Deployer(hre, wallet)

  const deployerAddress = wallet.address
  const owner = deployerAddress

  console.log({
    deployer: deployerAddress,
    balance: ethers.utils.formatUnits(
      await hre.ethers.provider.getBalance(deployerAddress)
    ),
  })

  // -------------------------------

  const faceCutArtifact = await deployer.loadArtifact(CONTRACTS.DiamondCutFacet)
  const diamondArtifact = await deployer.loadArtifact(CONTRACTS.DZapDiamond)

  // -------------------------------
  const faceCutDeploymentFee = await deployer.estimateDeployFee(
    faceCutArtifact,
    []
  )

  console.log(
    `The deployment is estimated to cost ${ethers.utils.formatEther(
      faceCutDeploymentFee
    )} ETH`
  )

  // -------------------------------

  const faceCutContract = await deployer.deploy(faceCutArtifact, [])

  // -------------------------------

  console.log({
    faceCutContract: faceCutContract.address,
  })

  // -------------------------------

  const args = [owner, faceCutContract.address]

  const diamondDeploymentFee = await deployer.estimateDeployFee(
    diamondArtifact,
    args
  )

  console.log(
    `The deployment is estimated to cost ${ethers.utils.formatEther(
      diamondDeploymentFee
    )} ETH`
  )

  // -------------------------------

  const diamondContract = await deployer.deploy(diamondArtifact, args)

  console.log({
    dzapDiamond: diamondContract.address,
    args,
  })

  // -------------------------------

  const verificationId = await verify({
    hre,
    contractAddress: diamondContract.address,
    contractConstructorArguments: args,
    artifact: diamondArtifact,
  })

  console.log({ verificationId })
}
