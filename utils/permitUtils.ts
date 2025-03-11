import { ethers } from 'ethers'
import { PermitType } from '../types'

export const encodePermitData = (data: string, permitType: PermitType) => {
  // userPermit2, callData
  const encodedData = ethers.utils.defaultAbiCoder.encode(
    ['uint8', 'bytes'],
    [permitType, data]
  )

  return encodedData
}

export const decodePermitData = (data: string) => {
  // userPermit2, callData
  const decodeData = ethers.utils.defaultAbiCoder.decode(
    ['uint8', 'bytes'],
    data
  )
  console.dir({ decodeData }, { depth: null })

  return decodeData
}
