import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { getDefaultProvider, utils } from 'ethers'
import { Wallet } from 'zksync-ethers'

const PRIVATE_KEY =
  process.env.IS_PROD == 'true'
    ? process.env.MAINNET_KEY
    : process.env.TESTNET_KEY

export default async function (hre: HardhatRuntimeEnvironment) {
  if (!PRIVATE_KEY) {
    throw new Error('WALLET_PRIVATE_KEY env variable is not set')
  }
  const wallet = new Wallet(PRIVATE_KEY as string)
  console.log(`Deploying using wallet: ${wallet.address}`)

  const ethBalance = await hre.ethers.provider.getBalance(wallet.address)
  console.log(`Wallet ETH balance: ${utils.formatUnits(ethBalance)} ETH\n`)

  return wallet
}
