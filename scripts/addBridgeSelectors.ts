import { ethers } from 'hardhat'
import { CONTRACTS } from '../constants'
import { CrossChainFacet } from '../typechain-types'
import { getSelectorsUsingFunSig } from './utils/diamond'

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

  const crossChainFacet = (await ethers.getContractAt(
    CONTRACTS.CrossChainFacet,
    diamondAddress
  )) as CrossChainFacet

  /* ------------------------------------------- */

  console.log('')

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
  const bridgeInfo = bridgeSelectors.map(() => {
    return { isAvailable: true, offset: 0 }
  })

  const tx3 = await crossChainFacet
    .connect(deployer)
    .updateSelectorInfo(bridgeSigDex, bridgeSelectors, bridgeInfo, {
      // gasPrice: parseUnits('90', 'gwei'),
    })
  console.log('updateSelectorInfo Tx', tx3.hash)
  const receipt2 = await tx3.wait()
  if (!receipt2.status) {
    throw Error(`Bridge Selector failed: ${tx3.hash}`)
  }
  console.log('Completed Adding Bridge Selectors')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
