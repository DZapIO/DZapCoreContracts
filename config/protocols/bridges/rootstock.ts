import { BRIDGES } from '../bridgeNames'

export const ROOTSTOCK_MAINNET = {
  bridges: {
    [BRIDGES.symbiosis]: {
      address: [
        '0x7057ab3fb2bee9c18e0cde4240de4ff7f159e365',
        '0xda8057acb94905eb6025120cb2c38415fd81bfeb',
        '0x01a3c8e513b758ebb011f7afaf6c37616c9c24d9',
        '0xfffdb2a69abcbbf55ecb2f6b348e0bd3d0f9f2e1',
      ],
      selectorInfo: [],
    },
    [BRIDGES.routerNitro]: {
      address: [
        '0xff13a7a12fd485bc9687ff88d8ae1a6b655ab469',
        '0xc21e4ebd1d92036cb467b53fe3258f219d909eb9',
      ],
      selectorInfo: [],
    },
    [BRIDGES.router]: {
      address: ['0xc21e4ebd1d92036cb467b53fe3258f219d909eb9'],
      selectorInfo: [],
    },
  },
}
