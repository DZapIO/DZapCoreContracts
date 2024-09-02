import { BRIDGES } from '../bridges'

export const MANTA_MAINNET = {
  bridges: {
    [BRIDGES.symbiosis]: {
      address: [
        '0x318C2B9a03C37702742C3d40C72e4056e430135A',
        '0x027cc92c6892de323Ba664F0B3bA8B602d4116B6',
        '0xda8057acB94905eb6025120cB2c38415Fd81BfEB',
        '0x2b7Aa8bDc40B6d3d19d0dE7480c4db8d5B6495e2',
      ],
      selectorInfo: [],
    },
    [BRIDGES.okx]: {
      address: [
        '0x91EcECC4F2363770c621a8a061A80d67cfEafEC7',
        '0x57df6092665eb6058DE53939612413ff4B09114E',
      ],
      selectorInfo: [],
    },
    [BRIDGES.routerNitro]: {
      address: ['0x8201c02d4AB2214471E8C3AD6475C8b0CD9F2D06'],
      selectorInfo: [],
    },
    [BRIDGES.router]: {
      address: ['0x21c1e74caadf990e237920d5515955a024031109'],
      selectorInfo: [],
    },
    [BRIDGES.mayanFinance]: {
      address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
      selectorInfo: [],
    },
    [BRIDGES.omniBtc]: {
      address: ['0xd600d94d0812f7EdfA47D0Cf02a767b1DD14A01B'],
      selectorInfo: [],
    },
  },
}