import { ethers } from 'hardhat'
import { CONTRACTS } from '../constants'
import { CrossChainFacet } from '../typechain-types'
import { getSelectorsUsingFunSig } from './utils/diamond'
import { readFileSync } from 'fs'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'addBridgeSelector',
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  /* ------------------------------------------- */

  const data = JSON.parse(
    readFileSync(__dirname + '/../data/address/bridge.json', 'utf8')
  )

  const dataArr: any = Object.values(data[chainId])

  const bridgeSigDex: string[] = []
  const bridgeSelectors: string[] = []
  const bridgeInfo: any[] = []

  for (let i = 0; i < dataArr.length; i++) {
    const selectors = Object.keys(getSelectorsUsingFunSig(dataArr[i].functions))

    for (let j = 0; j < selectors.length; j++) {
      bridgeSelectors.push(selectors[j])
      bridgeSigDex.push(dataArr[i].address)
      bridgeInfo.push({ isAvailable: true, offset: 0 })
    }

    for (let j = 0; j < dataArr[i].sigArr.length; j++) {
      bridgeSelectors.push(dataArr[i].sigArr[j])
      bridgeSigDex.push(dataArr[i].address)
      bridgeInfo.push({ isAvailable: true, offset: 0 })
    }
  }

  /* ------------------------------------------- */

  const diamondAddress = ''

  const crossChainFacet = (await ethers.getContractAt(
    CONTRACTS.CrossChainFacet,
    diamondAddress
  )) as CrossChainFacet

  /* ------------------------------------------- */
  console.log('')
  console.log('Adding Bridges...')

  const tx3 = await crossChainFacet
    .connect(deployer)
    .updateSelectorInfo(bridgeSigDex, bridgeSelectors, bridgeInfo)
  console.log('updateSelectorInfo Tx', tx3.hash)
  const receipt2 = await tx3.wait()
  if (!receipt2.status) {
    throw Error(`Bridge Selector failed: ${tx3.hash}`)
  }
  console.log('Completed Adding Bridge Selectors')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
