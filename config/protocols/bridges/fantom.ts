import { BRIDGES } from '../bridges'

export const FANTOM_MAINNET = {
  bridges: {
    [BRIDGES.mesonFinance]: {
      address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
      selectorInfo: [],
    },
    [BRIDGES.okx]: {
      address: [
        '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
        '0x70cBb871E8f30Fc8Ce23609E9E0Ea87B6b222F58',
      ],
      selectorInfo: [],
    },
    [BRIDGES.rango]: {
      address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
      selectorInfo: [],
    },
    [BRIDGES.squid]: {
      address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
      selectorInfo: [],
    },
  },
}
