import { ethers } from 'ethers'

export const BPS_MULTIPLIER = 10000n
export const BPS_DENOMINATOR = 100n * BPS_MULTIPLIER
export const ZERO = 0n
export const HARDHAT_CHAIN_ID = 31337

export const MaxUint48 = BigInt('0xffffffffffff')
export const MaxUint160 = BigInt('0xffffffffffffffffffffffffffffffffffffffff')
export const MaxUint256 = BigInt(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
)
export const MaxSigDeadline = MaxUint256
export const MaxPermit2AllowanceTransferAmount = MaxUint160
export const MaxPermit2AllowanceExpiration = MaxUint48
export const MaxOrderedNonce = MaxUint48
export const MaxUnorderedNonce = MaxUint256
