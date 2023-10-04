import { ethers } from 'hardhat'
import axios from 'axios'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import {
  BPS_MULTIPLIER,
  CONTRACTS,
  NATIVE_ADDRESS,
  ADDRESS_ZERO,
  DZAP_NATIVE,
  MAX_FIXED_FEE_AMOUNT,
  MAX_TOKEN_FEE,
  ZERO,
} from '../constants'
import {
  AccessManagerFacet,
  DZapDiamond,
  DexManagerFacet,
  DiamondCutFacet,
  DiamondLoupeFacet,
  FeesFacet,
  OwnershipFacet,
  SwapFacet,
  WithdrawFacet,
  WNATIVE,
  DiamondInit,
  Permit2,
  ERC20,
  CrossChainFacet,
  Executor,
  Receiver,
} from '../typechain-types'
import { forkNetwork, impersonate, snapshot, updateBalance } from './utils'
import {
  DiamondCut,
  FacetCutAction,
  FeeInfo,
  FeeType,
  PermitType,
} from '../types'
import { getKyberSwapData } from '../scripts/core/kyberSwap'
import { getInchSwapData } from '../scripts/core/oneInch'
import {
  DzapSwapData,
  LifiParams,
  OneInchSwapParams,
  ParaswapParams,
} from '../types'
import { getParaswapData } from '../scripts/core/paraswap'
import {
  approveToken,
  getFeeData,
  getRandomBytes32,
  getRevertMsg,
  isNative,
  replaceFromAmount,
} from '../scripts/core/helper'
import { chainIds, tokenAddress } from '../scripts/core/registry'
import { getLifiBridgeData } from '../scripts/core/lifi'

let dZapDiamond: DZapDiamond
let diamondInit: DiamondInit
let diamondCutFacetImp: DiamondCutFacet
let diamondCutFacet: DiamondCutFacet
let diamondLoupeFacetImp: DiamondLoupeFacet
let ownershipFacetImp: OwnershipFacet
let accessManagerFacetImp: AccessManagerFacet
let dexManagerFacetImp: DexManagerFacet
let dexManagerFacet: DexManagerFacet
let feesFacetImp: FeesFacet
let feesFacet: FeesFacet
let withdrawFacetImp: WithdrawFacet
let swapFacetImp: SwapFacet
let swapFacet: SwapFacet
let crossChainFacet: CrossChainFacet
let crossChainFacetImp: CrossChainFacet
let executor: Executor
let receiver: Receiver

let permit2: Permit2

let signers: SignerWithAddress[]
let deployer: SignerWithAddress
let owner: SignerWithAddress
let user: SignerWithAddress
let protoFeeVault: SignerWithAddress
let integrator: SignerWithAddress

// const tokenAddress = {
//   wNativeAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
//   usdcAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
//   usdtAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
//   wEth: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
// }
const permit2Address = '0x000000000022D473030F116dDEE9F6B43aC78BA3'

let wNative: WNATIVE
let usdc: ERC20
let usdt: ERC20
let wEth: ERC20

const jsonRpcUrl =
  'https://polygon-mainnet.g.alchemy.com/v2/Ko1ZTIARgSv-ZGDJz2vUrHMsR7NOAdnV'
const chainId = 137
const diamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'

// const jsonRpcUrl =
//   'https://opt-mainnet.g.alchemy.com/v2/Ko1ZTIARgSv-ZGDJz2vUrHMsR7NOAdnV'
// const chainId = 10
// const diamondAdresss = '0x45f4883c5777dFA2e905F55f095554B1a20E23B7'

let snapshotId: string
let selectors: string[]
let dexs: string[]
let sigDex: string[]
const selectorMap = {}

