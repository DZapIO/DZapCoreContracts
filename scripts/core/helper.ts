import { ethers } from 'hardhat'
import { BigNumber, BigNumberish, Signer } from 'ethers'
import {
  DzapSwapData,
  FeeInfo,
  PermitType,
  FeeType,
  FeeData,
} from '../../types'
import {
  BPS_DENOMINATOR,
  CONTRACTS,
  DZAP_NATIVE,
  NATIVE_ADDRESS,
} from '../../constants'
import { ERC20, FeesFacet } from '../../typechain-types'

export function getRandomBytes32() {
  const randomHexString =
    '0x' +
    Math.floor(Math.random() * 16 ** 64)
      .toString(16)
      .padStart(64, '0')
  return randomHexString
}

export const isNative = (token: string) => {
  token = ethers.utils.getAddress(token)
  return token == NATIVE_ADDRESS || token == DZAP_NATIVE
}

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

export const getFeeData = async (
  diamondAddress: string,
  integrator: string,
  amounts: BigNumber[],
  feeType = FeeType.SWAP
) => {
  const feesFacet = (await ethers.getContractAt(
    CONTRACTS.FeesFacet,
    diamondAddress
  )) as FeesFacet

  const tokenFeeData: FeeData[] = []
  for (let i = 0; i < amounts.length; i++) {
    const { totalFee, dzapShare } = await feesFacet.calcTokenFees(
      integrator,
      feeType,
      amounts[i]
    )
    const integratorFee = totalFee.sub(dzapShare)

    tokenFeeData.push({
      totalFee,
      dzapFee: dzapShare,
      integratorFee,
    })
  }

  // const { dzapFixedNativeShare } = await feesFacet.integratorFeeInfo(
  //   integrator,
  //   feeType
  // )
  // const dzapNativeFeeAmount = fixedNativeFeeAmount
  //   .mul(dzapFixedNativeShare)
  //   .div(BPS_DENOMINATOR)

  const { fixedNativeFeeAmount, dzapShare } =
    await feesFacet.calcFixedNativeFees(integrator, feeType)

  const fixedNativeData = {
    totalNativeFeeAmount: fixedNativeFeeAmount,
    dzapNativeFeeAmount: dzapShare,
    integratorNativeFeeAmount: fixedNativeFeeAmount.sub(dzapShare),
  }

  const amountWithoutFee = amounts.map((amount, i) =>
    amount.sub(tokenFeeData[i].totalFee)
  )

  return {
    amountWithoutFee,
    tokenFeeData,
    fixedNativeFeeAmount,
    fixedNativeData,
  }
}

export const approveToken = async (
  signer: Signer,
  tokenAddress: string,
  spender: string,
  approveAmount: BigNumberish
) => {
  const erc20 = (await ethers.getContractAt(
    '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20',
    tokenAddress
  )) as ERC20

  const allowance = await erc20.connect(signer).allowance(spender, spender)

  if (!allowance.gt(0)) {
    const tx = await erc20.connect(signer).approve(spender, approveAmount)
    console.log('Approving token tx', tx.hash)
    await tx.wait()
    console.log('Completed Token Approval')
  } else {
    console.log('Already Approved')
  }
}

export const getRevertMsg = (res) => {
  // console.log('getRevertMsg', res)
  if (res.length < 68) {
    return res
    // return ethers.utils.toUtf8String(res)
    // return ethers.utils.toUtf8String(res)
  }
  const revertData = '0x' + res.slice(10)
  const msg = ethers.utils.defaultAbiCoder.decode(['string'], revertData)[0]
  // console.log('msg', msg)
  return msg
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
