import { ethers } from 'hardhat'
import { CHAIN_IDS, NETWORKS } from '../config'
import { getRpcUrl } from '../utils/network'
import { forkNetwork, impersonate, updateBalance } from './utils'
import { CONTRACTS } from '../constants'
import {
  BridgeManagerFacet,
  CrossChainFacet,
  DynamicBatchBridgeCallFacet,
  RelayBridgeAdapter,
  RelayBridgeFacet,
} from '../typechain-types'
import {
  deployFacetsToReplace,
  deployToAddFacets,
  upgradeDiamond,
} from '../scripts/utils/diamond'
import { parseUnits } from 'viem'
import { encodePermitData } from '../scripts/core/helper'
import { PermitType } from '../types'

describe.skip('fork.test.ts', async () => {
  it('bridge ', async () => {
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

  it('arb check bridge ', async () => {
    const jsonRpcUrl = getRpcUrl(CHAIN_IDS.ARBITRUM_MAINNET)
    console.log(jsonRpcUrl)
    await forkNetwork(jsonRpcUrl, 301640170)

    const deployer = await impersonate(
      '0x6f3d888e62941c7f4733D23Ef3A90752eF20D50e'
    )
    await updateBalance(deployer.address)

    // ------------------------------------

    const dzapAddress = '0x53fEa6E30CE675d8D79d7610D66AD921001b7E63'
    const bridgeManagerFacet = (await ethers.getContractAt(
      CONTRACTS.BridgeManagerFacet,
      dzapAddress,
      deployer
    )) as BridgeManagerFacet

    // // ------------------------------------

    const arbBridges = [
      '0xe35e9842fceaCA96570B734083f4a58e8F7C5f2A',
      '0x9Ce3447B58D58e8602B7306316A5fF011B92d189',
      '0x1619DE6B6B20eD217a58d00f37B9d47C7663feca',
      '0x054B95b60BFFACe948Fa4548DA8eE2e212fb7C0a',
      '0x0fbCf4a62036E96C4F6770B38a9B536Aa14d1846',
      '0xA2A786ff9148f7C88EE93372Db8CBe9e94585c74',
      '0xCB0a4177E0A60247C0ad18Be87f8eDfF6DD30283',
      '0xe7F40BF16AB09f4a6906Ac2CAA4094aD2dA48Cc2',
      '0x33ceb27b39d2Bb7D2e61F7564d3Df29344020417',
      '0x16e08C02e4B78B0a5b3A917FF5FeaeDd349a5a95',
      '0x50a3a623d00fd8b8a4F3CbC5aa53D0Bc6FA912DD',
      '0x6504BFcaB789c35325cA4329f1f41FaC340bf982',
      '0x0e83DEd9f80e1C92549615D96842F5cB64A08762',
      '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
      '0x09a58d77ec86478d373c3173f3673195e4a12c06',
      '0x0Fa205c0446cD9EeDCc7538c9E24BC55AD08207f',
      '0xb7ea6Ee9647Bef9f7bd672b459bd3799fffb26a1',
      '0xC1a40F3e8cAC90a9f8fA427Ccc75653440DD5130',
      '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
      '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
      '0xA45B5130f36CDcA45667738e2a258AB09f4A5f7F',
      '0x2260f6120b634B94A23eF11fa0D615ecf62db3cD',
      '0x90f1Ef9D2cDe204C8494Cf73130771B350070B53',
      '0x4C1A9D72F3d6b9E4a62cA8971dd3862FcB64aD64',
      '0x3F45a223faA0dE47E2d4390c336320c68DC14E4E',
      '0xD073b9740D17850A804341d08ad657749fb178e0',
      '0x7E7A0e201FD38d3ADAA9523Da6C109a07118C96a',
      '0xd5a597d6e7ddf373a92C8f477DAAA673b0902F48',
      '0x00cD000000003f7F682BE4813200893d4e690000',
      '0xF7Ba155556E2CD4Dfe3Fe26e506A14d2f4b97613',
      '0x88888dd82A91f0406ED42BF750bAF881e64894F6',
      '0xD4B5f10D61916Bd6E0860144a91Ac658dE8a1437',
      '0xCF446713DDf0E83F7527A260047f8Ae89eFaE3e5',
    ]

    for (let i = 0; i < arbBridges.length; i++) {
      const bridge = arbBridges[i]
      const isWhitelisted = await bridgeManagerFacet.isWhitelisted(bridge)
      console.log(bridge, isWhitelisted)
    }
  })

  it('arb RELAY ', async () => {
    const jsonRpcUrl = getRpcUrl(CHAIN_IDS.ARBITRUM_MAINNET)
    console.log(jsonRpcUrl)
    await forkNetwork(jsonRpcUrl, 302230020)

    const user = await impersonate('0x46b24b781f9Ac1344e594A313671e5CDb1459646')
    await updateBalance(user.address)

    // ------------------------------------

    const dzapAddress = '0x53fEa6E30CE675d8D79d7610D66AD921001b7E63'
    const dzap = (await ethers.getContractAt(
      CONTRACTS.RelayBridgeFacet,
      dzapAddress
    )) as RelayBridgeFacet

    // ------------------------------------

    console.log(await dzap.getRelayAddress())

    await dzap.connect(user).bridgeViaRelay(
      '0x3078343662322d3435393634362d313733383539323535373734320000000000',
      '0x45Dd5eC28dbF5296DFFAe428D7f484Ab02Ee7BaD',
      {
        bridge: 'relayLink',
        from: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        receiver: '0x46b24b781f9Ac1344e594A313671e5CDb1459646',
        minAmountIn: '490000',
        destinationChainId: 8453,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      },
      {
        requestId:
          '0x1c87640085230a97f560b3d79a021f23099db4cad502d12726599651304193e4',
        permit:
          '0x0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000077a10000000000000000000000000000000000000000000000000000000000000000b0000000000000000000000000000000000000000000000000000ffffffffffff0000000000000000000000000000000000000000000000000000000067a9fe4700000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000041cacce7dbd18d5ade7c573e34dad4d8cf00bea769b70022b24aad9395edf0ee34165905cb5ec7203b24d3d0b1349c8f36655d9c025647c44b789326532482f3761b00000000000000000000000000000000000000000000000000000000000000',
      }
    )
  })

  it.skip('arb RELAY ', async () => {
    const jsonRpcUrl = getRpcUrl(CHAIN_IDS.ARBITRUM_MAINNET)
    // await forkNetwork(jsonRpcUrl, 302872172)
    await forkNetwork(jsonRpcUrl, 302908840)

    const deployer = await impersonate(
      '0x6f3d888e62941c7f4733D23Ef3A90752eF20D50e'
    )
    const user = await impersonate('0x46b24b781f9Ac1344e594A313671e5CDb1459646')
    await updateBalance(deployer.address)
    await updateBalance(user.address)

    // ------------------------------------

    const dzapAddress = '0x53fEa6E30CE675d8D79d7610D66AD921001b7E63'
    const dzap = (await ethers.getContractAt(
      CONTRACTS.DynamicBatchBridgeCallFacet,
      dzapAddress
    )) as DynamicBatchBridgeCallFacet

    const relay = (await ethers.getContractAt(
      CONTRACTS.RelayBridgeFacet,
      dzapAddress
    )) as RelayBridgeFacet

    const bridgeManagerFacet = (await ethers.getContractAt(
      CONTRACTS.BridgeManagerFacet,
      dzapAddress
    )) as BridgeManagerFacet

    // ------------------------------------

    // const { cutData } = await deployFacetsToReplace([
    //   CONTRACTS.DynamicBatchBridgeCallFacet,
    // ])
    // const initData = {
    //   address: ethers.constants.AddressZero,
    //   data: '0x',
    // }
    // await upgradeDiamond(deployer, cutData, dzap, initData)

    // ------------------------------------

    const RelayBridgeAdapter = await ethers.getContractFactory(
      'RelayBridgeAdapter',
      deployer
    )
    const relayAdapter =
      (await RelayBridgeAdapter.deploy()) as RelayBridgeAdapter

    // ------------------------------------

    await bridgeManagerFacet
      .connect(deployer)
      .addAdapters([relayAdapter.address])

    // ------------------------------------

    const DynamicTest = await ethers.getContractFactory('DynamicTest', deployer)
    const dynamicTest =
      (await DynamicTest.deploy()) as DynamicBatchBridgeCallFacet

    console.log('dynamicTest', dynamicTest.address)
    console.log('relayAdapter', relayAdapter.address)

    console.log('-----------')

    // ------------------------------------

    const token = await ethers.getContractAt(
      CONTRACTS.ERC20,
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
    )
    await token.connect(user).approve(dynamicTest.address, 245000 + 245000)
    // ------------------------------------

    // await relay.connect(user).bridgeViaRelay(
    //   '0x3078343662322d3435393634362d313733383539323535373734320000000000',
    //   '0x45Dd5eC28dbF5296DFFAe428D7f484Ab02Ee7BaD',
    //   {
    //     bridge: 'relayLink',
    //     from: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    //     to: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    //     receiver: '0x46b24b781f9Ac1344e594A313671e5CDb1459646',
    //     minAmountIn: '245000',
    //     destinationChainId: 137,
    //     hasSourceSwaps: false,
    //     hasDestinationCall: false,
    //   },
    //   {
    //     requestId:
    //       '0x08a60365ed4670c3f78f73629fa8d1c2a6bbed9e4a1583a1512c92059d3aa4c4',
    //     permit: encodePermitData('0x', PermitType.PERMIT),
    //   },
    //   {
    //     value: '120000000000000',
    //   }
    // )

    // const callData = (
    //   await relayAdapter.populateTransaction.bridge(
    //     '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    //     245000,
    //     '0x08a60365ed4670c3f78f73629fa8d1c2a6bbed9e4a1583a1512c92059d3aa4c4'
    //   )
    // ).data as string

    // console.log({ callData })

    await dynamicTest.connect(user).batchBridge(
      '0x3078343662322d3435393634362d313733383539323535373734320000000000',
      '0x45Dd5eC28dbF5296DFFAe428D7f484Ab02Ee7BaD',
      [
        {
          bridge: 'relayLink',
          from: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
          to: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
          receiver: '0x46b24b781f9Ac1344e594A313671e5CDb1459646',
          minAmountIn: '245000',
          destinationChainId: 137,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ],
      [],
      [
        {
          adapter: relayAdapter.address,
          // adapter: '0x9b8dEf9CbAcEB85615BecB166Ef7F598581eD600',
          // adapter: '0x6629184c0E61d39cb0E387f40FcD6db77B22E4b4',
          // data: callData,
          data: '0x08a60365ed4670c3f78f73629fa8d1c2a6bbed9e4a1583a1512c92059d3aa4c4',
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ],
      {
        // value: '240000000000000',
        value: '120000000000000',
      }
    )
  })

  it.skip('arb RELAY ', async () => {
    const jsonRpcUrl = getRpcUrl(CHAIN_IDS.ARBITRUM_MAINNET)
    // await forkNetwork(jsonRpcUrl, 302872172)
    await forkNetwork(jsonRpcUrl, 302906060)

    const deployer = await impersonate(
      '0x6f3d888e62941c7f4733D23Ef3A90752eF20D50e'
    )
    const user = await impersonate('0x46b24b781f9Ac1344e594A313671e5CDb1459646')
    await updateBalance(deployer.address)
    await updateBalance(user.address)

    // ------------------------------------

    const dzapAddress = '0x53fEa6E30CE675d8D79d7610D66AD921001b7E63'
    const dzap = (await ethers.getContractAt(
      CONTRACTS.DynamicBatchBridgeCallFacet,
      dzapAddress
    )) as DynamicBatchBridgeCallFacet

    const relay = (await ethers.getContractAt(
      CONTRACTS.RelayBridgeFacet,
      dzapAddress
    )) as RelayBridgeFacet

    const crosschain = (await ethers.getContractAt(
      CONTRACTS.CrossChainFacet,
      dzapAddress
    )) as CrossChainFacet

    const bridgeManagerFacet = (await ethers.getContractAt(
      CONTRACTS.BridgeManagerFacet,
      dzapAddress
    )) as BridgeManagerFacet

    // ------------------------------------

    const token = await ethers.getContractAt(
      CONTRACTS.ERC20,
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
    )
    await token.approve(dzap.address, 245000 + 245000)

    // ------------------------------------

    const { cutData } = await deployFacetsToReplace([
      CONTRACTS.DynamicBatchBridgeCallFacet,
    ])
    const initData = {
      address: ethers.constants.AddressZero,
      data: '0x',
    }
    await upgradeDiamond(deployer, cutData, dzap, initData)

    const RelayBridgeAdapter = await ethers.getContractFactory(
      'RelayBridgeAdapter',
      deployer
    )
    const relayAdapter = await RelayBridgeAdapter.deploy()
    console.log('relayAdapter', relayAdapter.address)

    const GasZipAdapter = await ethers.getContractFactory(
      'GasZipAdapter',
      deployer
    )
    const gasZipAdapter = await GasZipAdapter.deploy()
    console.log('gasZipAdapter', gasZipAdapter.address)

    const GenericBridgeAdapter = await ethers.getContractFactory(
      'GenericBridgeAdapter',
      deployer
    )
    const gnericBridgeAdapter = await GenericBridgeAdapter.deploy()
    console.log('gnericBridgeAdapter', gnericBridgeAdapter.address)

    const DirectTransferAdapter = await ethers.getContractFactory(
      'DirectTransferAdapter',
      deployer
    )
    const directTransferAdapter = await DirectTransferAdapter.deploy()
    console.log('directTransferAdapter', directTransferAdapter.address)

    await bridgeManagerFacet
      .connect(deployer)
      .addAdapters([
        relayAdapter.address,
        gasZipAdapter.address,
        gnericBridgeAdapter.address,
        directTransferAdapter.address,
      ])

    console.log('-----------')

    // ------------------------------------

    // await crosschain.connect(user).bridge(
    //   '0x3078343662322d3435393634362d313733383539323535373734320000000000',
    //   '0x45Dd5eC28dbF5296DFFAe428D7f484Ab02Ee7BaD',
    //   {
    //     bridge: 'lifi',
    //     from: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    //     to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    //     receiver: '0x46b24b781f9Ac1344e594A313671e5CDb1459646',
    //     minAmountIn: '245000',
    //     destinationChainId: 8453,
    //     hasSourceSwaps: false,
    //     hasDestinationCall: false,
    //   },
    //   {
    //     callTo: '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
    //     approveTo: '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae',
    //     extraNative: 0,
    //     permit: encodePermitData('0x', PermitType.PERMIT),
    //     callData:
    //       '0xae32859000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200d9a917ef69c00db9f39c258721259335efdf0c8c07395123da12fc254c8a123100000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000180000000000000000000000000b7cdc127881e88e4c47d5bdc63fd22a21fbff85f000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e583100000000000000000000000046b24b781f9ac1344e594a313671e5cdb1459646000000000000000000000000000000000000000000000000000000000003bd08000000000000000000000000000000000000000000000000000000000000210500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000572656c61790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004647a617000000000000000000000000000000000000000000000000000000000fcb887da5fecd8bd7844887282dcb9799ba34e1bd69869371d7c10211691bf2a00000000000000000000000046b24b781f9ac1344e594a313671e5cdb1459646000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000412ac591dc22146260feda8f43f42947cfe7eead34aecfc82c860a6a2ef39a50f41c2ea5d00084aa6ab39c187c1a0ccb94e05472b17c8e6b2a0e8592cdf78283501c00000000000000000000000000000000000000000000000000000000000000',
    //   },
    //   {
    //     value: 120000000000000n,
    //   }
    // )

    const value = 120000000000000n + 98991825575359n + 2186199870438242n
    await dzap.connect(user).batchBridge(
      '0x3078343662322d3435393634362d313733383539323535373734320000000000',
      '0x45Dd5eC28dbF5296DFFAe428D7f484Ab02Ee7BaD',
      [
        {
          bridge: 'relayLink',
          from: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
          to: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
          receiver: '0x46b24b781f9Ac1344e594A313671e5CDb1459646',
          minAmountIn: '245000',
          destinationChainId: 137,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        // {
        //   bridge: 'gasZip',
        //   from: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        //   to: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        //   receiver: '0x2467eBaF6860532384639836cA40706Cd8F2Cd17',
        //   minAmountIn: '98991825575359',
        //   destinationChainId: 1,
        //   hasSourceSwaps: false,
        //   hasDestinationCall: false,
        // },
        // {
        //   bridge: 'changeNow',
        //   destinationChainId: 8453,
        //   receiver: '0x2467eBaF6860532384639836cA40706Cd8F2Cd17',
        //   from: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        //   to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        //   hasDestinationCall: false,
        //   hasSourceSwaps: false,
        //   minAmountIn: '2186199870438242',
        // },
        // {
        //   bridge: 'lifi',
        //   from: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        //   to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        //   receiver: '0x46b24b781f9Ac1344e594A313671e5CDb1459646',
        //   minAmountIn: '245000',
        //   destinationChainId: 8453,
        //   hasSourceSwaps: false,
        //   hasDestinationCall: false,
        // },
      ],
      [],
      [
        {
          adapter: relayAdapter.address,
          // adapter: '0x9b8dEf9CbAcEB85615BecB166Ef7F598581eD600',
          // adapter: '0x6629184c0E61d39cb0E387f40FcD6db77B22E4b4',
          data: '0x08a60365ed4670c3f78f73629fa8d1c2a6bbed9e4a1583a1512c92059d3aa4c4',
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        // {
        //   adapter: gasZipAdapter.address,
        //   // adapter: '0x25036125276fF985DB8326c60a0391Ada834ED78',
        //   data: '0x022467eBaF6860532384639836cA40706Cd8F2Cd1700ff',
        //   permit: encodePermitData('0x', PermitType.PERMIT),
        // },
        // {
        //   adapter: directTransferAdapter.address,
        //   // adapter: '0x27481cfedD6469a41A23c9ccd2146595711437E5',
        //   data: '0x00000000000000000000000038956c6259733c9abaca63be5ffc088d33a3763b',
        //   permit: encodePermitData('0x', PermitType.PERMIT),
        // },
        // {
        //   adapter: gnericBridgeAdapter.address,
        //   // adapter: '0x92D620060d19b21c96ee7E5136109f73FaA5a01b',
        //   data: '0x0000000000000000000000001231deb6f5749ef6ce6943a275a1d3e7486f4eae0000000000000000000000001231deb6f5749ef6ce6943a275a1d3e7486f4eae000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000304ae32859000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200d9a917ef69c00db9f39c258721259335efdf0c8c07395123da12fc254c8a123100000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000180000000000000000000000000b7cdc127881e88e4c47d5bdc63fd22a21fbff85f000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e583100000000000000000000000046b24b781f9ac1344e594a313671e5cdb1459646000000000000000000000000000000000000000000000000000000000003bd08000000000000000000000000000000000000000000000000000000000000210500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000572656c61790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004647a617000000000000000000000000000000000000000000000000000000000fcb887da5fecd8bd7844887282dcb9799ba34e1bd69869371d7c10211691bf2a00000000000000000000000046b24b781f9ac1344e594a313671e5cdb1459646000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000412ac591dc22146260feda8f43f42947cfe7eead34aecfc82c860a6a2ef39a50f41c2ea5d00084aa6ab39c187c1a0ccb94e05472b17c8e6b2a0e8592cdf78283501c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        //   permit: encodePermitData('0x', PermitType.PERMIT),
        // },
      ],
      {
        value,
      }
    )
  })
})