const feeInfo: FeeInfo[] = [
  {
    tokenFee: ZERO,
    fixedNativeFeeAmount: ZERO,
    dzapTokenShare: ZERO,
    dzapFixedNativeShare: ZERO,
  },
  {
    tokenFee: ZERO,
    fixedNativeFeeAmount: parseUnits('1'),
    dzapTokenShare: ZERO,
    dzapFixedNativeShare: ZERO,
  },
]
// const feeInfo: FeeInfo[] = [
//   {
//     tokenFee: BigNumber.from(1 * BPS_MULTIPLIER),
//     fixedNativeFeeAmount: ZERO,
//     dzapTokenShare: BigNumber.from(100 * BPS_MULTIPLIER),
//     dzapFixedNativeShare: ZERO,
//   },
//   {
//     tokenFee: BigNumber.from(2 * BPS_MULTIPLIER),
//     fixedNativeFeeAmount: parseUnits('1'),
//     dzapTokenShare: BigNumber.from(100 * BPS_MULTIPLIER),
//     dzapFixedNativeShare: ZERO,
//   },
// ]

const userAddress = '0x2cb99f193549681e06c6770ddd5543812b4fafe8'
const deployerAddress = '0x12480616436dd6d555f88b8d94bb5156e28825b1'
const ownerAddress = '0x12480616436dd6d555f88b8d94bb5156e28825b1'
const integratorAddress = '0x12480616436dd6d555f88b8d94bb5156e28825b1'

