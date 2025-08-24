import { AbiCoder, FunctionFragment, keccak256, toUtf8Bytes } from 'ethers'
import { ADDRESS_ZERO } from '../constants'

export function calculateOffset({
  parameterIndex,
  functionAbi,
  parameterTypes,
}: {
  parameterIndex: number
  functionAbi?: FunctionFragment
  parameterTypes?: string[]
}) {
  let offset = 0

  if (!parameterTypes) {
    if (!functionAbi)
      throw new Error('functionAbi or parameterTypes is required')
    parameterTypes = functionAbi.inputs.map((input) => input.type)
  }

  const parameter: any[] = []

  for (let i = 0; i < parameterTypes.length; i++) {
    if (parameterTypes[i] === 'address') {
      parameter.push(ADDRESS_ZERO)
    } else if (parameterTypes[i] === 'uint256') {
      parameter.push(0)
    } else if (parameterTypes[i] === 'bool') {
      parameter.push(false)
    } else if (parameterTypes[i] === 'bytes32') {
      parameter.push(keccak256(toUtf8Bytes('0')))
    } else {
      throw new Error(
        `Parameter type ${parameterTypes[i]} at index ${i} is not supported`
      )
    }
  }

  for (let i = 0; i < parameterIndex; i++) {
    const size =
      AbiCoder.defaultAbiCoder().encode([parameterTypes[i]], [parameter[i]])
        .length - 2 // remove 0x

    offset += size
  }

  return { offset, offsetByBytes: offset / 2 + 4 }
}
