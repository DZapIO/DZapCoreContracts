import { ethers } from 'ethers'

export const getRevertMsg = (res) => {
  // console.log('getRevertMsg', res)
  if (res.length < 68) {
    return res
    // return ethers.utils.toUtf8String(res)
    // return ethers.utils.toUtf8String(res)
  }
  const revertData = '0x' + res.slice(10)
  const msg = ethers.utils.defaultAbiCoder.decode(['string'], revertData)[0]
  // console.log('msg', msg)
  return msg
}

export function decodeAscii(asciiString: string) {
  // Initialize an empty array to store the hexadecimal values
  const hexValues: string[] = []

  // Iterate through each character in the string
  for (let i = 0; i < asciiString.length; i++) {
    // Get the ASCII code of the character
    const asciiCode = asciiString.charCodeAt(i)

    // Convert the ASCII code to a hexadecimal string and push it to the array
    hexValues.push(asciiCode.toString(16))
  }

  // Join the hexadecimal values with an empty string to get the final hexadecimal representation
  const hexString = '0x' + hexValues.join('')
  return hexString // This will print the original hexadecimal representation
}
