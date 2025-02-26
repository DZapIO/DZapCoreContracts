import { BRIDGES } from '../bridgeNames'

export const POLYGON_MAINNET = {
  bridges: {
    [BRIDGES.across]: {
      address: ['0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096'],
      selectorInfo: [],
    },
    [BRIDGES.allbridge]: {
      address: ['0x7775d63836987f444E2F14AA0fA2602204D7D3E0'],
      selectorInfo: [],
    },
    [BRIDGES.cctp]: {
      address: [
        '0x3a5A635FD8c6fcEBa7A8b2861c1CBde7ED32A918',
        '0xB876cc05c3C3C8ECBA65dAc4CF69CaF871F2e0DD', // celer
      ],
      selectorInfo: [],
    },
    [BRIDGES.hop]: {
      address: [
        '0x8741Ba6225A6BF91f9D73531A98A89807857a2B3',
        '0x76b22b8C1079A44F1211D867D68b1eda76a635A7',
        '0x884d1Aa15F9957E1aEAA86a82a72e49Bc2bfCbe3',
        '0x28529fec439cfF6d7D1D5917e956dEE62Cd3BE5c',
        '0xc315239cFb05F1E130E7E28E603CEa4C014c57f0',
        '0x8741Ba6225A6BF91f9D73531A98A89807857a2B3',
        '0x1CD391bd1D915D189dE162F0F1963C07E60E4CD6',
      ],
      selectorInfo: [],
    },
    [BRIDGES.hyperlane]: {
      address: ['0xB3dF48224FA257D55e01342592f9A24cefc2628e'],
      selectorInfo: [],
    },
    [BRIDGES.lifi]: {
      address: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      selectorInfo: [
        {
          function: '',
          functionSig: '',
          offset: 0,
        },
      ],
    },
    [BRIDGES.socket]: {
      address: ['0x3a23F943181408EAC424116Af7b7790c94Cb97a5'],
      selectorInfo: [],
    },
    [BRIDGES.unizen]: {
      address: [
        '0x07d0ac7671D4242858D0cebcd34ec03907685947',
        '0xCf2DBA4e5C9f1B47AC09dc712A0F7bD8eE31A15d',
      ],
      selectorInfo: [],
    },
    [BRIDGES.xyFinance]: {
      address: [
        '0xa1fB1F1E5382844Ee2D1BD69Ef07D5A6Abcbd388',
        '0x0c988b66EdEf267D04f100A879db86cdb7B9A34F',
        '0xCF446713DDf0E83F7527A260047f8Ae89eFaE3e5',
      ],
      selectorInfo: [],
    },
    [BRIDGES.deBridge]: {
      address: [
        '0x663DC15D3C1aC63ff12E45Ab68FeA3F0a883C251',
        '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
        '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA',
      ],
      selectorInfo: [],
    },
    [BRIDGES.mayanFinance]: {
      address: [
        '0xF3f04555f8FdA510bfC77820FD6eB8446f59E72d',
        '0x0654874eb7F59C6f5b39931FC45dC45337c967c3',
      ],
      selectorInfo: [],
    },
    [BRIDGES.omniBtc]: {
      address: [
        '0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820',
        '0xd600d94d0812f7EdfA47D0Cf02a767b1DD14A01B',
        '0xA0285339CefD73AB948614E0a45E03ED1882BD03',
      ],
      selectorInfo: [],
    },
    [BRIDGES.rango]: {
      address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
      selectorInfo: [],
    },
    [BRIDGES.symbiosis]: {
      address: [
        '0xa260E3732593E4EcF9DdC144fD6C4c5fe7077978',
        '0xAb83653fd41511D638b69229afBf998Eb9B0F30c',
        '0xa260E3732593E4EcF9DdC144fD6C4c5fe7077978',
        '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
        '0xc5B61b9abC3C6229065cAD0e961aF585C5E0135c',
      ],
      selectorInfo: [],
    },
    [BRIDGES.synapse]: {
      address: [
        '0x7E7A0e201FD38d3ADAA9523Da6C109a07118C96a',
        '0xd5a597d6e7ddf373a92C8f477DAAA673b0902F48',
        '0x00cD000000003f7F682BE4813200893d4e690000',
      ],
      selectorInfo: [],
    },
    [BRIDGES.telosBridge]: {
      address: ['0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76'],
      selectorInfo: [],
    },
    [BRIDGES.mesonFinance]: {
      address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
      selectorInfo: [],
    },
    [BRIDGES.okx]: {
      address: [
        '0x89f423567c2648BB828c3997f60c47b54f57Fa6e',
        '0x3B86917369B83a6892f553609F3c2F439C184e31',
      ],
      selectorInfo: [],
    },
    [BRIDGES.routerNitro]: {
      address: [
        '0xc57133521ffbd729cb81cc8ddc12d9e9f61e0f6a',
        '0x1396F41d89b96Eaf29A7Ef9EE01ad36E452235aE',
        '0xfd30C690631592712F1A6927ebaF59581953B494',
        '0xa62ec33AbD6d7eBdF8ec98ce874820517Ae71E4D',
      ],
      selectorInfo: [],
    },
    [BRIDGES.router]: {
      address: [
        '0xa62ec33abd6d7ebdf8ec98ce874820517ae71e4d',
        '0x1ba8ca832496f0b66c08ab5f248217eb27b89a25',
      ],
      selectorInfo: [],
    },
    [BRIDGES.swing]: {
      address: [
        '0xE684eEDD1F493945d7923E9156401e945211243d',
        '0x0fad05a723fD039769815bE74Be9E7a1f7EeD911',
        '0x36F60E4F8aE2f6d2b373f48C0921348d5203F728',
        '0x80CA2C352ad30641bA39274110Df5F5c10F0dCa0',
      ],
      selectorInfo: [],
    },
    [BRIDGES.squid]: {
      address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
      selectorInfo: [],
    },
    [BRIDGES.stargate]: {
      address: [
        '0x9Aa02D4Fae7F58b8E8f34c66E756cC734DAc7fe4',
        '0xd47b03ee6d86Cf251ee7860FB2ACf9f91B9fD4d7',
      ],
      selectorInfo: [],
    },
    [BRIDGES.celer]: {
      address: ['0x88DCDC47D2f83a99CF0000FDF667A468bB958a78'],
      selectorInfo: [],
    },
    [BRIDGES.owlto]: {
      address: ['0xC626845BF4E6a5802Ef774dA0B3DfC6707F015F7'],
      selectorInfo: [],
    },
    [BRIDGES.orbiter]: {
      address: ['0x653f25dc641544675338cb47057f8ea530c69b78'],
      selectorInfo: [],
    },
    [BRIDGES.relayLink]: {
      address: ['0x77a917df7a084b7b3e43517ae28373c2a5492625'],
      selectorInfo: [],
    },
    [BRIDGES.wanBridge]: {
      address: [
        '0x30b8d9e757595B5cbAEcdFD81e9Eeccf4B31e53D',
        '0x88888dd82A91f0406ED42BF750bAF881e64894F6',
      ],
      selectorInfo: [],
    },
    [BRIDGES.crossCurve]: {
      address: ['0xA2A786ff9148f7C88EE93372Db8CBe9e94585c74'],
      selectorInfo: [],
    },
  },
}
