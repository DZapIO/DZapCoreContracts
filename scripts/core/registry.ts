export const chainIds = {
  mainnet: 1,
  bscMainnet: 56,
  polygonMainnet: 137,
  arbitrum: 42161,
  zksyncMainnet: 324,
  optimism: 10,
}

export const tokenAddress = {
  [chainIds.polygonMainnet]: {
    wMatic: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    usdc: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    usdt: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    wEth: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
  },
  [chainIds.optimism]: {
    wMatic: '0x4200000000000000000000000000000000000006',
    usdc: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
    usdt: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    wEth: '0x4200000000000000000000000000000000000006',
  },
  [chainIds.bscMainnet]: {
    wEth: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    wBnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    usd: '0x55d398326f99059ff775485246999027b3197955',
  },
  [chainIds.arbitrum]: {
    usdt: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
  },
}
