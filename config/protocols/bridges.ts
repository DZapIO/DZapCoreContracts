import { CHAIN_IDS } from '../networks'

export enum BRIDGES {
  ALL = 'ALL',
  socket = 'socket',
  unizen = 'unizen',
  xyFinance = 'xyFinance',
  deBridge = 'dbridge',
  mayanFinance = 'mayanFinance',
  symbiosis = 'symbiosis',
  changeNow = 'changeNow',
  omniBtc = 'omniBtc',
  telosBridge = 'telosBridge',
  lifi = 'lifi',
  mesonFinance = 'mesonFinance',
  okx = 'okx',
  rango = 'rango',
  routerNitro = 'routerNitro',
  router = 'router',
  squid = 'squid',
}

export const DZAP_BRIDGES_CONFIG: {
  [x: number]: { bridges?: any }
} = {
  [CHAIN_IDS.ETH_MAINNET]: {
    bridges: {
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
          '0xd3f64BAa732061F8B3626ee44bab354f854877AC',
          '0xCf2DBA4e5C9f1B47AC09dc712A0F7bD8eE31A15d',
        ],
        selectorInfo: [],
      },
      [BRIDGES.xyFinance]: {
        address: [
          '0xFfB9faf89165585Ad4b25F81332Ead96986a2681',
          '0x4315f344a905dC21a08189A117eFd6E1fcA37D57',
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
          '0xf3f04555f8fda510bfc77820fd6eb8446f59e72d',
          '0x0654874eb7F59C6f5b39931FC45dC45337c967c3',
        ],
        selectorInfo: [],
      },
      [BRIDGES.omniBtc]: {
        address: ['0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820'],
        selectorInfo: [],
      },
      [BRIDGES.rango]: {
        address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
        selectorInfo: [],
      },
      [BRIDGES.symbiosis]: {
        address: [
          '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
          '0xfCEF2Fe72413b65d3F393d278A714caD87512bcd',
          '0xf621Fb08BBE51aF70e7E0F4EA63496894166Ff7F',
          '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
          '0x49d3Fc00f3ACf80FABCb42D7681667B20F60889A',
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
          '0xFc99f58A8974A4bc36e60E2d490Bb8D72899ee9f',
          '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
        ],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: [
          '0x6c45e28a76977a96e263f84f95912b47f927b687',
          '0xC21e4ebD1d92036Cb467b53fE3258F219d909Eb9',
        ],
        selectorInfo: [],
      },
      [BRIDGES.squid]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.POLYGON_MAINNET]: {
    bridges: {
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
        address: ['0xc57133521ffbd729cb81cc8ddc12d9e9f61e0f6a'],
        selectorInfo: [],
      },
      [BRIDGES.squid]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.BSC_MAINNET]: {
    bridges: {
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
          '0x880E0cE34F48c0cbC68BF3E745F17175BA8c650e',
          '0xa9c430de6a91132330A09BE41f9f19bf45702f74',
        ],
        selectorInfo: [],
      },
      [BRIDGES.xyFinance]: {
        address: [
          '0xDF921bc47aa6eCdB278f8C259D6a7Fef5702f1A9',
          '0x7D26F09d4e2d032Efa0729fC31a4c2Db8a2394b1',
        ],
        selectorInfo: [],
      },
      [BRIDGES.deBridge]: {
        address: [
          '0x663DC15D3C1aC63ff12E45Ab68FeA3F0a883C251',
          '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA',
          '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
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
        address: ['0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820'],
        selectorInfo: [],
      },
      [BRIDGES.rango]: {
        address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
        selectorInfo: [],
      },
      [BRIDGES.symbiosis]: {
        address: [
          '0x10ED43C718714eb63d5aA57B78B54704E256024E',
          '0x5c97D726bf5130AE15408cE32bc764e458320D2f',
          '0x44487a445a7595446309464a82244b4bd4e325d5',
          '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
          '0x44b5d0F16Ad55c4e7113310614745e8771b963bB',
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
          '0xFc99f58A8974A4bc36e60E2d490Bb8D72899ee9f',
          '0x2c34A2Fb1d0b4f55de51E1d0bDEfaDDce6b7cDD6',
        ],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: [
          '0x2F301d3b045544A9D7Ec3FA090CD78986F11f2E7',
          '0x260687eBC6C55DAdd578264260f9f6e968f7B2A5',
        ],
        selectorInfo: [],
      },
      [BRIDGES.squid]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.ARBITRUM_MAINNET]: {
    bridges: {
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
          '0x1C7F7e0258c81CF41bcEa31ea4bB5191914Bf7D7',
          '0xa9c430de6a91132330A09BE41f9f19bf45702f74',
        ],
        selectorInfo: [],
      },
      [BRIDGES.xyFinance]: {
        address: [
          '0x062b1Db694F6A437e3c028FC60dd6feA7444308c',
          '0x33383265290421C704c6b09F4BF27ce574DC4203',
        ],
        selectorInfo: [],
      },
      [BRIDGES.deBridge]: {
        address: [
          '0x663DC15D3C1aC63ff12E45Ab68FeA3F0a883C251',
          '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA',
          '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
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
          '0x8D18DFCeA276DC3f5d76270F9F544cb74b39c4Eb',
        ],
        selectorInfo: [],
      },
      [BRIDGES.rango]: {
        address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
        selectorInfo: [],
      },
      [BRIDGES.symbiosis]: {
        address: [
          '0xD01319f4b65b79124549dE409D36F25e04B3e551',
          '0x80ddDDa846e779cceE463bDC0BCc2Ae296feDaF9',
          '0xf7e96217347667064DEE8f20DB747B1C7df45DDe',
          '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
          '0xda8057acB94905eb6025120cB2c38415Fd81BfEB',
        ],
        selectorInfo: [],
      },
      [BRIDGES.telosBridge]: {
        address: ['0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76'],
        selectorInfo: [],
      },
      [BRIDGES.mesonFinance]: {
        address: ['0x25ab3efd52e6470681ce037cd546dc60726948d3'],
        selectorInfo: [],
      },
      [BRIDGES.okx]: {
        address: [
          '0xFc99f58A8974A4bc36e60E2d490Bb8D72899ee9f',
          '0x70cBb871E8f30Fc8Ce23609E9E0Ea87B6b222F58',
        ],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: ['0xCA94d8C245601B152C904f42fE788B4125f5b46B'],
        selectorInfo: [],
      },
      [BRIDGES.squid]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
      [BRIDGES.router]: {
        address: [
          '0x60b483D521b844e13E3337D304929D0519Bd50C8',
          '0xef300fb4243a0ff3b90c8ccfa1264d78182adaa4',
        ],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.OPTIMISM_MAINNET]: {
    bridges: {
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
          '0xad1D43efCF92133A9a0f33e5936F5ca10f2b012E',
          '0xa9c430de6a91132330A09BE41f9f19bf45702f74',
        ],
        selectorInfo: [],
      },
      [BRIDGES.xyFinance]: {
        address: [
          '0xad1D43efCF92133A9a0f33e5936F5ca10f2b012E',
          '0x7a6e01880693093abACcF442fcbED9E0435f1030',
        ],
        selectorInfo: [],
      },
      [BRIDGES.deBridge]: {
        address: [
          '0x663DC15D3C1aC63ff12E45Ab68FeA3F0a883C251',
          '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA',
          '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
        ],
        selectorInfo: [],
      },
      [BRIDGES.mayanFinance]: {
        address: ['0x0654874eb7F59C6f5b39931FC45dC45337c967c3'],
        selectorInfo: [],
      },
      [BRIDGES.omniBtc]: {
        address: [
          '0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820',
          '0xd600d94d0812f7EdfA47D0Cf02a767b1DD14A01B',
        ],
        selectorInfo: [],
      },
      [BRIDGES.rango]: {
        address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
        selectorInfo: [],
      },
      [BRIDGES.symbiosis]: {
        address: [
          '0x0f91052dc5B4baE53d0FeA5DAe561A117268f5d2',
          '0x200a0fe876421DC49A26508e3Efd0a1008fD12B5',
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
          '0xf332761c673b59B21fF6dfa8adA44d78c12dEF09',
          '0x68D6B739D2020067D1e2F713b999dA97E4d54812',
          '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
        ],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: ['0x5501A36b1313aC5d27e85418acd2AA4564f50b44'],
        selectorInfo: [],
      },
      [BRIDGES.squid]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.ZKSYNC_MAINNET]: {
    bridges: {
      [BRIDGES.lifi]: {
        address: ['0x341e94069f53234fE6DabeF707aD424830525715'],
        selectorInfo: [],
      },
      [BRIDGES.socket]: {
        address: ['0xaDdE7028e7ec226777e5dea5D53F6457C21ec7D6'],
        selectorInfo: [],
      },
      [BRIDGES.xyFinance]: {
        address: [
          '0x30E63157bD0bA74C814B786F6eA2ed9549507b46',
          '0xe4e156167cc9C7AC4AbD8d39d203a5495F775547',
        ],
        selectorInfo: [],
      },
      [BRIDGES.symbiosis]: {
        address: [
          '0x8B791913eB07C32779a16750e3868aA8495F5964',
          '0x38307CB291Af47Af9847c134a34E9477c939Ca28',
          '0x8cA239448AdD34b057D1CB5934F12AC899DB66e1',
          '0x51eE73BEC8521E88042b426F31864f456f2a866e',
          '0xe004DE550074856bD64Cc1A89A8B3b56bD3eAf31',
        ],
        selectorInfo: [],
      },
      [BRIDGES.mesonFinance]: {
        address: [
          '0x2DcC88Fa6b6950EE28245C3238B8993BE5feeA42',
          '0x4040bEC373F6e8be2F913324de94A7b9242E5E92',
        ],
        selectorInfo: [],
      },
      [BRIDGES.okx]: {
        address: [
          '0x4040bEC373F6e8be2F913324de94A7b9242E5E92',
          '0xc67879F4065d3B9fe1C09EE990B891Aa8E3a4c2f',
        ],
        selectorInfo: [],
      },
      [BRIDGES.rango]: {
        address: ['0x13598FD0986D0E33c402f6907F05Acf720224527'],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: ['0x7E7D4185D9c3C44D5266eD974493b24811398049'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.AVALANCHE_MAINNET]: {
    bridges: {
      [BRIDGES.lifi]: {
        address: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
        selectorInfo: [],
      },
      [BRIDGES.socket]: {
        address: ['0x3a23F943181408EAC424116Af7b7790c94Cb97a5'],
        selectorInfo: [],
      },
      [BRIDGES.unizen]: {
        address: [
          '0x1C7F7e0258c81CF41bcEa31ea4bB5191914Bf7D7',
          '0xa9c430de6a91132330A09BE41f9f19bf45702f74',
        ],
        selectorInfo: [],
      },
      [BRIDGES.xyFinance]: {
        address: [
          '0xa0c0F962DECD78D7CDE5707895603CBA74C02989',
          '0x2C86f0FF75673D489b7D72D9986929a2b0Ed596C',
        ],
        selectorInfo: [],
      },
      [BRIDGES.deBridge]: {
        address: [
          '0x663DC15D3C1aC63ff12E45Ab68FeA3F0a883C251',
          '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA',
          '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
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
        address: ['0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820'],
        selectorInfo: [],
      },
      [BRIDGES.rango]: {
        address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
        selectorInfo: [],
      },
      [BRIDGES.symbiosis]: {
        address: [
          '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
          '0x4cfA66497Fa84D739a0f785FBcEe9196f1C64e4a',
          '0x6F0f6393e45fE0E7215906B6f9cfeFf53EA139cf',
          '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
          '0xDc9a6a26209A450caC415fb78487e907c660cf6a',
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
          '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
          '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
        ],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: ['0x4406ebEb7028fc0fc06bB7706A736AC6ada8D2bF'],
        selectorInfo: [],
      },
      [BRIDGES.squid]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.BASE_MAINNET]: {
    bridges: {
      [BRIDGES.lifi]: {
        address: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
        selectorInfo: [],
      },
      [BRIDGES.socket]: {
        address: ['0x3a23F943181408EAC424116Af7b7790c94Cb97a5'],
        selectorInfo: [],
      },
      [BRIDGES.unizen]: {
        address: [
          '0x4F68248ecB782647D1E5981a181bBe1bfFee1040',
          '0xa9c430de6a91132330A09BE41f9f19bf45702f74',
        ],
        selectorInfo: [],
      },
      [BRIDGES.xyFinance]: {
        address: [
          '0x6aCd0Ec9405CcB701c57A88849C4F1CD85a3f3ab',
          '0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1',
        ],
        selectorInfo: [],
      },
      [BRIDGES.deBridge]: {
        address: [
          '0x663DC15D3C1aC63ff12E45Ab68FeA3F0a883C251',
          '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
          '0xc1656B63D9EEBa6d114f6bE19565177893e5bCBF',
        ],
        selectorInfo: [],
      },
      [BRIDGES.mayanFinance]: {
        address: ['0x0654874eb7F59C6f5b39931FC45dC45337c967c3'],
        selectorInfo: [],
      },
      [BRIDGES.symbiosis]: {
        address: [
          '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86',
          '0x41Ae964d0F61Bb5F5e253141A462aD6F3b625B92',
          '0x691df9C4561d95a4a726313089c8536dd682b946',
          '0x8097f0B9f06C27AF9579F75762F971D745bb222F',
          '0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9',
        ],
        selectorInfo: [],
      },
      [BRIDGES.mesonFinance]: {
        address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
        selectorInfo: [],
      },
      [BRIDGES.okx]: {
        address: [
          '0x5965851f21DAE82eA7C62f87fb7C57172E9F2adD',
          '0x57df6092665eb6058DE53939612413ff4B09114E',
        ],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: [
          '0x02D728B9C1513478a6b6de77a92648e1D8F801e7',
          '0x0Fa205c0446cD9EeDCc7538c9E24BC55AD08207f',
        ],
        selectorInfo: [],
      },
      [BRIDGES.squid]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
      [BRIDGES.omniBtc]: {
        address: ['0xd600d94d0812f7EdfA47D0Cf02a767b1DD14A01B'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.MANTA_MAINNET]: {
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
  },
  [CHAIN_IDS.SCROLL_MAINNET]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0x624FFe62eBa13e6057878bCA1D7A9E35651E1D9c',
          '0x49952ff32FcBc3408D447E1E91Da2b44BD2D1AFE',
          '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
          '0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9',
        ],
        selectorInfo: [],
      },
      [BRIDGES.mesonFinance]: {
        address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
        selectorInfo: [],
      },
      [BRIDGES.okx]: {
        address: [
          '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
          '0x57df6092665eb6058DE53939612413ff4B09114E',
        ],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: [
          '0x5546dA2bCdCFF39b187723434cDE10D4eE99C566',
          '0x01b4ce0d48ce91eb6bcaf5db33870c65d641b894',
        ],
        selectorInfo: [],
      },
      [BRIDGES.router]: {
        address: ['0x01b4ce0d48ce91eb6bcaf5db33870c65d641b894'],
        selectorInfo: [],
      },
      [BRIDGES.squid]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
      [BRIDGES.xyFinance]: {
        address: ['0x778C974568e376146dbC64fF12aD55B2d1c4133f'],
        selectorInfo: [],
      },
      [BRIDGES.omniBtc]: {
        address: ['0xd600d94d0812f7EdfA47D0Cf02a767b1DD14A01B'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.TELOS_MAINNET]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0x9b1adec00a25fffd87a5bb17f61916e1c26f6844',
          '0x4949e74094D6F9C06D68e5Ffe388f6542C4b1A34',
          '0x8097f0B9f06C27AF9579F75762F971D745bb222F',
          '0x5523985926aa12ba58dc5ad00ddca99678d7227e',
          '0xcB28fbE3E9C0FEA62E0E63ff3f232CECfE555aD4',
        ],
        selectorInfo: [],
      },
      [BRIDGES.telosBridge]: {
        address: ['0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.CORE_MAINNET]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0x4ddDD324F205e5989bAF8aD0FFCa41f4E5d9841D',
          '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
          '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
          '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
          '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
        ],
        selectorInfo: [],
      },
      [BRIDGES.mesonFinance]: {
        address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.ROOTSTOCK_MAINNET]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0x7057ab3fb2bee9c18e0cde4240de4ff7f159e365',
          '0x7057ab3fb2bee9c18e0cde4240de4ff7f159e365',
          '0xda8057acb94905eb6025120cb2c38415fd81bfeb',
          '0x01a3c8e513b758ebb011f7afaf6c37616c9c24d9',
        ],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: ['0xff13a7a12fd485bc9687ff88d8ae1a6b655ab469'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.GNOSIS_MAINNET]: {
    bridges: {
      [BRIDGES.rango]: {
        address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.KAVA_MAINNET]: {
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
    },
  },
  [CHAIN_IDS.BOBA_AVALANCHE]: {
    bridges: {
      [BRIDGES.rango]: {
        address: ['0xd9BdD77E9017C4727D3CdB87D91b7a0Fc7d63da4'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.BOBA_BNB]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
          '0x2cBABD7329b84e2c0A317702410E7c73D0e0246d',
          '0xd666ab407c8E77DB239F473a49E309514aa55e0C',
          '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
          '0xcB28fbE3E9C0FEA62E0E63ff3f232CECfE555aD4',
        ],
        selectorInfo: [],
      },
      [BRIDGES.rango]: {
        address: ['0xd9BdD77E9017C4727D3CdB87D91b7a0Fc7d63da4'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.BOBA_MAINNET]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
          '0xca506793A420E901BbCa8066be5661E3C52c84c2',
          '0xd92Ca299F1C2518E78E48C207b64591BA6E9b9a8',
          '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
          '0x506803495B1876FE1fA6Cd9dC65fB060057A4Cc3',
        ],
        selectorInfo: [],
      },
      [BRIDGES.rango]: {
        address: ['0xd9BdD77E9017C4727D3CdB87D91b7a0Fc7d63da4'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.LINEA_MAINNET]: {
    bridges: {
      [BRIDGES.deBridge]: {
        address: ['0xeF4fB24aD0916217251F553c0596F8Edc630EB66'],
        selectorInfo: [],
      },
      [BRIDGES.lifi]: {
        address: ['0xDE1E598b81620773454588B85D6b5D4eEC32573e'],
        selectorInfo: [],
      },
      [BRIDGES.mesonFinance]: {
        address: [
          '0x25aB3Efd52e6470681CE037cD546Dc60726948D3',
          '0x3335733c454805df6a77f825f266e136FB4a3333',
        ],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: ['0x6D6050Ca1dd8e4aAb9164B663d805104a3ECFC34'],
        selectorInfo: [],
      },
      [BRIDGES.xyFinance]: {
        address: ['0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1'],
        selectorInfo: [],
      },
      [BRIDGES.okx]: {
        address: [
          '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
          '0x57df6092665eb6058DE53939612413ff4B09114E',
        ],
        selectorInfo: [],
      },
      [BRIDGES.socket]: {
        address: ['0x3a23F943181408EAC424116Af7b7790c94Cb97a5'],
        selectorInfo: [],
      },
      [BRIDGES.squid]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
      [BRIDGES.symbiosis]: {
        address: [
          '0x9A31bAC4b3B958C835C243800B474818D04393dd',
          '0x83f71AabdDBb9F0E3B6462Cc7635b6fFAD0f2f2e',
          '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
          '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
        ],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.MANTLE_MAINNET]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0xDd0840118bF9CCCc6d67b2944ddDfbdb995955FD',
          '0xca506793A420E901BbCa8066be5661E3C52c84c2',
          '0xd92Ca299F1C2518E78E48C207b64591BA6E9b9a8',
          '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
          '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
        ],
        selectorInfo: [],
      },
      [BRIDGES.mesonFinance]: {
        address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: ['0xB6dc6C8b71e88642cEAD3be1025565A9eE74d1C6'],
        selectorInfo: [],
      },
      [BRIDGES.okx]: {
        address: [
          '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
          '0x57df6092665eb6058DE53939612413ff4B09114E',
        ],
        selectorInfo: [],
      },
      [BRIDGES.squid]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.METIS_MAINNET]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0xf85FC807D05d3Ab2309364226970aAc57b4e1ea4',
          '0xcd7C056b39DdFB568E451923ABEDb9B6a7Aeb885',
          '0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9',
          '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4',
        ],
        selectorInfo: [],
      },
      [BRIDGES.mesonFinance]: {
        address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: ['0x21c1E74CAaDf990E237920d5515955a024031109'],
        selectorInfo: [],
      },
      [BRIDGES.okx]: {
        address: [
          '0xa50FD06d2b099a4B06d54177C7d3AB08D3D3F004',
          '0x57df6092665eb6058DE53939612413ff4B09114E',
        ],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.MODE_MAINNET]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0x5D61c537393cf21893BE619E36fC94cd73C77DD3',
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
      [BRIDGES.routerNitro]: {
        address: ['0xf0773508c585246bd09bfb401aa18b72685b03f9'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.BLAST_MAINNET]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0x7057aB3fB2BeE9c18e0cDe4240DE4ff7f159E365',
          '0xa0079829B9F1Edc5DD0DE3eC104f281745C4bD81',
          '0xda8057acB94905eb6025120cB2c38415Fd81BfEB',
          '0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9',
        ],
        selectorInfo: [],
      },
      [BRIDGES.mesonFinance]: {
        address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
        selectorInfo: [],
      },
      [BRIDGES.routerNitro]: {
        address: ['0x01B4CE0d48Ce91eB6bcaf5dB33870C65d641b894'],
        selectorInfo: [],
      },
      [BRIDGES.okx]: {
        address: [
          '0xf956d9fa19656d8e5219fd6fa8ba6cb198094138',
          '0x5fD2Dc91FF1dE7FF4AEB1CACeF8E9911bAAECa68',
        ],
        selectorInfo: [],
      },
      [BRIDGES.squid]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.MERLIN_MAINNET]: {
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
  },
  [CHAIN_IDS.TAIKO_MAINNET]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0x7057aB3fB2BeE9c18e0cDe4240DE4ff7f159E365',
          '0xa0079829B9F1Edc5DD0DE3eC104f281745C4bD81',
          '0xda8057acB94905eb6025120cB2c38415Fd81BfEB',
          '0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9',
        ],
        selectorInfo: [],
      },
      [BRIDGES.mesonFinance]: {
        address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.ZETACHAIN_MAINNET]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0x01A3c8E513B758EBB011F7AFaf6C37616c9C24d9',
          '0xcB341279c0A071bfC14e69450Add47c568c4ddAC',
          '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4',
          '0xd8db4fb1fEf63045A443202d506Bcf30ef404160',
        ],
        selectorInfo: [],
      },
      [BRIDGES.mesonFinance]: {
        address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.CRONOS_MAINNET]: {
    bridges: {
      [BRIDGES.symbiosis]: {
        address: [
          '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
          '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278',
          '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
          '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
        ],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.BOB_MAINNET]: {
    bridges: {
      [BRIDGES.mesonFinance]: {
        address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.BEVM_MAINNET]: {
    bridges: {
      [BRIDGES.mesonFinance]: {
        address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.OPBNB_MAINNET]: {
    bridges: {
      [BRIDGES.mesonFinance]: {
        address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.HECO_MAINNET]: {
    bridges: {
      [BRIDGES.rango]: {
        address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.FANTOM_MAINNET]: {
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
  },
  [CHAIN_IDS.OKX_MAINNET]: {
    bridges: {
      [BRIDGES.okx]: {
        address: [
          '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
          '0x70cBb871E8f30Fc8Ce23609E9E0Ea87B6b222F58',
        ],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.CONFLUX_E_SPACE_MAINNET]: {
    bridges: {},
  },
  [CHAIN_IDS.POLYGON_ZK_EVM_MAINNET]: {
    bridges: {
      [BRIDGES.routerNitro]: {
        address: ['0x6a0fd5577c540e16a3a49c40b51e0880a2a528ce'],
        selectorInfo: [],
      },
      [BRIDGES.okx]: {
        address: [
          '0x5965851f21DAE82eA7C62f87fb7C57172E9F2adD',
          '0x57df6092665eb6058DE53939612413ff4B09114E',
        ],
        selectorInfo: [],
      },
      [BRIDGES.rango]: {
        address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.X_LAYER_MAINNET]: {
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
      [BRIDGES.xyFinance]: {
        address: ['0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.AURORA_MAINNET]: {
    bridges: {
      [BRIDGES.routerNitro]: {
        address: ['0x7BD616192fB2B364f9d29B2026165281a5f2ff2F'],
        selectorInfo: [],
      },
      [BRIDGES.rango]: {
        address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.SAAKURU_MAINNET]: {
    bridges: {
      [BRIDGES.routerNitro]: {
        address: ['0x3BcEe7629Fce3b54783bE5e9305119a12bC2C770'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.MOONBEAM_MAINNET]: {
    bridges: {
      [BRIDGES.routerNitro]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
      [BRIDGES.rango]: {
        address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.MOONRIVER]: {
    bridges: {
      [BRIDGES.rango]: {
        address: ['0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.CLEO_MAINNET]: {
    bridges: {
      [BRIDGES.routerNitro]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
    },
  },
  [CHAIN_IDS.FILECOIN_MAINNET]: {
    bridges: {
      [BRIDGES.routerNitro]: {
        address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
        selectorInfo: [],
      },
    },
  },
}
