import { Deployer } from '@matterlabs/hardhat-zksync-deploy'
import * as ethers from 'ethers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { inspect } from 'util'
import { CONTRACTS } from '../constants'
import { getSelectorsUsingContract } from '../scripts/utils/diamond'
import { DiamondCut, FacetCutAction } from '../types'
import getWallet from './utils/getWallet'

export default async function (hre: HardhatRuntimeEnvironment) {
  const wallet = await getWallet(hre)
  const deployer = new Deployer(hre, wallet)

  const deployerAddress = wallet.address
  const chainId = hre.ethers.provider.network.chainId

  console.log({
    chainId,
    deployer: deployerAddress,
    balance: ethers.utils.formatUnits(
      await hre.ethers.provider.getBalance(deployerAddress)
    ),
  })

  // -------------------------------

  console.log('')
  console.log('Deploying DiamondInit...')

  const DiamondInitArtifact = await deployer.loadArtifact(CONTRACTS.DiamondInit)
  const diamondInit = await deployer.deploy(DiamondInitArtifact)

  console.log(`Contract DiamondInit was deployed to ${diamondInit.address}`)

  // -------------------------------

  const facetNames = [
    CONTRACTS.DiamondLoupeFacet,
    CONTRACTS.OwnershipFacet,
    CONTRACTS.AccessManagerFacet,
    CONTRACTS.DexManagerFacet,
    CONTRACTS.FeesFacet,
    CONTRACTS.WithdrawFacet,
    CONTRACTS.SwapFacet,
    CONTRACTS.BridgeManagerFacet,
    CONTRACTS.CrossChainFacet,
    CONTRACTS.BridgeDynamicTransferFacet,
    CONTRACTS.BatchBridgeCallFacet,
  ]

  const { cutData } = await deployToAddFacets(deployer, facetNames)

  console.log('cutData', inspect(cutData, false, null, true))

  // -------------------------------
}

async function deployToAddFacets(deployer: Deployer, facetNames) {
  console.log('')
  console.log('Deploying facets...')

  const cutData: DiamondCut[] = []

  for (let i = 0; i < facetNames.length; i++) {
    console.log('')
    console.log(`Deploying ${facetNames[i]}...`)

    const artifact = await deployer.loadArtifact(facetNames[i])
    const contract = await deployer.deploy(artifact)
    console.log(`${facetNames[i]} deployed: ${contract.address}`)

    const tempCutData = {
      facetAddress: contract.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(contract, facetNames[i])
        .selectors,
    }

    cutData.push(tempCutData)
    console.log(facetNames[i], tempCutData)
  }

  return {
    cutData,
  }
}
