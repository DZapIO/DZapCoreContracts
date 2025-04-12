import path from 'path'
import { CHAIN_IDS, DZAP_BRIDGES_CONFIG, DZAP_DEXES_CONFIG } from '../config'
import { readFileSync, writeFileSync } from 'fs'
import { BridgeManagerFacet, DexManagerFacet } from '../typechain-types'
import { Signer, Wallet } from 'ethers'
import { getGasPrice } from './contractUtils'
import { getContractUrl, getTxUrl } from './txUtils'
import { isProd } from './envUtils'
import { ChainId } from '../types'
import { getNetwork, getProvider } from './networkUtils'
import { formatUnits } from 'ethers/lib/utils'

export const getDexConfig = (chainId: CHAIN_IDS) => {
  const config = DZAP_DEXES_CONFIG[chainId]
  if (!config) throw Error(`Dex config not found for ${chainId}`)

  return config.dexes
}

export const getBridgeConfig = (chainId: CHAIN_IDS) => {
  const config = DZAP_BRIDGES_CONFIG[chainId]
  if (!config) throw Error(`Bridge config not found for ${chainId}`)

  return config.bridges
}

export const getBridgesToRemove = async (
  chainId: CHAIN_IDS,
  chainName: string,
  bridgeManagerFacet: BridgeManagerFacet,
  providersToRemove: string[]
) => {
  const bridges = getBridgeConfig(chainId)
  const addressToBridge: Record<string, string> = {}

  for (const providerName of providersToRemove) {
    const config = bridges[providerName]

    if (config && config.address.length > 0) {
      config.address.forEach((address) => {
        addressToBridge[address] = providerName
      })
    }
  }

  const bridgeAddresses: string[] = Object.keys(addressToBridge)

  console.log(`Checking and removing bridges on ${chainName}`)
  if (bridgeAddresses.length === 0) return { bridgeAddress: [] }

  // Batch all calls using the multicall provider
  const isWhitelistedResults = await Promise.all(
    bridgeAddresses.map((address) =>
      bridgeManagerFacet.isBridgeWhitelisted(address)
    )
  )

  // Filter only non-whitelisted bridges
  const addressesToRemove = bridgeAddresses.filter(
    (_, index) => isWhitelistedResults[index]
  )

  addressesToRemove.forEach((bridge) =>
    console.log(`Removing bridge: ${bridge} [${addressToBridge[bridge]}]`)
  )

  return { addressesToRemove }
}

export const getBridgesToAdd = async (
  chainId: CHAIN_IDS,
  chainName: string,
  bridgeManagerFacet: BridgeManagerFacet
) => {
  const bridges = getBridgeConfig(chainId)
  const addressToBridge: Record<string, string> = {}

  for (const [bridgeName, config] of Object.entries(bridges)) {
    config.address.forEach((address) => {
      addressToBridge[address] = bridgeName
    })
  }
  const bridgeAddresses: string[] = Object.keys(addressToBridge)

  console.log(`Checking and adding bridges on ${chainName}`)
  if (bridgeAddresses.length === 0) return { bridgeAddress: [] }

  // Batch all calls using the multicall provider
  const isWhitelistedResults = await Promise.all(
    bridgeAddresses.map((address) =>
      bridgeManagerFacet.isBridgeWhitelisted(address)
    )
  )

  // Filter only non-whitelisted bridges
  const addressToAdd = bridgeAddresses.filter(
    (_, index) => !isWhitelistedResults[index]
  )

  const providerToAddress: Record<string, string[]> = {}
  addressToAdd.forEach((bridge) => {
    const bridgeName = addressToBridge[bridge]
    console.log(
      `Adding Brides: ${getContractUrl(chainId, bridge)} [${bridgeName}]`
    )
    if (!providerToAddress[bridgeName]) providerToAddress[bridgeName] = []
    providerToAddress[bridgeName].push(bridge)
  })

  console.log({ addressToAdd, providerToAddress })
  return { addressToAdd, providerToAddress }
}

export const addBridges = async (
  chainId: CHAIN_IDS,
  addressToAdd: string[],
  bridgeManagerFacet: BridgeManagerFacet,
  sender: Wallet | Signer
) => {
  if (addressToAdd.length == 0) throw Error('Address array length is 0')
  console.log('\nAdding Bridges...')

  try {
    const gasPrice = await getGasPrice(bridgeManagerFacet.provider)

    const { data } =
      await bridgeManagerFacet.populateTransaction.addAggregatorsAndBridges(
        addressToAdd
      )

    const tx = await sender.sendTransaction({
      to: bridgeManagerFacet.address,
      data,
      gasPrice,
    })

    // const gasLimit =
    //   await bridgeManagerFacet.estimateGas.addAggregatorsAndBridges(
    //     bridgeAddress
    //   )

    // const tx = await bridgeManagerFacet.addAggregatorsAndBridges(
    //   bridgeAddress,
    //   {
    //     gasLimit: gasLimit.mul(12).div(10),
    //     gasPrice,
    //   }
    // )
    console.log({ tx: getTxUrl(chainId, tx.hash) })

    const receipt = await tx.wait()
    if (!receipt.status) {
      throw new Error(`Adding Bridge failed: ${tx.hash}`)
    }
  } catch (error) {
    console.error('Bridge addition failed:', error)
    throw error
  }
}

