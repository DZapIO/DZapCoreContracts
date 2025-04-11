export const delay = (ms: number) => {
  console.log(`\nWaiting for ${ms / 1000} seconds...`)
  return new Promise((resolve) => setTimeout(resolve, ms))
}