describe.skip('Fork.test.ts', () => {
  before(async () => {
    signers = await ethers.getSigners()
    // deployer = signers[0]
    // owner = signers[1]
    protoFeeVault = signers[2]

    /* ------------------------------ */

    console.log('Forking network...')
    await forkNetwork(jsonRpcUrl)
    console.log('Forked')

    deployer = await impersonate(deployerAddress)
    owner = await impersonate(ownerAddress)
    integrator = await impersonate(integratorAddress)
    user = await impersonate(userAddress)
    // user = deployer

    await updateBalance(deployer.address)
    await updateBalance(owner.address)
    await updateBalance(user.address)
    await updateBalance(integrator.address)
    await updateBalance(protoFeeVault.address)

    // /* ------------------------------ */
    // console.log('getting token contracts...')

    // usdc = (await ethers.getContractAt(
    //   '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20',
    //   tokenAddress[chainId].usdc as string
    // )) as ERC20
    // usdt = (await ethers.getContractAt(
    //   '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20',
    //   tokenAddress[chainId].usdt as string
    // )) as ERC20
    // wEth = (await ethers.getContractAt(
    //   '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20',
    //   tokenAddress[chainId].wEth as string
    // )) as ERC20
    // wNative = (await ethers.getContractAt(
    //   CONTRACTS.WNATIVE,
    //   tokenAddress[chainId].wMatic as string
    // )) as WNATIVE
    // permit2 = (await ethers.getContractAt(
    //   CONTRACTS.Permit2,
    //   permit2Address
    // )) as Permit2

    // /* ------------------------------ */
    // console.log('Deploying diamond...')

    // const DiamondCutFacet = await ethers.getContractFactory(
    //   'DiamondCutFacet',
    //   deployer
    // )
    // diamondCutFacetImp = (await DiamondCutFacet.deploy()) as DiamondCutFacet
    // await diamondCutFacetImp.deployed()

    // const DiamondInit = await ethers.getContractFactory('DiamondInit', deployer)
    // diamondInit = (await DiamondInit.deploy()) as DiamondInit
    // await diamondInit.deployed()

    // const Diamond = await ethers.getContractFactory('DZapDiamond', deployer)
    // dZapDiamond = (await Diamond.deploy(
    //   owner.address,
    //   diamondCutFacetImp.address
    // )) as DZapDiamond
    // await dZapDiamond.deployed()

    // // -----------------------------------------

    // diamondCutFacet = (await ethers.getContractAt(
    //   'DiamondCutFacet',
    //   dZapDiamond.address
    // )) as DiamondCutFacet
    // feesFacet = (await ethers.getContractAt(
    //   'FeesFacet',
    //   dZapDiamond.address
    // )) as FeesFacet
    // dexManagerFacet = (await ethers.getContractAt(
    //   'DexManagerFacet',
    //   dZapDiamond.address
    // )) as DexManagerFacet
    // swapFacet = (await ethers.getContractAt(
    //   'SwapFacet',
    //   dZapDiamond.address
    // )) as SwapFacet
    // crossChainFacet = (await ethers.getContractAt(
    //   'CrossChainFacet',
    //   dZapDiamond.address
    // )) as CrossChainFacet

    // // -----------------------------------------
    // // deploy facets
    // console.log('Deploying facets..')
    // {
    //   const DiamondLoupeFacet = await ethers.getContractFactory(
    //     CONTRACTS.DiamondLoupeFacet
    //   )
    //   diamondLoupeFacetImp =
    //     (await DiamondLoupeFacet.deploy()) as DiamondLoupeFacet
    //   await diamondLoupeFacetImp.deployed()

    //   const OwnershipFacet = await ethers.getContractFactory(
    //     CONTRACTS.OwnershipFacet,
    //     deployer
    //   )
    //   ownershipFacetImp = (await OwnershipFacet.deploy()) as OwnershipFacet
    //   await ownershipFacetImp.deployed()

    //   const AccessManagerFacet = await ethers.getContractFactory(
    //     CONTRACTS.AccessManagerFacet,
    //     deployer
    //   )
    //   accessManagerFacetImp =
    //     (await AccessManagerFacet.deploy()) as AccessManagerFacet
    //   await accessManagerFacetImp.deployed()

    //   const DexManagerFacet = await ethers.getContractFactory(
    //     CONTRACTS.DexManagerFacet,
    //     deployer
    //   )
    //   dexManagerFacetImp = (await DexManagerFacet.deploy()) as DexManagerFacet
    //   await dexManagerFacetImp.deployed()

    //   const FeesFacet = await ethers.getContractFactory(
    //     CONTRACTS.FeesFacet,
    //     deployer
    //   )
    //   feesFacetImp = (await FeesFacet.deploy()) as FeesFacet
    //   await feesFacetImp.deployed()

    //   const WithdrawFacet = await ethers.getContractFactory(
    //     CONTRACTS.WithdrawFacet,
    //     deployer
    //   )
    //   withdrawFacetImp = (await WithdrawFacet.deploy()) as WithdrawFacet
    //   await withdrawFacetImp.deployed()

    //   const SwapFacet = await ethers.getContractFactory(
    //     CONTRACTS.SwapFacet,
    //     deployer
    //   )
    //   swapFacetImp = (await SwapFacet.deploy()) as SwapFacet
    //   await swapFacetImp.deployed()

    //   const CrossChainFacet = await ethers.getContractFactory(
    //     CONTRACTS.CrossChainFacet,
    //     deployer
    //   )
    //   crossChainFacetImp = (await CrossChainFacet.deploy()) as CrossChainFacet
    //   await crossChainFacetImp.deployed()
    // }

    // /* ------------------------------ */
    // console.log('diamondCut...')
    // {
    //   const cutData: DiamondCut[] = [
    //     {
    //       facetAddress: diamondLoupeFacetImp.address,
    //       action: FacetCutAction.Add,
    //       functionSelectors: getSelectorsUsingContract(
    //         diamondLoupeFacetImp,
    //         'DiamondLoupeFacet'
    //       ).selectors,
    //     },
    //     {
    //       facetAddress: ownershipFacetImp.address,
    //       action: FacetCutAction.Add,
    //       functionSelectors: getSelectorsUsingContract(
    //         ownershipFacetImp,
    //         'OwnershipFacet'
    //       ).selectors,
    //     },
    //     {
    //       facetAddress: accessManagerFacetImp.address,
    //       action: FacetCutAction.Add,
    //       functionSelectors: getSelectorsUsingContract(
    //         accessManagerFacetImp,
    //         'AccessManagerFacet'
    //       ).selectors,
    //     },
    //     {
    //       facetAddress: dexManagerFacetImp.address,
    //       action: FacetCutAction.Add,
    //       functionSelectors: getSelectorsUsingContract(
    //         dexManagerFacetImp,
    //         'DexManagerFacet'
    //       ).selectors,
    //     },
    //     {
    //       facetAddress: feesFacetImp.address,
    //       action: FacetCutAction.Add,
    //       functionSelectors: getSelectorsUsingContract(
    //         feesFacetImp,
    //         'FeesFacet'
    //       ).selectors,
    //     },
    //     {
    //       facetAddress: withdrawFacetImp.address,
    //       action: FacetCutAction.Add,
    //       functionSelectors: getSelectorsUsingContract(
    //         withdrawFacetImp,
    //         'WithdrawFacet'
    //       ).selectors,
    //     },
    //     {
    //       facetAddress: swapFacetImp.address,
    //       action: FacetCutAction.Add,
    //       functionSelectors: getSelectorsUsingContract(
    //         swapFacetImp,
    //         'SwapFacet'
    //       ).selectors,
    //     },
    //     {
    //       facetAddress: crossChainFacetImp.address,
    //       action: FacetCutAction.Add,
    //       functionSelectors: getSelectorsUsingContract(
    //         crossChainFacetImp,
    //         'CrossChainFacet'
    //       ).selectors,
    //     },
    //   ]

    //   const { data: initData } =
    //     await diamondInit.populateTransaction.initialize(
    //       permit2.address,
    //       protoFeeVault.address,
    //       MAX_TOKEN_FEE,
    //       MAX_FIXED_FEE_AMOUNT
    //     )

    //   await diamondCutFacet
    //     .connect(owner)
    //     .diamondCut(cutData, diamondInit.address, initData as string)
    // }

    // /* ------------------------------ */
    // // add fee data
    // {
    //   console.log('Setting Fee...')

    //   await feesFacet
    //     .connect(owner)
    //     .setIntegratorInfo(
    //       integrator.address,
    //       [FeeType.SWAP, FeeType.BRIDGE],
    //       feeInfo
    //     )
    // }

    // /* ------------------------------ */
    // // Dex Access
    // {
    //   console.log('Adding Dex...')

    //   dexs = [
    //     // '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch
    //     // '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
    //     // '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', // lifi
    //     // '0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf', // odos
    //     // '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // openOcean
    //     '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
    //     '0x216b4b4ba9f3e719726886d34a177484278bfcae', // paraswap token proxy
    //     // '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
    //   ]

    //   const bridgeSig = []
    //   const bridgeSelectors = []
    //   const bridgeSigDex = []
    //   const bridgeApproval = []
    //   // const bridgeSig = [
    //   //   'function startBridgeTokensViaHopL1ERC20Min(bytes8,address,uint256,address,uint256,uint256,address,uint256,address)',
    //   //   'function startBridgeTokensViaHopL1ERC20Packed() payable',
    //   //   'function startBridgeTokensViaHopL1NativeMin(bytes8,address,uint256,uint256,address,uint256,address) payable',
    //   //   'function startBridgeTokensViaHopL1NativePacked() payable',
    //   //   'function startBridgeTokensViaHopL2ERC20Min(bytes8,address,uint256,address,uint256,uint256,uint256,uint256,uint256,address)',
    //   //   'function startBridgeTokensViaHopL2ERC20Packed()',
    //   //   'function startBridgeTokensViaHopL2NativeMin(bytes8,address,uint256,uint256,uint256,uint256,uint256,address) payable',
    //   //   'function startBridgeTokensViaHopL2NativePacked() payable',
    //   //   'function startBridgeTokensViaCBridge(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint32,uint64)) payable',
    //   //   'function swapAndStartBridgeTokensViaCBridge(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint32,uint64)) payable',
    //   //   'function triggerRefund(address,bytes,address,address,uint256)',
    //   //   'function startBridgeTokensViaCBridgeERC20Min(bytes32,address,uint64,address,uint256,uint64,uint32)',
    //   //   'function startBridgeTokensViaCBridgeERC20Packed()',
    //   //   'function startBridgeTokensViaCBridgeNativeMin(bytes32,address,uint64,uint64,uint32) payable',
    //   //   'function startBridgeTokensViaCBridgeNativePacked() payable',
    //   //   'function startBridgeTokensViaWormhole(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(bytes32,uint256,uint32)) payable',
    //   //   'function swapAndStartBridgeTokensViaWormhole(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(bytes32,uint256,uint32)) payable',
    //   //   'function startBridgeTokensViaHyphen(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool)) payable',
    //   //   'function swapAndStartBridgeTokensViaHyphen(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[]) payable',
    //   //   'function startBridgeTokensViaMultichain(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address)) payable',
    //   //   'function swapAndStartBridgeTokensViaMultichain(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(address)) payable',
    //   //   'function updateAddressMappings(tuple(address,address)[])',
    //   //   'function startBridgeTokensViaAmarok(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(bytes,address,uint256,uint256,address,uint32,bool)) payable',
    //   //   'function swapAndStartBridgeTokensViaAmarok(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(bytes,address,uint256,uint256,address,uint32,bool)) payable',
    //   //   'function startBridgeTokensViaStargate(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,bytes,bytes)) payable',
    //   //   'function swapAndStartBridgeTokensViaStargate(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,bytes,bytes)) payable',
    //   //   'function startBridgeTokensViaHop(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,uint256,uint256)) payable',
    //   //   'function swapAndStartBridgeTokensViaHop(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,uint256,uint256)) payable',
    //   //   'function startBridgeTokensViaAllBridge(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,bytes32,uint256,bytes32,uint256,uint8,bool)) payable',
    //   //   'function swapAndStartBridgeTokensViaAllBridge(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,bytes32,uint256,bytes32,uint256,uint8,bool)) payable',
    //   //   'function startBridgeTokensViaCelerIM(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint32,uint64,bytes,bytes,uint256,uint8)) payable',
    //   //   'function swapAndStartBridgeTokensViaCelerIM(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint32,uint64,bytes,bytes,uint256,uint8)) payable',
    //   //   'function setApprovalForBridges(address[],address[])',
    //   //   'function startBridgeTokensViaHopL1ERC20(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    //   //   'function startBridgeTokensViaHopL1Native(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    //   //   'function startBridgeTokensViaHopL2ERC20(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256))',
    //   //   'function startBridgeTokensViaHopL2Native(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    //   //   'function swapAndStartBridgeTokensViaHopL1ERC20(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    //   //   'function swapAndStartBridgeTokensViaHopL1Native(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    //   //   'function swapAndStartBridgeTokensViaHopL2ERC20(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    //   //   'function swapAndStartBridgeTokensViaHopL2Native(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    //   //   'function startBridgeTokensViaLIFuel(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool)) payable',
    //   //   'function swapAndStartBridgeTokensViaLIFuel(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[]) payable',
    //   //   'function startBridgeTokensViaAcross(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(int64,uint32,bytes,uint256)) payable',
    //   //   'function swapAndStartBridgeTokensViaAcross(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(int64,uint32,bytes,uint256)) payable',
    //   //   'function standardizedCall(bytes) payable',
    //   // ]

    //   // const bridgeSelectors = getSelectorsUsingFunSig(bridgeSig)
    //   // const bridgeApproval = bridgeSelectors.map(() => true)
    //   // const bridgeSigDex = bridgeSelectors.map(
    //   //   () => '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae'
    //   // )

    //   const swapSig = [
    //     // // oneInch
    //     // 'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint256 amount, uint256 minReturnAmount, uint256 flags) desc, bytes permit, bytes data) payable returns (uint256 returnAmount, uint256 spentAmount)',
    //     // // kyber
    //     // 'function swap(tuple(address,address,bytes,tuple(address,address,address[],uint256[],address[],uint256[],address,uint256,uint256,uint256,bytes),bytes)) payable returns (uint256, uint256)',
    //     // 'function swapGeneric(tuple(address,address,bytes,tuple(address,address,address[],uint256[],address[],uint256[],address,uint256,uint256,uint256,bytes),bytes)) payable returns (uint256, uint256)',
    //     // 'function swapSimpleMode(address,tuple(address,address,address[],uint256[],address[],uint256[],address,uint256,uint256,uint256,bytes),bytes,bytes) returns (uint256, uint256)',
    //     // // lifi
    //     // 'function swapTokensGeneric(bytes32,string,string,address,uint256,tuple(address,address,address,address,uint256,bytes,bool)[]) payable',
    //     // // odos
    //     // 'function swap(tuple(address,uint256,address,address,uint256,uint256,address),bytes,address,uint32) payable returns (uint256)',
    //     // 'function swapCompact() payable returns (uint256)',
    //     // 'function swapMultiCompact() payable returns (uint256[])',
    //     // // openOcean
    //     // 'function swap(address,tuple(address,address,address,address,uint256,uint256,uint256,uint256,address,bytes),tuple(uint256,uint256,uint256,bytes)[]) payable returns (uint256)',

    //     // paraswap
    //     //   multi swap Oxa94e78ef
    //     //   mega swap 0x46c67b6d
    //     //   Direct Uni V3Swap Oxa6886da9
    //     'function simpleSwap(tuple(address,address,uint256,uint256,uint256,address[],bytes,uint256[],uint256[],address,address,uint256,bytes,uint256,bytes16)) payable returns (uint256)',
    //     'function simpleBuy(tuple(address,address,uint256,uint256,uint256,address[],bytes,uint256[],uint256[],address,address,uint256,bytes,uint256,bytes16)) payable',

    //     // 0x
    //     // swap 0x415565b0
    //     // Buy ERC721 Oxfbee349d
    //     // Execute Meta Transaction V2 0x3d8d4082
    //     // Fill Taker Signed Otc Order 0x4f948110
    //   ]

    //   let swapSelectors = getSelectorsUsingFunSig(swapSig) as string[]
    //   swapSelectors = [
    //     ...swapSelectors,
    //     '0xa94e78ef',
    //     '0x46c67b6d',
    //     '0xa6886da9',
    //     // '0x415565b0',
    //     // '0xfbee349d',
    //     // '0x3d8d4082',
    //   ]

    //   const swapSelectorsSigDex = [
    //     // '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch
    //     // '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
    //     // '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
    //     // '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
    //     // '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', // lifi
    //     // '0xca423977156bb05b13a2ba3b76bc5419e2fe9680', // odos opt
    //     // '0xca423977156bb05b13a2ba3b76bc5419e2fe9680', // odos opt
    //     // '0xca423977156bb05b13a2ba3b76bc5419e2fe9680', // odos opt
    //     // '0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf', // odos
    //     // '0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf', // odos
    //     // '0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf', // odos
    //     // '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // openOcean
    //     '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
    //     '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
    //     '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
    //     '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
    //     '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
    //     // '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
    //     // '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
    //     // '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
    //   ]
    //   const swapApproval = swapSelectors.map(() => true)

    //   const sig = [...bridgeSig, ...swapSig]
    //   selectors = [...bridgeSelectors, ...swapSelectors]
    //   sigDex = [...bridgeSigDex, ...swapSelectorsSigDex]
    //   const approval = [...bridgeApproval, ...swapApproval]

    //   selectors.forEach(
    //     (selector, i) =>
    //       (selectorMap[selectors[i]] = {
    //         contract: sigDex[i],
    //         sig: sig[i] ? sig[i] : '',
    //       })
    //   )

    //   //   console.log(selectorMap)
    //   await dexManagerFacet.connect(owner).batchAddDex(dexs)

    //   console.log('Adding Dexs Signatures...')
    //   await dexManagerFacet
    //     .connect(owner)
    //     .batchSetFunctionApprovalBySignature(sigDex, selectors, approval)
    // }

    // /* ------------------------------ */
    // // deploy executor and receiver
    // const Executor = await ethers.getContractFactory('Executor')
    // executor = (await Executor.deploy(dZapDiamond.address)) as Executor
    // await crossChainFacet.deployed()

    // const Receiver = await ethers.getContractFactory('Receiver')
    // receiver = (await Receiver.deploy(
    //   owner.address,
    //   executor.address,
    //   0
    // )) as Receiver
    // await crossChainFacet.deployed()

    snapshotId = await snapshot.take()
  })

  beforeEach(async () => {
    await snapshot.revert(snapshotId)
  })

  it('test', async () => {
    await forkNetwork(jsonRpcUrl, 47995510)

    // -----------------------

    dZapDiamond = (await ethers.getContractAt(
      CONTRACTS.DZapDiamond,
      diamondAddress
    )) as DZapDiamond

    swapFacet = (await ethers.getContractAt(
      CONTRACTS.SwapFacet,
      dZapDiamond.address
    )) as SwapFacet

    const transactionId = ethers.utils.formatBytes32String('dummyId')
    const refundee = user.address
    const recipient = user.address

    // -------------------------

    // const amounts = [
    //   BigNumber.from('39013861800991814'),
    //   BigNumber.from('20826325731078662'),
    //   BigNumber.from('12'),
    //   BigNumber.from('130540565322924743'),
    // ]

    // // -------------------------

    // const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
    //   dZapDiamond.address,
    //   integrator.address,
    //   amounts
    // )

    // // -------------------------
    // const swapParamsPara: ParaswapParams[] = [
    //   {
    //     fromToken: '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4',
    //     toToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    //     fromAmount: amountWithoutFee[0],
    //     sender: dZapDiamond.address,
    //     receiver: dZapDiamond.address,
    //   },
    //   {
    //     fromToken: '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7',
    //     toToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    //     fromAmount: amountWithoutFee[1],
    //     sender: dZapDiamond.address,
    //     receiver: dZapDiamond.address,
    //   },
    //   {
    //     fromToken: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    //     toToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    //     fromAmount: amountWithoutFee[3],
    //     sender: dZapDiamond.address,
    //     receiver: dZapDiamond.address,
    //   },
    // ]
    // const paraSwapData = await getParaswapData(chainId, swapParamsPara)

    // const swapParams1inch: OneInchSwapParams[] = [
    //   {
    //     fromTokenAddress: '0xe111178a87a3bff0c8d18decba5798827539ae99',
    //     toTokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    //     amount: amountWithoutFee[2],
    //     fromAddress: dZapDiamond.address,
    //     slippage: 1,
    //     destReceiver: dZapDiamond.address,
    //     disableEstimate: true,
    //     compatibility: true,
    //   },
    // ]
    // const oneInchData = await getInchSwapData(chainId, swapParams1inch)

    // -------------------------

    // const data = [
    //   paraSwapData[0],
    //   paraSwapData[1],
    //   oneInchData[0],
    //   paraSwapData[2],
    // ]

    // const { swapData, value } = replaceFromAmount(
    //   data,
    //   amounts,
    //   fixedNativeFeeAmount
    // )

    const swapData = [
      // {
      //   callTo: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
      //   approveTo: '0x216b4b4ba9f3e719726886d34a177484278bfcae',
      //   from: '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4',
      //   to: '0x0000000000000000000000000000000000000000',
      //   fromAmount: '39013861800991814',
      //   minToAmount: '21399580102463591',
      //   swapCallData:
      //     '0x54e3f31b0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000a1c57f48f0deb89f569dfbe6e2b7f46d33606fd4000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000000000000000000000000000008a9ae68df6dc46000000000000000000000000000000000000000000000000004c06ce0259906700000000000000000000000000000000000000000000000000500729b1a1a57900000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000034000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000de74a179bfb939533caa344b402f11855afc6ff50000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000003e0000000000000000000000000000000000000000000000000000000006512c8b9fbf5a873dd68453fb6a612aba0e1aa58000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000f3938337f7294fef84e9b2c6d548a93f956cc28100000000000000000000000000000000000000000000000000000000000000e491a32b69000000000000000000000000a1c57f48f0deb89f569dfbe6e2b7f46d33606fd4000000000000000000000000000000000000000000000000008a9ae68df6dc4600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf127000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000004de5672d867b6f598a24fa0588c7bc181019d7db84ca000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      //   permit:
      //     '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
      // },
      // {
      //   callTo: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
      //   approveTo: '0x216b4b4ba9f3e719726886d34a177484278bfcae',
      //   from: '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7',
      //   to: '0x0000000000000000000000000000000000000000',
      //   fromAmount: '20826325731078662',
      //   minToAmount: '29377083856793282',
      //   swapCallData:
      //     '0x54e3f31b0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000385eeac5cb85a38a9a07a70c73e0a3271cfb54a7000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000000049fd6ed32d720600000000000000000000000000000000000000000000000000685e4d57d22ec2000000000000000000000000000000000000000000000000006ddc874ef8313700000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000034000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000de74a179bfb939533caa344b402f11855afc6ff50000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000003e0000000000000000000000000000000000000000000000000000000006512c8b9344f02cbeafa41d7bfce58a4740cb89e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000f3938337f7294fef84e9b2c6d548a93f956cc28100000000000000000000000000000000000000000000000000000000000000e491a32b69000000000000000000000000385eeac5cb85a38a9a07a70c73e0a3271cfb54a70000000000000000000000000000000000000000000000000049fd6ed32d720600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf127000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000004de5f69e93771f11aecd8e554aa165c3fe7fd811530c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e4000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      //   permit:
      //     '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
      // },
      {
        callTo: '0x1111111254EEB25477B68fb85Ed929f73A960582',
        approveTo: '0x1111111254EEB25477B68fb85Ed929f73A960582',
        from: '0xe111178a87a3bff0c8d18decba5798827539ae99',
        to: '0x0000000000000000000000000000000000000000',
        fromAmount: '12',
        minToAmount: '224649456229409058',
        // minToAmount: '0',
        swapCallData:
          '0x12aa3caf000000000000000000000000ce9cc1fa6df298854f77e92042fd2a3e7fb27eff000000000000000000000000e111178a87a3bff0c8d18decba5798827539ae99000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000ce9cc1fa6df298854f77e92042fd2a3e7fb27eff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000031e1d7d7d89e1220000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016400000000000000000000000000000000000000000000014600013000001a0020d6bdbf78e111178a87a3bff0c8d18decba5798827539ae9900a007e5c0d20000000000000000000000000000000000000000000000f20000b600006302a00000000000000000000000000000000000000000000000000000000000000001ee63c1e580c9d0cae8343a2231b1647ab00e639eabdc766147e111178a87a3bff0c8d18decba5798827539ae996e7a5fafcec6bb1e78bae2a1f0b612012bf1482700206ae4071118002dc6c06e7a5fafcec6bb1e78bae2a1f0b612012bf1482700000000000000000000000000000000000000000000000000000000000000012791bca1f2de4661ed88a30c99a7a9449aa8417441010d500b1d8e8ef31e21c99d1db9a6444d3adf127000042e1a7d4d0000000000000000000000000000000000000000000000000000000000000000c0611111111254eeb25477b68fb85ed929f73a96058200000000000000000000000000000000000000000000000000000000',
        permit:
          '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
      },
      // {
      //   callTo: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
      //   approveTo: '0x216b4b4ba9f3e719726886d34a177484278bfcae',
      //   from: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      //   to: '0x0000000000000000000000000000000000000000',
      //   fromAmount: '130540565322924743',
      //   minToAmount: '124013537056778506',
      //   swapCallData:
      //     '0x54e3f31b00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000000000000000000000000000001cfc5f3d8da02c700000000000000000000000000000000000000000000000001b895a7a79be90a00000000000000000000000000000000000000000000000001cfc5f3d8da02c700000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000002e0000000000000000000000000de74a179bfb939533caa344b402f11855afc6ff5000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000006512c8b9ad1acda32f0c484587a11698548b85ef0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf127000000000000000000000000000000000000000000000000000000000000000242e1a7d4d00000000000000000000000000000000000000000000000001cfc5f3d8da02c700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      //   permit:
      //     '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000',
      // },
    ] as any

    let value = ZERO
    swapData.forEach((d, i) => {
      if (isNative(d.from)) {
        value = value.add(d.fromAmount)
      }
    })

    console.log('swapData', swapData, value)

    // -------------------------
    // swap

    user = await impersonate('0x2cb99f193549681e06c6770ddd5543812b4fafe8')
    await updateBalance(user.address)

    // console.log(user.address, refundee, recipient)

    {
      let err
      try {
        await swapFacet
          .connect(user)
          .multiSwap(
            transactionId,
            integrator.address,
            refundee,
            recipient,
            swapData,
            {
              value,
            }
          )
      } catch (error: any) {
        err = error
        console.log('err', err)
        try {
          if (error.data) {
            const decodedError = swapFacet.interface.parseError(error.data)
            console.log('decodedError', decodedError)

            if (decodedError.args.reason) {
              const revertMessage = getRevertMsg(decodedError.args.reason)
              console.log('revertMessage', revertMessage)
              throw revertMessage
            } else {
              throw decodedError
            }
          } else {
            throw err
          }
        } catch (error) {
          console.log('final error', error)
          throw err
        }
      }
    }
  })
})
