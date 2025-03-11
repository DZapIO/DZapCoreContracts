import { DexConfig } from '../../types'
import { CHAIN_IDS } from '../networks'
import { DEXES } from './dexNames'

import { ARBITRUM_DEXES } from './dexes/arbitrum'
import { AVALANCHE_DEXES } from './dexes/avalanche'
import { BASE_DEXES } from './dexes/base'
import { BLAST_DEXES } from './dexes/blast'
import { BOBA_ETH_DEXES } from './dexes/bobaEth'
import { BSC_DEXES } from './dexes/bsc'
import { CORE_DEXES } from './dexes/core'
import { ETH_DEXES } from './dexes/ethereum'
import { MANTLE_DEXES } from './dexes/mantle'
import { FRAXTAL_DEXES } from './dexes/fraxtal'
import { FUSE_DEXES } from './dexes/fuse'
import { GRAVITY_DEXES } from './dexes/gravity'
import { KAVA_DEXES } from './dexes/kava'
import { KROMA_DEXES } from './dexes/kroma'
import { LINEA_DEXES } from './dexes/linea'
import { MANTA_DEXES } from './dexes/manta'
import { MINT_DEXES } from './dexes/mint'
import { OPTIMISM_DEXES } from './dexes/optimism'
import { POLYGON_DEXES } from './dexes/polygon'
import { ROOTSTOCK_DEXES } from './dexes/rootstock'
import { SCROLL_DEXES } from './dexes/scroll'
import { SONIC_DEXES } from './dexes/sonic'
import { TELOS_DEXES } from './dexes/telos'
import { ZKSYNC_DEXES } from './dexes/zksync'
import { BERACHAIN_DEXES } from './dexes/berachain'

