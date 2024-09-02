import { BRIDGES } from '../bridges'

export const TELOS_MAINNET = {
  bridges: {
    [BRIDGES.telosBridge]: {
      address: ['0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76'],
      selectorInfo: [],
    },
    [BRIDGES.symbiosis]: {
      address: [
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
      ],
      selectorInfo: [],
    },
    [BRIDGES.routerNitro]: {
      address: ['0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef'],
      selectorInfo: [],
    },
  },
}
