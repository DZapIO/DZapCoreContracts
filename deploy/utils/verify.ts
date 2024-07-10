import { ZkSyncArtifact } from '@matterlabs/hardhat-zksync-deploy/dist/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { CHAIN_IDS } from '../../config/networks'

const explorerURL = {
  [CHAIN_IDS.ZKSYNC_MAINNET]: 'https://explorer.zksync.io',
  [CHAIN_IDS.ZKSYNC_SEPOLIA_TESTNET]: ' https://sepolia.explorer.zksync.io',
}

export default async function ({
  hre,
  contractAddress,
  contractConstructorArguments,
  artifact,
}: {
  hre: HardhatRuntimeEnvironment
  contractAddress: string
  contractConstructorArguments: any[]
  artifact: ZkSyncArtifact
}) {
  const contractFullName = `${artifact.sourceName}:${artifact.contractName}`
  console.log(
    `\nVerifying contract "${contractFullName}[${contractAddress}]"...`
  )

  const verificationId = await hre.run('verify:verify', {
    address: contractAddress,
    contract: contractFullName,
    constructorArguments: contractConstructorArguments,
  })

  const chainId = hre.ethers.provider.network.chainId

  console.log(
    `See the contract on the zkSync explorer: ${explorerURL[chainId]}/address/${contractAddress}#contract`
  )

  return verificationId
}
