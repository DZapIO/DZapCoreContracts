import { ethers } from 'hardhat'
import { CHAIN_IDS, NETWORKS } from '../config'
import { getRpcUrl } from '../utils/network'
import { forkNetwork, impersonate, updateBalance } from './utils'
import { CONTRACTS } from '../constants'
import { BridgeManagerFacet } from '../typechain-types'

describe('fork.test.ts', async () => {
  it.only('bridge ', async () => {
    const jsonRpcUrl = getRpcUrl(CHAIN_IDS.FUSE)
    await forkNetwork(jsonRpcUrl)
    const adminAddress = '0x45679CDF728abdcdfce0F03A8f1D22BA49BAbC72'
    const userAddress = '0x12480616436DD6D555f88B8d94bB5156E28825B1'
    const admin = await impersonate(adminAddress)
    const user = await impersonate(userAddress)

    await updateBalance(admin.address)
    await updateBalance(user.address)

    const dzapAddress = '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6'

    const bridge = await ethers.getContractAt(
      CONTRACTS.CrossChainFacet,
      dzapAddress
    )
    const bridgeManager = (await ethers.getContractAt(
      CONTRACTS.BridgeManagerFacet,
      dzapAddress
    )) as BridgeManagerFacet

    const { cutData } = await deployToAddFacets([
      CONTRACTS.BridgeDynamicTransferFacet,
      CONTRACTS.BatchBridgeCallFacet,
      // CONTRACTS.SwapTransferFacet,
      // CONTRACTS.BatchSwapFacet,
    ])

    await bridgeManager
      .connect(admin)
      .addAggregatorsAndBridges(['0x13e46b2a3f8512ed4682a8fb8b560589fe3c2172'])

    await bridge.connect(user).estimateGas.bridge(
      '0x3078343532372d3935303762352d313733333839373835303032380000000000',
      '0x45Dd5eC28dbF5296DFFAe428D7f484Ab02Ee7BaD',
      {
        bridge: 'orbiter',
        from: '0x28C3d1cD466Ba22f6cae51b1a4692a831696391A',
        to: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        receiver: '0x4527Ca33b37b6e7e647a09d8224eB42a769507b5',
        minAmountIn: '1100000',
        destinationChainId: 42161,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      },
      {
        callTo: '0x13e46b2a3f8512ed4682a8fb8b560589fe3c2172',
        approveTo: '0x13e46b2a3f8512ed4682a8fb8b560589fe3c2172',
        extraNative: '0',
        permit:
          '0x000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000010c8e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffff000000000000000000000000000000000000000000000000000000006762673b00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000041dc52554ba2f3c11a4b03fa60f85cd9d7d40fea230506047935e7b38fac3ae9475745f44b3f742d86a92193c82adaf5569d88e3122f106e8c798901ec4245ec9c1c00000000000000000000000000000000000000000000000000000000000000',
        callData:
          '0xf9c028ec00000000000000000000000028c3d1cd466ba22f6cae51b1a4692a831696391a00000000000000000000000041d3d33156ae7c62c094aae2995003ae63f587b3000000000000000000000000000000000000000000000000000000000010c8e000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000030633d3226743d30783435323743613333623337623665376536343761303964383232346542343261373639353037623500000000000000000000000000000000',
      }
    )
  })
})
