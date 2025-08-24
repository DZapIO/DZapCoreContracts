export const toNumber = (num: bigint) => {
  return parseInt(num.toString())
}

export const percentOfBigInt = (value: bigint, percentage: number): bigint => {
  if (percentage < 0) {
    throw new Error('Percentage must be a non-negative number')
  }
  // Convert percentage to basis points (1% = 100 basis points)
  const basisPoints = BigInt(Math.round(percentage * 100))
  // Calculate x% of the value: multiply by basis points and divide by 10000 (100 * 100)
  return (value * basisPoints) / 10000n
}
