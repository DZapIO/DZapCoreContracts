import { BRIDGES } from '../bridges'

export const XLAYER_MAINNET = {
  bridges: {
    [BRIDGES.okx]: {
      address: [
        '0x5965851f21DAE82eA7C62f87fb7C57172E9F2adD',
        '0x8b773D83bc66Be128c60e07E17C8901f7a64F000',
      ],
      selectorInfo: [],
    },
    [BRIDGES.mesonFinance]: {
      address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
      selectorInfo: [],
    },
    [BRIDGES.router]: {
      address: ['0x21c1E74CAaDf990E237920d5515955a024031109'],
      selectorInfo: [],
    },
    [BRIDGES.xyFinance]: {
      address: ['0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1'],
      selectorInfo: [],
    },
  },
}
