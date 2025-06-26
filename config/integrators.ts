import { CHAIN_IDS } from './networks'

export const INTEGRATORS = {
  DZAP: 'DZAP',
}

export const INTEGRATOR_CONFIG = {
  [CHAIN_IDS.ETH_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.POLYGON_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 2,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.BSC_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.00065,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.ARBITRUM_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.OPTIMISM_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.ZKSYNC_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.AVALANCHE_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.022,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.BASE_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.MANTA_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.SCROLL_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.TELOS_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 4.5,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.CORE_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.9,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.ROOTSTOCK_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.000005,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.X_LAYER_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.008,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.LINEA_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.BLAST_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.POLYGON_ZK_EVM_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.MODE_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.MANTLE_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.5,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.METIS_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.03,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.CELO_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 1.3,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.TAIKO_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  // [CHAIN_IDS.FIRE_MAINNET]: {
  //   [INTEGRATORS.DZAP]: {
  //     address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
  //     fee: [
  //       {
  //         type: 1,
  //         tokenFee: 0,
  //         fixedNativeFeeAmount: 0,
  //         dzapTokenShare: 0,
  //         dzapFixedNativeShare: 0,
  //       },
  //       {
  //         type: 0,
  //         tokenFee: 0,
  //         fixedNativeFeeAmount: 40,
  //         dzapTokenShare: 0,
  //         dzapFixedNativeShare: 100,
  //       },
  //     ],
  //   },
  // },
  [CHAIN_IDS.ZETACHAIN_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 1.7,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.BOBA_ETH]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.FRAXTAL]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.GRAVITY]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 30,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.GNOSIS_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.35,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.FUSE]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0035,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.FANTOM_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.85,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.MOONBEAM_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 6,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.MOONRIVER]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.075,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.CRONOS_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 4.5,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.KAVA_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.85,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.KROMA]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.AURORA_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.MINT]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
  [CHAIN_IDS.ARTHERA]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          // fixedNativeFeeAmount: 2,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.BERACHAIN_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.075,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.SONIC_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.8,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.MORPH]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.MERLIN_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.000005,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.SONEIUM_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.KAIA]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 3.5,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.INK]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.SEI_EVM_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 2.5,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.BOUNCE_BIT]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 3.5,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.B2SQUARE_NETWORK]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.000005,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.BI_FROST]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 14,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.BITLAYER]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.000005,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.FLARE]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 22,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.HYPER_EVM]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.025,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.HEMI]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.IOTA_EVM]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 225,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.OPBNB_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.00065,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.PULSE_CHAIN]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 15000,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.RONIN]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.65,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.STORY]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.085,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.ZKFAIR]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.35,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.BAHAMUT_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.07,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.UNICHAIN]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.IMMUTABLE_ZKEVM]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.5,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.APE_CHAIN]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.5,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.SWELLCHAIN]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.SUPER_POSITION]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.WORLD_CHAIN]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.GOAT]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.000005,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.ABSTRACT_MAINNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.0002,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.LENS]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0.5,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.MONAD_TESTNET]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.ETH_SEPOLIA]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.OP_SEPOLIA]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.BASE_SEPOLIA]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
  [CHAIN_IDS.UNICHAIN_SEPOLIA]: {
    [INTEGRATORS.DZAP]: {
      address: '0x45dd5ec28dbf5296dffae428d7f484ab02ee7bad',
      fee: [
        {
          type: 1,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
        {
          type: 0,
          tokenFee: 0,
          fixedNativeFeeAmount: 0,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 0,
        },
      ],
    },
  },
}
