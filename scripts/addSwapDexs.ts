import { ethers } from 'hardhat'
import { CONTRACTS } from '../constants'
import { DexManagerFacet } from '../typechain-types'
import { getSelectorsUsingFunSig } from './utils/diamond'
import { readFileSync } from 'fs'

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

  const data = JSON.parse(
    readFileSync(__dirname + '/../data/address/dexs.json', 'utf8')
  )

  const dexDataArr: any = Object.values(data[chainId])
  const dexAddress: any = []

  const swapSigDex: string[] = []
  const swapSelectors: string[] = []
  const swapApproval: boolean[] = []

  for (let i = 0; i < dexDataArr.length; i++) {
    dexAddress.push(dexDataArr[i].address)

    if (dexDataArr[i].tokenProxy) dexAddress.push(dexDataArr[i].tokenProxy)

    const selectors = Object.keys(
      getSelectorsUsingFunSig(dexDataArr[i].functions)
    )

    for (let j = 0; j < selectors.length; j++) {
      swapSelectors.push(selectors[j])
      swapSigDex.push(dexDataArr[i].address)
      swapApproval.push(true)
    }

    for (let j = 0; j < dexDataArr[i].sigArr.length; j++) {
      swapSelectors.push(dexDataArr[i].sigArr[j])
      swapSigDex.push(dexDataArr[i].address)
      swapApproval.push(true)
    }
  }

  /* ------------------------------------------- */

  const diamondAddress = ''
  const dexManagerFacet = (await ethers.getContractAt(
    CONTRACTS.DexManagerFacet,
    diamondAddress
  )) as DexManagerFacet

  /* ------------------------------------------- */
  console.log('')
  console.log('Adding Dex...')

  const tx1 = await dexManagerFacet.connect(deployer).batchAddDex(dexAddress)
  console.log('batchAddDex Tx', tx1.hash)
  const receipt1 = await tx1.wait()
  if (!receipt1.status) {
    throw Error(`Adding Dex failed: ${tx1.hash}`)
  }
  console.log('Completed Adding Dex')

  /* ------------------------------------------- */

  console.log('Adding Function...')
  const tx2 = await dexManagerFacet
    .connect(deployer)
    .batchSetFunctionApprovalBySignature(
      swapSigDex,
      swapSelectors,
      swapApproval
    )
  console.log('batchSetFunctionApprovalBySignature Tx', tx2.hash)
  const receipt2 = await tx2.wait()
  if (!receipt2.status) {
    throw Error(`Adding Dex Signatures failed: ${tx2.hash}`)
  }
  console.log('Completed Adding Dex Signatures')

  /* ------------------------------------------- */
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