export const removeBridges = async (
  chainId: CHAIN_IDS,
  addressesToRemove: string[],
  bridgeManagerFacet: BridgeManagerFacet,
  sender: Wallet | Signer
) => {
  if (addressesToRemove.length == 0) throw Error('Address array length is 0')
  console.log('\nRemoving Bridges...')

  try {
    const gasPrice = await getGasPrice(bridgeManagerFacet.provider)

    const { data } =
      await bridgeManagerFacet.populateTransaction.removeAggregatorsAndBridges(
        addressesToRemove
      )
    const tx = await sender.sendTransaction({
      to: bridgeManagerFacet.address,
      data,
      gasPrice,
    })

    // const gasLimit =
    //   await bridgeManagerFacet.estimateGas.removeAggregatorsAndBridges(
    //     bridgeAddress
    //   )

    // const tx = await bridgeManagerFacet.removeAggregatorsAndBridges(
    //   bridgeAddress,
    //   {
    //     gasLimit: gasLimit.mul(12).div(10),
    //     gasPrice,
    //   }
    // )

    console.log({ tx: getTxUrl(chainId, tx.hash) })

    const receipt = await tx.wait()
    if (!receipt.status) {
      throw new Error(`Removing Bridge failed: ${tx.hash}`)
    }
  } catch (error) {
    console.error('Bridge removal failed:', error)
    throw error
  }
}

export const removeDexes = async (
  chainId: CHAIN_IDS,
  addressesToRemove: string[],
  dexManagerFacet: DexManagerFacet,
  sender: Wallet | Signer
) => {
  if (addressesToRemove.length == 0) throw Error('Address array length is 0')
  console.log('\nRemoving DEXes...')

  try {
    const gasPrice = await getGasPrice(dexManagerFacet.provider)

    const { data } = await dexManagerFacet.populateTransaction.batchRemoveDex(
      addressesToRemove
    )
    const tx = await sender.sendTransaction({
      to: dexManagerFacet.address,
      data,
      gasPrice,
    })

    // const gasLimit =
    //   await dexManagerFacet.estimateGas.batchRemoveDex(
    //     addressesToRemove
    //   )

    // const tx = await dexManagerFacet.batchRemoveDex(
    //   addressesToRemove,
    //   {
    //     gasLimit: gasLimit.mul(12).div(10),
    //     gasPrice,
    //   }
    // )

    console.log({ tx: getTxUrl(chainId, tx.hash) })

    const receipt = await tx.wait()
    if (!receipt.status) {
      throw new Error(`Removing Dexes failed: ${tx.hash}`)
    }
  } catch (error) {
    console.error('Dexes removal failed:', error)
    throw error
  }
}

export const getDexesToRemove = async (
  chainId: CHAIN_IDS,
  chainName: string,
  dexManagerFacet: DexManagerFacet,
  providersToRemove: string[]
) => {
  const dexes = getDexConfig(chainId)
  const addressToDexes: Record<string, string> = {}

  for (const providerName of providersToRemove) {
    const config = dexes[providerName]

    if (config && config.length > 0) {
      config.forEach((address) => {
        addressToDexes[address] = providerName
      })
    }
  }

  const dexAddresses: string[] = Object.keys(addressToDexes)

  console.log(`Checking and removing dexes on ${chainName}`)
  if (dexAddresses.length === 0) return { dexAddress: [] }

  // Batch all calls using the multicall provider
  const isWhitelistedResults = await Promise.all(
    dexAddresses.map((address) => dexManagerFacet.isContractApproved(address))
  )

  // Filter only non-whitelisted dexes
  const addressesToRemove = dexAddresses.filter(
    (_, index) => isWhitelistedResults[index]
  )

  addressesToRemove.forEach((dex) =>
    console.log(`Removing dex: ${dex} [${addressToDexes[dex]}]`)
  )

  return { addressesToRemove }
}

