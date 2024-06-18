import { ethers } from 'hardhat'
import { CONTRACTS } from '../../constants'
import {
  AccessManagerFacet,
  BridgeManagerFacet,
  DexManagerFacet,
  FeesFacet,
} from '../../typechain-types'
import { getSighash } from '../utils/diamond'
import path from 'path'
import { readFileSync, writeFileSync } from 'fs'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'access',
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

  const accessManagerFacet = (await ethers.getContractAt(
    CONTRACTS.AccessManagerFacet,
    dZapDiamond.address
  )) as AccessManagerFacet

  const dexManagerFacet = (await ethers.getContractAt(
    CONTRACTS.DexManagerFacet,
    dZapDiamond.address
  )) as DexManagerFacet

  const bridgeManagerFacet = (await ethers.getContractAt(
    CONTRACTS.BridgeManagerFacet,
    dZapDiamond.address
  )) as BridgeManagerFacet
  const feesFacet = (await ethers.getContractAt(
    CONTRACTS.FeesFacet,
    dZapDiamond.address
  )) as FeesFacet

  /* ------------------------------------------- */

  const executor = ['0x13CDD11d7C5Cc00769f8bFd2Ca102408D00AD453']

  const dexSelector = getSighash(
    [
      dexManagerFacet.interface.functions['addDex(address)'],
      dexManagerFacet.interface.functions['batchAddDex(address[])'],
    ],
    dexManagerFacet.interface
  )

  const bridgeSelector = getSighash(
    [
      bridgeManagerFacet.interface.functions[
        'addAggregatorsAndBridges(address[])'
      ],
      bridgeManagerFacet.interface.functions[
        'updateSelectorInfo(address[],bytes4[],uint256[])'
      ],
    ],
    bridgeManagerFacet.interface
  )

  const feeSelector = getSighash(
    [
      feesFacet.interface.functions['setProtocolFeeVault(address)'],
      feesFacet.interface.functions[
        'setIntegratorInfo(address,uint8[],(uint256,uint256,uint256,uint256)[])'
      ],
      feesFacet.interface.functions['removeIntegrator(address)'],
    ],
    feesFacet.interface
  )

  const tempSelectors = [...dexSelector, ...bridgeSelector, ...feeSelector]
  const selectors = Array(executor.length).fill(tempSelectors).flat()
  const executorArr = executor.flatMap((item) =>
    Array(tempSelectors.length).fill(item)
  )
  const canExecute = selectors.map(() => true)

  /* ------------------------------------------- */

  const tx =
    selectors.length == 1
      ? await accessManagerFacet.setCanExecute(
          selectors[0],
          executor[0],
          canExecute[0]
        )
      : await accessManagerFacet.setBatchCanExecute(
          selectors,
          executorArr,
          canExecute
        )

  console.log('Adding Executor Tx', tx.hash)
  const receipt1 = await tx.wait()
  if (!receipt1.status) {
    throw Error(`Adding Executor failed: ${tx.hash}`)
  }
  console.log('Completed Adding Executor')

  /* ------------------------------------------- */

  const historyPath = path.join(__dirname + '../../../registry/history.json')
  const historyData = JSON.parse(readFileSync(historyPath, 'utf8'))

  if (!historyData[chainId]) {
    historyData[chainId] = {}
  }
  if (!historyData[chainId]['executors']) {
    historyData[chainId]['executors'] = {}
  }

  for (let i = 0; i < executor.length; i++) {
    const executorAdd = executor[i]

    if (!historyData[chainId]['executors'][executorAdd]) {
      historyData[chainId]['executors'][executorAdd] = []
    }

    const uniqueSelectors = new Set([
      ...historyData[chainId]['executors'][executorAdd],
      ...tempSelectors,
    ])

    historyData[chainId]['executors'][executorAdd] = Array.from(uniqueSelectors)
  }

  // console.log('historyData', historyData)

  writeFileSync(historyPath, JSON.stringify(historyData, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
