export const PermitTypes = [
  {
    name: 'owner',
    type: 'address',
  },
  {
    name: 'spender',
    type: 'address',
  },
  {
    name: 'value',
    type: 'uint256',
  },
  {
    name: 'nonce',
    type: 'uint256',
  },
  {
    name: 'deadline',
    type: 'uint256',
  },
]

export const Permit2Types = {
  PermitSingle: [
    { name: 'details', type: 'PermitDetails' },
    { name: 'spender', type: 'address' },
    { name: 'sigDeadline', type: 'uint256' },
  ],
  PermitDetails: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint160' },
    { name: 'expiration', type: 'uint48' },
    { name: 'nonce', type: 'uint48' },
  ],
}

export const DZapTransferWitness = {
  DZapTransferWitness: [
    { name: 'owner', type: 'address' },
    { name: 'recipient', type: 'address' },
  ],
}

export const DZapPermitWitnessTransferFromTypes = {
  PermitWitnessTransferFrom: [
    { name: 'permitted', type: 'TokenPermissions' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
    { name: 'witness', type: 'DZapTransferWitness' },
  ],
  TokenPermissions: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  ...DZapTransferWitness,
}

export const DZapPermit2BatchWitnessTransferFromTypes = {
  PermitBatchWitnessTransferFrom: [
    { name: 'permitted', type: 'TokenPermissions[]' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
    { name: 'witness', type: 'DZapTransferWitness' },
  ],
  TokenPermissions: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  ...DZapTransferWitness,
}

export const DZapPermit2BatchWitnessGasLessSwapTypes = {
  PermitBatchWitnessTransferFrom: [
    { name: 'permitted', type: 'TokenPermissions[]' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
    { name: 'witness', type: 'DZapSwapWitness' },
  ],
  TokenPermissions: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  DZapSwapWitness: [
    { name: 'txId', type: 'bytes32' },
    { name: 'user', type: 'address' },
    { name: 'executorFeesHash', type: 'bytes32' },
    { name: 'swapDataHash', type: 'bytes32' },
  ],
}

export const DZapPermit2BatchWitnessGasLessBridgeTypes = {
  PermitBatchWitnessTransferFrom: [
    { name: 'permitted', type: 'TokenPermissions[]' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
    { name: 'witness', type: 'DZapBridgeWitness' },
  ],
  TokenPermissions: [
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  DZapBridgeWitness: [
    { name: 'txId', type: 'bytes32' },
    { name: 'user', type: 'address' },
    { name: 'executorFeesHash', type: 'bytes32' },
    { name: 'swapDataHash', type: 'bytes32' },
    { name: 'adapterDataHash', type: 'bytes32' },
  ],
}

export const SignedFeeData = [
  { name: 'txId', type: 'bytes32' },
  { name: 'user', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
  { name: 'feeDataHash', type: 'bytes32' },
  { name: 'adapterDataHash', type: 'bytes32' },
]

export const SignedGasLessSwapData = [
  { name: 'txId', type: 'bytes32' },
  { name: 'user', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
  { name: 'executorFeesHash', type: 'bytes32' },
  { name: 'swapDataHash', type: 'bytes32' },
]

export const SignedGasLessBridgeData = [
  { name: 'txId', type: 'bytes32' },
  { name: 'user', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
  { name: 'executorFeesHash', type: 'bytes32' },
  { name: 'adapterDataHash', type: 'bytes32' },
]

export const SignedGasLessSwapBridgeData = [
  { name: 'txId', type: 'bytes32' },
  { name: 'user', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
  { name: 'executorFeesHash', type: 'bytes32' },
  { name: 'swapDataHash', type: 'bytes32' },
  { name: 'adapterDataHash', type: 'bytes32' },
]
