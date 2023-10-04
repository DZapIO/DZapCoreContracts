import { ethers } from 'hardhat'
import { CONTRACTS, ZERO } from '../constants'
import { DexManagerFacet, FeesFacet, SwapFacet } from '../typechain-types'
import { getSelectorsUsingFunSig } from './utils/diamond'
import { getRevertMsg } from './core/helper'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'addDex',
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  /* ------------------------------------------- */

  const diamondAddress = ''
  // const diamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'
  // const diamondAddress = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7'

  const swapFacet = (await ethers.getContractAt(
    CONTRACTS.SwapFacet,
    diamondAddress
  )) as SwapFacet

  /* ------------------------------------------- */

  // const data = ''

  // const OneInchRouter = await ethers.getContractFactory('AggregationRouterV5')
  // const decodedError = OneInchRouter.interface.parseError(data)
  // console.log('decodedError', decodedError)

  /* ------------------------------------------- */

  // const decodedData = ''

  // const decodedData = swapFacet.interface.decodeFunctionData(
  //   'multiSwap',
  //   data
  // )
  //   console.log(await getRevertMsg(decodedData))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
