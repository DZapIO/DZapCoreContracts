import { readFileSync, writeFileSync } from 'fs'
import { ethers } from 'hardhat'
import path from 'path'
import { CONTRACTS, SWAP_DEXES } from '../../constants'
import { DexManagerFacet } from '../../typechain-types'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'addSwapDexes',
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  /* ------------------------------------------- */

  const swapsRegistry = JSON.parse(
    readFileSync(path.join(__dirname + '../../../registry/dexes.json'), 'utf8')
  )

  let dexesNames: string[] = []
  const dexAddress: string[] = []

  /* ------------------------------------------- */

  const dZapDiamondAddress = ''

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
    dexesNames = Object.keys(swapsRegistry[chainId])
  }

  for (let i = 0; i < dexesNames.length; i++) {
    const dex = swapsRegistry[chainId][dexesNames[i]]
    for (let j = 0; j < dex.length; j++) {
      const isApproved = await dexManagerFacet.isContractApproved(dex[j])
      console.log(dexesNames[i], dex[j], isApproved)
      if (!isApproved) {
        dexAddress.push(dex[j])
      }
    }
  }

  if (dexAddress.length == 0) throw Error('Dex array length is 0')
  console.log(dexAddress)

  /* ------------------------------------------- */

  console.log('')
  console.log('Adding Dex...')
  await dexManagerFacet.estimateGas.batchAddDex(dexAddress)
  const tx =
    dexAddress.length == 1
      ? await dexManagerFacet.addDex(dexAddress[0])
      : await dexManagerFacet.batchAddDex(dexAddress)

  console.log('Adding dex Tx', tx.hash)
  const receipt1 = await tx.wait()
  if (!receipt1.status) {
    throw Error(`Adding Dex failed: ${tx.hash}`)
  }
  console.log('Completed Adding Dex')

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

    if (!historyData[chainId]['dexes'][dexName]) {
      historyData[chainId]['dexes'][dexName] = []
    }

    const uniqueDexAddress = new Set([
      ...historyData[chainId]['dexes'][dexName],
      ...swapsRegistry[chainId][dexName],
    ])

    historyData[chainId]['dexes'][dexName] = Array.from(uniqueDexAddress)
  }

  // console.log('historyData', historyData)

  writeFileSync(historyPath, JSON.stringify(historyData, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