export const getDexesToAdd = async (
  chainId: CHAIN_IDS,
  chainName: string,
  dexManagerFacet: DexManagerFacet
) => {
  console.log(`Checking and adding dexes on ${chainName}`)

  const dexes = getDexConfig(chainId)
  const addressToDex: Record<string, string> = {}

  for (const [dexName, addresses] of Object.entries(dexes)) {
    addresses.forEach((address) => {
      addressToDex[address] = dexName
    })
  }

  const dexAddresses: string[] = Object.keys(addressToDex)

  if (dexAddresses.length === 0) return { dexAddress: [] }

  /* ------------------------------------------- */

  // Batch `isContractApproved` calls using `callStatic`
  const isApprovedResults = await Promise.all(
    dexAddresses.map(
      (dexAddress) => dexManagerFacet.callStatic.isContractApproved(dexAddress) // Using callStatic for batching
    )
  )

  // Filter only non-approved dexes
  const addressToAdd = dexAddresses.filter(
    (_, index) => !isApprovedResults[index]
  )

  const providerToAddress: Record<string, string[]> = {}
  addressToAdd.forEach((dex) => {
    const dexName = addressToDex[dex]
    console.log(`Adding dex: ${getContractUrl(chainId, dex)} [${dexName}]`)
    if (!providerToAddress[dexName]) providerToAddress[dexName] = []
    providerToAddress[dexName].push(dex)
  })

  console.log({ addressToAdd, providerToAddress })
  return { addressToAdd, providerToAddress }
}

export const addDexes = async (
  chainId: CHAIN_IDS,
  addressToAdd: string[],
  dexManagerFacet: DexManagerFacet,
  sender: Wallet | Signer
) => {
  if (addressToAdd.length == 0) throw Error('Dex array length is 0')

  console.log('\nAdding Dex...')

  try {
    const gasPrice = await getGasPrice(dexManagerFacet.provider)

    const { data } =
      addressToAdd.length == 1
        ? await dexManagerFacet.populateTransaction.addDex(addressToAdd[0], {})
        : await dexManagerFacet.populateTransaction.batchAddDex(
            addressToAdd,
            {}
          )

    const tx = await sender.sendTransaction({
      to: dexManagerFacet.address,
      data,
      gasPrice,
    })

    // const tx =
    //   dexAddress.length == 1
    //     ? await dexManagerFacet.addDex(dexAddress[0], {})
    //     : await dexManagerFacet.batchAddDex(dexAddress, {})
    // const tx =
    //   dexAddress.length == 1
    //     ? await dexManagerFacet.addDex(dexAddress[0], { gasLimit, gasPrice })
    //     : await dexManagerFacet.batchAddDex(dexAddress, { gasLimit, gasPrice })

    console.log({ tx: getTxUrl(chainId, tx.hash) })

    // Wait for confirmation
    const receipt = await tx.wait()
    if (!receipt.status) {
      throw new Error(`Adding Dex failed: ${tx.hash}`)
    }

    console.log('Completed Adding Dex')
  } catch (error) {
    console.error('Dex addition failed:', error)
    throw error
  }
}

export const logAddData = async (
  chainId: CHAIN_IDS,
  providerToAddress: Record<string, string[]>,
  type: 'bridges' | 'dexes'
) => {
  if (!isProd()) return

  const historyPath = path.join(__dirname + `../../registry/history.json`)
  const historyData = JSON.parse(readFileSync(historyPath, 'utf8'))

  ensureNestedObject(historyData, chainId)
  ensureNestedObject(historyData[chainId], type)

  for (const [provider, addresses] of Object.entries(providerToAddress)) {
    ensureNestedObject(historyData[chainId][type], provider, [])

    addUniqueAddresses(historyData[chainId][type][provider], addresses)
  }

  writeFileSync(historyPath, JSON.stringify(historyData, null, 2))
}

export const logRemoveData = async (
  chainId: CHAIN_IDS,
  addressesToRemove: string[],
  type: 'bridges' | 'dexes'
) => {
  if (!isProd()) return

  const historyPath = path.join(__dirname + `../../registry/history.json`)
  const historyData = JSON.parse(readFileSync(historyPath, 'utf8'))
  const historyObj = historyData[chainId][type]

  for (const key in historyObj) {
    if (Array.isArray(historyObj[key])) {
      historyObj[key] = historyObj[key].filter(
        (address) => !addressesToRemove.includes(address)
      )
      if (historyObj[key].length === 0) delete historyObj[key]
    }
  }

  writeFileSync(historyPath, JSON.stringify(historyData, null, 2))
}

const addUniqueAddresses = (existing: string[], newAddresses: string[]) => {
  newAddresses.forEach((address) => {
    if (!existing.includes(address)) {
      existing.push(address)
    }
  })
}

const ensureNestedObject = (
  obj: any,
  key: string | number,
  value: {} | [] = {}
) => {
  if (!obj[key]) {
    obj[key] = value
  }
  return obj[key]
}

export const getNativeBalance = async (chainId: ChainId, user: string) => {
  const network = getNetwork(chainId)
  const provided = await getProvider(chainId)
  const balanceBn = await provided.getBalance(user)
  const formattedBalance = `${formatUnits(
    balanceBn,
    network.nativeCurrency.decimals
  )} ${network.nativeCurrency.symbol}`

  return {
    balanceBn,
    balance: balanceBn.toString(),
    formattedBalance,
    symbol: network.nativeCurrency.symbol,
  }
}
