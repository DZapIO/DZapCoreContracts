import axios from 'axios'
import { BigNumber } from 'ethers'
import { encodePermitData, isNative } from '../../test/common'
import { PermitType } from '../../types'

const BASE_URL = 'https://aggregator-api.kyberswap.com'
const chain = 'polygon'
const Kyber_ROUTER = '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'
const SLIPPAGE = 1

export async function getKyberSwapData(srcToken, dstToken, amount, sender) {
  const queryParams = {
    tokenIn: srcToken,
    tokenOut: dstToken,
    amountIn: amount,
    // saveGas: false, // max output token or lest gas
  }

  const searchString = new URLSearchParams(queryParams)

  const routeUrl = `${BASE_URL}/${chain}/api/v1/routes/?${searchString}`
  console.log('routeUrl', routeUrl)

  const res = await axios.get(routeUrl)
  const swapRouteData = res.data.data
  // console.log(swapRouteData)

  const destAmount = BigNumber.from(swapRouteData.routeSummary.amountOut)
  const minAmount = destAmount.sub(destAmount.mul(SLIPPAGE).div(100)).toString()

  /* ------------------------------------------- */

  const txConfig = {
    routeSummary: swapRouteData.routeSummary,
    slippageTolerance: SLIPPAGE * 100, // 1% = 1 * 100 ; (10 means 0.1% = 1 / 100;)
    sender: sender,
    recipient: sender,
  }

  const txUrl = `${BASE_URL}/${chain}/api/v1/route/build`

  const res2 = await axios.post(txUrl, txConfig)
  const data = res2.data.data

  return {
    callTo: Kyber_ROUTER,
    approveTo: Kyber_ROUTER,
    from: srcToken,
    to: dstToken,
    fromAmount: BigNumber.from(0),
    minToAmount: minAmount,
    swapCallData: data.data,
    permit: isNative(srcToken)
      ? '0x'
      : encodePermitData('0x', PermitType.PERMIT),
  }
}
