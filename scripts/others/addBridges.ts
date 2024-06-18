import { readFileSync, writeFileSync } from 'fs'
import { ethers } from 'hardhat'
import path from 'path'
import { CONTRACTS, BRIDGES } from '../../constants'
import { BridgeManagerFacet } from '../../typechain-types'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'addBridges',
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  /* ------------------------------------------- */

  const bridgeRegistry = JSON.parse(
    readFileSync(
      path.join(__dirname + '../../../registry/bridges.json'),
      'utf8'
    )
  )

  const bridgeNames: string[] = []
  const bridgeAddress: string[] = []

  /* ------------------------------------------- */

  const dZapDiamondAddress = ''

  const dZapDiamond = await ethers.getContractAt(
    CONTRACTS.DZapDiamond,
    dZapDiamondAddress
  )

  const bridgeManagerFacet = (await ethers.getContractAt(
    CONTRACTS.BridgeManagerFacet,
    dZapDiamond.address
  )) as BridgeManagerFacet

  /* ------------------------------------------- */

  if (bridgeNames.length == 0) {
    for (const key in bridgeRegistry[chainId]) {
      if (bridgeRegistry[chainId].hasOwnProperty(key)) {
        bridgeNames.push(key)
      }
    }
  }

  for (let i = 0; i < bridgeNames.length; i++) {
    const bridge = bridgeRegistry[chainId][bridgeNames[i]].address
    for (let j = 0; j < bridge.length; j++) {
      const isWhitelisted = await bridgeManagerFacet.isWhitelisted(bridge[j])
      console.log(bridgeNames[i], bridge[j], isWhitelisted)
      if (!isWhitelisted) {
        bridgeAddress.push(bridge[j])
      }
    }
  }

  if (bridgeAddress.length == 0) throw Error('Address array length is 0')

  /* ------------------------------------------- */

  console.log('')
  console.log('Adding Bridges...')
  const tx = await bridgeManagerFacet.addAggregatorsAndBridges(bridgeAddress)

  console.log('Adding Bridge Tx', tx.hash)
  const receipt1 = await tx.wait()
  if (!receipt1.status) {
    throw Error(`Adding Bridge failed: ${tx.hash}`)
  }
  console.log('Completed Adding Bridge')

  /* ------------------------------------------- */

  const historyPath = path.join(__dirname + '../../../registry/history.json')
  const historyData = JSON.parse(readFileSync(historyPath, 'utf8'))

  if (!historyData[chainId]) {
    historyData[chainId] = {}
  }
  if (!historyData[chainId]['bridge']) {
    historyData[chainId]['bridge'] = {}
  }

  for (let i = 0; i < bridgeNames.length; i++) {
    const bridgeName = bridgeNames[i]

    if (!historyData[chainId]['bridge'][bridgeName]) {
      historyData[chainId]['bridge'][bridgeName] = []
    }

    const uniqueDexAddress = new Set([
      ...historyData[chainId]['bridge'][bridgeName],
      ...bridgeRegistry[chainId][bridgeName].address,
    ])

    historyData[chainId]['bridge'][bridgeName] = Array.from(uniqueDexAddress)
  }

  // console.log('historyData', historyData)

  writeFileSync(historyPath, JSON.stringify(historyData, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
