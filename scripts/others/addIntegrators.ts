import { parseUnits } from 'ethers/lib/utils'
import { readFileSync, writeFileSync } from 'fs'
import { ethers } from 'hardhat'
import path from 'path'
import { DZAP_ADDRESS } from '../../config/deployment'
import { DZAP_FEE_CONFIG } from '../../config/feeConfig'
import { INTEGRATOR_CONFIG } from '../../config/integrators'
import { BPS_MULTIPLIER, CONTRACTS, ZERO } from '../../constants'
import { FeeInfo, FeeType } from '../../types'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'addIntegrators',
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  /* ------------------------------------------- */

  const integrators = INTEGRATOR_CONFIG[chainId]
  let integratorsNames: string[] = []
  const dZapFeeConfig = DZAP_FEE_CONFIG[chainId]
  const dZapDiamondAddress = DZAP_ADDRESS[chainId]

  /* ------------------------------------------- */

  const dZapDiamond = await ethers.getContractAt(
    CONTRACTS.DZapDiamond,
    dZapDiamondAddress
  )

  const feesFacet = await ethers.getContractAt(
    CONTRACTS.FeesFacet,
    dZapDiamond.address
  )

  /* ------------------------------------------- */

  if (integratorsNames.length == 0) {
    integratorsNames = Object.keys(integrators)
  }

  const info = integratorsNames.map((name) => {
    const integratorInfo = integrators[name]
    const feeTypes: FeeType[] = []
    const feeInfo: FeeInfo[] = []

    for (let i = 0; i < integratorInfo.fee.length; i++) {
      const fee = integratorInfo.fee[i]
      feeTypes.push(fee.type == FeeType.BRIDGE ? FeeType.BRIDGE : FeeType.SWAP)
      feeInfo.push({
        tokenFee: fee.tokenFee * BPS_MULTIPLIER,
        fixedNativeFeeAmount:
          fee.fixedNativeFeeAmount == 0
            ? ZERO
            : parseUnits(fee.fixedNativeFeeAmount, dZapFeeConfig.nativeDecimal),
        dzapTokenShare: fee.dzapTokenShare * BPS_MULTIPLIER,
        dzapFixedNativeShare: fee.dzapFixedNativeShare * BPS_MULTIPLIER,
      })
    }

    return {
      name,
      address: integratorInfo.address,
      feeTypes,
      feeInfo,
    }
  })

  /* ------------------------------------------- */

  for (let i = 0; i < info.length; i++) {
    const integratorInfo = info[i]
    const isIntegratorAllowed = await feesFacet.isIntegratorAllowed(
      integratorInfo.address
    )
    console.log({ [integratorInfo.name]: isIntegratorAllowed })

    if (!isIntegratorAllowed) {
      console.log('')
      console.log(`Setting Fee for ${integratorInfo.name}...`)

      const tx = await feesFacet
        .connect(deployer)
        .setIntegratorInfo(
          integratorInfo.address,
          integratorInfo.feeTypes,
          integratorInfo.feeInfo
        )

      console.log('tx:', tx.hash)

      const receipt = await tx.wait()
      if (!receipt.status) {
        throw Error(`Setting Fee failed: ${tx.hash}`)
      }
      console.log(`Completed Setting Fee for ${integratorInfo.name}`)
    }
  }

  /* ------------------------------------------- */

  const historyPath = path.join(__dirname + '../../../registry/history.json')
  const historyData = JSON.parse(readFileSync(historyPath, 'utf8'))

  if (!historyData[chainId]) {
    historyData[chainId] = {}
  }
  if (!historyData[chainId]['integrators']) {
    historyData[chainId]['integrators'] = []
  }

  const uniqueIntegrators = new Set([
    ...historyData[chainId]['integrators'],
    ...integratorsNames,
  ])

  historyData[chainId]['integrators'] = Array.from(uniqueIntegrators)

  // console.log('historyData', historyData)

  writeFileSync(historyPath, JSON.stringify(historyData, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
