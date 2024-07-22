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
          fixedNativeFeeAmount: 0.00004,
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
          fixedNativeFeeAmount: 0.25,
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
          fixedNativeFeeAmount: 0.00025,
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
          fixedNativeFeeAmount: 0.00004,
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
          fixedNativeFeeAmount: 0.00004,
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
          fixedNativeFeeAmount: 0.00004,
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
          fixedNativeFeeAmount: 0.005,
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
          fixedNativeFeeAmount: 0.00004,
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
          fixedNativeFeeAmount: 0.00004,
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
          fixedNativeFeeAmount: 0.00004,
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
          fixedNativeFeeAmount: 0.7,
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
          fixedNativeFeeAmount: 0.1,
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
          fixedNativeFeeAmount: 0.000002,
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
          fixedNativeFeeAmount: 0.0035,
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
          fixedNativeFeeAmount: 0.00004,
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
          fixedNativeFeeAmount: 0.00004,
          dzapTokenShare: 0,
          dzapFixedNativeShare: 100,
        },
      ],
    },
  },
}