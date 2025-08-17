export const ZkCreat2FactoryAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'sender', type: 'address' },
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
      { internalType: 'bytes32', name: 'bytecodeHash', type: 'bytes32' },
      {
        internalType: 'bytes32',
        name: 'constructorInputHash',
        type: 'bytes32',
      },
    ],
    name: 'computeAddress',
    outputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
      { internalType: 'bytes32', name: 'bytecodeHash', type: 'bytes32' },
      { internalType: 'bytes', name: 'inputData', type: 'bytes' },
    ],
    name: 'deploy',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const
