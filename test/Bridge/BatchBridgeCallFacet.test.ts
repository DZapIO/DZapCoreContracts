import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { defaultAbiCoder, parseUnits } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import {
  BPS_DENOMINATOR,
  CONTRACTS,
  EVENTS,
  FunctionNames,
  NATIVE_ADDRESS,
} from '../../constants'
import {
  convertBNToNegative,
  generateRandomWallet,
  snapshot,
  updateBalance,
} from '../utils'

import { expect } from 'chai'
import { CHAIN_IDS } from '../../config'
import { encodePermitData, getFeeData } from '../../scripts/core/helper'
import { DZapDiamond } from '../../typechain-types'
import { AccessContractObj, FeeType, PermitType } from '../../types'
import {
  DEFAULT_ENCODDED_PERMIT,
  feeInfo1,
  feeInfo2,
  GasZipChainIds,
  GasZipReciever,
  MAX_FIXED_FEE_AMOUNT,
  MAX_TOKEN_FEE,
  TOKEN_A_DECIMAL,
  TOKEN_B_DECIMAL,
} from '../constants'
import { AdapterData, GenericBridgeData } from '../types'
import {
  addBridgeSelectors,
  createGasZipCallData,
  deployAndAdapters,
  deployAndIntializeDimond,
  deployFacets,
  getAllFacets,
  getMockContract,
  getPermi2ApprovetData,
  setAccessControl,
  validateBridgeEventData,
} from '../utils/helpers'

let dZapDiamond: DZapDiamond
let contracts: Awaited<ReturnType<typeof getAllFacets>>
let mock: Awaited<ReturnType<typeof getMockContract>>
let adapters: Awaited<ReturnType<typeof deployAndAdapters>>

let signers: SignerWithAddress[]
let deployer: SignerWithAddress
let owner: SignerWithAddress
let protoFeeVault: SignerWithAddress
let integrator1: SignerWithAddress
let integrator2: SignerWithAddress
let dexManager: SignerWithAddress
let swapManager: SignerWithAddress
let bridgeManager: SignerWithAddress
let feeManager: SignerWithAddress
let withdrawManager: SignerWithAddress
let relayReciever: SignerWithAddress
let relaySolver: SignerWithAddress
let gasZipDepositor: SignerWithAddress

let snapshotId: string

