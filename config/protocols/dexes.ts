import { CHAIN_IDS } from '../networks'

export enum DEXES {
  kyber = 'kyber',
  oneInch = 'oneInch',
  lifi = 'lifi',
  odos = 'odos',
  paraswap = 'paraswap',
  openOcean = 'openOcean',
  zeroX = 'zeroX',
  wNative = 'wNative',
  bebop = 'bebop',
  uniswap = 'uniswap',
  unizen = 'unizen',
  xyFinance = 'xyFinance',
  socket = 'socket',
  conveyor = 'conveyor',
  sushi = 'sushi',
  iceCreamSwap = 'iceCreamSwap',
  omniBtc = 'omniBtc',
  rocketX = 'rocketX',
  swapsicle = 'swapsicle',
  symmetric = 'symmetric',
  vapourDex = 'vapourDex',
  routerNitro = 'routerNitro',
  okx = 'okx',
}

export const DZAP_DEXES_CONFIG: {
  [x: number]: { dexes?: any }
} = {
  [CHAIN_IDS.ETH_MAINNET]: {
    dexes: {
      [DEXES.kyber]: ['0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'],
      [DEXES.oneInch]: ['0x1111111254eeb25477b68fb85ed929f73a960582'],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.odos]: ['0xcf5540fffcdc3d510b18bfca6d2b9987b0772559'],
      [DEXES.paraswap]: [
        '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
        '0x216b4b4ba9f3e719726886d34a177484278bfcae',
      ],
      [DEXES.openOcean]: ['0x6352a56caadc4f1e25cd6c75970fa768a3304e64'],
      [DEXES.zeroX]: ['0xdef1c0ded9bec7f1a1670819833240f027b25eff'],
      [DEXES.bebop]: [
        '0xBeB09000fa59627dc02Bb55448AC1893EAa501A5',
        '0xbEbEbEb035351f58602E0C1C8B59ECBfF5d5f47b',
        '0xfE96910cF84318d1B8a5e2a6962774711467C0be',
      ],
      [DEXES.uniswap]: ['0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'],
      [DEXES.unizen]: [
        '0xd3f64BAa732061F8B3626ee44bab354f854877AC',
        '0xCf2DBA4e5C9f1B47AC09dc712A0F7bD8eE31A15d',
        '0xfE96910cF84318d1B8a5e2a6962774711467C0be',
        '0xbbbbbbb520d69a9775e85b458c58c648259fad5f',
      ],
      [DEXES.xyFinance]: ['0xFfB9faf89165585Ad4b25F81332Ead96986a2681'],
      [DEXES.socket]: ['0x3a23F943181408EAC424116Af7b7790c94Cb97a5'],
      [DEXES.conveyor]: ['0xd5eC61bCa0Af24Ad06BE431585A0920142C98890'],
      [DEXES.omniBtc]: ['0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820'],
      [DEXES.sushi]: [
        '0x2214A42d8e2A1d20635c2cb0664422c528B6A432',
        '0xe43ca1Dee3F0fc1e2df73A0745674545F11A59F5',
      ],
      [DEXES.okx]: [
        '0x7D0CcAa3Fac1e5A943c5168b6CEd828691b46B36',
        '0x3b3ae790Df4F312e745D270119c6052904FB6790',
        '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
      ],
      [DEXES.routerNitro]: ['0x6c45e28a76977a96e263f84f95912b47f927b687'],
    },
  },
  [CHAIN_IDS.POLYGON_MAINNET]: {
    dexes: {
      [DEXES.kyber]: ['0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'],
      [DEXES.oneInch]: ['0x1111111254eeb25477b68fb85ed929f73a960582'],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.odos]: ['0x4e3288c9ca110bcc82bf38f09a7b425c095d92bf'],
      [DEXES.paraswap]: [
        '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
        '0x216b4b4ba9f3e719726886d34a177484278bfcae',
      ],
      [DEXES.openOcean]: ['0x6352a56caadc4f1e25cd6c75970fa768a3304e64'],
      [DEXES.zeroX]: ['0xdef1c0ded9bec7f1a1670819833240f027b25eff'],
      [DEXES.bebop]: [
        '0xBeB09000fa59627dc02Bb55448AC1893EAa501A5',
        '0xbbbbbBB520d69a9775E85b458C58c648259FAD5F',
        '0xbebebeb035351f58602e0c1c8b59ecbff5d5f47b',
        '0xfE96910cF84318d1B8a5e2a6962774711467C0be',
        '0xbEbEbEb035351f58602E0C1C8B59ECBfF5d5f47b',
      ],
      [DEXES.uniswap]: ['0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'],
      [DEXES.unizen]: [
        '0x07d0ac7671D4242858D0cebcd34ec03907685947',
        '0xCf2DBA4e5C9f1B47AC09dc712A0F7bD8eE31A15d',
      ],
      [DEXES.xyFinance]: ['0xa1fB1F1E5382844Ee2D1BD69Ef07D5A6Abcbd388'],
      [DEXES.socket]: ['0x3a23F943181408EAC424116Af7b7790c94Cb97a5'],
      [DEXES.conveyor]: ['0xd5eC61bCa0Af24Ad06BE431585A0920142C98890'],
      [DEXES.omniBtc]: ['0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820'],
      [DEXES.sushi]: [
        '0x0aF89E1620b96170e2a9D0b68fEebb767eD044c3',
        '0xb7402ee99F0A008e461098AC3A27F4957Df89a40',
        '0x46B3fDF7b5CDe91Ac049936bF0bDb12c5d22202e',
      ],
      [DEXES.okx]: [
        '0xA748D6573acA135aF68F2635BE60CB80278bd855',
        '0x3B86917369B83a6892f553609F3c2F439C184e31',
      ],
      [DEXES.routerNitro]: ['0xc57133521ffbd729cb81cc8ddc12d9e9f61e0f6a'],
    },
  },
  [CHAIN_IDS.BSC_MAINNET]: {
    dexes: {
      [DEXES.kyber]: ['0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'],
      [DEXES.oneInch]: ['0x1111111254eeb25477b68fb85ed929f73a960582'],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.odos]: ['0x89b8AA89FDd0507a99d334CBe3C808fAFC7d850E'],
      [DEXES.paraswap]: [
        '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
        '0x216b4b4ba9f3e719726886d34a177484278bfcae',
      ],
      [DEXES.openOcean]: ['0x6352a56caadc4f1e25cd6c75970fa768a3304e64'],
      [DEXES.zeroX]: ['0xdef1c0ded9bec7f1a1670819833240f027b25eff'],
      [DEXES.bebop]: [
        '0xbebebeb035351f58602e0c1c8b59ecbff5d5f47b',
        '0xfE96910cF84318d1B8a5e2a6962774711467C0be',
      ],
      [DEXES.uniswap]: ['0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2'],
      [DEXES.unizen]: [
        '0x880E0cE34F48c0cbC68BF3E745F17175BA8c650e',
        '0xa9c430de6a91132330A09BE41f9f19bf45702f74',
      ],
      [DEXES.xyFinance]: ['0xDF921bc47aa6eCdB278f8C259D6a7Fef5702f1A9'],
      [DEXES.socket]: ['0x3a23F943181408EAC424116Af7b7790c94Cb97a5'],
      [DEXES.conveyor]: ['0xd5eC61bCa0Af24Ad06BE431585A0920142C98890'],
      [DEXES.omniBtc]: ['0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820'],
      [DEXES.sushi]: [
        '0xF70c086618dcf2b1A461311275e00D6B722ef914',
        '0x33d91116e0370970444B0281AB117e161fEbFcdD',
      ],
      [DEXES.okx]: [
        '0x9333C74BDd1E118634fE5664ACA7a9710b108Bab',
        '0x2c34A2Fb1d0b4f55de51E1d0bDEfaDDce6b7cDD6',
      ],
      [DEXES.routerNitro]: ['0x2F301d3b045544A9D7Ec3FA090CD78986F11f2E7'],
    },
  },
  [CHAIN_IDS.ARBITRUM_MAINNET]: {
    dexes: {
      [DEXES.kyber]: ['0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'],
      [DEXES.oneInch]: ['0x1111111254eeb25477b68fb85ed929f73a960582'],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.odos]: ['0xa669e7A0d4b3e4Fa48af2dE86BD4CD7126Be4e13'],
      [DEXES.paraswap]: [
        '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
        '0x216b4b4ba9f3e719726886d34a177484278bfcae',
      ],
      [DEXES.openOcean]: ['0x6352a56caadc4f1e25cd6c75970fa768a3304e64'],
      [DEXES.zeroX]: ['0xdef1c0ded9bec7f1a1670819833240f027b25eff'],
      [DEXES.socket]: ['0x3a23F943181408EAC424116Af7b7790c94Cb97a5'],
      [DEXES.bebop]: [
        '0xBeB09000fa59627dc02Bb55448AC1893EAa501A5',
        '0xbbbbbBB520d69a9775E85b458C58c648259FAD5F',
        '0xbebebeb035351f58602e0c1c8b59ecbff5d5f47b',
        '0xfE96910cF84318d1B8a5e2a6962774711467C0be',
      ],
      [DEXES.uniswap]: ['0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'],
      [DEXES.unizen]: [
        '0x1C7F7e0258c81CF41bcEa31ea4bB5191914Bf7D7',
        '0xa9c430de6a91132330A09BE41f9f19bf45702f74',
      ],
      [DEXES.xyFinance]: ['0x062b1Db694F6A437e3c028FC60dd6feA7444308c'],
      [DEXES.conveyor]: ['0xd5eC61bCa0Af24Ad06BE431585A0920142C98890'],
      [DEXES.omniBtc]: ['0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820'],
      [DEXES.sushi]: [
        '0xF0cBce1942A68BEB3d1b73F0dd86C8DCc363eF49',
        '0x8A21F6768C1f8075791D08546Dadf6daA0bE820c',
        '0x544bA588efD839d2692Fc31EA991cD39993c135F',
      ],
      [DEXES.okx]: [
        '0xf332761c673b59B21fF6dfa8adA44d78c12dEF09',
        '0x70cBb871E8f30Fc8Ce23609E9E0Ea87B6b222F58',
      ],
      [DEXES.routerNitro]: ['0xCA94d8C245601B152C904f42fE788B4125f5b46B'],
    },
  },
  [CHAIN_IDS.OPTIMISM_MAINNET]: {
    dexes: {
      [DEXES.kyber]: ['0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'],
      [DEXES.oneInch]: ['0x1111111254eeb25477b68fb85ed929f73a960582'],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.odos]: ['0xCa423977156BB05b13A2BA3b76Bc5419E2fE9680'],
      [DEXES.paraswap]: [
        '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
        '0x216b4b4ba9f3e719726886d34a177484278bfcae',
      ],
      [DEXES.openOcean]: ['0x6352a56caadc4f1e25cd6c75970fa768a3304e64'],
      [DEXES.zeroX]: ['0xdef1abe32c034e558cdd535791643c58a13acc10'],
      [DEXES.socket]: ['0x3a23F943181408EAC424116Af7b7790c94Cb97a5'],
      [DEXES.bebop]: [
        '0xBeB09000fa59627dc02Bb55448AC1893EAa501A5',
        '0xbbbbbBB520d69a9775E85b458C58c648259FAD5F',
        '0xbebebeb035351f58602e0c1c8b59ecbff5d5f47b',
        '0xfE96910cF84318d1B8a5e2a6962774711467C0be',
      ],
      [DEXES.uniswap]: ['0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'],
      [DEXES.unizen]: [
        '0xad1D43efCF92133A9a0f33e5936F5ca10f2b012E',
        '0xa9c430de6a91132330A09BE41f9f19bf45702f74',
      ],
      [DEXES.xyFinance]: ['0xad1D43efCF92133A9a0f33e5936F5ca10f2b012E'],
      [DEXES.conveyor]: ['0xd5eC61bCa0Af24Ad06BE431585A0920142C98890'],
      [DEXES.omniBtc]: [
        '0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820',
        '0xd600d94d0812f7EdfA47D0Cf02a767b1DD14A01B',
      ],
      [DEXES.sushi]: [
        '0x1af415a1EbA07a4986a52B6f2e7dE7003D82231e',
        '0x1f2FCf1d036b375b384012e61D3AA33F8C256bbE',
      ],
      [DEXES.okx]: [
        '0xf332761c673b59B21fF6dfa8adA44d78c12dEF09',
        '0x68D6B739D2020067D1e2F713b999dA97E4d54812',
      ],
      [DEXES.routerNitro]: ['0x5501A36b1313aC5d27e85418acd2AA4564f50b44'],
    },
  },
  [CHAIN_IDS.ZKSYNC_MAINNET]: {
    dexes: {
      [DEXES.kyber]: ['0x3F95eF3f2eAca871858dbE20A93c01daF6C2e923'],
      [DEXES.oneInch]: ['0x6e2B76966cbD9cF4cC2Fa0D76d24d5241E0ABC2F'],
      [DEXES.lifi]: ['0x341e94069f53234fE6DabeF707aD424830525715'],
      [DEXES.odos]: ['0x4bBa932E9792A2b917D47830C93a9BC79320E4f7'],
      [DEXES.openOcean]: ['0x36A1aCbbCAfca2468b85011DDD16E7Cb4d673230'],
      [DEXES.socket]: ['0xaDdE7028e7ec226777e5dea5D53F6457C21ec7D6'],
      [DEXES.bebop]: [
        '0x574d1fcF950eb48b11de5DF22A007703cbD2b129',
        '0x10D7a281c39713B34751Fcc0830ea2AE56D64B2C',
      ],
      [DEXES.xyFinance]: ['0x30E63157bD0bA74C814B786F6eA2ed9549507b46'],
      [DEXES.okx]: [
        '0xb9061E38FeE7d30134F56aEf7117E2F6d1580666',
        '0xc67879F4065d3B9fe1C09EE990B891Aa8E3a4c2f',
      ],
      [DEXES.routerNitro]: ['0x7E7D4185D9c3C44D5266eD974493b24811398049'],
    },
  },
  [CHAIN_IDS.AVALANCHE_MAINNET]: {
    dexes: {
      [DEXES.kyber]: ['0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'],
      [DEXES.oneInch]: ['0x1111111254eeb25477b68fb85ed929f73a960582'],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.odos]: ['0x88de50B233052e4Fb783d4F6db78Cc34fEa3e9FC'],
      [DEXES.paraswap]: [
        '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
        '0x216b4b4ba9f3e719726886d34a177484278bfcae',
      ],
      [DEXES.openOcean]: ['0x6352a56caadc4f1e25cd6c75970fa768a3304e64'],
      [DEXES.zeroX]: ['0xdef1c0ded9bec7f1a1670819833240f027b25eff'],
      [DEXES.socket]: ['0x3a23F943181408EAC424116Af7b7790c94Cb97a5'],
      [DEXES.uniswap]: ['0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE'],
      [DEXES.unizen]: [
        '0x1C7F7e0258c81CF41bcEa31ea4bB5191914Bf7D7',
        '0xa9c430de6a91132330A09BE41f9f19bf45702f74',
      ],
      [DEXES.xyFinance]: ['0xa0c0F962DECD78D7CDE5707895603CBA74C02989'],
      [DEXES.omniBtc]: ['0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820'],
      [DEXES.sushi]: [
        '0x18350b048AB366ed601fFDbC669110Ecb36016f3',
        '0xCdBCd51a5E8728E0AF4895ce5771b7d17fF71959',
      ],
      [DEXES.okx]: [
        '0x1daC23e41Fc8ce857E86fD8C1AE5b6121C67D96d',
        '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
      ],
      [DEXES.routerNitro]: ['0x4406ebEb7028fc0fc06bB7706A736AC6ada8D2bF'],
      [DEXES.vapourDex]: ['0x55477d8537ede381784b448876AfAa98aa450E63'],
    },
  },
  [CHAIN_IDS.BASE_MAINNET]: {
    dexes: {
      [DEXES.kyber]: ['0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'],
      [DEXES.oneInch]: ['0x1111111254eeb25477b68fb85ed929f73a960582'],
      [DEXES.lifi]: ['0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'],
      [DEXES.odos]: ['0x19cEeAd7105607Cd444F5ad10dd51356436095a1'],
      [DEXES.paraswap]: [
        '0x59C7C832e96D2568bea6db468C1aAdcbbDa08A52',
        '0x93aAAe79a53759cD164340E4C8766E4Db5331cD7',
      ],
      [DEXES.openOcean]: ['0x6352a56caadc4f1e25cd6c75970fa768a3304e64'],
      [DEXES.zeroX]: ['0xdef1c0ded9bec7f1a1670819833240f027b25eff'],
      [DEXES.bebop]: [
        '0xbEbEbEb035351f58602E0C1C8B59ECBfF5d5f47b',
        '0xbbbbbBB520d69a9775E85b458C58c648259FAD5F',
        '0xfE96910cF84318d1B8a5e2a6962774711467C0be',
      ],
      [DEXES.uniswap]: ['0x2626664c2603336E57B271c5C0b26F421741e481'],
      [DEXES.unizen]: [
        '0x4F68248ecB782647D1E5981a181bBe1bfFee1040',
        '0xa9c430de6a91132330A09BE41f9f19bf45702f74',
      ],
      [DEXES.xyFinance]: ['0x6aCd0Ec9405CcB701c57A88849C4F1CD85a3f3ab'],
      [DEXES.socket]: ['0x3a23F943181408EAC424116Af7b7790c94Cb97a5'],
      [DEXES.sushi]: [
        '0x80C7DD17B01855a6D2347444a0FCC36136a314de',
        '0x0389879e0156033202c44bf784ac18fc02edee4f',
      ],
      [DEXES.okx]: [
        '0x6b2C0c7be2048Daa9b5527982C29f48062B34D58',
        '0x57df6092665eb6058DE53939612413ff4B09114E',
      ],
      [DEXES.routerNitro]: ['0x02D728B9C1513478a6b6de77a92648e1D8F801e7'],
    },
  },
  [CHAIN_IDS.MANTA_MAINNET]: {
    dexes: {
      [DEXES.openOcean]: ['0x6352a56caadc4f1e25cd6c75970fa768a3304e64'],
      [DEXES.okx]: [
        '0x6b2C0c7be2048Daa9b5527982C29f48062B34D58',
        '0x57df6092665eb6058DE53939612413ff4B09114E',
      ],
      [DEXES.routerNitro]: ['0x8201c02d4AB2214471E8C3AD6475C8b0CD9F2D06'],
      [DEXES.omniBtc]: ['0xd600d94d0812f7EdfA47D0Cf02a767b1DD14A01B'],
    },
  },
  [CHAIN_IDS.SCROLL_MAINNET]: {
    dexes: {
      [DEXES.bebop]: [
        '0xbEbEbEb035351f58602E0C1C8B59ECBfF5d5f47b',
        '0xfE96910cF84318d1B8a5e2a6962774711467C0be',
      ],
      [DEXES.kyber]: ['0x6131b5fae19ea4f9d964eac0408e4408b66337b5'],
      [DEXES.openOcean]: ['0x6352a56caadc4f1e25cd6c75970fa768a3304e64'],
      [DEXES.sushi]: [
        '0x33d91116e0370970444B0281AB117e161fEbFcdD',
        '0x0389879e0156033202C44BF784ac18fC02edeE4f',
        '0x734583f62Bb6ACe3c9bA9bd5A53143CA2Ce8C55A',
      ],
      [DEXES.okx]: [
        '0x6b2C0c7be2048Daa9b5527982C29f48062B34D58',
        '0x57df6092665eb6058DE53939612413ff4B09114E',
      ],
      [DEXES.routerNitro]: ['0x5546dA2bCdCFF39b187723434cDE10D4eE99C566'],
    },
  },
  [CHAIN_IDS.TELOS_MAINNET]: {
    dexes: {
      [DEXES.openOcean]: ['0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'],
      [DEXES.iceCreamSwap]: ['0xD810A437e334B9C3660C18b38fB3C01000B91DD3'],
      [DEXES.sushi]: ['0x1400feFD6F9b897970f00Df6237Ff2B8b27Dc82C'],
      [DEXES.swapsicle]: ['0xc96afc666A4195366a46E4ca8C4f10f3C39Ee363'],
      [DEXES.symmetric]: ['0xbccc4b4c6530F82FE309c5E845E50b5E9C89f2AD'],
      [DEXES.vapourDex]: ['0x55477d8537ede381784b448876AfAa98aa450E63'],
    },
  },
  [CHAIN_IDS.CORE_MAINNET]: {
    dexes: {
      [DEXES.sushi]: [
        '0x0389879e0156033202C44BF784ac18fC02edeE4f',
        '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3',
      ],
      [DEXES.omniBtc]: [
        '0x0B77E63db1cd9F4f7cdAfb4a1C39f6ABEB764B66',
        '0xd600d94d0812f7edfa47d0cf02a767b1dd14a01b',
      ],
    },
  },
  [CHAIN_IDS.ROOTSTOCK_MAINNET]: {
    dexes: {
      [DEXES.openOcean]: ['0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'],
      [DEXES.routerNitro]: ['0xff13a7a12fd485bc9687ff88d8ae1a6b655ab469'],
      [DEXES.sushi]: [
        '0x1400feFD6F9b897970f00Df6237Ff2B8b27Dc82C',
        '0x0389879e0156033202C44BF784ac18fC02edeE4f',
        '0xb46e319390De313B8cc95EA5aa30C7bBFD79Da94',
      ],
    },
  },
  [CHAIN_IDS.KAVA_MAINNET]: {},
  [CHAIN_IDS.BOBA_MAINNET]: {},
  [CHAIN_IDS.BOBA_BNB]: {},
  [CHAIN_IDS.LINEA_MAINNET]: {
    dexes: {
      [DEXES.okx]: [
        '0x6b2C0c7be2048Daa9b5527982C29f48062B34D58',
        '0x57df6092665eb6058DE53939612413ff4B09114E',
      ],
      [DEXES.openOcean]: ['0x6352a56caadC4F1E25CD6c75970Fa768A3304e64'],
      [DEXES.routerNitro]: ['0x6D6050Ca1dd8e4aAb9164B663d805104a3ECFC34'],
      [DEXES.kyber]: ['0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'],
      [DEXES.sushi]: ['0x46b3fdf7b5cde91ac049936bf0bdb12c5d22202e'],
      [DEXES.xyFinance]: ['0xc693C8AAD9745588e95995fef4570d6DcEF98000'],
    },
  },
  [CHAIN_IDS.MANTLE_MAINNET]: {
    dexes: {
      [DEXES.okx]: [
        '0x6b2C0c7be2048Daa9b5527982C29f48062B34D58',
        '0x57df6092665eb6058DE53939612413ff4B09114E',
      ],
      [DEXES.routerNitro]: ['0xB6dc6C8b71e88642cEAD3be1025565A9eE74d1C6'],
    },
  },
  [CHAIN_IDS.METIS_MAINNET]: {
    dexes: {
      [DEXES.okx]: [
        '0x6b2C0c7be2048Daa9b5527982C29f48062B34D58',
        '0x57df6092665eb6058DE53939612413ff4B09114E',
      ],
      [DEXES.routerNitro]: ['0x21c1E74CAaDf990E237920d5515955a024031109'],
    },
  },
  [CHAIN_IDS.MODE_MAINNET]: {
    dexes: {
      [DEXES.routerNitro]: ['0xf0773508c585246bd09bfb401aa18b72685b03f9'],
    },
  },
  [CHAIN_IDS.BLAST_MAINNET]: {
    dexes: {
      [DEXES.okx]: [
        '0x2E86f54943faFD2cB62958c3deed36C879e3E944',
        '0x5fD2Dc91FF1dE7FF4AEB1CACeF8E9911bAAECa68',
      ],
      [DEXES.routerNitro]: ['0x01B4CE0d48Ce91eB6bcaf5dB33870C65d641b894'],
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
  [CHAIN_IDS.TAIKO_MAINNET]: {},
  [CHAIN_IDS.ZETACHAIN_MAINNET]: {
    dexes: {
      [DEXES.okx]: [
        '0x0DaB5A5294AfAae76Ce990993fC10b896A01DBd1',
        '0x03B5ACdA01207824cc7Bc21783Ee5aa2B8d1D2fE',
      ],
    },
  },
  [CHAIN_IDS.CRONOS_MAINNET]: {},
  [CHAIN_IDS.BOB_MAINNET]: {},
  [CHAIN_IDS.BEVM_MAINNET]: {},
  [CHAIN_IDS.OPBNB_MAINNET]: {},
  [CHAIN_IDS.FANTOM_MAINNET]: {
    dexes: {
      [DEXES.okx]: [
        '0xf332761c673b59B21fF6dfa8adA44d78c12dEF09',
        '0x70cBb871E8f30Fc8Ce23609E9E0Ea87B6b222F58',
      ],
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
      [DEXES.okx]: [
        '0x6b2C0c7be2048Daa9b5527982C29f48062B34D58',
        '0x57df6092665eb6058DE53939612413ff4B09114E',
      ],
      [DEXES.routerNitro]: ['0x6a0fd5577c540e16a3a49c40b51e0880a2a528ce'],
    },
  },
  [CHAIN_IDS.X_LAYER_MAINNET]: {
    dexes: {
      [DEXES.okx]: [
        '0x127a986cE31AA2ea8E1a6a0F0D5b7E5dbaD7b0bE',
        '0x8b773D83bc66Be128c60e07E17C8901f7a64F000',
      ],
      [DEXES.xyFinance]: ['0x6A816cEE105a9409D8df0A83d8eeaeD9EB4309fE'],
    },
  },
  [CHAIN_IDS.AURORA_MAINNET]: {
    dexes: {
      [DEXES.rocketX]: ['0x7BD616192fB2B364f9d29B2026165281a5f2ff2F'],
    },
  },
  [CHAIN_IDS.SAAKURU_MAINNET]: {
    dexes: {
      [DEXES.routerNitro]: ['0x3BcEe7629Fce3b54783bE5e9305119a12bC2C770'],
    },
  },
  [CHAIN_IDS.MOONBEAM_MAINNET]: {},
  [CHAIN_IDS.CLEO_MAINNET]: {},
  [CHAIN_IDS.FILECOIN_MAINNET]: {},
}