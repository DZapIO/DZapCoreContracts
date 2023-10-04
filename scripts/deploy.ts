import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { CONTRACTS, BPS_MULTIPLIER, ZERO } from '../constants'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  getSelectorsUsingContract,
  getSelectorsUsingFunSig,
  removeFromSelectors,
} from './utils/diamond'
import { DiamondCut, FacetCutAction, FeeInfo, FeeType } from '../types'

async function init() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()
  const owner = deployer
  const integratorAddress = deployer.address

  // console.log({
  //   chainId,
  //   deployer: deployer.address,
  //   balance: ethers.utils.formatUnits(
  //     await ethers.provider.getBalance(deployer.address)
  //   ),
  // })

  // // --------------------------------------
  // // deploy DiamondCutFacet
  // const { diamondCutFacet } = await deployDiamondCut()
  // // const diamondCutFacet = await ethers.getContractAt(CONTRACTS.DZapDiamond, '')

  // // --------------------------------------
  // // deploy Diamond
  // const { dZapDiamond } = await deployDiamond(
  //   owner.address,
  //   diamondCutFacet.address
  // )
  // // const dZapDiamond = await ethers.getContractAt(
  // //   CONTRACTS.DZapDiamond,
  // //   '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'
  // // )

  // // --------------------------------------
  // // deploy DiamondInit
  // // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
  // const { diamondInit } = await deployDiamondInit()
  // // const diamondInit = await ethers.getContractAt(
  // //   CONTRACTS.DiamondInit,
  // //   ''
  // // )

  // const protocolFeeVaultAddress = deployer.address
  // const MAX_TOKEN_FEE = 10 * BPS_MULTIPLIER
  // const MAX_FIXED_FEE_AMOUNT = ethers.utils.parseUnits('1')

  // const initArgs = {
  //   permit2:
  //     chainId == 80001
  //       ? '0x95a18cb90585002c278B3354DACa83B6E9cF47C7'
  //       : '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  //   protocolFeeVault: protocolFeeVaultAddress,
  //   maxTokenFee: MAX_TOKEN_FEE,
  //   maxFixedNativeFeeAmount: MAX_FIXED_FEE_AMOUNT,
  // }

  // // --------------------------------------
  // // deploy facets
  // const { cutData } = await deployFacets()

  // // --------------------------------------
  // // upgrade diamond with facets
  // const initData = {
  //   address: diamondInit.address,
  //   data: (
  //     await diamondInit.populateTransaction.initialize(
  //       ...Object.values(initArgs)
  //     )
  //   ).data as string,
  // }
  // await upgradeDiamond(owner, cutData, dZapDiamond, initData)

  // // --------------------------------------
  // // add AccessManagerFacet

  // // --------------------------------------
  // // replace facets
  // // {
  // //   const dZapDiamond = await ethers.getContractAt(
  // //     CONTRACTS.DZapDiamond,
  // //     '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'
  // //   )

  // //   console.log('')
  // //   console.log('Replacing Facets...')
  // //   const { cutData } = await deployFacetsToReplace([CONTRACTS.SwapFacet])

  // //   const initData = {
  // //     address: ethers.constants.AddressZero,
  // //     data: '0x',
  // //   }

  // //   await upgradeDiamond(owner, cutData, dZapDiamond, initData)
  // // }

  // --------------------------------------
  // add fee data
  {
    console.log('')
    console.log('Setting Fee...')
    const feesFacet = await ethers.getContractAt(
      CONTRACTS.FeesFacet,
      // dZapDiamond.address
      // '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'
      '0x45f4883c5777dFA2e905F55f095554B1a20E23B7'
    )

    // const feeInfo: FeeInfo = {
    //   tokenFee: 1 * BPS_MULTIPLIER,
    //   fixedNativeFeeAmount: 0,
    //   dzapTokenShare: 100 * BPS_MULTIPLIER,
    //   dzapFixedNativeShare: 0,
    // }

    const feeInfo: FeeInfo[] = [
      {
        tokenFee: ZERO,
        fixedNativeFeeAmount: ZERO,
        dzapTokenShare: ZERO,
        dzapFixedNativeShare: ZERO,
      },
      {
        tokenFee: ZERO,
        fixedNativeFeeAmount: ZERO,
        dzapTokenShare: ZERO,
        dzapFixedNativeShare: ZERO,
      },
    ]

    const tx = await feesFacet
      .connect(owner)
      .setIntegratorInfo(
        integratorAddress,
        [FeeType.SWAP, FeeType.BRIDGE],
        feeInfo
      )
    console.log('tx:', tx.hash)
    const receipt = await tx.wait()
    if (!receipt.status) {
      throw Error(`Setting Fee failed: ${tx.hash}`)
    }
    console.log('Completed Setting Fee')
  }

  // --------------------------------------
  // add DexManager

  // {
  //   console.log('')
  //   console.log('Adding Dex...')
  //   const dexManagerFacet = await ethers.getContractAt(
  //     CONTRACTS.DexManagerFacet,
  //     dZapDiamond.address
  //     // '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'
  //   )
  //   const bridgeSelectors = getSelectorsUsingFunSig([
  //     'function startBridgeTokensViaHopL1ERC20Min(bytes8,address,uint256,address,uint256,uint256,address,uint256,address)',
  //     'function startBridgeTokensViaHopL1ERC20Packed() payable',
  //     'function startBridgeTokensViaHopL1NativeMin(bytes8,address,uint256,uint256,address,uint256,address) payable',
  //     'function startBridgeTokensViaHopL1NativePacked() payable',
  //     'function startBridgeTokensViaHopL2ERC20Min(bytes8,address,uint256,address,uint256,uint256,uint256,uint256,uint256,address)',
  //     'function startBridgeTokensViaHopL2ERC20Packed()',
  //     'function startBridgeTokensViaHopL2NativeMin(bytes8,address,uint256,uint256,uint256,uint256,uint256,address) payable',
  //     'function startBridgeTokensViaHopL2NativePacked() payable',
  //     'function startBridgeTokensViaCBridge(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint32,uint64)) payable',
  //     'function swapAndStartBridgeTokensViaCBridge(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint32,uint64)) payable',
  //     'function triggerRefund(address,bytes,address,address,uint256)',
  //     'function startBridgeTokensViaCBridgeERC20Min(bytes32,address,uint64,address,uint256,uint64,uint32)',
  //     'function startBridgeTokensViaCBridgeERC20Packed()',
  //     'function startBridgeTokensViaCBridgeNativeMin(bytes32,address,uint64,uint64,uint32) payable',
  //     'function startBridgeTokensViaCBridgeNativePacked() payable',
  //     'function startBridgeTokensViaWormhole(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(bytes32,uint256,uint32)) payable',
  //     'function swapAndStartBridgeTokensViaWormhole(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(bytes32,uint256,uint32)) payable',
  //     'function startBridgeTokensViaHyphen(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool)) payable',
  //     'function swapAndStartBridgeTokensViaHyphen(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[]) payable',
  //     'function startBridgeTokensViaMultichain(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address)) payable',
  //     'function swapAndStartBridgeTokensViaMultichain(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(address)) payable',
  //     'function updateAddressMappings(tuple(address,address)[])',
  //     'function startBridgeTokensViaAmarok(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(bytes,address,uint256,uint256,address,uint32,bool)) payable',
  //     'function swapAndStartBridgeTokensViaAmarok(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(bytes,address,uint256,uint256,address,uint32,bool)) payable',
  //     'function startBridgeTokensViaStargate(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,bytes,bytes)) payable',
  //     'function swapAndStartBridgeTokensViaStargate(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,bytes,bytes)) payable',
  //     'function startBridgeTokensViaHop(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,uint256,uint256)) payable',
  //     'function swapAndStartBridgeTokensViaHop(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,uint256,uint256)) payable',
  //     'function startBridgeTokensViaAllBridge(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,bytes32,uint256,bytes32,uint256,uint8,bool)) payable',
  //     'function swapAndStartBridgeTokensViaAllBridge(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,bytes32,uint256,bytes32,uint256,uint8,bool)) payable',
  //     'function startBridgeTokensViaCelerIM(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint32,uint64,bytes,bytes,uint256,uint8)) payable',
  //     'function swapAndStartBridgeTokensViaCelerIM(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint32,uint64,bytes,bytes,uint256,uint8)) payable',
  //     'function setApprovalForBridges(address[],address[])',
  //     'function startBridgeTokensViaHopL1ERC20(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
  //     'function startBridgeTokensViaHopL1Native(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
  //     'function startBridgeTokensViaHopL2ERC20(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256))',
  //     'function startBridgeTokensViaHopL2Native(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
  //     'function swapAndStartBridgeTokensViaHopL1ERC20(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
  //     'function swapAndStartBridgeTokensViaHopL1Native(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
  //     'function swapAndStartBridgeTokensViaHopL2ERC20(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
  //     'function swapAndStartBridgeTokensViaHopL2Native(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
  //     'function startBridgeTokensViaLIFuel(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool)) payable',
  //     'function swapAndStartBridgeTokensViaLIFuel(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[]) payable',
  //     'function startBridgeTokensViaAcross(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(int64,uint32,bytes,uint256)) payable',
  //     'function swapAndStartBridgeTokensViaAcross(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(int64,uint32,bytes,uint256)) payable',
  //     'function standardizedCall(bytes) payable',
  //   ])
  //   const bridgeSigDex = bridgeSelectors.map(
  //     () => '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'
  //   )
  //   let swapSelectors = getSelectorsUsingFunSig([
  //     // oneInch
  //     'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint256 amount, uint256 minReturnAmount, uint256 flags) desc, bytes permit, bytes data) payable returns (uint256 returnAmount, uint256 spentAmount)',
  //     // kyber
  //     'function swap(tuple(address,address,bytes,tuple(address,address,address[],uint256[],address[],uint256[],address,uint256,uint256,uint256,bytes),bytes)) payable returns (uint256, uint256)',
  //     'function swapGeneric(tuple(address,address,bytes,tuple(address,address,address[],uint256[],address[],uint256[],address,uint256,uint256,uint256,bytes),bytes)) payable returns (uint256, uint256)',
  //     'function swapSimpleMode(address,tuple(address,address,address[],uint256[],address[],uint256[],address,uint256,uint256,uint256,bytes),bytes,bytes) returns (uint256, uint256)',
  //     // lifi
  //     'function swapTokensGeneric(bytes32,string,string,address,uint256,tuple(address,address,address,address,uint256,bytes,bool)[]) payable',
  //     // odos
  //     'function swap(tuple(address,uint256,address,address,uint256,uint256,address),bytes,address,uint32) payable returns (uint256)',
  //     'function swapCompact() payable returns (uint256)',
  //     'function swapMultiCompact() payable returns (uint256[])',
  //     // openOcean
  //     'function swap(address,tuple(address,address,address,address,uint256,uint256,uint256,uint256,address,bytes),tuple(uint256,uint256,uint256,bytes)[]) payable returns (uint256)',
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
  //   ]) as string[]
  //   swapSelectors = [
  //     ...swapSelectors,
  //     '0xa94e78ef',
  //     '0x46c67b6d',
  //     '0xa6886da9',
  //     '0x415565b0',
  //     '0xfbee349d',
  //     '0x3d8d4082',
  //   ]
  //   // // polygon
  //   // const dex = [
  //   //   '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch
  //   //   '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
  //   //   '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', // lifi
  //   //   '0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf', // odos
  //   //   '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // openOcean
  //   //   '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
  //   //   '0x216b4b4ba9f3e719726886d34a177484278bfcae', // paraswap token proxy
  //   //   '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
  //   // ]

  //   // // arbitrum
  //   // const dex = [
  //   //   '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch
  //   //   '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
  //   //   '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', // lifi
  //   //   '0xa669e7a0d4b3e4fa48af2de86bd4cd7126be4e13', // odos
  //   //   '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // openOcean
  //   //   '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
  //   //   '0x216b4b4ba9f3e719726886d34a177484278bfcae', // paraswap token proxy
  //   //   '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
  //   // ]

  //   // optimism
  //   const dex = [
  //     '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch
  //     '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
  //     '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', // lifi
  //     '0xca423977156bb05b13a2ba3b76bc5419e2fe9680', // odos
  //     '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // openOcean
  //     '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
  //     '0x216b4b4ba9f3e719726886d34a177484278bfcae', // paraswap token proxy
  //     '0xdef1abe32c034e558cdd535791643c58a13acc10', // 0X
  //   ]

  //   const swapSigDex = [
  //     '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch
  //     '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch
  //     '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
  //     '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
  //     '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
  //     '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', // lifi
  //     '0xca423977156bb05b13a2ba3b76bc5419e2fe9680', // odos
  //     '0xca423977156bb05b13a2ba3b76bc5419e2fe9680', // odos
  //     '0xca423977156bb05b13a2ba3b76bc5419e2fe9680', // odos
  //     '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // openOcean
  //     '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
  //     '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap

  //     '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
  //     '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
  //     '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
  //     '0xdef1abe32c034e558cdd535791643c58a13acc10', // 0X
  //     '0xdef1abe32c034e558cdd535791643c58a13acc10', // 0X
  //     '0xdef1abe32c034e558cdd535791643c58a13acc10', // 0X
  //   ]
  //   const sigDex = [...swapSigDex, ...bridgeSigDex]
  //   const selectors = [...swapSelectors, ...bridgeSelectors]
  //   const approval = selectors.map(() => true)

  //   // console.log(selectors, sigDex, selectors.length, sigDex.length)
  //   const tx1 = await dexManagerFacet.connect(owner).batchAddDex(dex)
  //   console.log('batchAddDex Tx', tx1.hash)
  //   const receipt1 = await tx1.wait()
  //   if (!receipt1.status) {
  //     throw Error(`Adding Dex failed: ${tx1.hash}`)
  //   }
  //   console.log('Completed Adding Dex')

  //   // const tx2 = await dexManagerFacet
  //   //   .connect(owner)
  //   //   .setFunctionApprovalBySignature(sigDex[0], selectors[0], approval[0])

  //   const tx2 = await dexManagerFacet
  //     .connect(owner)
  //     .batchSetFunctionApprovalBySignature(sigDex, selectors, approval)
  //   console.log('batchSetFunctionApprovalBySignature Tx', tx2.hash)
  //   const receipt2 = await tx2.wait()
  //   if (!receipt2.status) {
  //     throw Error(`Adding Dex Signatures failed: ${tx2.hash}`)
  //   }
  //   console.log('Completed Adding Dex Signatures')
  // }

  // --------------------------------------
  // updateSelectorInfo offset

  // {
  //   console.log('')
  //   console.log('Adding bridge selectors...')
  //   const crossChainFacet = await ethers.getContractAt(
  //     'CrossChainFacet',
  //     '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'
  //   )
  //   const tx = await crossChainFacet.connect(owner).updateSelectorInfo(
  //     [
  //       '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
  //       '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
  //       '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
  //       '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
  //     ],
  //     ['0xbe1eace7', '0xed178619', '0x8dc9932d', '0x83f31917'],
  //     [
  //       {
  //         isAvailable: true,
  //         offset: 0,
  //       },
  //       {
  //         isAvailable: true,
  //         offset: 0,
  //       },
  //       {
  //         isAvailable: true,
  //         offset: 0,
  //       },
  //       {
  //         isAvailable: true,
  //         offset: 0,
  //       },
  //     ]
  //   )
  //   console.log('tx:', tx.hash)

  //   const receipt = await tx.wait()
  //   if (!receipt.status) {
  //     throw Error(`Bridge Selector Update failed: ${tx.hash}`)
  //   }
  //   console.log('Bridge Selector Updated')
  // }
}

