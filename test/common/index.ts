import { BigNumber } from 'ethers'
import { BPS_DENOMINATOR } from '../../constants'
import { FeeInfo } from '../../types'

export function decodeAscii(asciiString: string) {
  // Initialize an empty array to store the hexadecimal values
  const hexValues: string[] = []

  // Iterate through each character in the string
  for (let i = 0; i < asciiString.length; i++) {
    // Get the ASCII code of the character
    const asciiCode = asciiString.charCodeAt(i)

    // Convert the ASCII code to a hexadecimal string and push it to the array
    hexValues.push(asciiCode.toString(16))
  }

  // Join the hexadecimal values with an empty string to get the final hexadecimal representation
  const hexString = '0x' + hexValues.join('')
  return hexString // This will print the original hexadecimal representation
}

export const calculateTokenFee = (amount: BigNumber, feeInfo: FeeInfo) => {
  const totalFee = amount.mul(feeInfo.tokenFee).div(BPS_DENOMINATOR)
  const amountWithoutFee = amount.sub(totalFee)
  const dzapFeeShare = totalFee.mul(feeInfo.dzapTokenShare).div(BPS_DENOMINATOR)
  const integratorFee = totalFee.sub(dzapFeeShare)

  return { amountWithoutFee, totalFee, dzapFeeShare, integratorFee }
}

export const calculateFixedNativeFee = (feeInfo: FeeInfo) => {
  const totalNativeFee = BigNumber.from(feeInfo.fixedNativeFeeAmount)
  const dzapNativeFeeShare = totalNativeFee
    .mul(feeInfo.dzapFixedNativeShare)
    .div(BPS_DENOMINATOR)
  const integratorNativeFee = totalNativeFee.sub(dzapNativeFeeShare)

  return { totalNativeFee, dzapNativeFeeShare, integratorNativeFee }
}
