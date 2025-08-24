export const FEES_ABI_TYPE = `tuple(address token,uint256 integratorFeeAmount,uint256 protocolFeeAmount)`
export const FEE_CONFIG_ABI_TYPE = `tuple(address integrator,${FEES_ABI_TYPE}[] fees)`
export const ADAPTER_INFO_ABI_TYPE = `tuple(address adapter,bytes adapterData)`
export const ADAPTER_INFO_ABI_TYPE_ARRAY = `${ADAPTER_INFO_ABI_TYPE}[]`
export const SWAP_INFO_ABI_TYPE = `tuple(address recipient,address from,address to,uint256 fromAmount,uint256 minToAmount)`
export const SWAP_INFO_ABI_TYPE_ARRAY = `${SWAP_INFO_ABI_TYPE}[]`
export const BRIDGE_SWAP_INFO_ABI_TYPE = `tuple(address recipient,address from,address to,uint256 fromAmount,uint256 minToAmount,bool updateBridgeInAmount)`
export const BRIDGE_SWAP_INFO_ABI_TYPE_ARRAY = `${BRIDGE_SWAP_INFO_ABI_TYPE}[]`
export const EXECUTOR_INFO_ABI_TYPE = `tuple(address token,uint256 amount)`
export const EXECUTOR_INFO_ABI_TYPE_ARRAY = `${EXECUTOR_INFO_ABI_TYPE}[]`

export const DZapEip2612EncodingType = [
  'uint256',
  'uint8',
  'bytes32',
  'bytes32',
]

export const Eip2612EncodingType = [
  'address',
  'address',
  'uint256',
  'uint256',
  'uint8',
  'bytes32',
  'bytes32',
]

export const DZapPermit2ApproveEncodingType = [
  'uint48 nonce',
  'uint48 expiration',
  'uint256 sigDeadline',
  'bytes signature',
]

export const Permit2ApproveEncodingType = [
  'address owner',
  'tuple(address token, uint160 amount, uint48 expiration, uint48 nonce) details',
  'address spender',
  'uint256 sigDeadline',
  'bytes signature',
]