async function deployDiamondCut() {
  console.log('')
  console.log('Deploying diamondCutFacet...')
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
  const diamondCutFacet = await DiamondCutFacet.deploy()
  await diamondCutFacet.deployed()
  console.log('DiamondCutFacet deployed:', diamondCutFacet.address)

  return { diamondCutFacet }
}

async function deployDiamondInit() {
  console.log('')
  console.log('Deploying DiamondInit...')
  const DiamondInit = await ethers.getContractFactory(CONTRACTS.DiamondInit)
  const diamondInit = await DiamondInit.deploy()
  await diamondInit.deployed()
  console.log('DiamondInit deployed:', diamondInit.address)

  return { diamondInit }
}

async function deployDiamond(
  contractOwner: string,
  diamondCutFacetAddress: string
) {
  console.log('')
  console.log('Deploying dZapDiamond...')
  const Diamond = await ethers.getContractFactory('DZapDiamond')
  const dZapDiamond = await Diamond.deploy(
    contractOwner,
    diamondCutFacetAddress
  )
  await dZapDiamond.deployed()
  console.log('DZapDiamond deployed:', dZapDiamond.address)

  return { dZapDiamond }
}

async function deployFacets() {
  console.log('')
  console.log('Deploying facets...')

  const DiamondLoupeFacet = await ethers.getContractFactory(
    CONTRACTS.DiamondLoupeFacet
  )
  const diamondLoupeFacet = await DiamondLoupeFacet.deploy()
  await diamondLoupeFacet.deployed()
  console.log(`DiamondLoupeFacet deployed: ${diamondLoupeFacet.address}`)

  const OwnershipFacet = await ethers.getContractFactory(
    CONTRACTS.OwnershipFacet
  )
  const ownershipFacet = await OwnershipFacet.deploy()
  await ownershipFacet.deployed()
  console.log(`OwnershipFacet deployed: ${ownershipFacet.address}`)

  const AccessManagerFacet = await ethers.getContractFactory(
    'AccessManagerFacet'
  )
  const accessManagerFacet = await AccessManagerFacet.deploy()
  await accessManagerFacet.deployed()
  console.log(`AccessManagerFacet deployed: ${accessManagerFacet.address}`)

  const DexManagerFacet = await ethers.getContractFactory(
    CONTRACTS.DexManagerFacet
  )
  const dexManagerFacet = await DexManagerFacet.deploy()
  await dexManagerFacet.deployed()
  console.log(`DexManagerFacet deployed: ${dexManagerFacet.address}`)

  const FeesFacet = await ethers.getContractFactory(CONTRACTS.FeesFacet)
  const feesFacet = await FeesFacet.deploy()
  await feesFacet.deployed()
  console.log(`FeesFacet deployed: ${feesFacet.address}`)

  const WithdrawFacet = await ethers.getContractFactory(CONTRACTS.WithdrawFacet)
  const withdrawFacet = await WithdrawFacet.deploy()
  await withdrawFacet.deployed()
  console.log(`WithdrawFacet deployed: ${withdrawFacet.address}`)

  const SwapFacet = await ethers.getContractFactory(CONTRACTS.SwapFacet)
  const swapFacet = await SwapFacet.deploy()
  await swapFacet.deployed()
  console.log(`SwapFacet deployed: ${swapFacet.address}`)

  const CrossChainFacet = await ethers.getContractFactory(
    CONTRACTS.CrossChainFacet
  )
  const crossChainFacet = await CrossChainFacet.deploy()
  await crossChainFacet.deployed()
  console.log(`CrossChainFacet deployed: ${crossChainFacet.address}`)

  /* 
  const diamondLoupeFacet = await ethers.getContractAt(
    CONTRACTS.DiamondLoupeFacet,
    '0x77b02b7DCAeea6d2C1503211c80BF466Fd28b772'
  )
  const ownershipFacet = await ethers.getContractAt(
    CONTRACTS.OwnershipFacet,
    '0x7c48359C5E77420eFD353D53221032347185f39e'
  )
  const accessManagerFacet = await ethers.getContractAt(
    'AccessManagerFacet',
    '0x92cc4CeEE7450377B2De1b0b9192B41520d9B6F9'
  )
  const dexManagerFacet = await ethers.getContractAt(
    CONTRACTS.DexManagerFacet,
    '0x26E3eD863606e2cb110C4f112819B3605D82bd8D'
  )
  const feesFacet = await ethers.getContractAt(
    CONTRACTS.FeesFacet,
    '0xc6BB92a1454BCB1AF921955DE1873b4e23b52CB5'
  )
  const withdrawFacet = await ethers.getContractAt(
    CONTRACTS.WithdrawFacet,
    '0x9505F36b63320AF377183F252962f8F397544C66'
  )
  const swapFacet = await ethers.getContractAt(
    CONTRACTS.SwapFacet,
    '0xf37848d6BEA6f32f5584C987853A05291CEb64D9'
  )
  const crossChainFacet = await ethers.getContractAt(
    CONTRACTS.CrossChainFacet,
    '0xEC5F822DbD177F575eE5420C7cA7cD2C10e56F67'
  )
 */

  const cutData: DiamondCut[] = [
    {
      facetAddress: diamondLoupeFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        diamondLoupeFacet,
        CONTRACTS.DiamondLoupeFacet
      ).selectors,
    },
    {
      facetAddress: ownershipFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        ownershipFacet,
        CONTRACTS.OwnershipFacet
      ).selectors,
    },
    {
      facetAddress: accessManagerFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        accessManagerFacet,
        'AccessManagerFacet'
      ).selectors,
    },
    {
      facetAddress: dexManagerFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        dexManagerFacet,
        CONTRACTS.DexManagerFacet
      ).selectors,
    },
    {
      facetAddress: feesFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        feesFacet,
        CONTRACTS.FeesFacet
      ).selectors,
    },
    // {
    //   facetAddress: feesFacet.address,
    //   action: FacetCutAction.Add,
    //   functionSelectors: removeFromSelectors(
    //     feesFacet,
    //     getSelectorsUsingContract(feesFacet, CONTRACTS.FeesFacet).selectors,
    //     ['initialize(address,uint256,uint256)']
    //   ),
    // },
    {
      facetAddress: withdrawFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        withdrawFacet,
        CONTRACTS.WithdrawFacet
      ).selectors,
    },
    {
      facetAddress: swapFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        swapFacet,
        CONTRACTS.SwapFacet
      ).selectors,
    },
    {
      facetAddress: crossChainFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(
        crossChainFacet,
        CONTRACTS.CrossChainFacet
      ).selectors,
    },
  ]

  return {
    cutData,
    diamondLoupeFacet,
    ownershipFacet,
    accessManagerFacet,
    dexManagerFacet,
    withdrawFacet,
    feesFacet,
    swapFacet,
    crossChainFacet,
  }
}

