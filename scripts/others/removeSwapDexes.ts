import { readFileSync, writeFileSync } from 'fs'
import { ethers } from 'hardhat'
import path from 'path'
import { DEXES, DZAP_PROTOCOL_CONFIG } from '../../config/protocols'
import { CONTRACTS } from '../../constants'
import { DexManagerFacet } from '../../typechain-types'
import { DZAP_ADDRESS } from '../../config/deployment'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'removeSwapDexes',
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  /* ------------------------------------------- */

  const { dexes } = DZAP_PROTOCOL_CONFIG[chainId]
  let dexesNames: string[] = [DEXES.router]
  const dexAddress: string[] = []
  const dZapDiamondAddress = DZAP_ADDRESS[chainId]

  /* ------------------------------------------- */

  const dZapDiamond = await ethers.getContractAt(
    CONTRACTS.DZapDiamond,
    dZapDiamondAddress
  )

  const dexManagerFacet = (await ethers.getContractAt(
    CONTRACTS.DexManagerFacet,
    dZapDiamond.address
  )) as DexManagerFacet

  /* ------------------------------------------- */

  if (dexesNames.length == 0) {
    dexesNames = Object.keys(dexes)
  }

  for (let i = 0; i < dexesNames.length; i++) {
    const dex = dexes[dexesNames[i]]
    for (let j = 0; j < dex.length; j++) {
      const isApproved = await dexManagerFacet.isContractApproved(dex[j])
      console.log(dexesNames[i], dex[j], isApproved)
      if (isApproved) {
        dexAddress.push(dex[j])
      }
    }
  }

  console.log({ dexAddress })
  if (dexAddress.length == 0) throw Error('Dex array length is 0')

  /* ------------------------------------------- */

  console.log('')
  console.log('Removing Dex...')
  await dexManagerFacet.estimateGas.batchRemoveDex(dexAddress)
  const tx =
    dexAddress.length == 1
      ? await dexManagerFacet.removeDex(dexAddress[0])
      : await dexManagerFacet.batchRemoveDex(dexAddress)

  console.log('Removing dex Tx', tx.hash)
  const receipt1 = await tx.wait()
  if (!receipt1.status) {
    throw Error(`Removing Dex failed: ${tx.hash}`)
  }
  console.log('Completed Removing Dex')

  /* ------------------------------------------- */

  const historyPath = path.join(__dirname + '../../../registry/history.json')
  const historyData = JSON.parse(readFileSync(historyPath, 'utf8'))

  if (!historyData[chainId]) {
    historyData[chainId] = {}
  }
  if (!historyData[chainId]['dexes']) {
    historyData[chainId]['dexes'] = {}
  }

  for (let i = 0; i < dexesNames.length; i++) {
    const dexName = dexesNames[i]
    let dexHistory = historyData[chainId]['dexes'][dexName]

    if (dexHistory) {
      dexHistory = dexHistory.filter((item) => !dexAddress.includes(item))
    }

    if (dexHistory.length > 0)
      historyData[chainId]['dexes'][dexName] = dexHistory
    else delete historyData[chainId]['dexes'][dexName]
  }

  // console.log('historyData', historyData)

  writeFileSync(historyPath, JSON.stringify(historyData, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
