import { BigNumber, ethers } from 'ethers'
import { DzapSwapData } from '../types'
import { isNative } from './tokenUtils'
import { DZAP_NATIVE } from '../constants'

export const replaceFromAmount = (
  swapData: DzapSwapData[],
  amounts: BigNumber[],
  fixedNativeFeeAmount: BigNumber
) => {
  let value = fixedNativeFeeAmount
  swapData.forEach((data, i) => {
    if (isNative(data.from)) {
      value = value.add(amounts[i])
      swapData[i].from = DZAP_NATIVE
    }
    if (isNative(data.to)) {
      swapData[i].to = DZAP_NATIVE
    }
    swapData[i].fromAmount = BigNumber.from(amounts[i])
  })

  return { swapData: swapData, value }
}

export function calculateOffset(parameterIndex, parameterTypes, parameter) {
  let offset = 0
  for (let i = 0; i < parameterIndex; i++) {
    const size =
      ethers.utils.defaultAbiCoder.encode([parameterTypes[i]], [parameter[i]])
        .length - 2 // remove 0x
    // console.log(parameterTypes[i], size)

    offset += size
  }

  return { offset, offsetByBytes: offset / 2 + 4 }
}

export function replaceParameter(encodedData, newValue, offset, parameterType) {
  const encodedValue = ethers.utils.defaultAbiCoder.encode(
    [parameterType],
    [newValue]
  )

  const startIndex = offset + 2
  const endIndex = startIndex + encodedValue.slice(2).length

  const updatedEncodedData =
    encodedData.slice(0, startIndex) +
    encodedValue.slice(2) +
    encodedData.slice(endIndex)

  return updatedEncodedData
}
