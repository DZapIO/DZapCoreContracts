import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { BPS_DENOMINATOR, CONTRACTS } from '../constants'
import { FeesFacet } from '../typechain-types'
import { FeeData, FeeInfo, FeeType } from '../types'

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
