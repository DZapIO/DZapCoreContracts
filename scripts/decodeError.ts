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

  const diamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'
  //   const diamondAddress = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7'

  const swapFacet = (await ethers.getContractAt(
    CONTRACTS.SwapFacet,
    diamondAddress
  )) as SwapFacet

  /* ------------------------------------------- */

  const data = '0xf32bec2f'

  const OneInchRouter = await ethers.getContractFactory('AggregationRouterV5')
  const decodedError = OneInchRouter.interface.parseError(data)
  console.log('decodedError', decodedError)

  /* ------------------------------------------- */

  //   const decodedData =
  //     '0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001b52657475726e20616d6f756e74206973206e6f7420656e6f7567680000000000'

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
