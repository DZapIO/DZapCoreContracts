import { DexConfig } from '../../types'
import { CHAIN_IDS } from '../networks'

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
import { METIS_DEXES } from './dexes/metis'
import { MODE_DEXES } from './dexes/mode'
import { CELO_DEXES } from './dexes/celo'
import { FANTOM_DEXES } from './dexes/fantom'
import { MERLIN_DEXES } from './dexes/merlin'
import { CRONOS_DEXES } from './dexes/cronos'
import { POLYGON_ZK_EVM_DEXES } from './dexes/polygonZkEvm'
import { OP_BNB_DEXES } from './dexes/opBnb'
import { OKX_DEXES } from './dexes/okx'
import { CONFLUX_DEXES } from './dexes/conflux'
import { TAIKO_DEXES } from './dexes/taiko'
import { X_LAYER_DEXES } from './dexes/xLayer'
import { ZETACHAIN_DEXES } from './dexes/zetachain'
import { AURORA_DEXES } from './dexes/aurora'
import { SAAKURU_DEXES } from './dexes/saakuru'
import { GNOSIS_DEXES } from './dexes/gnosis'
import { MOONBEAM_DEXES } from './dexes/moonbeam'
import { MOONRIVER_DEXES } from './dexes/moonriver'
import { SONEIUM_DEXES } from './dexes/soneium'
import { STORY_DEXES } from './dexes/story'
import { INK_DEXES } from './dexes/ink'
import { FLARE_DEXES } from './dexes/flare'
import { BITLAYER_DEXES } from './dexes/bitlayer'
import { HEMI_DEXES } from './dexes/hemi'
import { SEI_DEXES } from './dexes/sei'
import { MORPH_DEXES } from './dexes/morph'

export const DZAP_DEXES_CONFIG: {
  [x in CHAIN_IDS]?: DexConfig
} = {
  [CHAIN_IDS.ARBITRUM_MAINNET]: ARBITRUM_DEXES,
  [CHAIN_IDS.AVALANCHE_MAINNET]: AVALANCHE_DEXES,
  [CHAIN_IDS.AURORA_MAINNET]: AURORA_DEXES,
  [CHAIN_IDS.BASE_MAINNET]: BASE_DEXES,
  [CHAIN_IDS.BERACHAIN_MAINNET]: BERACHAIN_DEXES,
  [CHAIN_IDS.BITLAYER]: BITLAYER_DEXES,
  [CHAIN_IDS.BLAST_MAINNET]: BLAST_DEXES,
  [CHAIN_IDS.BOBA_ETH]: BOBA_ETH_DEXES,
  [CHAIN_IDS.BSC_MAINNET]: BSC_DEXES,
  [CHAIN_IDS.CELO_MAINNET]: CELO_DEXES,
  [CHAIN_IDS.CONFLUX_E_SPACE_MAINNET]: CONFLUX_DEXES,
  [CHAIN_IDS.CORE_MAINNET]: CORE_DEXES,
  [CHAIN_IDS.CRONOS_MAINNET]: CRONOS_DEXES,
  [CHAIN_IDS.ETH_MAINNET]: ETH_DEXES,
  [CHAIN_IDS.FANTOM_MAINNET]: FANTOM_DEXES,
  [CHAIN_IDS.FLARE]: FLARE_DEXES,
  [CHAIN_IDS.FRAXTAL]: FRAXTAL_DEXES,
  [CHAIN_IDS.FUSE]: FUSE_DEXES,
  [CHAIN_IDS.GNOSIS_MAINNET]: GNOSIS_DEXES,
  [CHAIN_IDS.GRAVITY]: GRAVITY_DEXES,
  [CHAIN_IDS.HEMI]: HEMI_DEXES,
  [CHAIN_IDS.INK]: INK_DEXES,
  [CHAIN_IDS.KAVA_MAINNET]: KAVA_DEXES,
  [CHAIN_IDS.KROMA]: KROMA_DEXES,
  [CHAIN_IDS.LINEA_MAINNET]: LINEA_DEXES,
  [CHAIN_IDS.MANTA_MAINNET]: MANTA_DEXES,
  [CHAIN_IDS.MANTLE_MAINNET]: MANTLE_DEXES,
  [CHAIN_IDS.MERLIN_MAINNET]: MERLIN_DEXES,
  [CHAIN_IDS.METIS_MAINNET]: METIS_DEXES,
  [CHAIN_IDS.MINT]: MINT_DEXES,
  [CHAIN_IDS.MODE_MAINNET]: MODE_DEXES,
  [CHAIN_IDS.MOONBEAM_MAINNET]: MOONBEAM_DEXES,
  [CHAIN_IDS.MOONRIVER]: MOONRIVER_DEXES,
  [CHAIN_IDS.MORPH]: MORPH_DEXES,
  [CHAIN_IDS.OKX_MAINNET]: OKX_DEXES,
  [CHAIN_IDS.OPBNB_MAINNET]: OP_BNB_DEXES,
  [CHAIN_IDS.OPTIMISM_MAINNET]: OPTIMISM_DEXES,
  [CHAIN_IDS.POLYGON_MAINNET]: POLYGON_DEXES,
  [CHAIN_IDS.POLYGON_ZK_EVM_MAINNET]: POLYGON_ZK_EVM_DEXES,
  [CHAIN_IDS.ROOTSTOCK_MAINNET]: ROOTSTOCK_DEXES,
  [CHAIN_IDS.SAAKURU_MAINNET]: SAAKURU_DEXES,
  [CHAIN_IDS.SCROLL_MAINNET]: SCROLL_DEXES,
  [CHAIN_IDS.SEI_EVM_MAINNET]: SEI_DEXES,
  [CHAIN_IDS.SONIC_MAINNET]: SONIC_DEXES,
  [CHAIN_IDS.SONEIUM_MAINNET]: SONEIUM_DEXES,
  [CHAIN_IDS.STORY]: STORY_DEXES,
  [CHAIN_IDS.TAIKO_MAINNET]: TAIKO_DEXES,
  [CHAIN_IDS.TELOS_MAINNET]: TELOS_DEXES,
  [CHAIN_IDS.X_LAYER_MAINNET]: X_LAYER_DEXES,
  [CHAIN_IDS.ZETACHAIN_MAINNET]: ZETACHAIN_DEXES,
  [CHAIN_IDS.ZKSYNC_MAINNET]: ZKSYNC_DEXES,
}
