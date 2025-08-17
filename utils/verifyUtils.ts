import { run } from 'hardhat'
import { CHAIN_IDS } from '../config'
import { ADAPTERS_DEPLOYMENT_CONFIG } from '../config/deployment/adapters'
import { FACETS_DEPLOYMENT_CONFIG } from '../config/deployment/facets'
import { CONTRACTS_PATH, TASK_VERIFY_SOURCIFY } from '../constants'
import { ApiType, VerificationData } from '../types'
import { getLastCreate3Config, isContractDeployed } from './contractUtils'
import { getNetwork } from './networkUtils'
import { getContractUrl } from './txUtils'

export const getFacetAndAdapterVerificationConfig = (
  chainId: CHAIN_IDS,
  facetVerificationData: Record<string, any[]>,
  adaptersNames: string[]
): VerificationData[] => {
  const facetsNames = Object.keys(facetVerificationData)
  const facetsObj = facetsNames.map((name) => {
    return {
      contractName: name,
      contractAddress: getLastCreate3Config(FACETS_DEPLOYMENT_CONFIG[name])
        .contractAddress,
      constructorArguments: facetVerificationData[name],
    }
  })

  const adaptersObj = adaptersNames.map((name) => {
    return {
      contractName: name,
      contractAddress: getLastCreate3Config(ADAPTERS_DEPLOYMENT_CONFIG[name])
        .contractAddress,
      constructorArguments: [],
    }
  })

  return [...facetsObj, ...adaptersObj]
}

export const verifyContracts = async (
  chainId: CHAIN_IDS,
  verificationData: VerificationData[]
) => {
  for (const {
    contractName,
    contractAddress,
    constructorArguments,
  } of verificationData) {
    if (await isContractDeployed(contractAddress)) {
      await verify(chainId, contractName, contractAddress, constructorArguments)
    } else {
      console.log(
        `\n\n--------------${contractName} not deployed-------------\n\n`
      )
    }
  }
}

export const verify = async (
  chainId: CHAIN_IDS,
  contractName: string,
  contractAddress: string,
  contractConstructorArguments: any[]
) => {
  const network = getNetwork(chainId)

  if (network.apiType === ApiType.NONE) {
    console.log(
      `\n ${contractName} Verification not supported on ${network.chainName}`,
      getContractUrl(chainId, contractAddress)
    )
    return
  }

  console.log(
    `\n ${contractName} Verification Started...`,
    getContractUrl(chainId, contractAddress)
  )

  try {
    if (network.apiType === ApiType.SOURCIFY) {
      console.log('Sourcify Verification Started...')
      const endpoint = network.apiUrl || 'https://sourcify.dev/server'
      await run(TASK_VERIFY_SOURCIFY, {
        address: contractAddress,
        constructorArguments: contractConstructorArguments,
        endpoint,
      })
      return
    }

    await run('verify:verify', {
      address: contractAddress,
      contract: CONTRACTS_PATH[contractName],
      constructorArguments: contractConstructorArguments,
    })
    console.log(`${contractName} Verification successful...`)
  } catch (error) {
    console.log(error)
    console.log(`${contractName} Verification failed...`)
  }
}
