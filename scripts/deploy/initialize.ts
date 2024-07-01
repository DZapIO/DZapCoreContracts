import { readFileSync } from 'fs'
import { ethers } from 'hardhat'
import { BPS_MULTIPLIER, CONTRACTS } from '../../constants'
import { deployToAddFacets, upgradeDiamond } from '../utils/diamond'
import path from 'path'
import { PERMIT2_ADDRESS } from '../../config/permit2'
import { DZAP_FEE_CONFIG } from '../../config/feeConfig'
import { DZAP_ADDRESS } from '../../config/deployment'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'initialize',
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  /* ------------------------------------------- */

  const dZapFeeConfig = DZAP_FEE_CONFIG[chainId]
  const permit2 = PERMIT2_ADDRESS[chainId]

  /* ------------------------------------------- */

  const dZapDiamondAddress = DZAP_ADDRESS[chainId]

  const dZapDiamond = await ethers.getContractAt(
    CONTRACTS.DZapDiamond,
    dZapDiamondAddress
  )

  /* ------------------------------------------- */

  console.log('')
  console.log('Deploying DiamondInit...')
  const DiamondInit = await ethers.getContractFactory(CONTRACTS.DiamondInit)
  const diamondInit = await DiamondInit.deploy()
  await diamondInit.deployed()
  console.log('DiamondInit deployed:', diamondInit.address)

  /* ------------------------------------------- */

  const protocolFeeVaultAddress = dZapFeeConfig.protocolFeeVault
  const MAX_FIXED_FEE = ethers.utils.parseUnits(
    dZapFeeConfig.maxFixedFeeAmount,
    dZapFeeConfig.nativeDecimal
  )
  const initArgs = {
    permit2,
    protocolFeeVault: protocolFeeVaultAddress,
    maxTokenFee: dZapFeeConfig.maxTokenFeePercent * BPS_MULTIPLIER,
    maxFixedNativeFeeAmount: MAX_FIXED_FEE,
  }

  /* ------------------------------------------- */

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

  const { cutData } = await deployToAddFacets(facetNames)

  /* ------------------------------------------- */
  // upgrade diamond with facets

  const initData = {
    address: diamondInit.address,
    data: (
      await diamondInit.populateTransaction.initialize(
        ...Object.values(initArgs)
      )
    ).data as string,
  }

  await upgradeDiamond(deployer, cutData, dZapDiamond, initData)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
