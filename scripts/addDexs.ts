import { ethers } from 'hardhat'
import { CONTRACTS, ZERO } from '../constants'
import { DexManagerFacet, FeesFacet, SwapFacet } from '../typechain-types'
import { getSelectorsUsingFunSig } from './utils/diamond'
import { getRevertMsg } from './core/helper'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [deployer] = await ethers.getSigners()

  console.log({
    name: 'addDex',
    chainId,
    deployer: deployer.address,
    balance: ethers.utils.formatUnits(
      await ethers.provider.getBalance(deployer.address)
    ),
  })

  /* ------------------------------------------- */

  const diamondAddress = ''

  const swapFacet = (await ethers.getContractAt(
    CONTRACTS.SwapFacet,
    diamondAddress
  )) as SwapFacet

  const feesFacet = (await ethers.getContractAt(
    CONTRACTS.FeesFacet,
    diamondAddress
  )) as FeesFacet

  const dexManagerFacet = (await ethers.getContractAt(
    CONTRACTS.DexManagerFacet,
    diamondAddress
  )) as DexManagerFacet

  /* ------------------------------------------- */

  console.log('')

  const selectorMap = {}

  const bridgeSig = [
    'function startBridgeTokensViaHopL1ERC20Min(bytes8,address,uint256,address,uint256,uint256,address,uint256,address)',
    'function startBridgeTokensViaHopL1ERC20Packed() payable',
    'function startBridgeTokensViaHopL1NativeMin(bytes8,address,uint256,uint256,address,uint256,address) payable',
    'function startBridgeTokensViaHopL1NativePacked() payable',
    'function startBridgeTokensViaHopL2ERC20Min(bytes8,address,uint256,address,uint256,uint256,uint256,uint256,uint256,address)',
    'function startBridgeTokensViaHopL2ERC20Packed()',
    'function startBridgeTokensViaHopL2NativeMin(bytes8,address,uint256,uint256,uint256,uint256,uint256,address) payable',
    'function startBridgeTokensViaHopL2NativePacked() payable',
    'function startBridgeTokensViaCBridge(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint32,uint64)) payable',
    'function swapAndStartBridgeTokensViaCBridge(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint32,uint64)) payable',
    'function triggerRefund(address,bytes,address,address,uint256)',
    'function startBridgeTokensViaCBridgeERC20Min(bytes32,address,uint64,address,uint256,uint64,uint32)',
    'function startBridgeTokensViaCBridgeERC20Packed()',
    'function startBridgeTokensViaCBridgeNativeMin(bytes32,address,uint64,uint64,uint32) payable',
    'function startBridgeTokensViaCBridgeNativePacked() payable',
    'function startBridgeTokensViaWormhole(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(bytes32,uint256,uint32)) payable',
    'function swapAndStartBridgeTokensViaWormhole(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(bytes32,uint256,uint32)) payable',
    'function startBridgeTokensViaHyphen(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool)) payable',
    'function swapAndStartBridgeTokensViaHyphen(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[]) payable',
    'function startBridgeTokensViaMultichain(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address)) payable',
    'function swapAndStartBridgeTokensViaMultichain(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(address)) payable',
    'function updateAddressMappings(tuple(address,address)[])',
    'function startBridgeTokensViaAmarok(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(bytes,address,uint256,uint256,address,uint32,bool)) payable',
    'function swapAndStartBridgeTokensViaAmarok(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(bytes,address,uint256,uint256,address,uint32,bool)) payable',
    'function startBridgeTokensViaStargate(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,bytes,bytes)) payable',
    'function swapAndStartBridgeTokensViaStargate(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,bytes,bytes)) payable',
    'function startBridgeTokensViaHop(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,uint256,uint256)) payable',
    'function swapAndStartBridgeTokensViaHop(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,uint256,uint256)) payable',
    'function startBridgeTokensViaAllBridge(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,bytes32,uint256,bytes32,uint256,uint8,bool)) payable',
    'function swapAndStartBridgeTokensViaAllBridge(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,bytes32,uint256,bytes32,uint256,uint8,bool)) payable',
    'function startBridgeTokensViaCelerIM(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint32,uint64,bytes,bytes,uint256,uint8)) payable',
    'function swapAndStartBridgeTokensViaCelerIM(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint32,uint64,bytes,bytes,uint256,uint8)) payable',
    'function setApprovalForBridges(address[],address[])',
    'function startBridgeTokensViaHopL1ERC20(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    'function startBridgeTokensViaHopL1Native(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    'function startBridgeTokensViaHopL2ERC20(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256))',
    'function startBridgeTokensViaHopL2Native(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    'function swapAndStartBridgeTokensViaHopL1ERC20(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    'function swapAndStartBridgeTokensViaHopL1Native(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    'function swapAndStartBridgeTokensViaHopL2ERC20(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    'function swapAndStartBridgeTokensViaHopL2Native(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(uint256,uint256,uint256,uint256,uint256,address,address,uint256,uint256)) payable',
    'function startBridgeTokensViaLIFuel(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool)) payable',
    'function swapAndStartBridgeTokensViaLIFuel(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[]) payable',
    'function startBridgeTokensViaAcross(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(int64,uint32,bytes,uint256)) payable',
    'function swapAndStartBridgeTokensViaAcross(tuple(bytes32,string,string,address,address,address,uint256,uint256,bool,bool),tuple(address,address,address,address,uint256,bytes,bool)[],tuple(int64,uint32,bytes,uint256)) payable',
    'function standardizedCall(bytes) payable',
  ]
  const bridgeSelectors = getSelectorsUsingFunSig(bridgeSig)
  const bridgeSigDex = bridgeSelectors.map(
    () => '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae'
  )

  // const bridgeSig = []
  // const bridgeSelectors = []
  // const bridgeSigDex = []
  // const bridgeApproval = []

  const swapSig = [
    // oneInch
    'function swap(address executor, tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint256 amount, uint256 minReturnAmount, uint256 flags) desc, bytes permit, bytes data) payable returns (uint256 returnAmount, uint256 spentAmount)',
    // kyber
    'function swap(tuple(address,address,bytes,tuple(address,address,address[],uint256[],address[],uint256[],address,uint256,uint256,uint256,bytes),bytes)) payable returns (uint256, uint256)',
    'function swapGeneric(tuple(address,address,bytes,tuple(address,address,address[],uint256[],address[],uint256[],address,uint256,uint256,uint256,bytes),bytes)) payable returns (uint256, uint256)',
    'function swapSimpleMode(address,tuple(address,address,address[],uint256[],address[],uint256[],address,uint256,uint256,uint256,bytes),bytes,bytes) returns (uint256, uint256)',
    // lifi
    'function swapTokensGeneric(bytes32,string,string,address,uint256,tuple(address,address,address,address,uint256,bytes,bool)[]) payable',
    // odos
    'function swap(tuple(address,uint256,address,address,uint256,uint256,address),bytes,address,uint32) payable returns (uint256)',
    'function swapCompact() payable returns (uint256)',
    'function swapMultiCompact() payable returns (uint256[])',
    // openOcean
    'function swap(address,tuple(address,address,address,address,uint256,uint256,uint256,uint256,address,bytes),tuple(uint256,uint256,uint256,bytes)[]) payable returns (uint256)',
    // paraswap
    //   multi swap Oxa94e78ef
    //   mega swap 0x46c67b6d
    //   Direct Uni V3Swap Oxa6886da9
    'function simpleSwap(tuple(address,address,uint256,uint256,uint256,address[],bytes,uint256[],uint256[],address,address,uint256,bytes,uint256,bytes16)) payable returns (uint256)',
    'function simpleBuy(tuple(address,address,uint256,uint256,uint256,address[],bytes,uint256[],uint256[],address,address,uint256,bytes,uint256,bytes16)) payable',
    // 0x
    // swap 0x415565b0
    // Buy ERC721 Oxfbee349d
    // Execute Meta Transaction V2 0x3d8d4082
    // Fill Taker Signed Otc Order 0x4f948110
  ]

  let swapSelectors = getSelectorsUsingFunSig(swapSig)
  swapSelectors = [
    ...swapSelectors,
    '0xa94e78ef',
    '0x46c67b6d',
    '0xa6886da9',
    '0x415565b0',
    '0xfbee349d',
    '0x3d8d4082',
  ]

  const dex = {
    137: [
      '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch
      '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
      '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', // lifi
      '0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf', // odos
      '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // openOcean
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0x216b4b4ba9f3e719726886d34a177484278bfcae', // paraswap token proxy
      '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
    ],
    42161: [
      '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch
      '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
      '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', // lifi
      '0xa669e7a0d4b3e4fa48af2de86bd4cd7126be4e13', // odos
      '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // openOcean
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0x216b4b4ba9f3e719726886d34a177484278bfcae', // paraswap token proxy
      '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
    ],
    10: [
      '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch
      '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
      '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', // lifi
      '0xca423977156bb05b13a2ba3b76bc5419e2fe9680', // odos
      '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // openOcean
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0x216b4b4ba9f3e719726886d34a177484278bfcae', // paraswap token proxy
      '0xdef1abe32c034e558cdd535791643c58a13acc10', // 0X
    ],
  }

  const swapSigDex = {
    137: [
      '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch

      '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
      '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
      '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber

      '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', // lifi

      '0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf', // odos poly
      '0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf', // odos poly
      '0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf', // odos poly

      '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // openOcean

      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap

      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap

      '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
      '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
      '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
    ],
    42161: [
      '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch
      '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
      '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
      '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
      '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', // lifi
      '0xa669e7a0d4b3e4fa48af2de86bd4cd7126be4e13', // odos arb
      '0xa669e7a0d4b3e4fa48af2de86bd4cd7126be4e13', // odos arb
      '0xa669e7a0d4b3e4fa48af2de86bd4cd7126be4e13', // odos arb
      '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // openOcean
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
      '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
      '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0X
    ],
    10: [
      '0x1111111254EEB25477B68fb85Ed929f73A960582', // oneInch
      '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
      '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
      '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5', // kyber
      '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE', // lifi
      '0xca423977156bb05b13a2ba3b76bc5419e2fe9680', // odos opt
      '0xca423977156bb05b13a2ba3b76bc5419e2fe9680', // odos opt
      '0xca423977156bb05b13a2ba3b76bc5419e2fe9680', // odos opt
      '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // openOcean
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57', // paraswap
      '0xdef1abe32c034e558cdd535791643c58a13acc10', // 0X
      '0xdef1abe32c034e558cdd535791643c58a13acc10', // 0X
      '0xdef1abe32c034e558cdd535791643c58a13acc10', // 0X
    ],
  }

  const sig = [...swapSig, ...bridgeSig]
  const sigDex = [...swapSigDex[chainId], ...bridgeSigDex]
  const selectors = [...swapSelectors, ...bridgeSelectors]
  const approval = selectors.map(() => true)

  selectors.forEach((selector, i) => {
    selectorMap[selectors[i]] = {
      contract: sigDex[i],
      sig: sig[i] ? sig[i] : '',
    }
  })

  // --------------------------------------

  console.log('Adding Dex...')

  const tx1 = await dexManagerFacet.connect(deployer).batchAddDex(dex[chainId])
  console.log('batchAddDex Tx', tx1.hash)
  const receipt1 = await tx1.wait()
  if (!receipt1.status) {
    throw Error(`Adding Dex failed: ${tx1.hash}`)
  }
  console.log('Completed Adding Dex')

  // --------------------------------------

  console.log('Adding Function...')
  const tx2 = await dexManagerFacet
    .connect(deployer)
    .batchSetFunctionApprovalBySignature(sigDex, selectors, approval)
  console.log('batchSetFunctionApprovalBySignature Tx', tx2.hash)
  const receipt2 = await tx2.wait()
  if (!receipt2.status) {
    throw Error(`Adding Dex Signatures failed: ${tx2.hash}`)
  }
  console.log('Completed Adding Dex Signatures')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
