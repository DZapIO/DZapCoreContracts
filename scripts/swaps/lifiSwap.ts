import { ethers } from 'hardhat'
import { DZAP_NATIVE, getRevertMsg } from '../../test/common'
import { CONTRACTS, NATIVE_ADDRESS } from '../../constants'
import { SwapFacet } from '../../typechain-types'
import { parseUnits } from 'ethers/lib/utils'
import { LifiParams } from '../../types'
import { getLifiSwapData } from '../core/lifi'
import { approveToken, getFeeData, replaceFromAmount } from '../core/helper'

// const diamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'
const diamondAddress = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7'

// const tokenAddress = {
//   wNativeAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
//   usdcAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
//   usdtAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
//   wEth: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
// }
const tokenAddress = {
  wNativeAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  wbtc: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
  usdcAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
  usdtAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
  dai: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
  arb: '0x912ce59144191c1204e64559fe8253a0e49e6548',
}

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  // const networkName: string = networks[chainId];
  const [signer] = await ethers.getSigners()

  console.log({
    name: 'lifi',
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
  const amounts = [parseUnits('0.001')]
  // const gasPrice = parseUnits('150 ', 'gwei')

  /* ------------------------------------------- */

  // await approveToken(
  //   signer,
  //   tokenAddress.usdcAddress,
  //   dZap.address,
  //   approveAmount
  // )

  /* ------------------------------------------- */

  const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
    diamondAddress,
    integrator,
    amounts
  )
  /* ------------------------------------------- */

  const swapParams: LifiParams[] = [
    {
      fromChain: chainId,
      toChain: chainId,
      fromToken: DZAP_NATIVE,
      toToken: tokenAddress.usdtAddress,
      fromAddress: dZap.address,
      toAddress: dZap.address,
      fromAmount: amountWithoutFee[0],
      slippage: 1 / 100, // 0.005 represents 0.5%.
      enableSlippageProtection: false,
    },
    // {
    //   fromChain: chainId,
    //   toChain: chainId,
    //   fromToken: DZAP_NATIVE,
    //   toToken: tokenAddress.wEth,
    //   fromAddress: dZap.address,
    //   toAddress: dZap.address,
    //   fromAmount: amountWithoutFee[1],
    //   slippage: 1 / 100, // 0.005 represents 0.5%.
    //   enableSlippageProtection: false,
    // },
  ]

  const data = await getLifiSwapData(swapParams)
  const { swapData, value } = replaceFromAmount(
    data,
    amounts,
    fixedNativeFeeAmount
  )
  console.log('swapData', swapData, value)

  /* ------------------------------------------- */
  // single
  console.log('swap')
  const transactionId = ethers.utils.formatBytes32String('dummyId')
  const refundee = signer.address
  console.log('transactionId', transactionId)

  console.log('swap 0')
  try {
    await dZap
      .connect(signer)
      .estimateGas.swap(
        transactionId,
        integrator,
        refundee,
        recipient,
        swapData[0],
        {
          value,
        }
      )
  } catch (error) {
    try {
      await dZap
        .connect(signer)
        .swap(transactionId, integrator, refundee, recipient, swapData[0], {
          value,
        })
    } catch (error: any) {
      if (error.data) {
        const decodedError = dZap.interface.parseError(error.data)
        if (decodedError.args.reason) {
          const revertMessage = getRevertMsg(decodedError.args.reason)
          throw revertMessage
        } else {
          throw decodedError
        }
      } else {
        throw error
      }
    }
  }

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
  //   try {
  //     await dZap
  //       .connect(signer)
  //       .swap(transactionId, integrator, refundee, recipient, swapData[1], {
  //         value,
  //       })
  //   } catch (error: any) {
  //     if (error.data) {
  //       const decodedError = dZap.interface.parseError(error.data)
  //       if (decodedError.args.reason) {
  //         const revertMessage = getRevertMsg(decodedError.args.reason)
  //         throw revertMessage
  //       } else {
  //         throw decodedError
  //       }
  //     } else {
  //       throw error
  //     }
  //   }
  // }

  console.log('multiswap')
  try {
    await dZap
      .connect(signer)
      .estimateGas.multiSwap(
        transactionId,
        integrator,
        refundee,
        recipient,
        swapData,
        {
          value,
        }
      )
  } catch (error) {
    try {
      await dZap
        .connect(signer)
        .multiSwap(transactionId, integrator, refundee, recipient, swapData, {
          value,
        })
    } catch (error: any) {
      if (error.data) {
        const decodedError = dZap.interface.parseError(error.data)
        if (decodedError.args.reason) {
          const revertMessage = getRevertMsg(decodedError.args.reason)
          throw revertMessage
        } else {
          throw decodedError
        }
      } else {
        throw error
      }
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
