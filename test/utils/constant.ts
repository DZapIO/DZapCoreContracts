import { BigNumber } from 'ethers'
import { ethers, network } from 'hardhat'

export const ZERO = BigNumber.from(0)
export const BASE_TEN = 10

export const BPS_MULTIPLIER = 10000
export const BPS_DENOMINATOR = BigNumber.from(100 * BPS_MULTIPLIER)

export const TOKEN_A_DECIMAL = 18
export const TOKEN_B_DECIMAL = 12
export const TOKEN_C_DECIMAL = 16
export const USDT_DECIMAL = 6
export const MINIMUM_LIQUIDITY = 10 ** 3
export const NATIVE_WEIGHAGE = ethers.utils.parseEther('1')

export const DEFAULT_BYTES = '0x'
export const ADDRESS_ZERO = ethers.constants.AddressZero
export const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD'
export const MAX_DEADLINE = ethers.constants.MaxInt256
export const HARDHAT_CHAIN_ID = network.config.chainId as number

export const DEFAULT_ERC20_PERMIT_VERSION = '1'
