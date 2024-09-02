import { BRIDGES } from '../bridges'

export const MERLIN_MAINNET = {
  bridges: {
    [BRIDGES.symbiosis]: {
      address: [
        '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
        '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
        '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
        '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
      ],
      selectorInfo: [],
    },
    [BRIDGES.mesonFinance]: {
      address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
      selectorInfo: [],
    },
    [BRIDGES.okx]: {
      address: [
        '0xf956d9fa19656d8e5219fd6fa8ba6cb198094138',
        '0x8b773D83bc66Be128c60e07E17C8901f7a64F000',
      ],
      selectorInfo: [],
    },
  },
}
