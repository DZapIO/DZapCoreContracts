import { BigNumber, Contract } from 'ethers'
import { DiamondCutData, FeeInfo, PermitType } from '../types'
import { ethers } from 'hardhat'
import { FunctionFragment, Interface } from 'ethers/lib/utils'
import { ZERO_ADDRESS } from '../../constants'

export const BPS_MULTIPLIER = 10000
export const BPS_DENOMINATOR = 100 * BPS_MULTIPLIER
export const MAX_TOKEN_FEE = 10 * BPS_MULTIPLIER
export const MAX_FIXED_FEE_AMOUNT = ethers.utils.parseUnits('1')
export const DZAP_NATIVE = ZERO_ADDRESS
export const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const isNative = (token: string) => {
  return token == NATIVE_ADDRESS || token == DZAP_NATIVE
}

export const getRevertMsg = (res) => {
  if (res.length < 68) {
    return res
    // return ethers.utils.toUtf8String(res)
    // return ethers.utils.toUtf8String(res)
  }
  const revertData = '0x' + res.slice(10)
  return ethers.utils.defaultAbiCoder.decode(['string'], revertData)[0]
}

export function getSelectorsUsingContract(contract, facetName) {
  const signatures = Object.keys(contract.interface.functions)
  const selectors = signatures.reduce((acc, val) => {
    if (val !== 'init(bytes)') {
      acc.push(contract.interface.getSighash(val))
    }
    return acc
  }, [] as string[])
  const faceCutData: DiamondCutData = {
    facetName,
    contract,
    selectors,
  }

  return faceCutData
}

export function get(faceCutData: DiamondCutData, functionNames: string[]) {
  faceCutData.selectors = faceCutData.selectors.filter((selector) => {
    for (const functionName of functionNames) {
      if (
        selector === faceCutData.contract.interface.getSighash(functionName)
      ) {
        return selector
      }
    }
  })

  return faceCutData
}

export function removeFromSelectors(
  contract: Contract,
  selectors: string[],
  functionNames: string[]
) {
  return selectors.filter((selector) => {
    for (const functionName of functionNames) {
      if (selector !== contract.interface.getSighash(functionName)) {
        return selector
      }
    }
  })
}

export function getSelector(func: string) {
  const abiInterface = new ethers.utils.Interface([func])
  return abiInterface.getSighash(ethers.utils.Fragment.from(func))
}

export function getSelectorsUsingFunSig(func: string[]) {
  const abiInterface = new ethers.utils.Interface(func)

  return func.map((fun) =>
    abiInterface.getSighash(ethers.utils.Fragment.from(fun))
  )
}

export function getSighash(
  fragments: FunctionFragment[],
  abiInterface: Interface
) {
  return fragments.map((fragment) => abiInterface.getSighash(fragment))
}

export const encodePermitData = (data: string, permitType: PermitType) => {
  // userPermit2, callData
  const encodedData = ethers.utils.defaultAbiCoder.encode(
    ['uint8', 'bytes'],
    [permitType, data]
  )

  return encodedData
}

export function calculateOffset(parameterIndex, parameterTypes, parameter) {
  let offset = 0
  for (let i = 0; i < parameterIndex; i++) {
    const size =
      ethers.utils.defaultAbiCoder.encode([parameterTypes[i]], [parameter[i]])
        .length - 2 // remove 0x
    console.log(parameterTypes[i], size)

    offset += size
  }

  return offset
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
  const totalNativeFee = feeInfo.fixedNativeFeeAmount
  const dzapNativeFeeShare = totalNativeFee
    .mul(feeInfo.dzapFixedNativeShare)
    .div(BPS_DENOMINATOR)
  const integratorNativeFee = totalNativeFee.sub(dzapNativeFeeShare)

  return { totalNativeFee, dzapNativeFeeShare, integratorNativeFee }
}
