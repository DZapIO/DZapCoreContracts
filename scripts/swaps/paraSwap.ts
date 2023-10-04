import { ethers } from 'hardhat'
import { parseUnits } from 'ethers/lib/utils'

import { getParaswapData } from '../core/paraswap'
import {
  approveToken,
  getFeeData,
  getRevertMsg,
  replaceFromAmount,
} from '../core/helper'
import { CONTRACTS, DZAP_NATIVE, NATIVE_ADDRESS } from '../../constants'
import { ParaswapParams } from '../../types'
import { SwapFacet } from '../../typechain-types'
import { BigNumber } from 'ethers'

const diamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'
// const diamondAddress = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7'

// const tokenAddress = {
//   wNativeAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
//   usdcAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
//   usdtAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
//   wEth: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
// }

// const tokenAddress = {
//   wNativeAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
//   usdcAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
//   usdtAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
//   wEth: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
// }

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  // const networkName: string = networks[chainId];
  const [signer] = await ethers.getSigners()

  console.log({
    name: 'paraswap',
    chainId,
    signer: signer.address,
    balance: ethers.utils.formatUnits(await signer.getBalance()),
  })

  /* ------------------------------------------- */

  const dZap = (await ethers.getContractAt(
    CONTRACTS.SwapFacet,
    diamondAddress
  )) as SwapFacet

  /* ------------------------------------------- */

  const integrator = '0x12480616436DD6D555f88B8d94bB5156E28825B1' // dzapProjectId
  const recipient = signer.address

  // const amounts = [parseUnits('0.5', 6), parseUnits('0.1')]
  // const gasPrice = parseUnits('150 ', 'gwei')
  // const amounts = [parseUnits('0.5', 6)]
  const amounts = [
    BigNumber.from('39013861800991814'),
    BigNumber.from('20826325731078662'),
    BigNumber.from('130540565322924743'),
  ]

  // const from = '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58'
  // const to = '0x7f5c764cbc14f9669b88837ca1490cca17c31607'

  /* ------------------------------------------- */

  // const approveAmount = parseUnits('100', 6)
  // await approveToken(signer, from, dZap.address, approveAmount)

  /* ------------------------------------------- */

  const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
    diamondAddress,
    integrator,
    amounts
  )

  /* ------------------------------------------- */

  const swapParams: ParaswapParams[] = [
    // {
    //   fromToken: from,
    //   toToken: to,
    //   fromAmount: amountWithoutFee[0],
    //   sender: dZap.address,
    //   receiver: dZap.address,
    // },
    // {
    //   fromToken: NATIVE_ADDRESS,
    //   toToken: tokenAddress.wEth,
    //   fromAmount: amountWithoutFee[1],
    //   sender: dZap.address,
    //   receiver: dZap.address,
    // },
    {
      fromToken: '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4',
      toToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      fromAmount: amountWithoutFee[0],
      sender: dZap.address,
      receiver: dZap.address,
    },
    {
      fromToken: '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7',
      toToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      fromAmount: amountWithoutFee[1],
      sender: dZap.address,
      receiver: dZap.address,
    },
    {
      fromToken: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      toToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      fromAmount: amountWithoutFee[2],
      sender: dZap.address,
      receiver: dZap.address,
    },
  ]

  const data = await getParaswapData(chainId, swapParams)
  const { swapData, value } = replaceFromAmount(
    data,
    amounts,
    fixedNativeFeeAmount
  )

  console.log(swapData, value)

  /* ------------------------------------------- */

  // // single
  // console.log('swap')
  // const transactionId = ethers.utils.formatBytes32String('dummyId')
  // const refundee = signer.address
  // console.log('transactionId', transactionId)

  // console.log('swap 0')
  // let err: any

  // try {
  //   await dZap
  //     .connect(signer)
  //     .estimateGas.swap(
  //       transactionId,
  //       integrator,
  //       refundee,
  //       recipient,
  //       swapData[0],
  //       {
  //         value,
  //       }
  //     )
  // } catch (error) {
  //   err = error
  //   try {
  //     await dZap
  //       .connect(signer)
  //       .swap(transactionId, integrator, refundee, recipient, swapData[0], {
  //         value,
  //       })
  //   } catch (error: any) {
  //     err = error
  //     try {
  //       if (error.data) {
  //         const decodedError = dZap.interface.parseError(error.data)
  //         if (decodedError.args.reason) {
  //           const revertMessage = getRevertMsg(decodedError.args.reason)
  //           throw revertMessage
  //         } else {
  //           throw decodedError
  //         }
  //       } else {
  //         throw error
  //       }
  //     } catch (error) {
  //       throw err
  //       // throw getRevertMsg(err.data)
  //     }
  //   }
  // }

  // console.log('swap 1')
  // try {
  //   await dZap
  //     .connect(signer)
  //     .estimateGas.swap(
  //       transactionId,
  //       integrator,
  //       refundee,
  //       recipient,
  //       swapData[1],
  //       {
  //         value,
  //       }
  //     )
  // } catch (error) {
  //   err = error
  //   try {
  //     await dZap
  //       .connect(signer)
  //       .swap(transactionId, integrator, refundee, recipient, swapData[1], {
  //         value,
  //       })
  //   } catch (error: any) {
  //     err = error
  //     try {
  //       if (error.data) {
  //         const decodedError = dZap.interface.parseError(error.data)
  //         if (decodedError.args.reason) {
  //           const revertMessage = getRevertMsg(decodedError.args.reason)
  //           throw revertMessage
  //         } else {
  //           throw decodedError
  //         }
  //       } else {
  //         throw error
  //       }
  //     } catch (error) {
  //       throw err
  //       // throw getRevertMsg(err.data)
  //     }
  //   }
  // }

  // console.log('multiswap')
  // const tx = await dZap
  //   .connect(signer)
  //   .multiSwap(transactionId, integrator, refundee, recipient, swapData, {
  //     value,
  //   })
  // console.log('tx', tx.hash)
  // await tx.wait()

  // try {
  //   await dZap
  //     .connect(signer)
  //     .estimateGas.multiSwap(
  //       transactionId,
  //       integrator,
  //       refundee,
  //       recipient,
  //       swapData,
  //       {
  //         value,
  //       }
  //     )
  // } catch (error) {
  //   err = error
  //   try {
  //     await dZap
  //       .connect(signer)
  //       .multiSwap(transactionId, integrator, refundee, recipient, swapData, {
  //         value,
  //       })
  //   } catch (error: any) {
  //     err = error
  //     try {
  //       if (error.data) {
  //         const decodedError = dZap.interface.parseError(error.data)
  //         if (decodedError.args.reason) {
  //           const revertMessage = getRevertMsg(decodedError.args.reason)
  //           throw revertMessage
  //         } else {
  //           throw decodedError
  //         }
  //       } else {
  //         throw error
  //       }
  //     } catch (error) {
  //       throw err
  //       // throw getRevertMsg(err.data)
  //     }
  //   }
  // }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
