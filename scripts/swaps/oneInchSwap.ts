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
import { OneInchSwapParams, ParaswapParams } from '../../types'
import { SwapFacet } from '../../typechain-types'
import { getInchSwapData } from '../core/oneInch'
import { BigNumber } from 'ethers'

// const diamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'
const diamondAddress = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7'

// const tokenAddress = {
//   wNativeAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
//   usdcAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
//   usdtAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
//   wEth: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
// }

// const tokenAddress = {
//   wNativeAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
//   wbtc: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
//   usdcAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
//   usdtAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
//   dai: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
//   arb: '0x912ce59144191c1204e64559fe8253a0e49e6548',
// }

const tokenAddress = {
  usdtAddress: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
}

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  // const networkName: string = networks[chainId];
  const [signer] = await ethers.getSigners()

  console.log({
    name: 'oneinch',
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

  // const gasPrice = parseUnits('150 ', 'gwei')

  /* ------------------------------------------- */

  // await approveToken(
  //   signer,
  //   tokenAddress.usdcAddress,
  //   dZap.address,
  //   approveAmount
  // )

  /* ------------------------------------------- */

  // const amounts = [parseUnits('0.5', 6), parseUnits('0.5', 6)]
  // const amounts = [parseUnits('0.001'), parseUnits('0.001')]
  const amounts = [
    BigNumber.from('50000000000000'),
    BigNumber.from('50000000000000'),
  ]

  const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
    diamondAddress,
    integrator,
    amounts
  )

  /* ------------------------------------------- */

  const swapParams: OneInchSwapParams[] = [
    {
      fromTokenAddress: NATIVE_ADDRESS,
      toTokenAddress: '0x68f180fcce6836688e9084f035309e29bf0a2095',
      amount: amountWithoutFee[0],
      fromAddress: dZap.address,
      slippage: 1,
      destReceiver: dZap.address,
      disableEstimate: true,
      compatibility: true,
    },
    {
      fromTokenAddress: NATIVE_ADDRESS,
      toTokenAddress: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
      amount: amountWithoutFee[1],
      fromAddress: dZap.address,
      slippage: 1,
      destReceiver: dZap.address,
      disableEstimate: true,
      compatibility: true,
    },
    // {
    //   fromTokenAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    //   toTokenAddress: '0xb33eaad8d922b1083446dc23f610c2567fb5180f',
    //   amount: amountWithoutFee[1],
    //   fromAddress: dZap.address,
    //   slippage: 1,
    //   destReceiver: dZap.address,
    //   disableEstimate: true,
    //   compatibility: true,
    // },
  ]

  // const swapParams: OneInchSwapParams[] = [
  //   // {
  //   //   fromTokenAddress: tokenAddress.usdtAddress,
  //   //   toTokenAddress: tokenAddress.usdcAddress,
  //   //   amount: amountWithoutFee[0],
  //   //   fromAddress: dZap.address,
  //   //   slippage: 1,
  //   //   destReceiver: dZap.address,
  //   //   disableEstimate: true,
  //   //   compatibility: true,
  //   // },
  //   {
  //     fromTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  //     toTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  //     amount: amountWithoutFee[0],
  //     fromAddress: dZap.address,
  //     slippage: 1,
  //     destReceiver: dZap.address,
  //     disableEstimate: true,
  //     compatibility: true,
  //   },
  // ]

  const data = await getInchSwapData(chainId, swapParams)
  const { swapData, value } = replaceFromAmount(
    data,
    amounts,
    fixedNativeFeeAmount
  )

  console.log(swapData, value)

  /* ------------------------------------------- */

  // single
  // const DexManagerFacet = await ethers.getContractAt('DexManagerFacet', dZap.address)
  // console.log(
  //   'isApproved',
  //   await DexManagerFacet.isFunctionApproved(
  //     '0x1111111254EEB25477B68fb85Ed929f73A960582',
  //     '0x12aa3caf'
  //   )
  // )

  console.log('swap')
  const transactionId = ethers.utils.formatBytes32String('dummyId')
  const refundee = signer.address
  console.log('transactionId', transactionId)

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
  //   try {
  //     await dZap
  //       .connect(signer)
  //       .swap(transactionId, integrator, refundee, recipient, swapData[0], {
  //         value,
  //       })
  //   } catch (error: any) {
  //     err = error
  //     console.log('err', err)
  //     try {
  //       if (error.data) {
  //         const decodedError = dZap.interface.parseError(error.data)
  //         console.log('decodedError', decodedError)

  //         if (decodedError.args.reason) {
  //           const revertMessage = getRevertMsg(decodedError.args.reason)
  //           console.log('revertMessage', revertMessage)

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

  console.log('multiswap')
  const tx = await dZap
    .connect(signer)
    .multiSwap(transactionId, integrator, refundee, recipient, swapData, {
      value,
    })
  console.log('tx', tx.hash)
  await tx.wait()
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
