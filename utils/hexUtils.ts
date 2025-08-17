export const hexRightPad = (hexString: string, targetBytes = 32) => {
  let s = hexString.startsWith('0x') ? hexString.slice(2) : hexString
  const targetLength = targetBytes * 2 // 2 hex digits per byte
  if (s.length > targetLength) {
    throw new Error('Input is longer than the target byte length')
  }
  while (s.length < targetLength) {
    s += '00'
  }

  return '0x' + s
}

export function getRandomBytes32() {
  const randomHexString =
    '0x' +
    Math.floor(Math.random() * 16 ** 64)
      .toString(16)
      .padStart(64, '0')
  return randomHexString
}
