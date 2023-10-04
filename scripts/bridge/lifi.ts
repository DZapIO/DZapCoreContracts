import axios from 'axios'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { ethers } from 'hardhat'

const diamondAddress = '0xDE74A179Bfb939533cAa344B402F11855AFC6fF5'
const DZAP_NATIVE = ethers.constants.AddressZero
const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const ZERO = BigNumber.from(0)
const LIFI_ROUTER = '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'
const BASE_URL = `https://li.quest/v1/quote`
const chainIds = {
  mainnet: 1,
  bscMainnet: 56,
  polygonMainnet: 137,
  arbitrum: 42161,
  zksyncMainnet: 324,
  optimism: 10,
}
const tokenAddress = {
  [chainIds.polygonMainnet]: {
    wMatic: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    usdc: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    usdt: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    wEth: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
  },
  [chainIds.bscMainnet]: {
    wEth: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    wBnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    usd: '0x55d398326f99059ff775485246999027b3197955',
  },
}

enum FeeType {
  BRIDGE,
  SWAP,
}

enum PermitType {
  PERMIT,
  PERMIT2_TRANSFER_FROM,
  PERMIT2_APPROVE,
}

interface LifiParams {
  fromChain: number
  toChain: number
  fromToken: string
  toToken: string
  fromAddress: string
  toAddress: string
  fromAmount: BigNumber
  slippage: number
  enableSlippageProtection: boolean
  allowBridges?: string[]
}

const getRevertMsg = (res) => {
  // console.log('getRevertMsg', res)
  if (res.length < 68) {
    return res
    // return ethers.utils.toUtf8String(res)
    // return ethers.utils.toUtf8String(res)
  }
  const revertData = '0x' + res.slice(10)
  const msg = ethers.utils.defaultAbiCoder.decode(['string'], revertData)[0]
  // console.log('msg', msg)
  return msg
}

const getFeeData = async (
  diamondAddress: string,
  integrator: string,
  amounts: BigNumber[],
  feeType = FeeType.SWAP
) => {
  const feesFacet = await ethers.getContractAt('FeesFacet', diamondAddress)

  const tokenFeeData = await Promise.all(
    amounts.map(async (amount) =>
      feesFacet.calcTokenFees(integrator, feeType, amount)
    )
  )

  const { fixedNativeFeeAmount } = await feesFacet.calcFixedNativeFees(
    integrator,
    feeType
  )

  const amountWithoutFee = amounts.map((amount, i) =>
    amount.sub(tokenFeeData[i].totalFee)
  )

  return { amountWithoutFee, tokenFeeData, fixedNativeFeeAmount }
}

const isNative = (token: string) => {
  token = ethers.utils.getAddress(token)
  return token == NATIVE_ADDRESS || token == DZAP_NATIVE
}

const encodePermitData = (data: string, permitType: PermitType) => {
  // userPermit2, callData
  const encodedData = ethers.utils.defaultAbiCoder.encode(
    ['uint8', 'bytes'],
    [permitType, data]
  )

  return encodedData
}

const getLifiBridgeData = async (params: LifiParams[]) => {
  const urls = params.map((queryParams) =>
    axios.get(
      `${BASE_URL}/?${new URLSearchParams(Object.entries(queryParams))}`
    )
  )
  const response = await axios.all(urls)
  //   console.log(response[0].data.action.fromToken)
  //   console.log(response[1].data.action.fromToken)

  const bridgeNames: string[] = []
  const genericData = response.map((res: any, i) => {
    // console.log(i, res.data)
    if (res.data.action.fromChainId == res.data.action.toChainId)
      throw 'Src and Dst chains are same'

    bridgeNames.push(res.data.tool)

    // console.log(
    //   'transactionRequest.value',
    //   BigNumber.from(res.data.transactionRequest.value)
    // )

    return {
      callTo: LIFI_ROUTER,
      approveTo: LIFI_ROUTER,
      extraNative: res.data.transactionRequest.value,
      permit: isNative(res.data.action.fromToken.address)
        ? '0x'
        : encodePermitData('0x', PermitType.PERMIT),
      callData: res.data.transactionRequest.data as string,
    }
  })
  return { genericData, bridgeNames }
}

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

  const dZapCore = await ethers.getContractAt('CrossChainFacet', diamondAddress)

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
    err = error
    try {
      if (error.data) {
        const decodedError = dZapCore.interface.parseError(error.data)
        // console.log('decodedError', decodedError)
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

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
