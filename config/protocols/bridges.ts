import { CHAIN_IDS } from '../networks'

import { ARBITRUM_MAINNET } from './bridges/arbitrum'
import { AURORA_MAINNET } from './bridges/aurora'
import { AVALANCHE_MAINNET } from './bridges/avalanche'
import { BASE_MAINNET } from './bridges/base'
import { BLAST_MAINNET } from './bridges/blast'
import { BOB_MAINNET } from './bridges/bob'
import { BEVM_MAINNET } from './bridges/bev'
import { BOBA_AVALANCHE } from './bridges/bobaAvalanche'
import { BOBA_BNB } from './bridges/bobaBnb'
import { BOBA_ETH } from './bridges/bobaEth'
import { BSC_MAINNET } from './bridges/bsc'
import { CELO_MAINNET } from './bridges/celo'
import { CONFLUX_E_SPACE_MAINNET } from './bridges/conflux'
import { CORE_MAINNET } from './bridges/core'
import { CRONOS_MAINNET } from './bridges/cronos'
import { ETH_MAINNET } from './bridges/ethereum'
import { FANTOM_MAINNET } from './bridges/fantom'
import { FILECOIN_MAINNET } from './bridges/filecoin'
import { GNOSIS_MAINNET } from './bridges/gnosis'
import { HECO_MAINNET } from './bridges/heco'
import { KAVA_MAINNET } from './bridges/kava'
import { LINEA_MAINNET } from './bridges/linea'
import { LISK_MAINNET } from './bridges/lisk'
import { MANTA_MAINNET } from './bridges/manta'
import { MANTLE_MAINNET } from './bridges/mantle'
import { METIS_MAINNET } from './bridges/metis'
import { MODE_MAINNET } from './bridges/mode'
import { MERLIN_MAINNET } from './bridges/merlin'
import { MOONBEAM_MAINNET } from './bridges/moonbeam'
import { MOONRIVER_BRIDGES } from './bridges/moonriver'
import { OKX_MAINNET } from './bridges/okx'
import { OPBNB_MAINNET } from './bridges/opbnb'
import { OPTIMISM_MAINNET } from './bridges/optimism'
import { POLYGON_MAINNET } from './bridges/polygon'
import { POLYGON_ZK_EVM_MAINNET } from './bridges/polygonZkEvm'
import { ROOTSTOCK_MAINNET } from './bridges/rootstock'
import { SCROLL_MAINNET } from './bridges/scroll'
import { TELOS_MAINNET } from './bridges/telos'
import { TAIKO_MAINNET } from './bridges/taiko'
import { SAAKURU_MAINNET } from './bridges/saakuru'
import { XLAYER_MAINNET } from './bridges/xlayer'
import { ZETACHAIN_MAINNET } from './bridges/zetachain'
import { ZKSYNC_MAINNET } from './bridges/zksync'
import { FRAXTAL } from './bridges/fraxtal'
import { GRAVITY } from './bridges/gravity'
import { KROMA } from './bridges/kroma'
import { MINT } from './bridges/mint'
import { ARTHERA } from './bridges/arthera'
import { FUSE } from './bridges/fuse'
import { FIRE_MAINNET } from './bridges/fire'
import { BridgeConfig } from '../../types'
import { SONIC_BRIDGES } from './bridges/sonic'
import { BERACHAIN_BRIDGES } from './bridges/berachain'
import { MORPH_BRIDGES } from './bridges/morph'
import { SONEIUM_BRIDGES } from './bridges/soneium'
import { STORY_BRIDGES } from './bridges/story'
import { INK_BRIDGES } from './bridges/ink'
import { FLARE_BRIDGES } from './bridges/flare'
import { BITLAYER_BRIDGES } from './bridges/bitlayer'
import { HEMI_BRIDGES } from './bridges/hemi'
import { SEI_BRIDGES } from './bridges/sei'
import { WORLDCHAIN_BRIDGES } from './bridges/worldChain'
import { KAIA_BRIDGES } from './bridges/kaia'
import { ZKFAIR_BRIDGES } from './bridges/zkFair'
import { APE_CHAIN_BRIDGES } from './bridges/apeChain'
import { IMMUTABLE_ZK_EVM_BRIDGES } from './bridges/immutableZkEvm'
import { UNICHAIN_BRIDGES } from './bridges/unichain'
import { SUPERPOSITION_BRIDGES } from './bridges/superposition'
import { SWELLCHAIN__BRIDGES } from './bridges/swellChain'
import { ABSTRACT_BRIDGES } from './bridges/abstract'

