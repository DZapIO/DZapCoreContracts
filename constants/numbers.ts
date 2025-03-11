import { BigNumber, ethers } from 'ethers'

export const BPS_MULTIPLIER = 10000
export const BPS_DENOMINATOR = 100 * BPS_MULTIPLIER
export const ZERO = BigNumber.from(0)
export const MAX_DEADLINE = ethers.constants.MaxInt256
export const HARDHAT_CHAIN_ID = 31337
