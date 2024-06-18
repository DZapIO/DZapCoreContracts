import { readFileSync } from 'fs'
import { ethers } from 'hardhat'
import { BPS_MULTIPLIER, CONTRACTS } from '../../constants'
import { deployToAddFacets, upgradeDiamond } from '../utils/diamond'
import path from 'path'

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

  const dZapConfig = JSON.parse(
    readFileSync(
      path.join(__dirname + '../../../registry/dZapConfig.json'),
      'utf8'
    )
  )

  const permit2 = JSON.parse(
    readFileSync(
      path.join(__dirname + '../../../registry/permit2.json'),
      'utf8'
    )
  )

  /* ------------------------------------------- */

  const dZapDiamondAddress = ''

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

  const config = dZapConfig[chainId]

  const protocolFeeVaultAddress = config.protocolFeeVault
  const MAX_FIXED_FEE = ethers.utils.parseUnits(
    config.maxFixedFeeAmount,
    config.nativeDecimal
  )
  const initArgs = {
    permit2: permit2[chainId],
    protocolFeeVault: protocolFeeVaultAddress,
    maxTokenFee: config.maxTokenFeePercent * BPS_MULTIPLIER,
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
