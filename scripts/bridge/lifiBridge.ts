import { ethers } from 'hardhat'
import { CONTRACTS, DZAP_NATIVE, NATIVE_ADDRESS } from '../../constants'
import { CrossChainFacet } from '../../typechain'
import { parseUnits } from 'ethers/lib/utils'
import { FeeType, LifiParams } from '../../types'
import { getLifiBridgeData } from '../core/lifi'
import {
  approveToken,
  getFeeData,
  getRevertMsg,
  isNative,
} from '../core/helper'
import { chainIds, tokenAddress } from '../core/registry'
import { BigNumber } from 'ethers'

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

  const dZapCore = (await ethers.getContractAt(
    CONTRACTS.CrossChainFacet,
    diamondAddress
  )) as CrossChainFacet

  /* ------------------------------------------- */

  const integrator = '0x12480616436DD6D555f88B8d94bB5156E28825B1' // dzapProjectId
  const transactionId = ethers.utils.formatBytes32String('dummyId')
  const refundee = signer.address
  const recipient = signer.address
  const amounts = [parseUnits('3', 6)]
  // const amounts = [parseUnits('1')]
  // const gasPrice = parseUnits('150 ', 'gwei')

  /* ------------------------------------------- */

  // const approveAmount = parseUnits('100', 6)
  // const fromTokenAddress = tokenAddress[chainId].usdc as string
  // await approveToken(signer, fromTokenAddress, dZapCore.address, approveAmount)

  /* ------------------------------------------- */

  const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
    diamondAddress,
    integrator,
    amounts,
    FeeType.BRIDGE
  )
  /* ------------------------------------------- */

  const token = await ethers.getContractAt(
    'ERC20Mock',
    tokenAddress[chainId].usdc as string
  )
  console.log({
    amount: amounts[0],
    amountWithoutFee: amountWithoutFee[0],
    balanceOf: await token.balanceOf(signer.address),
    allowance: await token.allowance(signer.address, dZapCore.address),
  })

  const params: LifiParams[] = [
    {
      fromChain: chainId,
      toChain: chainIds.bscMainnet,
      fromToken: tokenAddress[chainId].usdc as string,
      toToken: tokenAddress[chainIds.bscMainnet].usd as string,
      // fromToken: NATIVE_ADDRESS,
      // toToken: tokenAddress[chainIds.bscMainnet].usd as string,
      fromAddress: dZapCore.address,
      // toAddress: dZapCore.address, // for destination call
      toAddress: recipient,
      fromAmount: amountWithoutFee[0],
      slippage: 1 / 100, // 1%
      enableSlippageProtection: false,
      // allowBridges: ['stargate', 'amarok'],
      // allowBridges: ['stargate'],
      allowBridges: ['amarok'],
    },
  ]

  const { genericData, bridgeNames } = await getLifiBridgeData(params)
  const bridgeData: any = []

  let value = fixedNativeFeeAmount
  for (let i = 0; i < genericData.length; i++) {
    value = value.add(genericData[i].extraNative)
    bridgeData.push({
      bridge: bridgeNames[i],
      from: isNative(params[i].fromToken) ? DZAP_NATIVE : params[i].fromToken,
      to: params[i].toToken,
      receiver: recipient,
      // minAmount: amounts[i],
      // minAmount: amountWithoutFee[i],
      minAmount: amounts[i],
      destinationChainId: params[i].toChain,
      hasSourceSwaps: false,
      hasDestinationCall: false,
    })
  }

  console.log({
    genericData,
    bridgeData,
    value,
    fixedNativeFeeAmount,
    extraNative: BigNumber.from(genericData[0].extraNative),
  })

  // -------------------

  let err: any
  try {
    await dZapCore
      .connect(signer)
      .estimateGas.bridge(
        transactionId,
        integrator,
        refundee,
        bridgeData[0],
        genericData[0],
        {
          value,
        }
      )
    // const tx = await dZapCore
    //   .connect(signer)
    //   .bridge(
    //     transactionId,
    //     integrator,
    //     refundee,
    //     bridgeData[0],
    //     genericData[0],
    //     {
    //       value,
    //     }
    //   )
    // console.log('tx', tx.hash)
    // const receipt = await tx.wait()
    // if (!receipt.status) {
    //   throw Error(`Bridge failed: ${tx.hash}`)
    // }
    // console.log('Bridge successful')
  } catch (error: any) {
    try {
      const tx = await dZapCore
        .connect(signer)
        .bridge(
          transactionId,
          integrator,
          refundee,
          bridgeData[0],
          genericData[0],
          {
            value,
          }
        )
      console.log('tx', tx.hash)
      await tx.wait()
    } catch (error: any) {
      err = error
      console.log('err', err)
      try {
        if (error.data) {
          const decodedError = dZapCore.interface.parseError(error.data)
          console.log('decodedError', decodedError)
          if (decodedError.args.reason) {
            const revertMessage = getRevertMsg(decodedError.args.reason)
            console.log('revertMessage', revertMessage)
            throw revertMessage
          } else {
            throw decodedError
          }
        } else {
          throw error
        }
      } catch (error) {
        throw err
      }
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