async function upgradeDiamond(
  owner: SignerWithAddress,
  cutData: DiamondCut[],
  diamond,
  initData: {
    address: string
    data: string
  }
) {
  console.log('')
  console.log('Diamond Cut:', cutData)
  const diamondCut = await ethers.getContractAt(
    CONTRACTS.DiamondCutFacet,
    diamond.address
  )

  const estimateGas = await diamondCut
    .connect(owner)
    .estimateGas.diamondCut(cutData, initData.address, initData.data)
  console.log('estimateGas', estimateGas.toString())

  const tx = await diamondCut
    .connect(owner)
    .diamondCut(cutData, initData.address, initData.data)
  console.log('Diamond cut tx: ', tx.hash)
  const receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')
}

async function deployFacetsToReplace(facetNames: string[]) {
  const cutData: DiamondCut[] = []
  console.log('')
  console.log('Deploying NewFacets:')
  for (let i = 0; i < facetNames.length; i++) {
    const facetName = facetNames[i]
    const Facet = await ethers.getContractFactory(facetName)
    const facet = await Facet.deploy()
    await facet.deployed()
    console.log(`${facetName} deployed: ${facet.address}`)

    if (facetName == CONTRACTS.FeesFacet) {
      cutData.push({
        facetAddress: facet.address,
        action: FacetCutAction.Replace,
        functionSelectors: getSelectorsUsingContract(facet, CONTRACTS.FeesFacet)
          .selectors,
      })
    } else {
      cutData.push({
        facetAddress: facet.address,
        action: FacetCutAction.Replace,
        functionSelectors: getSelectorsUsingContract(facet, facetName)
          .selectors,
      })
    }
  }

  return { cutData }
}

if (require.main === module) {
  init()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployDiamond = deployDiamond
