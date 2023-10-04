import axios from 'axios'
import { ethers } from 'hardhat'
import { BigNumber, BigNumberish } from 'ethers'
import { DZAP_NATIVE, encodePermitData, isNative } from '../../test/common'
import { NATIVE_ADDRESS } from '../../test/utils'
import { DzapSwapData, OneInchSwapParams, PermitType } from '../../types'

const BASE_URL = 'https://api-dzap.1inch.io/v5.0'
const ONE_INCH_V5 = '0x1111111254EEB25477B68fb85Ed929f73A960582'

const generateSwapDetails = async (
  chainId: number,
  swapParams: OneInchSwapParams[]
) => {
  try {
    const apis = swapParams.map((param) => {
      let paramsString = ''
      for (const key in param) {
        paramsString += `${key}=${param[key]}&`
      }

      const url = `${BASE_URL}/${chainId}/swap?${paramsString}`.slice(0, -1)
      console.log(url)
      return axios.get(url)
    })

    const response = await axios.all(apis)
    const OneInchRouter = await ethers.getContractFactory('AggregationRouterV5')

    return response.map((data: any) =>
      OneInchRouter.interface.decodeFunctionData('swap', data.data.tx.data)
    )
  } catch (err: any) {
    throw new Error(
      `Status code: ${err.response.status}. Message: ${err.response.statusText} (${err.response.data.description})`
    )
  }
}

export const getInchSwapData = async (
  chainId: number,
  swapParams: OneInchSwapParams[]
) => {
  const details = await generateSwapDetails(chainId, swapParams)
  // let value = BigNumber.from(0)

  const oneInch = await ethers.getContractAt('AggregationRouterV5', ONE_INCH_V5)

  const swapDetails: DzapSwapData[] = await Promise.all(
    details.map(async (decodedData, i) => {
      const { data } = await oneInch.populateTransaction.swap(
        decodedData.executor,
        decodedData.desc,
        decodedData.permit,
        decodedData.data
      )

      return {
        callTo: ONE_INCH_V5,
        approveTo: ONE_INCH_V5,
        from: decodedData.desc.srcToken,
        to: decodedData.desc.dstToken,
        fromAmount: BigNumber.from(0),
        // change to  totalAmount = amountWithoutFee + totalFee
        minToAmount: decodedData.desc.minReturnAmount,
        swapCallData: data as string,
        // permit: '0x',
        permit: isNative(decodedData.desc.srcToken)
          ? '0x'
          : encodePermitData('0x', PermitType.PERMIT),
      }
    })
  )
  return swapDetails
}
