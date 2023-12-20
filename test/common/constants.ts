import { ethers } from 'hardhat'
import { BPS_MULTIPLIER } from '../../constants'

export const MAX_TOKEN_FEE = 10 * BPS_MULTIPLIER
export const MAX_FIXED_FEE_AMOUNT = ethers.utils.parseUnits('1')