export const DZAP_DEXES_CONFIG: {
  [x in CHAIN_IDS]?: DexConfig
} = {
  [CHAIN_IDS.ARBITRUM_MAINNET]: ARBITRUM_DEXES,
  [CHAIN_IDS.AVALANCHE_MAINNET]: AVALANCHE_DEXES,
  [CHAIN_IDS.BASE_MAINNET]: BASE_DEXES,
  [CHAIN_IDS.BERACHAIN_MAINNET]: BERACHAIN_DEXES,
  [CHAIN_IDS.BLAST_MAINNET]: BLAST_DEXES,
  [CHAIN_IDS.BOBA_ETH]: BOBA_ETH_DEXES,
  [CHAIN_IDS.BSC_MAINNET]: BSC_DEXES,
  [CHAIN_IDS.CORE_MAINNET]: CORE_DEXES,
  [CHAIN_IDS.ETH_MAINNET]: ETH_DEXES,
  [CHAIN_IDS.FRAXTAL]: FRAXTAL_DEXES,
  [CHAIN_IDS.FUSE]: FUSE_DEXES,
  [CHAIN_IDS.GRAVITY]: GRAVITY_DEXES,
  [CHAIN_IDS.KAVA_MAINNET]: KAVA_DEXES,
  [CHAIN_IDS.KROMA]: KROMA_DEXES,
  [CHAIN_IDS.LINEA_MAINNET]: LINEA_DEXES,
  [CHAIN_IDS.MANTA_MAINNET]: MANTA_DEXES,
  [CHAIN_IDS.MANTLE_MAINNET]: MANTLE_DEXES,
  [CHAIN_IDS.MINT]: MINT_DEXES,
  [CHAIN_IDS.OPTIMISM_MAINNET]: OPTIMISM_DEXES,
  [CHAIN_IDS.POLYGON_MAINNET]: POLYGON_DEXES,
  [CHAIN_IDS.ROOTSTOCK_MAINNET]: ROOTSTOCK_DEXES,
  [CHAIN_IDS.SCROLL_MAINNET]: SCROLL_DEXES,
  [CHAIN_IDS.SONIC_MAINNET]: SONIC_DEXES,
  [CHAIN_IDS.TELOS_MAINNET]: TELOS_DEXES,
  [CHAIN_IDS.ZKSYNC_MAINNET]: ZKSYNC_DEXES,
  [CHAIN_IDS.METIS_MAINNET]: {
    dexes: {
      [DEXES.lifi]: ['0x24ca98fB6972F5eE05f0dB00595c7f68D9FaFd68'],
      [DEXES.magpiefi]: ['0x2b14763c27B9661182c2503f6C9C4d47BA747Dd2'],
      [DEXES.okx]: [
        '0x6b2C0c7be2048Daa9b5527982C29f48062B34D58',
        '0x57df6092665eb6058DE53939612413ff4B09114E',
      ],
      [DEXES.routerNitro]: ['0x21c1E74CAaDf990E237920d5515955a024031109'],
      [DEXES.sushi]: [
        '0xf2614A233c7C3e7f08b1F887Ba133a13f1eb2c55',
        '0xc55332b1d758e798a8dB1f255B029f045C4958b7',
        '0x85CD07Ea01423b1E937929B44E4Ad8c40BbB5E71',
      ],
      [DEXES.openOcean]: ['0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'],
    },
  },
  [CHAIN_IDS.MODE_MAINNET]: {
    dexes: {
      [DEXES.bebop]: [
        '0xbeb0b0623f66bE8cE162EbDfA2ec543A522F4ea6',
        '0xC5a350853E4e36b73EB0C24aaA4b8816C9A3579a',
      ],
      [DEXES.izumi]: ['0x3EF68D3f7664b2805D4E88381b64868a56f88bC4'],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.odos]: ['0x7E15EB462cdc67Cf92Af1f7102465a8F8c784874'],
      [DEXES.openOcean]: ['0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'],
      [DEXES.routerNitro]: ['0xf0773508c585246bd09bfb401aa18b72685b03f9'],
      [DEXES.sushi]: ['0x85CD07Ea01423b1E937929B44E4Ad8c40BbB5E71'],
      [DEXES.zeroX]: [
        '0xa601B541f17FB6Bf8db1628E8F3d113b4336434c',
        '0x5B45200D00BCb0850C56FaB3BCB32a2cc78B289d',
        '0x0000000000001ff3684f28c67538d4d072c22734',
      ],
    },
  },
  [CHAIN_IDS.MERLIN_MAINNET]: {
    dexes: {
      [DEXES.okx]: [
        '0x127a986cE31AA2ea8E1a6a0F0D5b7E5dbaD7b0bE',
        '0x8b773D83bc66Be128c60e07E17C8901f7a64F000',
      ],
    },
  },
  [CHAIN_IDS.CRONOS_MAINNET]: {
    dexes: {
      [DEXES.sushi]: [
        '0xf2614A233c7C3e7f08b1F887Ba133a13f1eb2c55',
        '0x85CD07Ea01423b1E937929B44E4Ad8c40BbB5E71',
      ],
      [DEXES.okx]: [
        '0xf332761c673b59B21fF6dfa8adA44d78c12dEF09',
        '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
      ],
      [DEXES.openOcean]: ['0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'],
    },
  },
  [CHAIN_IDS.OPBNB_MAINNET]: {
    dexes: {
      [DEXES.izumi]: ['0x02F55D53DcE23B4AA962CC68b0f685f26143Bdb2'],
    },
  },
  [CHAIN_IDS.FANTOM_MAINNET]: {
    dexes: {
      [DEXES.kyber]: ['0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.magpiefi]: ['0x2b14763c27B9661182c2503f6C9C4d47BA747Dd2'],
      [DEXES.odos]: ['0xD0c22A5435F4E8E5770C1fAFb5374015FC12F7cD'],
      [DEXES.okx]: [
        '0xf332761c673b59B21fF6dfa8adA44d78c12dEF09',
        '0x70cBb871E8f30Fc8Ce23609E9E0Ea87B6b222F58',
      ],
      [DEXES.openOcean]: ['0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'],
      [DEXES.paraswap]: [
        '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
        '0x216b4b4ba9f3e719726886d34a177484278bfcae',
      ],
      [DEXES.paraswapV6]: ['0x6a000f20005980200259b80c5102003040001068'],
      [DEXES.sushi]: [
        '0xf2614A233c7C3e7f08b1F887Ba133a13f1eb2c55',
        '0x85CD07Ea01423b1E937929B44E4Ad8c40BbB5E71',
      ],
      [DEXES.zeroX]: ['0xDEF189DeAEF76E379df891899eb5A00a94cBC250'],
    },
  },
  [CHAIN_IDS.OKX_MAINNET]: {
    dexes: {
      [DEXES.okx]: [
        '0xf6Aab105CB9e66e03CAD2c2F3f8558242593385c',
        '0x70cBb871E8f30Fc8Ce23609E9E0Ea87B6b222F58',
      ],
    },
  },
  [CHAIN_IDS.CONFLUX_E_SPACE_MAINNET]: {
    dexes: {
      [DEXES.okx]: [
        '0x0112bc6fDB78345e612B862a6B388FfeB00E2320',
        '0x68D6B739D2020067D1e2F713b999dA97E4d54812',
      ],
    },
  },
  [CHAIN_IDS.POLYGON_ZK_EVM_MAINNET]: {
    dexes: {
      [DEXES.kyber]: ['0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.magpiefi]: ['0xCf32c5bB41F7A302298a2D2072155800871BaaD3'],
      [DEXES.okx]: [
        '0x6b2C0c7be2048Daa9b5527982C29f48062B34D58',
        '0x57df6092665eb6058DE53939612413ff4B09114E',
      ],
      [DEXES.paraswapV6]: ['0x6a000f20005980200259b80c5102003040001068'],
      [DEXES.paraswap]: [
        '0xB83B554730d29cE4Cb55BB42206c3E2c03E4A40A',
        '0xc8a21fcd5a100c3ecc037c97e2f9c53a8d3a02a1',
      ],
      [DEXES.routerNitro]: ['0x6a0fd5577c540e16a3a49c40b51e0880a2a528ce'],
      [DEXES.sushi]: [
        '0xf2614A233c7C3e7f08b1F887Ba133a13f1eb2c55',
        '0xc55332b1d758e798a8dB1f255B029f045C4958b7',
        '0x85CD07Ea01423b1E937929B44E4Ad8c40BbB5E71',
      ],
      [DEXES.openOcean]: ['0x6dd434082EAB5Cd134B33719ec1FF05fE985B97b'],
      [DEXES.xyFinance]: ['0x218Ef86b88765df568E9D7d7Fd34B5Dc88098080'],
    },
  },
  [CHAIN_IDS.TAIKO_MAINNET]: {
    dexes: {
      [DEXES.bebop]: [
        '0xbebebeb035351f58602e0c1c8b59ecbff5d5f47b',
        '0xbbbbbBB520d69a9775E85b458C58c648259FAD5F',
        '0xfE96910cF84318d1B8a5e2a6962774711467C0be',
        '0xbeb0b0623f66bE8cE162EbDfA2ec543A522F4ea6',
        '0xC5a350853E4e36b73EB0C24aaA4b8816C9A3579a',
      ],
      [DEXES.iceCreamSwap]: ['0x16A3247Db4588176c24C6A5F6d3fd2C174122DF5'],
      [DEXES.izumi]: ['0x04830cfCED9772b8ACbAF76Cfc7A630Ad82c9148'],
      [DEXES.magpiefi]: ['0x2b14763c27B9661182c2503f6C9C4d47BA747Dd2'],
      [DEXES.router]: ['0x7BD616192fB2B364f9d29B2026165281a5f2ff2F'],
      [DEXES.sushi]: ['0x85CD07Ea01423b1E937929B44E4Ad8c40BbB5E71'],
      [DEXES.xyFinance]: ['0xedC061306A79257f15108200C5B82ACc874C239d'],
    },
  },
  [CHAIN_IDS.X_LAYER_MAINNET]: {
    dexes: {
      [DEXES.izumi]: ['0xd7de110Bd452AAB96608ac3750c3730A17993DE0'],
      [DEXES.okx]: [
        '0x127a986cE31AA2ea8E1a6a0F0D5b7E5dbaD7b0bE',
        '0x8b773D83bc66Be128c60e07E17C8901f7a64F000',
      ],
      [DEXES.sushi]: ['0xCF446713DDf0E83F7527A260047f8Ae89eFaE3e5'],
      [DEXES.xyFinance]: ['0x6A816cEE105a9409D8df0A83d8eeaeD9EB4309fE'],
      [DEXES.kyber]: ['0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'],
    },
  },
  [CHAIN_IDS.ZETACHAIN_MAINNET]: {
    dexes: {
      [DEXES.izumi]: ['0x34bc1b87f60e0a30c0e24FD7Abada70436c71406'],
      [DEXES.okx]: [
        '0x03B5ACdA01207824cc7Bc21783Ee5aa2B8d1D2fE',
        '0x0DaB5A5294AfAae76Ce990993fC10b896A01DBd1',
      ],
      [DEXES.sushi]: [
        '0xf2614A233c7C3e7f08b1F887Ba133a13f1eb2c55',
        '0xc55332b1d758e798a8dB1f255B029f045C4958b7',
        '0x85CD07Ea01423b1E937929B44E4Ad8c40BbB5E71',
      ],
    },
  },
  [CHAIN_IDS.AURORA_MAINNET]: {
    dexes: {
      [DEXES.dodo]: [
        '0x335aC99bb3E51BDbF22025f092Ebc1Cf2c5cC619',
        '0x7449Cd63C2b1A06C36945eD83f0626D303781B6E',
        '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
      ],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.openOcean]: ['0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'],
      [DEXES.synapse]: ['0x7E7A0e201FD38d3ADAA9523Da6C109a07118C96a'],
    },
  },
  [CHAIN_IDS.SAAKURU_MAINNET]: {
    dexes: {
      [DEXES.routerNitro]: ['0x3BcEe7629Fce3b54783bE5e9305119a12bC2C770'],
    },
  },
  [CHAIN_IDS.GNOSIS_MAINNET]: {
    dexes: {
      [DEXES.enso]: ['0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E'],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.openOcean]: ['0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'],
      [DEXES.sushi]: [
        '0xf2614A233c7C3e7f08b1F887Ba133a13f1eb2c55',
        '0xc55332b1d758e798a8dB1f255B029f045C4958b7',
        '0x85CD07Ea01423b1E937929B44E4Ad8c40BbB5E71',
      ],
    },
  },
  [CHAIN_IDS.MOONBEAM_MAINNET]: {
    dexes: {
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.sushi]: [
        '0xf2614A233c7C3e7f08b1F887Ba133a13f1eb2c55',
        '0x85CD07Ea01423b1E937929B44E4Ad8c40BbB5E71',
      ],
    },
  },
  [CHAIN_IDS.CELO_MAINNET]: {
    dexes: {
      [DEXES.zeroX]: ['0xdef1c0ded9bec7f1a1670819833240f027b25eff'],
      [DEXES.openOcean]: ['0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'],
      [DEXES.sushi]: [
        '0xf2614A233c7C3e7f08b1F887Ba133a13f1eb2c55',
        '0x85CD07Ea01423b1E937929B44E4Ad8c40BbB5E71',
      ],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      // [DEXES.uniswap]: ['0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'],
    },
  },
}
