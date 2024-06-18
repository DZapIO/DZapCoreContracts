import { ethers } from 'hardhat'
import {
  deployFacetsToReplace,
  deployToAddFacets,
  getSelector,
  getSelectorsUsingContract,
  upgradeDiamond,
} from '../utils/diamond'
import { ADDRESS_ZERO, CONTRACTS } from '../../constants'
import { FacetCutAction } from 'hardhat-deploy/dist/types'

const oldAbi = []

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'update',
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  /* ------------------------------------------- */

  const dZapDiamondAddress = ''

  const dZapDiamond = await ethers.getContractAt(
    CONTRACTS.DZapDiamond,
    dZapDiamondAddress
  )

  const initData = {
    address: ethers.constants.AddressZero,
    data: '0x',
  }

  /* ------------------------------------------- */
  // replace facets
  console.log('')
  // console.log('Replacing Facets...')
  // const { cutData } = await deployFacetsToReplace([CONTRACTS.SwapFacet])

  /* ------------------------------------------- */

  const { cutData: cutDataNew } = await deployToAddFacets([
    CONTRACTS.SwapFacet,
    CONTRACTS.BridgeDynamicTransferFacet,
    CONTRACTS.CrossChainFacet,
    CONTRACTS.BatchBridgeCallFacet,
    CONTRACTS.BridgeManagerFacet,
  ])

  const cutData = [
    {
      facetAddress: ADDRESS_ZERO,
      action: FacetCutAction.Remove,
      functionSelectors: oldAbi.map((fun) => getSelector(fun)),
    },
    ...cutDataNew,
  ]

  /* ------------------------------------------- */

  console.log(cutData)

  await upgradeDiamond(deployer, cutData, dZapDiamond, initData)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
