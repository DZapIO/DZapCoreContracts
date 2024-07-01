import { ethers } from 'hardhat'
import { FacetCutAction } from 'hardhat-deploy/dist/types'
import { DZAP_ADDRESS } from '../../config/deployment'
import { ADDRESS_ZERO, CONTRACTS } from '../../constants'
import {
  deployToAddFacets,
  getSelector,
  upgradeDiamond,
} from '../utils/diamond'

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

  const dZapDiamondAddress = DZAP_ADDRESS[chainId]

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

  const { cutData: cutDataNew } = await deployToAddFacets([CONTRACTS.SwapFacet])

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
