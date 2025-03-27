import { BRIDGES } from '../bridgeNames'

export const ETH_MAINNET = {
  bridges: {
    [BRIDGES.across]: {
      address: ['0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5'],
    },
    [BRIDGES.allbridge]: {
      address: [
        '0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5',
        '0x609c690e8F7D68a59885c9132e812eEbDaAf0c9e',
      ],
    },
    [BRIDGES.celer]: {
      address: [
        '0x6065A982F04F759b7d2D042D2864e569fad84214',
        '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
      ],
    },
    [BRIDGES.comet]: {
      address: ['0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846'],
    },
    [BRIDGES.deBridge]: {
      address: [
        '0x663DC15D3C1aC63ff12E45Ab68FeA3F0a883C251',
        '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
        '0x43dE2d77BF8027e25dBD179B491e8d64f38398aA',
      ],
    },
    [BRIDGES.hop]: {
      address: [
        '0xb8901acB165ed027E32754E0FFe830802919727f',
        '0x7e77461CA2a9d82d26FD5e0Da2243BF72eA45747',
        '0x3E4a3a4796d16c0Cd582C382691998f7c06420B6',
      ],
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
    [BRIDGES.mayanFinance]: {
      address: [
        '0xf3f04555f8fda510bfc77820fd6eb8446f59e72d',
        '0x0654874eb7F59C6f5b39931FC45dC45337c967c3',
      ],
    },
    [BRIDGES.mesonFinance]: {
      address: ['0x25aB3Efd52e6470681CE037cD546Dc60726948D3'],
    },
    [BRIDGES.okx]: {
      address: [
        '0xFc99f58A8974A4bc36e60E2d490Bb8D72899ee9f',
        '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
      ],
    },
    [BRIDGES.omniBtc]: {
      address: ['0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820'],
    },
    [BRIDGES.optimismBridge]: {
      address: ['0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1'],
    },
    [BRIDGES.orbiter]: {
      address: ['0xC741900276CD598060b0FE6594FbE977392928f4'],
    },
    [BRIDGES.owlto]: {
      address: ['0x0e83DEd9f80e1C92549615D96842F5cB64A08762'],
    },
    [BRIDGES.rango]: {
      address: [
        '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
        '0x6bfad42cfc4efc96f529d786d643ff4a8b89fa52', // rainbow bridge through rango
      ],
    },
    [BRIDGES.relayLink]: {
      address: ['0xaaaaaaae92Cc1cEeF79a038017889fDd26D23D4d'],
    },
    [BRIDGES.router]: {
      address: ['0xBC5D5fB38227c8DA51FAD6f5F5AC6652585B6cBc'],
    },
    [BRIDGES.routerNitro]: {
      address: [
        '0x6c45e28a76977a96e263f84f95912b47f927b687',
        '0xC21e4ebD1d92036Cb467b53fE3258F219d909Eb9',
        '0xfB375Cdfb975381731be52c05e8e695C8253c319',
        '0x35101b9DeCace6324aaDf65867d695D175c71D59',
        '0xd87Fff92728792F6dFFA5A915Bd4F7BE1A5bb45E',
        '0xBC5D5fB38227c8DA51FAD6f5F5AC6652585B6cBc',
      ],
    },
    [BRIDGES.socket]: {
      address: ['0x3a23F943181408EAC424116Af7b7790c94Cb97a5'],
    },
    [BRIDGES.squid]: {
      address: ['0xce16F69375520ab01377ce7B88f5BA8C48F8D666'],
    },
    [BRIDGES.stargate]: {
      address: [
        '0x77b2043768d28E9C9aB44E1aBfC95944bcE57931',
        '0x268Ca24DAefF1FaC2ed883c598200CcbB79E931D',
        '0xcDafB1b2dB43f366E48e6F614b8DCCBFeeFEEcD3',
        '0x77b2043768d28E9C9aB44E1aBfC95944bcE57931',
      ],
    },
    [BRIDGES.swing]: {
      address: [
        '0x885E415D0836727F8757BfFC093E9728B1Aaf60f',
        '0x800589bDafE1Fd3C47d545b7012B471e7DFbD0a7',
        '0xF5027600efEA7491515056866fa1F0303f6C8d09',
        '0x967EC03DFfdfB4A22C8C4B811B17ac135082fBdc',
      ],
    },
    [BRIDGES.symbiosis]: {
      address: [
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        '0xfCEF2Fe72413b65d3F393d278A714caD87512bcd',
        '0xf621Fb08BBE51aF70e7E0F4EA63496894166Ff7F',
        '0x5523985926Aa12BA58DC5Ad00DDca99678D7227E',
        '0x49d3Fc00f3ACf80FABCb42D7681667B20F60889A',
      ],
    },
    [BRIDGES.synapse]: {
      address: [
        '0x7E7A0e201FD38d3ADAA9523Da6C109a07118C96a',
        '0xd5a597d6e7ddf373a92C8f477DAAA673b0902F48',
        '0x00cD000000003f7F682BE4813200893d4e690000',
      ],
    },
    [BRIDGES.teleSwap]: {
      address: ['0xFA1B28052Bd8087B1CF64eE9429FEB324e95B0ff'],
    },
    [BRIDGES.telosBridge]: {
      address: ['0x9c5ebCbE531aA81bD82013aBF97401f5C6111d76'],
    },
    [BRIDGES.unizen]: {
      address: [
        '0xd3f64BAa732061F8B3626ee44bab354f854877AC',
        '0xCf2DBA4e5C9f1B47AC09dc712A0F7bD8eE31A15d',
      ],
    },
    [BRIDGES.wanBridge]: {
      address: [
        '0x88888dd82A91f0406ED42BF750bAF881e64894F6',
        '0x940f7994921a292A5062dc81C65511FDa79f4Bc9',
        '0xeC0D8Cfd081ccce2D6Ed4E3dd8f248D3cAa3d24B',
      ],
    },
    [BRIDGES.xyFinance]: {
      address: [
        '0xFfB9faf89165585Ad4b25F81332Ead96986a2681',
        '0x4315f344a905dC21a08189A117eFd6E1fcA37D57',
        '0xCF446713DDf0E83F7527A260047f8Ae89eFaE3e5',
      ],
    },
  },
}
