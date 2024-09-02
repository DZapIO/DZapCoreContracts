import { BRIDGES } from '../bridges'

export const KAVA_MAINNET = {
  bridges: {
    [BRIDGES.symbiosis]: {
      address: [
        '0xA7544C409d772944017BB95B99484B6E0d7B6388',
        '0x77Ed285AD9d1c8C0307eA23DcE68B8a5A6AfB39A',
        '0x0c4313a5dD4990f2fC15c6aA4d287D4602645a05',
        '0xda8057acB94905eb6025120cB2c38415Fd81BfEB',
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
      ],
      selectorInfo: [],
    },
    [BRIDGES.squid]: {
      address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
      selectorInfo: [],
    },
    [BRIDGES.stargate]: {
      address: ['0x41A5b0470D96656Fb3e8f68A218b39AdBca3420b'],
      selectorInfo: [],
    },
  },
}