describe('BatchBridgeCallFacet.test.ts', async () => {
  before(async () => {
    signers = await ethers.getSigners()
    deployer = signers[0]
    owner = signers[1]
    protoFeeVault = signers[2]
    integrator1 = signers[3]
    integrator2 = signers[4]
    dexManager = signers[5]
    swapManager = signers[6]
    bridgeManager = signers[7]
    feeManager = signers[8]
    withdrawManager = signers[9]
    gasZipDepositor = signers[10]
    relayReciever = signers[17]
    relaySolver = signers[18]

    await updateBalance(deployer.address)

    // -----------------------------------------
    // mock
    mock = await getMockContract(deployer, TOKEN_A_DECIMAL, TOKEN_B_DECIMAL)

    // -----------------------------------------
    // deploy facets
    const cutData = await deployFacets({
      [CONTRACTS.DiamondLoupeFacet]: [],
      [CONTRACTS.OwnershipFacet]: [],
      [CONTRACTS.WithdrawFacet]: [],
      [CONTRACTS.AccessManagerFacet]: [],
      [CONTRACTS.DexManagerFacet]: [],
      [CONTRACTS.BridgeManagerFacet]: [],
      [CONTRACTS.FeesFacet]: [],
      [CONTRACTS.SwapFacet]: [],
      [CONTRACTS.BatchBridgeCallFacet]: [],
      [CONTRACTS.RelayBridgeFacet]: [
        relayReciever.address,
        relaySolver.address,
      ],
      [CONTRACTS.GasZipFacet]: [gasZipDepositor.address],
    })

    // deploy diamond, and initialize it
    dZapDiamond = await deployAndIntializeDimond({
      owner,
      cutData,
      permit2Address: mock.permit2.address,
      protoFeeVaultAddrsess: protoFeeVault.address,
      maxTokenFee: MAX_TOKEN_FEE,
      maxFixedTokenFee: MAX_FIXED_FEE_AMOUNT,
    })

    contracts = await getAllFacets(dZapDiamond.address)

    // ----------------------------------------
    // access
    const accessContractObj: AccessContractObj = {
      [CONTRACTS.DexManagerFacet]: {
        executor: dexManager.address,
        functionNames: [
          FunctionNames.AddDex,
          FunctionNames.BatchAddDex,
          FunctionNames.RemoveDex,
          FunctionNames.BatchRemoveDex,
          FunctionNames.SetFunctionApprovalBySignature,
          FunctionNames.BatchSetFunctionApprovalBySignature,
        ],
      },
      [CONTRACTS.FeesFacet]: {
        executor: feeManager.address,
        functionNames: [
          FunctionNames.SetProtocolFeeVault,
          FunctionNames.SetIntegratorInfo,
          FunctionNames.RemoveIntegrator,
        ],
      },
      [CONTRACTS.BridgeManagerFacet]: {
        executor: bridgeManager.address,
        functionNames: [
          FunctionNames.UpdateSelectorInfo,
          FunctionNames.AddAggregatorsAndBridges,
          FunctionNames.RemoveAggregatorsAndBridges,
          FunctionNames.AddAdapters,
          FunctionNames.RemoveAdapters,
        ],
      },
    }
    await setAccessControl(owner, accessContractObj, dZapDiamond.address)

    // set integrator
    await contracts.feesFacet
      .connect(feeManager)
      .setIntegratorInfo(
        integrator1.address,
        [FeeType.SWAP, FeeType.BRIDGE],
        feeInfo1
      )
    await contracts.feesFacet
      .connect(feeManager)
      .setIntegratorInfo(
        integrator2.address,
        [FeeType.SWAP, FeeType.BRIDGE],
        feeInfo2
      )
    // ----------------------------------------

    adapters = await deployAndAdapters(dZapDiamond.address, bridgeManager)

    // ----------------------------------------
    snapshotId = await snapshot.take()
  })

  beforeEach(async () => {
    await snapshot.revert(snapshotId)

    expect(await contracts.gasZipFacet.getGasZipDepositAddress()).eql(
      gasZipDepositor.address
    )
    expect(await contracts.relayBridgeFacet.getRelayAddress()).eql([
      relayReciever.address,
      relaySolver.address,
    ])
    expect(
      await contracts.bridgeManagerFacet.isAdapterWhitelisted(
        adapters.gasZipAdapter.address
      )
    ).equal(true)
    expect(
      await contracts.bridgeManagerFacet.isAdapterWhitelisted(
        adapters.directTransferAdapter.address
      )
    ).equal(true)
    expect(
      await contracts.bridgeManagerFacet.isAdapterWhitelisted(
        adapters.relayBridgeAdapter.address
      )
    ).equal(true)
    expect(
      await contracts.bridgeManagerFacet.isAdapterWhitelisted(
        adapters.genericBridgeAdapter.address
      )
    ).equal(true)
  })

  describe('1) batchBridge', async () => {
    describe('1) RelayBridgeAdapter', async () => {
      it('1.1.1 Should allow users to bridge using RelayBridgeAdapter [native, erc20]', async () => {
        const user = signers[12]
        const transactionId = ethers.utils.formatBytes32String('dummyId')
        const integratorAddress = integrator2.address
        const recipient = [signers[14], signers[15]]
        const relayRequestIds = [
          ethers.utils.id('relayDymmyId1'),
          ethers.utils.id('relayDymmyId2'),
        ]

        // -------------------------------------

        const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]

        const {
          amountWithoutFee,
          fixedNativeFeeAmount,
          fixedNativeData,
          tokenFeeData,
        } = await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )
        const extra = parseUnits('1')
        const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

        // -------------------------------------

        await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
        await mock.tokenA
          .connect(user)
          .approve(dZapDiamond.address, parseUnits('10', TOKEN_A_DECIMAL))

        // -------------------------------------

        const genericBridgeData: GenericBridgeData[] = [
          {
            bridge: 'RelayLink',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient[0].address,
            minAmountIn: amounts[0],
            destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'RelayLink',
            from: mock.tokenA.address,
            to: NATIVE_ADDRESS,
            receiver: recipient[1].address,
            minAmountIn: amounts[1],
            destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
        ]

        const adapterData: AdapterData[] = [
          {
            adapter: adapters.relayBridgeAdapter.address,
            data: relayRequestIds[0],
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.relayBridgeAdapter.address,
            data: relayRequestIds[1],
            permit: DEFAULT_ENCODDED_PERMIT,
          },
        ]

        // -------------------------------------

        const tx = await contracts.batchBridgeCallFacet
          .connect(user)
          .batchBridge(
            transactionId,
            integratorAddress,
            genericBridgeData,
            adapterData,
            {
              value,
            }
          )

        await expect(tx).changeEtherBalances(
          [
            user,
            relayReciever,
            relaySolver,
            protoFeeVault,
            integrator2,
            dZapDiamond,
          ],
          [
            convertBNToNegative(value).add(extra),
            amountWithoutFee[0],
            0,
            fixedNativeData.dzapNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            fixedNativeData.integratorNativeFeeAmount.add(
              tokenFeeData[0].integratorFee
            ),
            0,
          ]
        )

        await expect(tx).changeTokenBalances(
          mock.tokenA,
          [
            user,
            relayReciever,
            relaySolver,
            protoFeeVault,
            integrator2,
            dZapDiamond,
          ],
          [
            convertBNToNegative(amounts[1]),
            0,
            amountWithoutFee[1],
            tokenFeeData[1].dzapFee,
            tokenFeeData[1].integratorFee,
            0,
          ]
        )

        await expect(tx).emit(
          contracts.batchBridgeCallFacet,
          EVENTS.BatchBridgeTransferStart
        )

        const eventFilter =
          contracts.batchBridgeCallFacet.filters.BatchBridgeTransferStart()
        const data = await contracts.batchBridgeCallFacet.queryFilter(
          eventFilter
        )
        const args = data[data.length - 1].args

        expect(args.transactionId).eql(transactionId)
        expect(args.integrator).eql(integratorAddress)
        expect(args.sender).eql(user.address)

        validateBridgeEventData(
          args.bridgeData[0],
          genericBridgeData[0],
          amountWithoutFee[0]
        )

        validateBridgeEventData(
          args.bridgeData[1],
          genericBridgeData[1],
          amountWithoutFee[1]
        )
      })

      it('1.1.2 Should allow users to bridge using RelayBridgeAdapter uing permit [erc20, erc20]', async () => {
        const user = await generateRandomWallet()
        const transactionId = ethers.utils.formatBytes32String('dummyId')
        const integratorAddress = integrator2.address
        const recipient = [signers[14], signers[15]]
        const relayRequestIds = [
          ethers.utils.id('relayDymmyId1'),
          ethers.utils.id('relayDymmyId2'),
        ]

        // -------------------------------------

        const amounts = [
          parseUnits('20', TOKEN_A_DECIMAL),
          parseUnits('10', TOKEN_A_DECIMAL),
        ]

        const {
          amountWithoutFee,
          fixedNativeFeeAmount,
          fixedNativeData,
          tokenFeeData,
        } = await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )
        const extra = parseUnits('1')
        const value = fixedNativeFeeAmount.add(extra)

        // -------------------------------------

        await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
        await mock.tokenA
          .connect(user)
          .approve(mock.permit2.address, parseUnits('30', TOKEN_A_DECIMAL))

        // -------------------------------------

        const genericBridgeData: GenericBridgeData[] = [
          {
            bridge: 'RelayLink',
            from: mock.tokenA.address,
            to: NATIVE_ADDRESS,
            receiver: recipient[0].address,
            minAmountIn: amounts[0],
            destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'RelayLink',
            from: mock.tokenA.address,
            to: NATIVE_ADDRESS,
            receiver: recipient[1].address,
            minAmountIn: amounts[1],
            destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
        ]

        const adapterData: AdapterData[] = [
          {
            adapter: adapters.relayBridgeAdapter.address,
            data: relayRequestIds[0],
            permit: await getPermi2ApprovetData(
              mock.permit2,
              user,
              mock.tokenA.address,
              dZapDiamond.address,
              amounts[0].add(amounts[1])
            ),
          },
          {
            adapter: adapters.relayBridgeAdapter.address,
            data: relayRequestIds[1],
            permit: encodePermitData('0x', PermitType.PERMIT2_APPROVE),
          },
        ]

        // -------------------------------------

        const tx = await contracts.batchBridgeCallFacet
          .connect(user)
          .batchBridge(
            transactionId,
            integratorAddress,
            genericBridgeData,
            adapterData,
            {
              value,
            }
          )

        await expect(tx).changeEtherBalances(
          [
            user,
            relayReciever,
            relaySolver,
            protoFeeVault,
            integrator2,
            dZapDiamond,
          ],
          [
            convertBNToNegative(value).add(extra),
            0,
            0,
            fixedNativeData.dzapNativeFeeAmount,
            fixedNativeData.integratorNativeFeeAmount,
            0,
          ]
        )

        await expect(tx).changeTokenBalances(
          mock.tokenA,
          [
            user,
            relayReciever,
            relaySolver,
            protoFeeVault,
            integrator2,
            dZapDiamond,
          ],
          [
            convertBNToNegative(amounts[0].add(amounts[1])),
            0,
            amountWithoutFee[0].add(amountWithoutFee[1]),
            tokenFeeData[0].dzapFee.add(tokenFeeData[1].dzapFee),
            tokenFeeData[0].integratorFee.add(tokenFeeData[1].integratorFee),
            0,
          ]
        )

        await expect(tx).emit(
          contracts.batchBridgeCallFacet,
          EVENTS.BatchBridgeTransferStart
        )

        const eventFilter =
          contracts.batchBridgeCallFacet.filters.BatchBridgeTransferStart()
        const data = await contracts.batchBridgeCallFacet.queryFilter(
          eventFilter
        )
        const args = data[data.length - 1].args

        expect(args.transactionId).eql(transactionId)
        expect(args.integrator).eql(integratorAddress)
        expect(args.sender).eql(user.address)

        validateBridgeEventData(
          args.bridgeData[0],
          genericBridgeData[0],
          amountWithoutFee[0]
        )

        validateBridgeEventData(
          args.bridgeData[1],
          genericBridgeData[1],
          amountWithoutFee[1]
        )
      })
    })

    describe('1.2) GasZipAdapter', async () => {
      it('1.2.1 Should allow users to bridge using GasZipAdapter adapter', async () => {
        const user = signers[12]
        const transactionId = ethers.utils.formatBytes32String('dummyId')
        const integratorAddress = integrator2.address
        const recipient = [signers[14], signers[15]]
        const gasZipCallData = [
          createGasZipCallData({
            recieverType: GasZipReciever.EvmReciver,
            desChainId: [GasZipChainIds[CHAIN_IDS.ARBITRUM_MAINNET]],
            reciever: recipient[0].address,
          }),
          createGasZipCallData({
            recieverType: GasZipReciever.EvmReciver,
            desChainId: [GasZipChainIds[CHAIN_IDS.BASE_MAINNET]],
            reciever: recipient[1].address,
          }),
        ]

        // -------------------------------------

        const amounts = [parseUnits('20'), parseUnits('10')]

        const {
          amountWithoutFee,
          fixedNativeFeeAmount,
          fixedNativeData,
          tokenFeeData,
        } = await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )
        const extra = parseUnits('1')
        const value = amounts[0]
          .add(amounts[1])
          .add(fixedNativeFeeAmount)
          .add(extra)

        // -------------------------------------

        const genericBridgeData: GenericBridgeData[] = [
          {
            bridge: 'GasZip',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient[0].address,
            minAmountIn: amounts[0],
            destinationChainId: 0,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'GasZip',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient[1].address,
            minAmountIn: amounts[1],
            destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
        ]

        const adapterData: AdapterData[] = [
          {
            adapter: adapters.gasZipAdapter.address,
            data: gasZipCallData[0],
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.gasZipAdapter.address,
            data: gasZipCallData[1],
            permit: DEFAULT_ENCODDED_PERMIT,
          },
        ]

        // -------------------------------------

        const tx = await contracts.batchBridgeCallFacet
          .connect(user)
          .batchBridge(
            transactionId,
            integratorAddress,
            genericBridgeData,
            adapterData,
            {
              value,
            }
          )

        await expect(tx).changeEtherBalances(
          [user, gasZipDepositor, protoFeeVault, integrator2, dZapDiamond],
          [
            convertBNToNegative(value).add(extra),
            amountWithoutFee[0].add(amountWithoutFee[1]),
            fixedNativeData.dzapNativeFeeAmount
              .add(tokenFeeData[0].dzapFee)
              .add(tokenFeeData[1].dzapFee),
            fixedNativeData.integratorNativeFeeAmount
              .add(tokenFeeData[0].integratorFee)
              .add(tokenFeeData[1].integratorFee),
            0,
          ]
        )

        await expect(tx).emit(
          contracts.batchBridgeCallFacet,
          EVENTS.BatchBridgeTransferStart
        )

        const eventFilter =
          contracts.batchBridgeCallFacet.filters.BatchBridgeTransferStart()
        const data = await contracts.batchBridgeCallFacet.queryFilter(
          eventFilter
        )
        const args = data[data.length - 1].args

        expect(args.transactionId).eql(transactionId)
        expect(args.integrator).eql(integratorAddress)
        expect(args.sender).eql(user.address)

        validateBridgeEventData(
          args.bridgeData[0],
          genericBridgeData[0],
          amountWithoutFee[0]
        )

        validateBridgeEventData(
          args.bridgeData[1],
          genericBridgeData[1],
          amountWithoutFee[1]
        )
      })
    })

    describe('1.3) DirectTransferAdapter', async () => {
      it('1.3.1 Should allow users to bridge using directTransfer adapter [native, erc20]', async () => {
        const user = signers[12]
        const transactionId = ethers.utils.formatBytes32String('dummyId')
        const integratorAddress = integrator2.address
        const mockTransferAddress = [signers[18], signers[19]]
        const recipient = [signers[14], signers[15]]

        // -------------------------------------

        const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]

        const {
          amountWithoutFee,
          fixedNativeFeeAmount,
          fixedNativeData,
          tokenFeeData,
        } = await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )
        const extra = parseUnits('1')
        const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

        // -------------------------------------

        await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
        await mock.tokenA
          .connect(user)
          .approve(dZapDiamond.address, parseUnits('10', TOKEN_A_DECIMAL))

        // -------------------------------------

        const genericBridgeData: GenericBridgeData[] = [
          {
            bridge: 'ChangeNow',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient[0].address,
            minAmountIn: amounts[0],
            destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'DirectTransferTestBridge',
            from: mock.tokenA.address,
            to: NATIVE_ADDRESS,
            receiver: recipient[1].address,
            minAmountIn: amounts[1],
            destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
        ]

        const adapterData: AdapterData[] = [
          {
            adapter: adapters.directTransferAdapter.address,
            data: defaultAbiCoder.encode(
              ['address'],
              [mockTransferAddress[0].address]
            ),
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.directTransferAdapter.address,
            data: defaultAbiCoder.encode(
              ['address'],
              [mockTransferAddress[1].address]
            ),
            permit: DEFAULT_ENCODDED_PERMIT,
          },
        ]

        // -------------------------------------

        const tx = await contracts.batchBridgeCallFacet
          .connect(user)
          .batchBridge(
            transactionId,
            integratorAddress,
            genericBridgeData,
            adapterData,
            {
              value,
            }
          )

        await expect(tx).changeEtherBalances(
          [
            user,
            mockTransferAddress[0],
            protoFeeVault,
            integrator2,
            dZapDiamond,
          ],
          [
            convertBNToNegative(value).add(extra),
            amountWithoutFee[0],
            fixedNativeData.dzapNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            fixedNativeData.integratorNativeFeeAmount.add(
              tokenFeeData[0].integratorFee
            ),
            0,
          ]
        )

        await expect(tx).changeTokenBalances(
          mock.tokenA,
          [
            user,
            mockTransferAddress[1],
            protoFeeVault,
            integrator2,
            dZapDiamond,
          ],
          [
            convertBNToNegative(amounts[1]),
            amountWithoutFee[1],
            tokenFeeData[1].dzapFee,
            tokenFeeData[1].integratorFee,
            0,
          ]
        )

        await expect(tx).emit(
          contracts.batchBridgeCallFacet,
          EVENTS.BatchBridgeTransferStart
        )

        const eventFilter =
          contracts.batchBridgeCallFacet.filters.BatchBridgeTransferStart()
        const data = await contracts.batchBridgeCallFacet.queryFilter(
          eventFilter
        )
        const args = data[data.length - 1].args

        expect(args.transactionId).eql(transactionId)
        expect(args.integrator).eql(integratorAddress)
        expect(args.sender).eql(user.address)

        validateBridgeEventData(
          args.bridgeData[0],
          genericBridgeData[0],
          amountWithoutFee[0]
        )

        validateBridgeEventData(
          args.bridgeData[1],
          genericBridgeData[1],
          amountWithoutFee[1]
        )
      })

      it('1.3.2 Should allow users to bridge using directTransfer adapter using permit [erc20, erc20]', async () => {
        const user = await generateRandomWallet()
        const transactionId = ethers.utils.formatBytes32String('dummyId')
        const integratorAddress = integrator2.address
        const recipient = [signers[14], signers[15]]
        const mockTransferAddress = [signers[18], signers[19]]

        // -------------------------------------

        const amounts = [
          parseUnits('20', TOKEN_A_DECIMAL),
          parseUnits('10', TOKEN_A_DECIMAL),
        ]

        const {
          amountWithoutFee,
          fixedNativeFeeAmount,
          fixedNativeData,
          tokenFeeData,
        } = await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )
        const extra = parseUnits('1')
        const value = fixedNativeFeeAmount.add(extra)

        // -------------------------------------

        await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
        await mock.tokenA
          .connect(user)
          .approve(mock.permit2.address, parseUnits('30', TOKEN_A_DECIMAL))

        // -------------------------------------

        const genericBridgeData: GenericBridgeData[] = [
          {
            bridge: 'RelayLink',
            from: mock.tokenA.address,
            to: NATIVE_ADDRESS,
            receiver: recipient[0].address,
            minAmountIn: amounts[0],
            destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'RelayLink',
            from: mock.tokenA.address,
            to: NATIVE_ADDRESS,
            receiver: recipient[1].address,
            minAmountIn: amounts[1],
            destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
        ]

        const adapterData: AdapterData[] = [
          {
            adapter: adapters.directTransferAdapter.address,
            data: defaultAbiCoder.encode(
              ['address'],
              [mockTransferAddress[0].address]
            ),
            permit: await getPermi2ApprovetData(
              mock.permit2,
              user,
              mock.tokenA.address,
              dZapDiamond.address,
              amounts[0].add(amounts[1])
            ),
          },
          {
            adapter: adapters.directTransferAdapter.address,
            data: defaultAbiCoder.encode(
              ['address'],
              [mockTransferAddress[1].address]
            ),
            permit: encodePermitData('0x', PermitType.PERMIT2_APPROVE),
          },
        ]

        // -------------------------------------

        const tx = await contracts.batchBridgeCallFacet
          .connect(user)
          .batchBridge(
            transactionId,
            integratorAddress,
            genericBridgeData,
            adapterData,
            {
              value,
            }
          )

        await expect(tx).changeEtherBalances(
          [user, protoFeeVault, integrator2, dZapDiamond],
          [
            convertBNToNegative(value).add(extra),
            fixedNativeData.dzapNativeFeeAmount,
            fixedNativeData.integratorNativeFeeAmount,
            0,
          ]
        )

        await expect(tx).changeTokenBalances(
          mock.tokenA,
          [
            user,
            mockTransferAddress[0],
            mockTransferAddress[1],
            protoFeeVault,
            integrator2,
            dZapDiamond,
          ],
          [
            convertBNToNegative(amounts[0].add(amounts[1])),
            amountWithoutFee[0],
            amountWithoutFee[1],
            tokenFeeData[0].dzapFee.add(tokenFeeData[1].dzapFee),
            tokenFeeData[0].integratorFee.add(tokenFeeData[1].integratorFee),
            0,
          ]
        )

        await expect(tx).emit(
          contracts.batchBridgeCallFacet,
          EVENTS.BatchBridgeTransferStart
        )

        const eventFilter =
          contracts.batchBridgeCallFacet.filters.BatchBridgeTransferStart()
        const data = await contracts.batchBridgeCallFacet.queryFilter(
          eventFilter
        )
        const args = data[data.length - 1].args

        expect(args.transactionId).eql(transactionId)
        expect(args.integrator).eql(integratorAddress)
        expect(args.sender).eql(user.address)

        validateBridgeEventData(
          args.bridgeData[0],
          genericBridgeData[0],
          amountWithoutFee[0]
        )

        validateBridgeEventData(
          args.bridgeData[1],
          genericBridgeData[1],
          amountWithoutFee[1]
        )
      })
    })

    describe('1.4) GenericBridgeAdapter', async () => {
      beforeEach(async () => {
        await addBridgeSelectors(
          mock.mockBridge,
          contracts.bridgeManagerFacet,
          bridgeManager
        )
      })

      it('1.4.1 Should allow users to bridge using generic adapter [native, erc20]', async () => {
        const user = signers[12]
        const transactionId = ethers.utils.formatBytes32String('dummyId')
        const integratorAddress = integrator2.address
        const recipient = [signers[14], signers[15]]

        const mockBridgeNativeFeeAmount =
          await mock.mockBridge.nativeFeeAmount()
        const mockBridgeFeePercent = await mock.mockBridge.tokenFee()

        // -------------------------------------

        const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]

        const {
          amountWithoutFee,
          fixedNativeFeeAmount,
          fixedNativeData,
          tokenFeeData,
        } = await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )
        const extra = parseUnits('1')
        const value = amounts[0]
          .add(fixedNativeFeeAmount)
          .add(extra)
          .add(mockBridgeNativeFeeAmount)
          .add(mockBridgeNativeFeeAmount)

        const routerTokenFee = [
          amountWithoutFee[0].mul(mockBridgeFeePercent).div(BPS_DENOMINATOR),
          amountWithoutFee[1].mul(mockBridgeFeePercent).div(BPS_DENOMINATOR),
        ]

        const minReturn = [
          amountWithoutFee[0].sub(routerTokenFee[0]),
          amountWithoutFee[1].sub(routerTokenFee[1]),
        ]

        // -------------------------------------

        await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
        await mock.tokenA
          .connect(user)
          .approve(dZapDiamond.address, parseUnits('10', TOKEN_A_DECIMAL))

        // -------------------------------------

        const genericBridgeData: GenericBridgeData[] = [
          {
            bridge: 'TestCrossChainBridge1',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient[0].address,
            minAmountIn: amounts[0],
            destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'TestCrossChainBridge2',
            from: mock.tokenA.address,
            to: mock.tokenA.address,
            receiver: recipient[1].address,
            minAmountIn: amounts[1],
            destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
        ]

        const adapterData: AdapterData[] = [
          {
            adapter: adapters.genericBridgeAdapter.address,
            data: defaultAbiCoder.encode(
              ['address', 'address', 'bytes', 'uint256'],
              [
                mock.mockBridge.address,
                mock.mockBridge.address,
                (
                  await mock.mockBridge.populateTransaction.bridge(
                    recipient[0].address,
                    NATIVE_ADDRESS,
                    amountWithoutFee[0],
                    false
                  )
                ).data as string,
                mockBridgeNativeFeeAmount,
              ]
            ),
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.genericBridgeAdapter.address,
            data: defaultAbiCoder.encode(
              ['address', 'address', 'bytes', 'uint256'],
              [
                mock.mockBridge.address,
                mock.mockBridge.address,
                (
                  await mock.mockBridge.populateTransaction.bridge(
                    recipient[1].address,
                    mock.tokenA.address,
                    amountWithoutFee[1],
                    false
                  )
                ).data as string,
                mockBridgeNativeFeeAmount,
              ]
            ),
            permit: DEFAULT_ENCODDED_PERMIT,
          },
        ]

        // -------------------------------------

        const tx = await contracts.batchBridgeCallFacet
          .connect(user)
          .batchBridge(
            transactionId,
            integratorAddress,
            genericBridgeData,
            adapterData,
            {
              value,
            }
          )

        await expect(tx).changeEtherBalances(
          [user, recipient[0], protoFeeVault, integrator2, dZapDiamond],
          [
            convertBNToNegative(value).add(extra),
            minReturn[0],
            fixedNativeData.dzapNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            fixedNativeData.integratorNativeFeeAmount.add(
              tokenFeeData[0].integratorFee
            ),
            0,
          ]
        )

        await expect(tx).changeTokenBalances(
          mock.tokenA,
          [user, recipient[1], protoFeeVault, integrator2, dZapDiamond],
          [
            convertBNToNegative(amounts[1]),
            minReturn[1],
            tokenFeeData[1].dzapFee,
            tokenFeeData[1].integratorFee,
            0,
          ]
        )

        await expect(tx).emit(
          contracts.batchBridgeCallFacet,
          EVENTS.BatchBridgeTransferStart
        )

        const eventFilter =
          contracts.batchBridgeCallFacet.filters.BatchBridgeTransferStart()
        const data = await contracts.batchBridgeCallFacet.queryFilter(
          eventFilter
        )
        const args = data[data.length - 1].args

        expect(args.transactionId).eql(transactionId)
        expect(args.integrator).eql(integratorAddress)
        expect(args.sender).eql(user.address)

        validateBridgeEventData(
          args.bridgeData[0],
          genericBridgeData[0],
          amountWithoutFee[0]
        )

        validateBridgeEventData(
          args.bridgeData[1],
          genericBridgeData[1],
          amountWithoutFee[1]
        )
      })

      it('1.4.2 Should allow users to bridge using generic adapter uing permit [erc20, erc20]', async () => {
        const user = await generateRandomWallet()
        const transactionId = ethers.utils.formatBytes32String('dummyId')
        const integratorAddress = integrator2.address
        const recipient = [signers[14], signers[15]]

        const mockBridgeNativeFeeAmount =
          await mock.mockBridge.nativeFeeAmount()
        const mockBridgeFeePercent = await mock.mockBridge.tokenFee()

        // -------------------------------------

        const amounts = [
          parseUnits('20', TOKEN_A_DECIMAL),
          parseUnits('10', TOKEN_A_DECIMAL),
        ]

        const {
          amountWithoutFee,
          fixedNativeFeeAmount,
          fixedNativeData,
          tokenFeeData,
        } = await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )
        const extra = parseUnits('1')
        const value = fixedNativeFeeAmount
          .add(extra)
          .add(mockBridgeNativeFeeAmount)
          .add(mockBridgeNativeFeeAmount)

        const routerTokenFee = [
          amountWithoutFee[0].mul(mockBridgeFeePercent).div(BPS_DENOMINATOR),
          amountWithoutFee[1].mul(mockBridgeFeePercent).div(BPS_DENOMINATOR),
        ]

        const minReturn = [
          amountWithoutFee[0].sub(routerTokenFee[0]),
          amountWithoutFee[1].sub(routerTokenFee[1]),
        ]

        // -------------------------------------

        await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
        await mock.tokenA
          .connect(user)
          .approve(mock.permit2.address, parseUnits('30', TOKEN_A_DECIMAL))

        // -------------------------------------

        const genericBridgeData: GenericBridgeData[] = [
          {
            bridge: 'TestCrossChainBridge1',
            from: mock.tokenA.address,
            to: mock.tokenA.address,
            receiver: recipient[0].address,
            minAmountIn: amounts[0],
            destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'TestCrossChainBridge2',
            from: mock.tokenA.address,
            to: mock.tokenA.address,
            receiver: recipient[1].address,
            minAmountIn: amounts[1],
            destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
        ]

        const adapterData: AdapterData[] = [
          {
            adapter: adapters.genericBridgeAdapter.address,
            data: defaultAbiCoder.encode(
              ['address', 'address', 'bytes', 'uint256'],
              [
                mock.mockBridge.address,
                mock.mockBridge.address,
                (
                  await mock.mockBridge.populateTransaction.bridge(
                    recipient[0].address,
                    mock.tokenA.address,
                    amountWithoutFee[0],
                    false
                  )
                ).data as string,
                mockBridgeNativeFeeAmount,
              ]
            ),
            permit: await getPermi2ApprovetData(
              mock.permit2,
              user,
              mock.tokenA.address,
              dZapDiamond.address,
              amounts[0].add(amounts[1])
            ),
          },
          {
            adapter: adapters.genericBridgeAdapter.address,
            data: defaultAbiCoder.encode(
              ['address', 'address', 'bytes', 'uint256'],
              [
                mock.mockBridge.address,
                mock.mockBridge.address,
                (
                  await mock.mockBridge.populateTransaction.bridge(
                    recipient[1].address,
                    mock.tokenA.address,
                    amountWithoutFee[1],
                    false
                  )
                ).data as string,
                mockBridgeNativeFeeAmount,
              ]
            ),
            permit: encodePermitData('0x', PermitType.PERMIT2_APPROVE),
          },
        ]

        // -------------------------------------

        const tx = await contracts.batchBridgeCallFacet
          .connect(user)
          .batchBridge(
            transactionId,
            integratorAddress,
            genericBridgeData,
            adapterData,
            {
              value,
            }
          )

        await expect(tx).changeEtherBalances(
          [user, protoFeeVault, integrator2, dZapDiamond],
          [
            convertBNToNegative(value).add(extra),
            fixedNativeData.dzapNativeFeeAmount,
            fixedNativeData.integratorNativeFeeAmount,
            0,
          ]
        )

        await expect(tx).changeTokenBalances(
          mock.tokenA,
          [
            user,
            recipient[0],
            recipient[1],
            protoFeeVault,
            integrator2,
            dZapDiamond,
          ],
          [
            convertBNToNegative(amounts[0].add(amounts[1])),
            minReturn[0],
            minReturn[1],
            tokenFeeData[0].dzapFee.add(tokenFeeData[1].dzapFee),
            tokenFeeData[0].integratorFee.add(tokenFeeData[1].integratorFee),
            0,
          ]
        )

        await expect(tx).emit(
          contracts.batchBridgeCallFacet,
          EVENTS.BatchBridgeTransferStart
        )

        const eventFilter =
          contracts.batchBridgeCallFacet.filters.BatchBridgeTransferStart()
        const data = await contracts.batchBridgeCallFacet.queryFilter(
          eventFilter
        )
        const args = data[data.length - 1].args

        expect(args.transactionId).eql(transactionId)
        expect(args.integrator).eql(integratorAddress)
        expect(args.sender).eql(user.address)

        validateBridgeEventData(
          args.bridgeData[0],
          genericBridgeData[0],
          amountWithoutFee[0]
        )

        validateBridgeEventData(
          args.bridgeData[1],
          genericBridgeData[1],
          amountWithoutFee[1]
        )
      })
    })

    describe('1.5) Combine', async () => {
      beforeEach(async () => {
        await addBridgeSelectors(
          mock.mockBridge,
          contracts.bridgeManagerFacet,
          bridgeManager
        )
      })

      it('1.5.1 Should allow users to bridge using [RelayBridgeAdapter(native,erc20), GasZipAdapter, DirectTransferAdapter(native,erc20), GenericBridgeAdapter(native,erc20)]', async () => {
        const mockBridgeNativeFeeAmount =
          await mock.mockBridge.nativeFeeAmount()
        const mockBridgeFeePercent = await mock.mockBridge.tokenFee()

        const user = await generateRandomWallet()
        const transactionId = ethers.utils.formatBytes32String('dummyId')
        const integratorAddress = integrator2.address
        const recipient = {
          relayBridge: [signers[11], signers[12]],
          gasZip: [signers[11], signers[12]],
          directTransfer: [signers[11], signers[12]],
          generic: [signers[13], signers[14]],
        }
        const mockTransferAddress = [signers[15], signers[16]]
        const relayRequestIds = [
          ethers.utils.id('relayDymmyId1'),
          ethers.utils.id('relayDymmyId2'),
        ]
        const gasZipCallData = [
          createGasZipCallData({
            recieverType: GasZipReciever.EvmReciver,
            desChainId: [GasZipChainIds[CHAIN_IDS.ARBITRUM_MAINNET]],
            reciever: recipient.gasZip[0].address,
          }),
          createGasZipCallData({
            recieverType: GasZipReciever.EvmReciver,
            desChainId: [GasZipChainIds[CHAIN_IDS.BASE_MAINNET]],
            reciever: recipient.gasZip[1].address,
          }),
        ]

        // -------------------------------------

        const amounts = [
          parseUnits('5'),
          parseUnits('4', TOKEN_A_DECIMAL),
          parseUnits('10'),
          parseUnits('15'),
          parseUnits('20'),
          parseUnits('8', TOKEN_A_DECIMAL),
          parseUnits('25'),
          parseUnits('16', TOKEN_A_DECIMAL),
        ]

        const {
          amountWithoutFee,
          fixedNativeFeeAmount,
          fixedNativeData,
          tokenFeeData,
        } = await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )
        const extra = parseUnits('1')
        const value = amounts[0]
          .add(amounts[2])
          .add(amounts[3])
          .add(amounts[4])
          .add(amounts[6])
          .add(fixedNativeFeeAmount)
          .add(extra)
          .add(mockBridgeNativeFeeAmount)
          .add(mockBridgeNativeFeeAmount)

        const routerTokenFee = [
          amountWithoutFee[6].mul(mockBridgeFeePercent).div(BPS_DENOMINATOR),
          amountWithoutFee[7].mul(mockBridgeFeePercent).div(BPS_DENOMINATOR),
        ]

        const minReturnForGeneric = [
          amountWithoutFee[6].sub(routerTokenFee[0]),
          amountWithoutFee[7].sub(routerTokenFee[1]),
        ]

        // -------------------------------------

        await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
        await mock.tokenA
          .connect(user)
          .approve(dZapDiamond.address, parseUnits('30', TOKEN_A_DECIMAL))

        // -------------------------------------

        const genericBridgeData: GenericBridgeData[] = [
          {
            bridge: 'RelayLink',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient.relayBridge[0].address,
            minAmountIn: amounts[0],
            destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'RelayLink',
            from: mock.tokenA.address,
            to: NATIVE_ADDRESS,
            receiver: recipient.relayBridge[1].address,
            minAmountIn: amounts[1],
            destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'GasZip1',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient.gasZip[0].address,
            minAmountIn: amounts[2],
            destinationChainId: CHAIN_IDS.BASE_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'GasZip2',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient.gasZip[1].address,
            minAmountIn: amounts[3],
            destinationChainId: CHAIN_IDS.OPTIMISM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'ChangeNow',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient.directTransfer[0].address,
            minAmountIn: amounts[4],
            destinationChainId: CHAIN_IDS.BASE_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'DirectTransferBridge',
            from: mock.tokenA.address,
            to: NATIVE_ADDRESS,
            receiver: recipient.directTransfer[1].address,
            minAmountIn: amounts[5],
            destinationChainId: CHAIN_IDS.OPTIMISM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'TestCrossChainBridge1',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient.generic[0].address,
            minAmountIn: amounts[6],
            destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'TestCrossChainBridge2',
            from: mock.tokenA.address,
            to: mock.tokenA.address,
            receiver: recipient.generic[1].address,
            minAmountIn: amounts[7],
            destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
        ]

        const adapterData: AdapterData[] = [
          {
            adapter: adapters.relayBridgeAdapter.address,
            data: relayRequestIds[0],
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.relayBridgeAdapter.address,
            data: relayRequestIds[1],
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.gasZipAdapter.address,
            data: gasZipCallData[0],
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.gasZipAdapter.address,
            data: gasZipCallData[1],
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.directTransferAdapter.address,
            data: defaultAbiCoder.encode(
              ['address'],
              [mockTransferAddress[0].address]
            ),
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.directTransferAdapter.address,
            data: defaultAbiCoder.encode(
              ['address'],
              [mockTransferAddress[1].address]
            ),
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.genericBridgeAdapter.address,
            data: defaultAbiCoder.encode(
              ['address', 'address', 'bytes', 'uint256'],
              [
                mock.mockBridge.address,
                mock.mockBridge.address,
                (
                  await mock.mockBridge.populateTransaction.bridge(
                    recipient.generic[0].address,
                    NATIVE_ADDRESS,
                    amountWithoutFee[6],
                    false
                  )
                ).data as string,
                mockBridgeNativeFeeAmount,
              ]
            ),
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.genericBridgeAdapter.address,
            data: defaultAbiCoder.encode(
              ['address', 'address', 'bytes', 'uint256'],
              [
                mock.mockBridge.address,
                mock.mockBridge.address,
                (
                  await mock.mockBridge.populateTransaction.bridge(
                    recipient.generic[1].address,
                    mock.tokenA.address,
                    amountWithoutFee[7],
                    false
                  )
                ).data as string,
                mockBridgeNativeFeeAmount,
              ]
            ),
            permit: DEFAULT_ENCODDED_PERMIT,
          },
        ]

        const tx = await contracts.batchBridgeCallFacet
          .connect(user)
          .batchBridge(
            transactionId,
            integratorAddress,
            genericBridgeData,
            adapterData,
            {
              value,
            }
          )

        await expect(tx).changeEtherBalances(
          [
            user,
            relayReciever,
            relaySolver,
            gasZipDepositor,
            mockTransferAddress[0],
            recipient.generic[0],
            protoFeeVault,
            integrator2,
            dZapDiamond,
          ],
          [
            convertBNToNegative(value).add(extra),
            amountWithoutFee[0],
            0,
            amountWithoutFee[2].add(amountWithoutFee[3]),
            amountWithoutFee[4],
            minReturnForGeneric[0],
            fixedNativeData.dzapNativeFeeAmount
              .add(tokenFeeData[0].dzapFee)
              .add(tokenFeeData[2].dzapFee)
              .add(tokenFeeData[3].dzapFee)
              .add(tokenFeeData[4].dzapFee)
              .add(tokenFeeData[6].dzapFee),
            fixedNativeData.integratorNativeFeeAmount
              .add(tokenFeeData[0].integratorFee)
              .add(tokenFeeData[2].integratorFee)
              .add(tokenFeeData[3].integratorFee)
              .add(tokenFeeData[4].integratorFee)
              .add(tokenFeeData[6].integratorFee),
            0,
          ]
        )

        await expect(tx).changeTokenBalances(
          mock.tokenA,
          [
            user,
            relayReciever,
            relaySolver,
            mockTransferAddress[1],
            recipient.generic[1],
            protoFeeVault,
            integrator2,
            dZapDiamond,
          ],
          [
            convertBNToNegative(amounts[1].add(amounts[5]).add(amounts[7])),
            0,
            amountWithoutFee[1],
            amountWithoutFee[5],
            minReturnForGeneric[1],
            tokenFeeData[1].dzapFee
              .add(tokenFeeData[5].dzapFee)
              .add(tokenFeeData[7].dzapFee),
            tokenFeeData[1].integratorFee
              .add(tokenFeeData[5].integratorFee)
              .add(tokenFeeData[7].dzapFee),
            0,
          ]
        )

        await expect(tx).emit(
          contracts.batchBridgeCallFacet,
          EVENTS.BatchBridgeTransferStart
        )

        const eventFilter =
          contracts.batchBridgeCallFacet.filters.BatchBridgeTransferStart()
        const data = await contracts.batchBridgeCallFacet.queryFilter(
          eventFilter
        )
        const args = data[data.length - 1].args

        expect(args.transactionId).eql(transactionId)
        expect(args.integrator).eql(integratorAddress)
        expect(args.sender).eql(user.address)

        validateBridgeEventData(
          args.bridgeData[0],
          genericBridgeData[0],
          amountWithoutFee[0]
        )

        validateBridgeEventData(
          args.bridgeData[1],
          genericBridgeData[1],
          amountWithoutFee[1]
        )
      })

      it('1.5.2 Should allow users to bridge using with permit [RelayBridgeAdapter(native,erc20), GasZipAdapter, DirectTransferAdapter(native,erc20), GenericBridgeAdapter(native,erc20)]', async () => {
        const mockBridgeNativeFeeAmount =
          await mock.mockBridge.nativeFeeAmount()
        const mockBridgeFeePercent = await mock.mockBridge.tokenFee()

        const user = await generateRandomWallet()
        const transactionId = ethers.utils.formatBytes32String('dummyId')
        const integratorAddress = integrator2.address
        const recipient = {
          relayBridge: [signers[11], signers[12]],
          gasZip: [signers[11], signers[12]],
          directTransfer: [signers[11], signers[12]],
          generic: [signers[13], signers[14]],
        }
        const mockTransferAddress = [signers[15], signers[16]]
        const relayRequestIds = [
          ethers.utils.id('relayDymmyId1'),
          ethers.utils.id('relayDymmyId2'),
        ]
        const gasZipCallData = [
          createGasZipCallData({
            recieverType: GasZipReciever.EvmReciver,
            desChainId: [GasZipChainIds[CHAIN_IDS.ARBITRUM_MAINNET]],
            reciever: recipient.gasZip[0].address,
          }),
          createGasZipCallData({
            recieverType: GasZipReciever.EvmReciver,
            desChainId: [GasZipChainIds[CHAIN_IDS.BASE_MAINNET]],
            reciever: recipient.gasZip[1].address,
          }),
        ]

        // -------------------------------------

        const amounts = [
          parseUnits('5'),
          parseUnits('4', TOKEN_A_DECIMAL),
          parseUnits('10'),
          parseUnits('15'),
          parseUnits('20'),
          parseUnits('8', TOKEN_A_DECIMAL),
          parseUnits('25'),
          parseUnits('16', TOKEN_A_DECIMAL),
        ]

        const {
          amountWithoutFee,
          fixedNativeFeeAmount,
          fixedNativeData,
          tokenFeeData,
        } = await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )
        const extra = parseUnits('1')
        const value = amounts[0]
          .add(amounts[2])
          .add(amounts[3])
          .add(amounts[4])
          .add(amounts[6])
          .add(fixedNativeFeeAmount)
          .add(extra)
          .add(mockBridgeNativeFeeAmount)
          .add(mockBridgeNativeFeeAmount)

        const routerTokenFee = [
          amountWithoutFee[6].mul(mockBridgeFeePercent).div(BPS_DENOMINATOR),
          amountWithoutFee[7].mul(mockBridgeFeePercent).div(BPS_DENOMINATOR),
        ]

        const minReturnForGeneric = [
          amountWithoutFee[6].sub(routerTokenFee[0]),
          amountWithoutFee[7].sub(routerTokenFee[1]),
        ]

        // -------------------------------------

        await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
        await mock.tokenA
          .connect(user)
          .approve(mock.permit2.address, parseUnits('30', TOKEN_A_DECIMAL))

        // -------------------------------------

        const genericBridgeData: GenericBridgeData[] = [
          {
            bridge: 'RelayLink',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient.relayBridge[0].address,
            minAmountIn: amounts[0],
            destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'RelayLink',
            from: mock.tokenA.address,
            to: NATIVE_ADDRESS,
            receiver: recipient.relayBridge[1].address,
            minAmountIn: amounts[1],
            destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'GasZip1',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient.gasZip[0].address,
            minAmountIn: amounts[2],
            destinationChainId: CHAIN_IDS.BASE_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'GasZip2',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient.gasZip[1].address,
            minAmountIn: amounts[3],
            destinationChainId: CHAIN_IDS.OPTIMISM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'ChangeNow',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient.directTransfer[0].address,
            minAmountIn: amounts[4],
            destinationChainId: CHAIN_IDS.BASE_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'DirectTransferBridge',
            from: mock.tokenA.address,
            to: NATIVE_ADDRESS,
            receiver: recipient.directTransfer[1].address,
            minAmountIn: amounts[5],
            destinationChainId: CHAIN_IDS.OPTIMISM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'TestCrossChainBridge1',
            from: NATIVE_ADDRESS,
            to: NATIVE_ADDRESS,
            receiver: recipient.generic[0].address,
            minAmountIn: amounts[6],
            destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
          {
            bridge: 'TestCrossChainBridge2',
            from: mock.tokenA.address,
            to: mock.tokenA.address,
            receiver: recipient.generic[1].address,
            minAmountIn: amounts[7],
            destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
            hasSourceSwaps: false,
            hasDestinationCall: false,
          },
        ]

        const adapterData: AdapterData[] = [
          {
            adapter: adapters.relayBridgeAdapter.address,
            data: relayRequestIds[0],
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.relayBridgeAdapter.address,
            data: relayRequestIds[1],
            permit: await getPermi2ApprovetData(
              mock.permit2,
              user,
              mock.tokenA.address,
              dZapDiamond.address,
              amounts[1].add(amounts[5]).add(amounts[7])
            ),
          },
          {
            adapter: adapters.gasZipAdapter.address,
            data: gasZipCallData[0],
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.gasZipAdapter.address,
            data: gasZipCallData[1],
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.directTransferAdapter.address,
            data: defaultAbiCoder.encode(
              ['address'],
              [mockTransferAddress[0].address]
            ),
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.directTransferAdapter.address,
            data: defaultAbiCoder.encode(
              ['address'],
              [mockTransferAddress[1].address]
            ),
            permit: encodePermitData('0x', PermitType.PERMIT2_APPROVE),
          },
          {
            adapter: adapters.genericBridgeAdapter.address,
            data: defaultAbiCoder.encode(
              ['address', 'address', 'bytes', 'uint256'],
              [
                mock.mockBridge.address,
                mock.mockBridge.address,
                (
                  await mock.mockBridge.populateTransaction.bridge(
                    recipient.generic[0].address,
                    NATIVE_ADDRESS,
                    amountWithoutFee[6],
                    false
                  )
                ).data as string,
                mockBridgeNativeFeeAmount,
              ]
            ),
            permit: DEFAULT_ENCODDED_PERMIT,
          },
          {
            adapter: adapters.genericBridgeAdapter.address,
            data: defaultAbiCoder.encode(
              ['address', 'address', 'bytes', 'uint256'],
              [
                mock.mockBridge.address,
                mock.mockBridge.address,
                (
                  await mock.mockBridge.populateTransaction.bridge(
                    recipient.generic[1].address,
                    mock.tokenA.address,
                    amountWithoutFee[7],
                    false
                  )
                ).data as string,
                mockBridgeNativeFeeAmount,
              ]
            ),
            permit: encodePermitData('0x', PermitType.PERMIT2_APPROVE),
          },
        ]

        const tx = await contracts.batchBridgeCallFacet
          .connect(user)
          .batchBridge(
            transactionId,
            integratorAddress,
            genericBridgeData,
            adapterData,
            {
              value,
            }
          )

        await expect(tx).changeEtherBalances(
          [
            user,
            relayReciever,
            relaySolver,
            gasZipDepositor,
            mockTransferAddress[0],
            recipient.generic[0],
            protoFeeVault,
            integrator2,
            dZapDiamond,
          ],
          [
            convertBNToNegative(value).add(extra),
            amountWithoutFee[0],
            0,
            amountWithoutFee[2].add(amountWithoutFee[3]),
            amountWithoutFee[4],
            minReturnForGeneric[0],
            fixedNativeData.dzapNativeFeeAmount
              .add(tokenFeeData[0].dzapFee)
              .add(tokenFeeData[2].dzapFee)
              .add(tokenFeeData[3].dzapFee)
              .add(tokenFeeData[4].dzapFee)
              .add(tokenFeeData[6].dzapFee),
            fixedNativeData.integratorNativeFeeAmount
              .add(tokenFeeData[0].integratorFee)
              .add(tokenFeeData[2].integratorFee)
              .add(tokenFeeData[3].integratorFee)
              .add(tokenFeeData[4].integratorFee)
              .add(tokenFeeData[6].integratorFee),
            0,
          ]
        )

        await expect(tx).changeTokenBalances(
          mock.tokenA,
          [
            user,
            relayReciever,
            relaySolver,
            mockTransferAddress[1],
            recipient.generic[1],
            protoFeeVault,
            integrator2,
            dZapDiamond,
          ],
          [
            convertBNToNegative(amounts[1].add(amounts[5]).add(amounts[7])),
            0,
            amountWithoutFee[1],
            amountWithoutFee[5],
            minReturnForGeneric[1],
            tokenFeeData[1].dzapFee
              .add(tokenFeeData[5].dzapFee)
              .add(tokenFeeData[7].dzapFee),
            tokenFeeData[1].integratorFee
              .add(tokenFeeData[5].integratorFee)
              .add(tokenFeeData[7].dzapFee),
            0,
          ]
        )

        await expect(tx).emit(
          contracts.batchBridgeCallFacet,
          EVENTS.BatchBridgeTransferStart
        )

        const eventFilter =
          contracts.batchBridgeCallFacet.filters.BatchBridgeTransferStart()
        const data = await contracts.batchBridgeCallFacet.queryFilter(
          eventFilter
        )
        const args = data[data.length - 1].args

        expect(args.transactionId).eql(transactionId)
        expect(args.integrator).eql(integratorAddress)
        expect(args.sender).eql(user.address)

        validateBridgeEventData(
          args.bridgeData[0],
          genericBridgeData[0],
          amountWithoutFee[0]
        )

        validateBridgeEventData(
          args.bridgeData[1],
          genericBridgeData[1],
          amountWithoutFee[1]
        )
      })
    })
  })

  describe('2) batchSwapAndBridge', async () => {
    describe('2.1) RelayBridgeAdapter', async () => {
      it('2.1.1 Should allow users to swap and then bridge using RelayBridgeAdapter [native->erc20] ', async () => {})

      it('2.1.2 Should allow users to swap and then bridge using RelayBridgeAdapter using permit [erc20->erc20, erc20]', async () => {})
    })

    describe('2.2) GasZipAdapter', async () => {
      it('2.1 Should allow users to bridge using GasZipAdapter adapter', async () => {})

      it('2.2 Should allow users to swap and then bridge using GasZipAdapter adapter[native, erc20->native]', async () => {})
    })

    describe('2.3) DirectTransferAdapter', async () => {
      it('2.3.1 Should allow users to swap and then bridge using directTransfer adapter [native, erc20] ', async () => {})

      it('2.3.1 Should allow users to swap and then bridge using directTransfer adapter using permit [erc20->erc20, erc20]', async () => {})
    })

    describe('2.4) GenericBridgeAdapter', async () => {
      it('2.4.1 Should allow users to swap and then bridge using generic adapter [native->erc20] ', async () => {})

      it('2.4.2 Should allow users to swap and then bridge using generic adapter using permit [erc20->erc20, erc20]', async () => {})
    })

    describe('2.5) Combine', async () => {
      it('2.5.1 Should allow users to swap and bridge using [RelayBridgeAdapter(erc20->erc20), GasZipAdapter(erc20->native), DirectTransferAdapter(erc20->erc20), GenericBridgeAdapter(erc20->erc20)]', async () => {})
    })
  })
})
