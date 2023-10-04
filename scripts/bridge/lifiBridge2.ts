import { ethers } from 'hardhat'
import { CONTRACTS } from '../../constants'
import { CrossChainFacet } from '../../typechain'
import { parseUnits } from 'ethers/lib/utils'
import { FeeType, LifiParams } from '../../types'
import { getLifiBridgeData } from '../core/lifi'
import { getFeeData, isNative } from '../core/helper'
import { chainIds, tokenAddress } from '../core/registry'

const diamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  // const networkName: string = networks[chainId];
  const [signer] = await ethers.getSigners()

  console.log({
    name: 'lifi',
    chainId,
    signer: signer.address,
    balance: ethers.utils.formatUnits(await signer.getBalance()),
  })

  /* ------------------------------------------- */

  const dZap = (await ethers.getContractAt(
    CONTRACTS.CrossChainFacet,
    diamondAddress
  )) as CrossChainFacet

  /* ------------------------------------------- */

  const integrator = '0x12480616436DD6D555f88B8d94bB5156E28825B1' // dzapProjectId
  const recipient = signer.address

  const amounts = [parseUnits('0.5', 6)]
  // const gasPrice = parseUnits('150 ', 'gwei')

  /* ------------------------------------------- */

  // await approveToken(
  //   signer,
  //   tokenAddress.usdc,
  //   dZap.address,
  //   approveAmount
  // )

  /* ------------------------------------------- */

  const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
    diamondAddress,
    integrator,
    amounts,
    FeeType.BRIDGE
  )
  /* ------------------------------------------- */

  const params: LifiParams[] = [
    {
      fromChain: chainId,
      toChain: chainIds.bscMainnet,
      fromToken: tokenAddress[chainId].usdt as string,
      toToken: tokenAddress[chainIds.bscMainnet].usd as string,
      fromAddress: dZap.address,
      toAddress: dZap.address,
      fromAmount: amountWithoutFee[0],
      slippage: 1 / 100, // 0.005 represents 0.5%.
      enableSlippageProtection: false,
    },
  ]

  const { genericData, bridgeNames } = await getLifiBridgeData(params)
  const bridgeData: any = []

  let value = fixedNativeFeeAmount
  for (let i = 0; i < genericData.length; i++) {
    value = value.add(genericData[i].extraNative)
    if (isNative(params[i].fromAddress)) {
      value = value.add(amounts[i])
    }

    bridgeData.push({
      bridge: bridgeNames[i],
      from: params[i].fromToken,
      to: params[i].toToken,
      receiver: signer.address,
      minAmount: amounts[i],
      destinationChainId: params[i].toChain,
      hasSourceSwaps: false,
      hasDestinationCall: false,
    })
  }

  console.log({ genericData, bridgeData, value })

  /* ------------------------------------------- */
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
