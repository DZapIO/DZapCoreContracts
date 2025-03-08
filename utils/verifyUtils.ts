import { run } from 'hardhat'
import { CHAIN_IDS } from '../config'
import { CONTRACTS_PATH } from '../constants'
import { getContractUrl } from './txUtils'

export const verify = async (
  chainId: CHAIN_IDS,
  contractName: string,
  contractAddress: string,
  contractConstructorArguments: any[]
) => {
  console.log(
    `\n ${contractName} Verification Started...`
    getContractUrl(chainId, contractAddress)
  )
  try {
    await run('verify:verify', {
      address: contractAddress,
      contract: CONTRACTS_PATH[contractName],
      constructorArguments: contractConstructorArguments,
    })
    console.log(`${contractName} Verification successful...`)
  } catch (error) {
    // console.log(error)
    console.log(`${contractName} Verification failed...`)
  }
}
