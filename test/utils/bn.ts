import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'

/* ----------------------------------------- */
/* Big Number Helpers */
// Defaults to e18 using amount * 10^18
export function getBigNumber(amount: string | number, decimals = 18) {
  return BigNumber.from(amount).mul(BigNumber.from(10).pow(decimals))
}

export function convertBNToNegative(amount: BigNumber) {
  return BigNumber.from(0).sub(amount)
}

export const calBNPercent = (num: BigNumber, percentage: number) => {
  return num.mul(percentage).div(100)
}

export const bigNumberMin = (a: BigNumber, b: BigNumber) => {
  return a.lt(b) ? a : b
}

export const bigNumberMax = (a: BigNumber, b: BigNumber) => {
  return a.gt(b) ? a : b
}

export function toWei(amount: number) {
  return ethers.utils.parseEther(amount.toString())
}

export const bnCloseTo = (
  value: BigNumber,
  expectedValue: BigNumber,
  closeTo: number | BigNumber
) => {
  if (value.gte(expectedValue) && value.lte(expectedValue.add(closeTo)))
    return true
  if (value.lte(expectedValue) && value.gte(expectedValue.sub(closeTo)))
    return true

  return false
}

export function bnSqrt(x: BigNumber) {
  const ONE = BigNumber.from(1)
  const TWO = BigNumber.from(2)

  let z = x.add(ONE).div(TWO)
  let y = x
  while (z.sub(y).isNegative()) {
    y = z
    z = x.div(z).add(z).div(TWO)
  }
  return y
}

export const bnConsoleLog = (a: string, b: BigNumber) => {
  console.log(a, b.toString())
}

/* ----------------------------------------- */

// export const getLatestCreatedEvent = async (
//   factory: GatherLaunchpadFactory
// ) => {
//   const eventFilter = factory.filters.Created();
//   const data = await factory.queryFilter(eventFilter);
//   return data[data.length - 1].args;
// };

/* ----------------------------------------- */
