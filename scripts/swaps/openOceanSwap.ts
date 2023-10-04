import { ethers } from 'hardhat'
import { CONTRACTS } from '../../constants'
import { SwapFacet } from '../../typechain'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { LifiParams, OpenOceanParams } from '../../types'
import { getLifiSwapData } from '../core/lifi'
import { approveToken, getFeeData, replaceFromAmount } from '../core/helper'
import { getOpenOceanSwapData } from '../core/openocean'

const diamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'

const tokenAddress = {
  wNativeAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  usdcAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  usdtAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  wEth: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
}

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  // const networkName: string = networks[chainId];
  const [signer] = await ethers.getSigners()

  console.log({
    name: 'OpenOcean',
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

  // await approveToken(
  //   signer,
  //   tokenAddress.usdcAddress,
  //   dZap.address,
  //   approveAmount
  // )

  /* ------------------------------------------- */
  const integrator = '0x12480616436DD6D555f88B8d94bB5156E28825B1' // dzapProjectId
  const recipient = signer.address
  const amounts = [parseUnits('0.5', 6), parseUnits('0.1')]
  // const gasPrice = parseUnits('150 ', 'gwei')

  const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
    diamondAddress,
    integrator,
    amounts
  )
  /* ------------------------------------------- */

  const swapParams: OpenOceanParams[] = [
    {
      inTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      outTokenAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      account: dZap.address,
      // amount: amountWithoutFee[0],
      amount: formatUnits('906801560078699038', 6),
      slippage: 5,
      gasPrice: 130,
    },
    // {
    //   inTokenAddress: DZAP_NATIVE,
    //   outTokenAddress: tokenAddress.wEth,
    //   account: dZap.address,
    //   amount: amountWithoutFee[1],
    //   slippage: 1,
    //   gasPrice: 130,
    // },
  ]

  const data = await getOpenOceanSwapData(swapParams)
  console.log(data)
  const { swapData, value } = replaceFromAmount(
    data,
    amounts,
    fixedNativeFeeAmount
  )
  console.log('swapData', swapData, value)

  // /* ------------------------------------------- */
  // // single
  console.log('swap')
  const transactionId = ethers.utils.formatBytes32String('dummyId')
  const refundee = signer.address
  console.log('transactionId', transactionId)

  // console.log('swap 0')
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
