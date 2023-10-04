import axios from 'axios'
import { encodePermitData, isNative } from './helper'
import { LifiParams, PermitType } from '../../types'
import { BigNumber } from 'ethers'

const SLIPPAGE = 1 // 1%
const LIFI_ROUTER = '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'
const BASE_URL = `https://li.quest/v1/quote`

export const getLifiSwapData = async (params: LifiParams[]) => {
  const urls = params.map((queryParams) =>
    axios.get(
      `${BASE_URL}/?${new URLSearchParams(Object.entries(queryParams))}`
    )
  )
  const response = await axios.all(urls)
  //   console.log(response[0].data.action.fromToken)
  //   console.log(response[1].data.action.fromToken)

  return response.map((res: any, i) => {
    console.log(i, res.data)
    return {
      callTo: LIFI_ROUTER,
      approveTo: LIFI_ROUTER,
      from: res.data.action.fromToken.address,
      to: res.data.action.toToken.address,
      fromAmount: BigNumber.from(0),
      minToAmount: res.data.estimate.toAmountMin,
      swapCallData: res.data.transactionRequest.data,
      permit: isNative(res.data.action.fromToken.address)
        ? '0x'
        : encodePermitData('0x', PermitType.PERMIT),
    }
  })
}

export const getLifiBridgeData = async (params: LifiParams[]) => {
  const urls = params.map((queryParams) =>
    axios.get(
      `${BASE_URL}/?${new URLSearchParams(Object.entries(queryParams))}`
    )
  )
  const response = await axios.all(urls)
  //   console.log(response[0].data.action.fromToken)
  //   console.log(response[1].data.action.fromToken)

  const bridgeNames: string[] = []
  const genericData = response.map((res: any, i) => {
    // console.log(i, res.data)
    if (res.data.action.fromChainId == res.data.action.toChainId)
      throw 'Src and Dst chains are same'

    bridgeNames.push(res.data.tool)

    // console.log(
    //   'transactionRequest.value',
    //   BigNumber.from(res.data.transactionRequest.value)
    // )

    return {
      callTo: LIFI_ROUTER,
      approveTo: LIFI_ROUTER,
      extraNative: res.data.transactionRequest.value,
      permit: isNative(res.data.action.fromToken.address)
        ? '0x'
        : encodePermitData('0x', PermitType.PERMIT),
      callData: res.data.transactionRequest.data as string,
    }
  })
  return { genericData, bridgeNames }
}
