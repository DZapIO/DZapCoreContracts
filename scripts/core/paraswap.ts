import axios from 'axios'
import { BigNumber } from 'ethers'
import { encodePermitData, isNative } from '../../test/common'
import { DzapSwapData, ParaswapParams, PermitType } from '../../types'
import { ethers } from 'hardhat'

const BASE_URL = 'https://apiv5.paraswap.io'
const PARASWAP_ROUTER = '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57'
const SLIPPAGE = 1

enum SwapSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

const getRate = async (chainId: number, params: ParaswapParams) => {
  let fromDecimals = '18'
  let toDecimals = '18'

  if (!isNative(params.fromToken)) {
    const from = await ethers.getContractAt(
      '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20',
      params.fromToken
    )

    fromDecimals = (await from.decimals()).toString()
  }

  if (!isNative(params.toToken)) {
    const to = await ethers.getContractAt(
      '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20',
      params.toToken
    )
    toDecimals = (await to.decimals()).toString()
  }

  const queryParams = {
    srcToken: params.fromToken,
    destToken: params.toToken,
    srcDecimals: fromDecimals,
    destDecimals: toDecimals,
    amount: params.fromAmount,
    side: SwapSide.SELL,
    network: chainId,
  }

  const searchString = new URLSearchParams(queryParams as any)

  const pricesURL = `${BASE_URL}/prices/?${searchString}`
  console.log(pricesURL)

  const {
    data: { priceRoute },
  } = await axios.get(pricesURL)

  return priceRoute
}

const buildSwap = async (chainId, { priceRoute, userAddress, receiver }) => {
  const queryParams = {
    ignoreChecks: 'true',
    onlyParams: 'false',
    // ignoreGasEstimate: false
  }

  const searchString = new URLSearchParams(Object.entries(queryParams))
  const txURL = `${BASE_URL}/transactions/${chainId}/?${searchString}`
  const txConfig = {
    priceRoute,
    srcToken: priceRoute.srcToken,
    srcDecimals: priceRoute.srcDecimals,
    destToken: priceRoute.destToken,
    destDecimals: priceRoute.destDecimals,
    srcAmount: priceRoute.srcAmount,
    destAmount: priceRoute.destAmount,
    userAddress,
    receiver,
  }
  const { data } = await axios.post(txURL, txConfig)

  return data
}

export const getParaswapData = async (
  chainId: number,
  params: ParaswapParams[]
) => {
  const priceRoute = await Promise.all(
    params.map((param) => getRate(chainId, param))
  )

  const txData = await Promise.all(
    priceRoute.map((data, i) => {
      return buildSwap(chainId, {
        priceRoute: data,
        userAddress: params[i].sender,
        receiver: params[i].receiver,
      })
    })
  )

  const swapData: DzapSwapData[] = []

  for (let i = 0; i < txData.length; i++) {
    const destAmount = BigNumber.from(priceRoute[i].destAmount)
    const minAmount = destAmount.sub(destAmount.mul(SLIPPAGE).div(100))

    swapData.push({
      callTo: priceRoute[i].contractAddress,
      approveTo: priceRoute[i].tokenTransferProxy,
      from: priceRoute[i].srcToken,
      to: priceRoute[i].destToken,
      fromAmount: BigNumber.from(0),
      minToAmount: minAmount,
      swapCallData: txData[i].data,
      permit: isNative(priceRoute[i].srcToken)
        ? '0x'
        : encodePermitData('0x', PermitType.PERMIT),
    })
  }

  return swapData
}
