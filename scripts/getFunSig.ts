import { FormatTypes } from 'ethers/lib/utils'
import { ethers } from 'hardhat'

const abi = []

async function main() {
  const { chainId } = await ethers.provider.getNetwork()
  const [signer] = await ethers.getSigners()

  console.log(`Deploying with account ${signer.address} on ${chainId}`)
  console.log(
    'Account balance signer:',
    ethers.utils.formatUnits(await signer.getBalance())
  )

  /* ------------------------------------------- */
  //   const contract = await ethers.getContractAt(abi, contractAddress)

  const iface = new ethers.utils.Interface(abi)

  console.log(iface.format(FormatTypes.minimal))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