export const DZAP_BRIDGES_CONFIG: {
  [x in CHAIN_IDS]?: BridgeConfig
} = {
  [CHAIN_IDS.ABSTRACT_MAINNET]: ABSTRACT_BRIDGES,
  [CHAIN_IDS.APE_CHAIN]: APE_CHAIN_BRIDGES,
  [CHAIN_IDS.ARBITRUM_MAINNET]: ARBITRUM_MAINNET,
  [CHAIN_IDS.AVALANCHE_MAINNET]: AVALANCHE_MAINNET,
  // [CHAIN_IDS.BAHAMUT_MAINNET]: BAHAMUT_BRIDGES,
  [CHAIN_IDS.BERACHAIN_MAINNET]: BERACHAIN_BRIDGES,
  [CHAIN_IDS.BASE_MAINNET]: BASE_MAINNET,
  [CHAIN_IDS.POLYGON_MAINNET]: POLYGON_MAINNET,
  [CHAIN_IDS.BSC_MAINNET]: BSC_MAINNET,
  [CHAIN_IDS.INK]: INK_BRIDGES,
  [CHAIN_IDS.BITLAYER]: BITLAYER_BRIDGES,
  [CHAIN_IDS.FLARE]: FLARE_BRIDGES,
  [CHAIN_IDS.MANTA_MAINNET]: MANTA_MAINNET,
  [CHAIN_IDS.SCROLL_MAINNET]: SCROLL_MAINNET,
  [CHAIN_IDS.ETH_MAINNET]: ETH_MAINNET,
  [CHAIN_IDS.LINEA_MAINNET]: LINEA_MAINNET,
  [CHAIN_IDS.MANTLE_MAINNET]: MANTLE_MAINNET,
  [CHAIN_IDS.CORE_MAINNET]: CORE_MAINNET,
  [CHAIN_IDS.ROOTSTOCK_MAINNET]: ROOTSTOCK_MAINNET,
  [CHAIN_IDS.X_LAYER_MAINNET]: XLAYER_MAINNET,
  [CHAIN_IDS.POLYGON_ZK_EVM_MAINNET]: POLYGON_ZK_EVM_MAINNET,
  [CHAIN_IDS.MODE_MAINNET]: MODE_MAINNET,
  [CHAIN_IDS.METIS_MAINNET]: METIS_MAINNET,
  [CHAIN_IDS.CELO_MAINNET]: CELO_MAINNET,
  [CHAIN_IDS.IMMUTABLE_ZKEVM]: IMMUTABLE_ZK_EVM_BRIDGES,
  [CHAIN_IDS.BLAST_MAINNET]: BLAST_MAINNET,
  [CHAIN_IDS.BOBA_ETH]: BOBA_ETH,
  [CHAIN_IDS.FRAXTAL]: FRAXTAL,
  [CHAIN_IDS.GRAVITY]: GRAVITY,
  [CHAIN_IDS.GNOSIS_MAINNET]: GNOSIS_MAINNET,
  [CHAIN_IDS.FUSE]: FUSE,
  [CHAIN_IDS.FANTOM_MAINNET]: FANTOM_MAINNET,
  [CHAIN_IDS.MOONBEAM_MAINNET]: MOONBEAM_MAINNET,
  [CHAIN_IDS.MOONRIVER]: MOONRIVER_BRIDGES,
  [CHAIN_IDS.MORPH]: MORPH_BRIDGES,
  [CHAIN_IDS.HEMI]: HEMI_BRIDGES,
  [CHAIN_IDS.OPTIMISM_MAINNET]: OPTIMISM_MAINNET,
  [CHAIN_IDS.CRONOS_MAINNET]: CRONOS_MAINNET,
  [CHAIN_IDS.KAIA]: KAIA_BRIDGES,
  [CHAIN_IDS.KAVA_MAINNET]: KAVA_MAINNET,
  [CHAIN_IDS.KROMA]: KROMA,
  [CHAIN_IDS.AURORA_MAINNET]: AURORA_MAINNET,
  [CHAIN_IDS.MINT]: MINT,
  [CHAIN_IDS.ARTHERA]: ARTHERA,
  [CHAIN_IDS.TAIKO_MAINNET]: TAIKO_MAINNET,
  [CHAIN_IDS.FIRE_MAINNET]: FIRE_MAINNET,
  [CHAIN_IDS.BOB_MAINNET]: BOB_MAINNET,
  [CHAIN_IDS.BEVM_MAINNET]: BEVM_MAINNET,
  [CHAIN_IDS.BOBA_AVALANCHE]: BOBA_AVALANCHE,
  [CHAIN_IDS.BOBA_BNB]: BOBA_BNB,
  [CHAIN_IDS.CONFLUX_E_SPACE_MAINNET]: CONFLUX_E_SPACE_MAINNET,
  [CHAIN_IDS.FILECOIN_MAINNET]: FILECOIN_MAINNET,
  [CHAIN_IDS.HECO_MAINNET]: HECO_MAINNET,
  [CHAIN_IDS.LISK_MAINNET]: LISK_MAINNET,
  [CHAIN_IDS.MERLIN_MAINNET]: MERLIN_MAINNET,
  [CHAIN_IDS.OKX_MAINNET]: OKX_MAINNET,
  [CHAIN_IDS.OPBNB_MAINNET]: OPBNB_MAINNET,
  [CHAIN_IDS.SAAKURU_MAINNET]: SAAKURU_MAINNET,
  [CHAIN_IDS.SONIC_MAINNET]: SONIC_BRIDGES,
  [CHAIN_IDS.SONEIUM_MAINNET]: SONEIUM_BRIDGES,
  [CHAIN_IDS.STORY]: STORY_BRIDGES,
  [CHAIN_IDS.TELOS_MAINNET]: TELOS_MAINNET,
  [CHAIN_IDS.SEI_EVM_MAINNET]: SEI_BRIDGES,
  [CHAIN_IDS.SUPER_POSITION]: SUPERPOSITION_BRIDGES,
  [CHAIN_IDS.SWELLCHAIN]: SWELLCHAIN__BRIDGES,
  [CHAIN_IDS.UNICHAIN]: UNICHAIN_BRIDGES,
  [CHAIN_IDS.WORLD_CHAIN]: WORLDCHAIN_BRIDGES,
  [CHAIN_IDS.ZETACHAIN_MAINNET]: ZETACHAIN_MAINNET,
  [CHAIN_IDS.ZKFAIR]: ZKFAIR_BRIDGES,
  [CHAIN_IDS.ZKSYNC_MAINNET]: ZKSYNC_MAINNET,
}
