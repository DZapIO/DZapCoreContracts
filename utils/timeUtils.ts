import { BigNumberish, Block } from 'ethers'
import { ethers } from 'hardhat'

export const delay = (ms: number) => {
  console.log(`\nWaiting for ${ms / 1000} seconds...`)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function latest() {
  const block = (await ethers.provider.getBlock('latest')) as Block
  return BigInt(block.timestamp)
}

export async function latestBlock() {
  return BigInt(await ethers.provider.getBlockNumber())
}

export const getDeadline = async (deadline: BigNumberish) => {
  return (await latest()) + BigInt(deadline)
}

export const duration = {
  seconds: function (val: number | string) {
    return BigInt(val)
  },
  minutes: function (val: number | string) {
    return BigInt(val) * this.seconds('60')
  },
  hours: function (val: number | string) {
    return BigInt(val) * this.minutes('60')
  },
  days: function (val: number | string) {
    return BigInt(val) * this.hours('24')
  },
  weeks: function (val: number | string) {
    return BigInt(val) * this.days('7')
  },
  month: (val: number | string = 1) => duration.days(30) * BigInt(val),
  years: function (val: number | string) {
    return BigInt(val) * this.days('365')
  },
}
