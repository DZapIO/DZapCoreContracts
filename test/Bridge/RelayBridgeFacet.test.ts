import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import {
  BPS_DENOMINATOR,
  BPS_MULTIPLIER,
  CONTRACTS,
  ERRORS,
  EVENTS,
  FunctionNames,
  HARDHAT_CHAIN_ID,
  NATIVE_ADDRESS,
  ZERO,
} from '../../constants'
import {
  convertBNToNegative,
  generateRandomWallet,
  snapshot,
  updateBalance,
} from '../utils'

import { expect } from 'chai'
import { randomBytes } from 'node:crypto'
import { CHAIN_IDS } from '../../config'
import { encodePermitData, getFeeData } from '../../scripts/core/helper'
import { DZapDiamond } from '../../typechain-types'
import { AccessContractObj, FeeType, PermitType } from '../../types'
import {
  DEFAULT_ENCODDED_PERMIT,
  feeInfo1,
  feeInfo2,
  MAX_FIXED_FEE_AMOUNT,
  MAX_TOKEN_FEE,
  TOKEN_A_DECIMAL,
  TOKEN_B_DECIMAL,
} from '../constants'
import { GenericBridgeData, RelayData, SwapData } from '../types'
import {
  deployAndIntializeDimond,
  deployFacets,
  getAllFacets,
  getMockContract,
  getPermi2ApprovetData,
  setAccessControl,
  validateBridgeEventData,
  validateSwapEventData,
} from '../utils/helpers'

let dZapDiamond: DZapDiamond
let contracts: Awaited<ReturnType<typeof getAllFacets>>
let mock: Awaited<ReturnType<typeof getMockContract>>

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
let relayReceiver: SignerWithAddress
let relaySolver: SignerWithAddress

let snapshotId: string

describe('RelayBridgeFacet.test.ts', async () => {
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
    relayReceiver = signers[10]
    relaySolver = signers[11]

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
      [CONTRACTS.RelayBridgeFacet]: [
        relayReceiver.address,
        relaySolver.address,
      ],
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
    snapshotId = await snapshot.take()
  })

  beforeEach(async () => {
    await snapshot.revert(snapshotId)

    expect(await contracts.relayBridgeFacet.getRelayAddress()).eql([
      relayReceiver.address,
      relaySolver.address,
    ])
  })

  describe('1) bridgeViaRelay', () => {
    it('1.1 Should allow user to bridge token from one chain to other chain(bridgeToken: Native)', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.id('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14]
      const relayRequestId = ethers.utils.id('relayDymmyId')

      // -------------------------------------

      const amounts = [parseUnits('20')]

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

      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const relayData = {
        requestId: relayRequestId,
        permit: DEFAULT_ENCODDED_PERMIT,
      }

      const genericBridgeDataForTransfer = {
        bridge: 'RelayLink',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      // -------------------------------------

      const tx = contracts.relayBridgeFacet
        .connect(user)
        .bridgeViaRelay(
          transactionId,
          integratorAddress,
          genericBridgeDataForTransfer,
          relayData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [user, relayReceiver, relaySolver, protoFeeVault, integrator2],
        [
          convertBNToNegative(value),
          amountWithoutFee[0],
          0,
          fixedNativeData.dzapNativeFeeAmount.add(tokenFeeData[0].dzapFee),
          fixedNativeData.integratorNativeFeeAmount.add(
            tokenFeeData[0].integratorFee
          ),
        ]
      )

      await expect(tx).emit(
        contracts.relayBridgeFacet,
        EVENTS.BridgeTransferStarted
      )

      const eventFilter =
        contracts.relayBridgeFacet.filters.BridgeTransferStarted()
      const data = await contracts.relayBridgeFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)

      validateBridgeEventData(
        args.bridgeData,
        genericBridgeDataForTransfer,
        amountWithoutFee[0]
      )
    })

    it('1.2 Should allow user to bridge token from one chain to other chain(bridgeToken : Erc20)', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.id('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]
      const relayRequestId = ethers.utils.id('relayDymmyId')

      // -------------------------------------

      const amounts = [parseUnits('20', TOKEN_A_DECIMAL)]

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

      const extra = 0
      const value = fixedNativeFeeAmount.add(extra)

      // -------------------------------------

      const relayData = {
        requestId: relayRequestId,
        permit: DEFAULT_ENCODDED_PERMIT,
      }

      const genericBridgeDataForTransfer = {
        bridge: 'RelayLink',
        from: mock.tokenA.address,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      // -------------------------------------

      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA.connect(user).approve(dZapDiamond.address, amounts[0])

      // -------------------------------------

      const tx = contracts.relayBridgeFacet
        .connect(user)
        .bridgeViaRelay(
          transactionId,
          integratorAddress,
          genericBridgeDataForTransfer,
          relayData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [user, relayReceiver, relaySolver, protoFeeVault, integrator2],
        [
          convertBNToNegative(value),
          0,
          0,
          fixedNativeData.dzapNativeFeeAmount,
          fixedNativeData.integratorNativeFeeAmount,
        ]
      )

      await expect(tx).changeTokenBalances(
        mock.tokenA,
        [user, relayReceiver, relaySolver, protoFeeVault, integrator1],
        [
          convertBNToNegative(amounts[0]),
          0,
          amountWithoutFee[0],
          tokenFeeData[0].dzapFee,
          tokenFeeData[0].integratorFee,
        ]
      )

      await expect(tx).emit(
        contracts.relayBridgeFacet,
        EVENTS.BridgeTransferStarted
      )

      const eventFilter =
        contracts.relayBridgeFacet.filters.BridgeTransferStarted()
      const data = await contracts.relayBridgeFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)

      validateBridgeEventData(
        args.bridgeData,
        genericBridgeDataForTransfer,
        amountWithoutFee[0]
      )
    })

    it('1.3 Should allow user to bridge token from one chain to other chain using permit2 (bridgeToken : Erc20)', async () => {
      // -------------------------------------

      const user = await generateRandomWallet()
      const transactionId = ethers.utils.id('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]
      const relayRequestId = ethers.utils.id('relayDymmyId')

      // -------------------------------------

      const amounts = [parseUnits('20', TOKEN_A_DECIMAL)]

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

      const extra = 0
      const value = fixedNativeFeeAmount.add(extra)

      // -------------------------------------
      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(mock.permit2.address, ethers.constants.MaxUint256)

      const encodedPermitData = await getPermi2ApprovetData(
        mock.permit2,
        user,
        mock.tokenA.address,
        dZapDiamond.address,
        amounts[0]
      )

      // -------------------------------------

      const relayData = {
        requestId: relayRequestId,
        permit: encodedPermitData,
      }

      const genericBridgeDataForTransfer = {
        bridge: 'RelayLink',
        from: mock.tokenA.address,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      // -------------------------------------

      const tx = contracts.relayBridgeFacet
        .connect(user)
        .bridgeViaRelay(
          transactionId,
          integratorAddress,
          genericBridgeDataForTransfer,
          relayData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [user, relayReceiver, relaySolver, protoFeeVault, integrator2],
        [
          convertBNToNegative(value),
          0,
          0,
          fixedNativeData.dzapNativeFeeAmount,
          fixedNativeData.integratorNativeFeeAmount,
        ]
      )

      await expect(tx).changeTokenBalances(
        mock.tokenA,
        [user, relayReceiver, relaySolver, protoFeeVault, integrator1],
        [
          convertBNToNegative(amounts[0]),
          0,
          amountWithoutFee[0],
          tokenFeeData[0].dzapFee,
          tokenFeeData[0].integratorFee,
        ]
      )

      await expect(tx).emit(
        contracts.relayBridgeFacet,
        EVENTS.BridgeTransferStarted
      )

      const eventFilter =
        contracts.relayBridgeFacet.filters.BridgeTransferStarted()
      const data = await contracts.relayBridgeFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)

      validateBridgeEventData(
        args.bridgeData,
        genericBridgeDataForTransfer,
        amountWithoutFee[0]
      )
    })

    it('1.4 native Should allow user to bridge token from one chain to other chain and return extra', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.id('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14]
      const relayRequestId = ethers.utils.id('relayDymmyId')

      // -------------------------------------

      const amounts = [parseUnits('20')]

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

      const relayData = {
        requestId: relayRequestId,
        permit: DEFAULT_ENCODDED_PERMIT,
      }

      const genericBridgeDataForTransfer = {
        bridge: 'RelayLink',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      // -------------------------------------

      const tx = contracts.relayBridgeFacet
        .connect(user)
        .bridgeViaRelay(
          transactionId,
          integratorAddress,
          genericBridgeDataForTransfer,
          relayData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [user, relayReceiver, relaySolver, protoFeeVault, integrator2],
        [
          convertBNToNegative(value.sub(extra)),
          amountWithoutFee[0],
          0,
          fixedNativeData.dzapNativeFeeAmount.add(tokenFeeData[0].dzapFee),
          fixedNativeData.integratorNativeFeeAmount.add(
            tokenFeeData[0].integratorFee
          ),
        ]
      )

      await expect(tx).emit(
        contracts.relayBridgeFacet,
        EVENTS.BridgeTransferStarted
      )

      const eventFilter =
        contracts.relayBridgeFacet.filters.BridgeTransferStarted()
      const data = await contracts.relayBridgeFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)

      validateBridgeEventData(
        args.bridgeData,
        genericBridgeDataForTransfer,
        amountWithoutFee[0]
      )
    })

    it('1.5 Should revert if destToken length is invalid is 255', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.id('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14]
      const relayRequestId = ethers.utils.id('relayDymmyId')

      // -------------------------------------

      const amounts = [parseUnits('20')]

      const { fixedNativeFeeAmount } = await getFeeData(
        dZapDiamond.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )

      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const relayData = {
        requestId: relayRequestId,
        permit: DEFAULT_ENCODDED_PERMIT,
      }
      const mockAddress = '0x' + randomBytes(256).toString('hex')

      const genericBridgeDataForTransfer = {
        bridge: 'RelayLink',
        from: NATIVE_ADDRESS,
        to: mockAddress,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .bridgeViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InvalidLength
      )
    })

    it('1.6 Should revert if receiver length is invalid is 255', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.id('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14]
      const relayRequestId = ethers.utils.id('relayDymmyId')

      // -------------------------------------

      const amounts = [parseUnits('20')]

      const { fixedNativeFeeAmount } = await getFeeData(
        dZapDiamond.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )

      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const relayData = {
        requestId: relayRequestId,
        permit: DEFAULT_ENCODDED_PERMIT,
      }
      const mockAddress = '0x' + randomBytes(256).toString('hex')

      const genericBridgeDataForTransfer = {
        bridge: 'RelayLink',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: mockAddress,
        minAmountIn: amounts[0],
        destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .bridgeViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InvalidLength
      )
    })

    it('1.7 Should revert if amount is zero', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.id('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14]
      const relayRequestId = ethers.utils.id('relayDymmyId')

      // -------------------------------------

      const amounts = [parseUnits('20')]

      const { fixedNativeFeeAmount } = await getFeeData(
        dZapDiamond.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )

      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const relayData = {
        requestId: relayRequestId,
        permit: DEFAULT_ENCODDED_PERMIT,
      }

      const genericBridgeDataForTransfer = {
        bridge: 'RelayLink',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: ZERO,
        destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .bridgeViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InvalidAmount
      )
    })

    it('1.8 Should revert if dest chainId is same is src', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.id('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14]
      const relayRequestId = ethers.utils.id('relayDymmyId')

      // -------------------------------------

      const amounts = [parseUnits('20')]

      const { fixedNativeFeeAmount } = await getFeeData(
        dZapDiamond.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )

      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const relayData = {
        requestId: relayRequestId,
        permit: DEFAULT_ENCODDED_PERMIT,
      }

      const genericBridgeDataForTransfer = {
        bridge: 'RelayLink',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: HARDHAT_CHAIN_ID,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .bridgeViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.CannotBridgeToSameNetwork
      )
    })

    it('1.9 Should revert if it contains source swap', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.id('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14]
      const relayRequestId = ethers.utils.id('relayDymmyId')

      // -------------------------------------

      const amounts = [parseUnits('20')]

      const { fixedNativeFeeAmount } = await getFeeData(
        dZapDiamond.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )

      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const relayData = {
        requestId: relayRequestId,
        permit: DEFAULT_ENCODDED_PERMIT,
      }

      const genericBridgeDataForTransfer = {
        bridge: 'RelayLink',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
        hasSourceSwaps: true,
        hasDestinationCall: false,
      }

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .bridgeViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InformationMismatch
      )
    })

    it('1.10 Should revert if it contains dest swap', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.id('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14]
      const relayRequestId = ethers.utils.id('relayDymmyId')

      // -------------------------------------

      const amounts = [parseUnits('20')]

      const { fixedNativeFeeAmount } = await getFeeData(
        dZapDiamond.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )

      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const relayData = {
        requestId: relayRequestId,
        permit: DEFAULT_ENCODDED_PERMIT,
      }

      const genericBridgeDataForTransfer = {
        bridge: 'RelayLink',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
        hasSourceSwaps: false,
        hasDestinationCall: true,
      }

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .bridgeViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InformationMismatch
      )
    })
  })

  describe('2) bridgeMultipleTokensViaRelay', () => {
    it('2.1 Should allow user to bridge multiple token from one chain to other multiple chain (native, tokenA, tokenA, tokenB)', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15], signers[16], signers[17]]
      const relayRequestIds = [
        ethers.utils.id('relayDymmyId1'),
        ethers.utils.id('relayDymmyId2'),
        ethers.utils.id('relayDymmyId3'),
        ethers.utils.id('relayDymmyId4'),
      ]

      // -------------------------------------

      const amounts = [
        parseUnits('20'),
        parseUnits('10', TOKEN_A_DECIMAL),
        parseUnits('20', TOKEN_A_DECIMAL),
        parseUnits('30', TOKEN_B_DECIMAL),
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
      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('30', TOKEN_A_DECIMAL))

      await mock.tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await mock.tokenB
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('30', TOKEN_B_DECIMAL))

      // -------------------------------------

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'RelayLink',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
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
        {
          bridge: 'RelayLink',
          from: mock.tokenA.address,
          to: NATIVE_ADDRESS,
          receiver: recipient[2].address,
          minAmountIn: amounts[2],
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'RelayLink',
          from: mock.tokenB.address,
          to: NATIVE_ADDRESS,
          receiver: recipient[3].address,
          minAmountIn: amounts[3],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[2],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[3],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      const tx = contracts.relayBridgeFacet
        .connect(user)
        .bridgeMultipleTokensViaRelay(
          transactionId,
          integratorAddress,
          genericBridgeData,
          relayData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [
          user,
          relayReceiver,
          relaySolver,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(value),
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
          relayReceiver,
          relaySolver,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(amounts[1].add(amounts[2])),
          0,
          amountWithoutFee[1].add(amountWithoutFee[2]),
          tokenFeeData[1].dzapFee.add(tokenFeeData[2].dzapFee),
          tokenFeeData[1].integratorFee.add(tokenFeeData[2].integratorFee),
          0,
        ]
      )

      await expect(tx).changeTokenBalances(
        mock.tokenB,
        [
          user,
          relayReceiver,
          relaySolver,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(amounts[3]),
          0,
          amountWithoutFee[3],
          tokenFeeData[3].dzapFee,
          tokenFeeData[3].integratorFee,
          0,
        ]
      )

      await expect(tx).emit(
        contracts.relayBridgeFacet,
        EVENTS.MultiTokenBridgeTransferStarted
      )

      const eventFilter =
        contracts.relayBridgeFacet.filters.MultiTokenBridgeTransferStarted()
      const data = await contracts.relayBridgeFacet.queryFilter(eventFilter)
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
      validateBridgeEventData(
        args.bridgeData[2],
        genericBridgeData[2],
        amountWithoutFee[2]
      )
      validateBridgeEventData(
        args.bridgeData[3],
        genericBridgeData[3],
        amountWithoutFee[3]
      )
    })

    it('2.2 Should allow user to bridge multiple token from one chain to other multiple chain usingPermit2 (native, tokenA, tokenA, tokenB)', async () => {
      // -------------------------------------

      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15], signers[16], signers[17]]
      const relayRequestIds = [
        ethers.utils.id('relayDymmyId1'),
        ethers.utils.id('relayDymmyId2'),
        ethers.utils.id('relayDymmyId3'),
        ethers.utils.id('relayDymmyId4'),
      ]

      // -------------------------------------

      const amounts = [
        parseUnits('20'),
        parseUnits('10', TOKEN_A_DECIMAL),
        parseUnits('20', TOKEN_A_DECIMAL),
        parseUnits('30', TOKEN_B_DECIMAL),
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
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(mock.permit2.address, parseUnits('30', TOKEN_A_DECIMAL))

      await mock.tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await mock.tokenB
        .connect(user)
        .approve(mock.permit2.address, parseUnits('30', TOKEN_B_DECIMAL))

      // -------------------------------------

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'RelayLink',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
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
        {
          bridge: 'RelayLink',
          from: mock.tokenA.address,
          to: NATIVE_ADDRESS,
          receiver: recipient[2].address,
          minAmountIn: amounts[2],
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'RelayLink',
          from: mock.tokenB.address,
          to: NATIVE_ADDRESS,
          receiver: recipient[3].address,
          minAmountIn: amounts[3],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: await getPermi2ApprovetData(
            mock.permit2,
            user,
            mock.tokenA.address,
            dZapDiamond.address,
            amounts[1].add(amounts[2])
          ),
        },
        {
          requestId: relayRequestIds[2],
          permit: encodePermitData('0x', PermitType.PERMIT2_APPROVE),
        },
        {
          requestId: relayRequestIds[3],
          permit: await getPermi2ApprovetData(
            mock.permit2,
            user,
            mock.tokenB.address,
            dZapDiamond.address,
            amounts[3]
          ),
        },
      ]

      // -------------------------------------

      const tx = contracts.relayBridgeFacet
        .connect(user)
        .bridgeMultipleTokensViaRelay(
          transactionId,
          integratorAddress,
          genericBridgeData,
          relayData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [
          user,
          relayReceiver,
          relaySolver,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(value.sub(extra)),
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
          relayReceiver,
          relaySolver,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(amounts[1].add(amounts[2])),
          0,
          amountWithoutFee[1].add(amountWithoutFee[2]),
          tokenFeeData[1].dzapFee.add(tokenFeeData[2].dzapFee),
          tokenFeeData[1].integratorFee.add(tokenFeeData[2].integratorFee),
          0,
        ]
      )

      await expect(tx).changeTokenBalances(
        mock.tokenB,
        [
          user,
          relayReceiver,
          relaySolver,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(amounts[3]),
          0,
          amountWithoutFee[3],
          tokenFeeData[3].dzapFee,
          tokenFeeData[3].integratorFee,
          0,
        ]
      )

      await expect(tx).emit(
        contracts.relayBridgeFacet,
        EVENTS.MultiTokenBridgeTransferStarted
      )

      const eventFilter =
        contracts.relayBridgeFacet.filters.MultiTokenBridgeTransferStarted()
      const data = await contracts.relayBridgeFacet.queryFilter(eventFilter)
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
      validateBridgeEventData(
        args.bridgeData[2],
        genericBridgeData[2],
        amountWithoutFee[2]
      )
      validateBridgeEventData(
        args.bridgeData[3],
        genericBridgeData[3],
        amountWithoutFee[3]
      )
    })

    it('2.3 Should revert if destToken length is invalid is 255', async () => {
      // -------------------------------------

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

      const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
        dZapDiamond.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )
      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('30', TOKEN_A_DECIMAL))

      // -------------------------------------
      const mockAddress = '0x' + randomBytes(256).toString('hex')

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'RelayLink',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'RelayLink',
          from: mock.tokenA.address,
          to: mockAddress,
          receiver: recipient[1].address,
          minAmountIn: amounts[1],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .bridgeMultipleTokensViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeData,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InvalidLength
      )
    })

    it('2.4 Should revert if receiver length is invalid is 255', async () => {
      // -------------------------------------

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

      const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
        dZapDiamond.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )
      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('30', TOKEN_A_DECIMAL))

      // -------------------------------------
      const mockAddress = '0x' + randomBytes(256).toString('hex')

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'RelayLink',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'RelayLink',
          from: mock.tokenA.address,
          to: NATIVE_ADDRESS,
          receiver: mockAddress,
          minAmountIn: amounts[1],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .bridgeMultipleTokensViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeData,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InvalidLength
      )
    })

    it('2.5 Should revert if amount is zero', async () => {
      // -------------------------------------

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

      const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
        dZapDiamond.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )
      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

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
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'RelayLink',
          from: mock.tokenA.address,
          to: NATIVE_ADDRESS,
          receiver: recipient[1].address,
          minAmountIn: ZERO,
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .bridgeMultipleTokensViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeData,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InvalidAmount
      )
    })

    it('2.6 Should revert if dest chainId is same is src', async () => {
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

      const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
        dZapDiamond.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )
      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

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
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'RelayLink',
          from: mock.tokenA.address,
          to: NATIVE_ADDRESS,
          receiver: recipient[1].address,
          minAmountIn: amounts[1],
          destinationChainId: HARDHAT_CHAIN_ID,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .bridgeMultipleTokensViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeData,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.CannotBridgeToSameNetwork
      )
    })

    it('2.7 Should revert if it contains source swap', async () => {
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

      const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
        dZapDiamond.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )
      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

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
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
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
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .bridgeMultipleTokensViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeData,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InformationMismatch
      )
    })

    it('2.8 Should revert if it contains dest swap', async () => {
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

      const { amountWithoutFee, fixedNativeFeeAmount } = await getFeeData(
        dZapDiamond.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )
      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

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
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
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
          hasDestinationCall: true,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .bridgeMultipleTokensViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeData,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InformationMismatch
      )
    })
  })

  describe('3) swapAndBridgeViaRelay', () => {
    beforeEach(async () => {
      await contracts.dexManagerFacet
        .connect(dexManager)
        .batchAddDex([mock.mockExchange.address])
    })

    it('3.1 Should allow user to bridge token from one chain to other chain(erc20 -> erc20)', async () => {
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15]]
      const rate = await mock.mockExchange.rate()
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

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        TOKEN_B_DECIMAL
      )
      const minSwapReturnAmount = swapReturnAmount.sub(
        parseUnits('1', TOKEN_B_DECIMAL)
      )

      // -------------------------------------
      const swapData: SwapData[] = [
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: mock.tokenA.address,
          to: mock.tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              mock.tokenA.address,
              mock.tokenB.address,
              dZapDiamond.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: mock.tokenB.address,
          to: mock.tokenB.address,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      const tx = contracts.relayBridgeFacet
        .connect(user)
        .swapAndBridgeViaRelay(
          transactionId,
          integratorAddress,
          genericBridgeData,
          swapData,
          relayData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [
          user,
          relayReceiver,
          relaySolver,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(value.sub(extra)),
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
          relayReceiver,
          relaySolver,
          mock.mockExchange,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(amounts[1]),
          0,
          0,
          amountWithoutFee[1],
          tokenFeeData[1].dzapFee,
          tokenFeeData[1].integratorFee,
          0,
        ]
      )

      await expect(tx).changeTokenBalances(
        mock.tokenB,
        [
          user,
          relayReceiver,
          relaySolver,
          mock.mockExchange,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          swapReturnAmount.sub(minSwapReturnAmount),
          0,
          minSwapReturnAmount,
          convertBNToNegative(swapReturnAmount),
          0,
          0,
          0,
        ]
      )

      await expect(tx).emit(
        contracts.relayBridgeFacet,
        EVENTS.SwapBridgeTransferStarted
      )

      const eventFilter =
        contracts.relayBridgeFacet.filters.SwapBridgeTransferStarted()
      const data = await contracts.relayBridgeFacet.queryFilter(eventFilter)
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
        minSwapReturnAmount
      )

      validateSwapEventData(args.swapInfo[0], swapData[0], swapReturnAmount)
    })

    it('3.2 Should allow user to bridge token from one chain to other chain(erc20 -> native)', async () => {
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15]]
      const rate = await mock.mockExchange.rate()
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

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        18
      )
      const minSwapReturnAmount = swapReturnAmount.sub(parseUnits('1'))

      // -------------------------------------
      const swapData: SwapData[] = [
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: mock.tokenA.address,
          to: NATIVE_ADDRESS,
          fromAmount: amounts[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              mock.tokenA.address,
              NATIVE_ADDRESS,
              dZapDiamond.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      const tx = contracts.relayBridgeFacet
        .connect(user)
        .swapAndBridgeViaRelay(
          transactionId,
          integratorAddress,
          genericBridgeData,
          swapData,
          relayData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [
          user,
          relayReceiver,
          relaySolver,
          mock.mockExchange,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(
            value.sub(extra).sub(swapReturnAmount.sub(minSwapReturnAmount))
          ),
          amountWithoutFee[0].add(minSwapReturnAmount),
          0,
          convertBNToNegative(swapReturnAmount),
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
          relayReceiver,
          relaySolver,
          mock.mockExchange,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(amounts[1]),
          0,
          0,
          amountWithoutFee[1],
          tokenFeeData[1].dzapFee,
          tokenFeeData[1].integratorFee,
          0,
        ]
      )

      await expect(tx).emit(
        contracts.relayBridgeFacet,
        EVENTS.SwapBridgeTransferStarted
      )

      const eventFilter =
        contracts.relayBridgeFacet.filters.SwapBridgeTransferStarted()
      const data = await contracts.relayBridgeFacet.queryFilter(eventFilter)
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
        minSwapReturnAmount
      )

      validateSwapEventData(args.swapInfo[0], swapData[0], swapReturnAmount)
    })

    it('3.3 Should allow user to bridge token from one chain to other chain(native -> erc20)', async () => {
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15]]
      const rate = await mock.mockExchange.rate()
      const relayRequestIds = [
        ethers.utils.id('relayDymmyId1'),
        ethers.utils.id('relayDymmyId2'),
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

      const extra = parseUnits('0.5')
      const value = amounts[0]
        .add(amounts[1])
        .add(fixedNativeFeeAmount)
        .add(extra)

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_A_DECIMAL
      )
      const minSwapReturnAmount = swapReturnAmount.sub(
        parseUnits('1', TOKEN_A_DECIMAL)
      )

      // -------------------------------------
      const swapData: SwapData[] = [
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: NATIVE_ADDRESS,
          to: mock.tokenA.address,
          fromAmount: amounts[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              NATIVE_ADDRESS,
              mock.tokenA.address,
              dZapDiamond.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: mock.tokenA.address,
          to: mock.tokenA.address,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      const tx = contracts.relayBridgeFacet
        .connect(user)
        .swapAndBridgeViaRelay(
          transactionId,
          integratorAddress,
          genericBridgeData,
          swapData,
          relayData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [
          user,
          relayReceiver,
          relaySolver,
          mock.mockExchange,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(value.sub(extra)),
          amountWithoutFee[0],
          0,
          amountWithoutFee[1],
          fixedNativeData.dzapNativeFeeAmount
            .add(tokenFeeData[0].dzapFee)
            .add(tokenFeeData[1].dzapFee),
          fixedNativeData.integratorNativeFeeAmount
            .add(tokenFeeData[0].integratorFee)
            .add(tokenFeeData[1].integratorFee),
          0,
        ]
      )

      await expect(tx).changeTokenBalances(
        mock.tokenA,
        [
          user,
          relayReceiver,
          relaySolver,
          mock.mockExchange,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          swapReturnAmount.sub(minSwapReturnAmount),
          0,
          minSwapReturnAmount,
          convertBNToNegative(swapReturnAmount),
          0,
          0,
          0,
        ]
      )

      await expect(tx).emit(
        contracts.relayBridgeFacet,
        EVENTS.SwapBridgeTransferStarted
      )

      const eventFilter =
        contracts.relayBridgeFacet.filters.SwapBridgeTransferStarted()
      const data = await contracts.relayBridgeFacet.queryFilter(eventFilter)
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
        minSwapReturnAmount
      )

      validateSwapEventData(args.swapInfo[0], swapData[0], swapReturnAmount)
    })

    it('3.4 Should allow user to swap src token, return leftOvers and extra then bridge them to destination chain', async () => {
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15]]
      const rate = await mock.mockExchange.rate()
      const leftOverPercent = await mock.mockExchange.leftOverPercent()
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

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        18
      )
      const minSwapReturnAmount = swapReturnAmount.sub(parseUnits('1'))
      const leftOverFromAmount = amountWithoutFee[1]
        .mul(leftOverPercent)
        .div(BPS_DENOMINATOR)

      // -------------------------------------
      const swapData: SwapData[] = [
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: mock.tokenA.address,
          to: NATIVE_ADDRESS,
          fromAmount: amounts[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              mock.tokenA.address,
              NATIVE_ADDRESS,
              dZapDiamond.address,
              amountWithoutFee[1],
              true,
              false
            )
          ).data as string,
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      const tx = contracts.relayBridgeFacet
        .connect(user)
        .swapAndBridgeViaRelay(
          transactionId,
          integratorAddress,
          genericBridgeData,
          swapData,
          relayData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [
          user,
          relayReceiver,
          relaySolver,
          mock.mockExchange,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(
            value.sub(extra).sub(swapReturnAmount.sub(minSwapReturnAmount))
          ),
          amountWithoutFee[0].add(minSwapReturnAmount),
          0,
          convertBNToNegative(swapReturnAmount),
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
          relayReceiver,
          relaySolver,
          mock.mockExchange,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(amounts[1].sub(leftOverFromAmount)),
          0,
          0,
          amountWithoutFee[1].sub(leftOverFromAmount),
          tokenFeeData[1].dzapFee,
          tokenFeeData[1].integratorFee,
          0,
        ]
      )

      await expect(tx).emit(
        contracts.relayBridgeFacet,
        EVENTS.SwapBridgeTransferStarted
      )

      const eventFilter =
        contracts.relayBridgeFacet.filters.SwapBridgeTransferStarted()
      const data = await contracts.relayBridgeFacet.queryFilter(eventFilter)
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
        minSwapReturnAmount
      )

      validateSwapEventData(
        args.swapInfo[0],
        swapData[0],
        swapReturnAmount,
        leftOverFromAmount
      )
    })

    it('3.5 Should allow user to to swap src token and bridgea them usingPermit2 (native, tokenA, tokenA, tokenB)', async () => {
      // -------------------------------------

      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15], signers[16], signers[17]]
      const rate = await mock.mockExchange.rate()
      const relayRequestIds = [
        ethers.utils.id('relayDymmyId1'),
        ethers.utils.id('relayDymmyId2'),
        ethers.utils.id('relayDymmyId3'),
        ethers.utils.id('relayDymmyId4'),
      ]

      // -------------------------------------

      const amounts = [
        parseUnits('20'),
        parseUnits('10', TOKEN_A_DECIMAL),
        parseUnits('20', TOKEN_A_DECIMAL),
        parseUnits('30', TOKEN_B_DECIMAL),
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
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(mock.permit2.address, parseUnits('30', TOKEN_A_DECIMAL))

      await mock.tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await mock.tokenB
        .connect(user)
        .approve(mock.permit2.address, parseUnits('30', TOKEN_B_DECIMAL))

      // -------------------------------------

      const swapReturnAmount = [
        parseUnits(
          formatUnits(
            amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          18
        ),
        parseUnits(
          formatUnits(
            amountWithoutFee[3].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_B_DECIMAL
          ),
          18
        ),
      ]
      const minSwapReturnAmount = [
        swapReturnAmount[0].sub(parseUnits('1')),
        swapReturnAmount[1].sub(parseUnits('1')),
      ]

      // -------------------------------------

      const swapData: SwapData[] = [
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: mock.tokenA.address,
          to: NATIVE_ADDRESS,
          fromAmount: amounts[1],
          minToAmount: minSwapReturnAmount[0],
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              mock.tokenA.address,
              NATIVE_ADDRESS,
              dZapDiamond.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: await getPermi2ApprovetData(
            mock.permit2,
            user,
            mock.tokenA.address,
            dZapDiamond.address,
            amounts[1].add(amounts[2])
          ),
        },
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: mock.tokenB.address,
          to: NATIVE_ADDRESS,
          fromAmount: amounts[3],
          minToAmount: minSwapReturnAmount[1],
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              mock.tokenB.address,
              NATIVE_ADDRESS,
              dZapDiamond.address,
              amountWithoutFee[3],
              false,
              false
            )
          ).data as string,
          permit: await getPermi2ApprovetData(
            mock.permit2,
            user,
            mock.tokenB.address,
            dZapDiamond.address,
            amounts[3]
          ),
        },
      ]

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'RelayLink',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'RelayLink',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
        {
          bridge: 'RelayLink',
          from: mock.tokenA.address,
          to: mock.tokenA.address,
          receiver: recipient[2].address,
          minAmountIn: amounts[2],
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'RelayLink',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[3].address,
          minAmountIn: minSwapReturnAmount[1],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[2],
          permit: encodePermitData('0x', PermitType.PERMIT2_APPROVE),
        },
        {
          requestId: relayRequestIds[3],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      const tx = contracts.relayBridgeFacet
        .connect(user)
        .swapAndBridgeViaRelay(
          transactionId,
          integratorAddress,
          genericBridgeData,
          swapData,
          relayData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [
          user,
          relayReceiver,
          relaySolver,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(value)
            .add(extra)
            .add(swapReturnAmount[0].sub(minSwapReturnAmount[0]))
            .add(swapReturnAmount[1].sub(minSwapReturnAmount[1])),
          amountWithoutFee[0]
            .add(minSwapReturnAmount[0])
            .add(minSwapReturnAmount[1]),
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
          relayReceiver,
          relaySolver,
          mock.mockExchange,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(amounts[1].add(amounts[2])),
          0,
          amountWithoutFee[2],
          amountWithoutFee[1],
          tokenFeeData[1].dzapFee.add(tokenFeeData[2].dzapFee),
          tokenFeeData[1].integratorFee.add(tokenFeeData[2].integratorFee),
          0,
        ]
      )

      await expect(tx).changeTokenBalances(
        mock.tokenB,
        [
          user,
          relayReceiver,
          relaySolver,
          mock.mockExchange,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(amounts[3]),
          0,
          0,
          amountWithoutFee[3],
          tokenFeeData[3].dzapFee,
          tokenFeeData[3].integratorFee,
          0,
        ]
      )

      await expect(tx).emit(
        contracts.relayBridgeFacet,
        EVENTS.SwapBridgeTransferStarted
      )

      const eventFilter =
        contracts.relayBridgeFacet.filters.SwapBridgeTransferStarted()
      const data = await contracts.relayBridgeFacet.queryFilter(eventFilter)
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
        minSwapReturnAmount[0]
      )

      validateBridgeEventData(
        args.bridgeData[2],
        genericBridgeData[2],
        amountWithoutFee[2]
      )

      validateBridgeEventData(
        args.bridgeData[3],
        genericBridgeData[3],
        minSwapReturnAmount[1]
      )

      validateSwapEventData(args.swapInfo[0], swapData[0], swapReturnAmount[0])
      validateSwapEventData(args.swapInfo[1], swapData[1], swapReturnAmount[1])
    })

    it('3.6 Should allow dest swap', async () => {
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15]]
      const rate = await mock.mockExchange.rate()
      const relayRequestIds = [
        ethers.utils.id('relayDymmyId1'),
        ethers.utils.id('relayDymmyId2'),
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

      const extra = parseUnits('0.5')
      const value = amounts[0]
        .add(amounts[1])
        .add(fixedNativeFeeAmount)
        .add(extra)

      // -------------------------------------

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[1].address,
          minAmountIn: amounts[1],
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: true,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      const tx = contracts.relayBridgeFacet
        .connect(user)
        .swapAndBridgeViaRelay(
          transactionId,
          integratorAddress,
          genericBridgeData,
          [],
          relayData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [
          user,
          relayReceiver,
          relaySolver,
          protoFeeVault,
          integrator2,
          dZapDiamond,
        ],
        [
          convertBNToNegative(value).add(extra),
          amountWithoutFee[0].add(amountWithoutFee[1]),
          0,
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
        contracts.relayBridgeFacet,
        EVENTS.SwapBridgeTransferStarted
      )

      const eventFilter =
        contracts.relayBridgeFacet.filters.SwapBridgeTransferStarted()
      const data = await contracts.relayBridgeFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.swapInfo.length).eql(0)

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

    it('3.7 Should revert if callTo is not whitelisted', async () => {
      await contracts.dexManagerFacet
        .connect(dexManager)
        .removeDex(mock.mockExchange.address)

      // ---------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15]]
      const rate = await mock.mockExchange.rate()
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

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        TOKEN_B_DECIMAL
      )
      const minSwapReturnAmount = swapReturnAmount.sub(
        parseUnits('1', TOKEN_B_DECIMAL)
      )

      // -------------------------------------
      const swapData: SwapData[] = [
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: mock.tokenA.address,
          to: mock.tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              mock.tokenA.address,
              mock.tokenB.address,
              dZapDiamond.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: mock.tokenB.address,
          to: mock.tokenB.address,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .swapAndBridgeViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeData,
            swapData,
            relayData,
            {
              value,
            }
          )
      )
        .revertedWithCustomError(
          contracts.relayBridgeFacet,
          ERRORS.UnAuthorizedCall
        )
        .withArgs(mock.mockExchange.address)
    })

    it('3.8 Should revert if dest chainId is same is src', async () => {
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15]]
      const rate = await mock.mockExchange.rate()
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

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        TOKEN_B_DECIMAL
      )
      const minSwapReturnAmount = swapReturnAmount.sub(
        parseUnits('1', TOKEN_B_DECIMAL)
      )

      // -------------------------------------
      const swapData: SwapData[] = [
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: mock.tokenA.address,
          to: mock.tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              mock.tokenA.address,
              mock.tokenB.address,
              dZapDiamond.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: mock.tokenB.address,
          to: mock.tokenB.address,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: HARDHAT_CHAIN_ID,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .swapAndBridgeViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeData,
            swapData,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.CannotBridgeToSameNetwork
      )
    })

    it('3.9 Should revert if swap amount is 0', async () => {
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15]]
      const rate = await mock.mockExchange.rate()
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

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        TOKEN_B_DECIMAL
      )
      const minSwapReturnAmount = swapReturnAmount.sub(
        parseUnits('1', TOKEN_B_DECIMAL)
      )

      // -------------------------------------
      const swapData: SwapData[] = [
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: mock.tokenA.address,
          to: mock.tokenB.address,
          fromAmount: ZERO,
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              mock.tokenA.address,
              mock.tokenB.address,
              dZapDiamond.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: mock.tokenB.address,
          to: mock.tokenB.address,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .swapAndBridgeViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeData,
            swapData,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.NoSwapFromZeroBalance
      )
    })

    it('3.10 Should revert if swap to token and bridge from tokens does not matches', async () => {
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15]]
      const rate = await mock.mockExchange.rate()
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

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        TOKEN_B_DECIMAL
      )
      const minSwapReturnAmount = swapReturnAmount.sub(
        parseUnits('1', TOKEN_B_DECIMAL)
      )

      // -------------------------------------
      const swapData: SwapData[] = [
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: mock.tokenA.address,
          to: NATIVE_ADDRESS,
          fromAmount: amountWithoutFee[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              mock.tokenA.address,
              mock.tokenB.address,
              dZapDiamond.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: mock.tokenB.address,
          to: mock.tokenB.address,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .swapAndBridgeViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeData,
            swapData,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InvalidSwapDetails
      )
    })

    it('3.11 Should revert if destToken length is invalid is 255', async () => {
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15]]
      const rate = await mock.mockExchange.rate()
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

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)
      const mockAddress = '0x' + randomBytes(256).toString('hex')

      // -------------------------------------
      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        TOKEN_B_DECIMAL
      )
      const minSwapReturnAmount = swapReturnAmount.sub(
        parseUnits('1', TOKEN_B_DECIMAL)
      )

      // -------------------------------------
      const swapData: SwapData[] = [
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: mock.tokenA.address,
          to: mock.tokenB.address,
          fromAmount: amountWithoutFee[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              mock.tokenA.address,
              mock.tokenB.address,
              dZapDiamond.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: mock.tokenB.address,
          to: mockAddress,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .swapAndBridgeViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeData,
            swapData,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InvalidLength
      )
    })

    it('3.12 Should revert if destToken length is invalid is 255', async () => {
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = [signers[14], signers[15]]
      const rate = await mock.mockExchange.rate()
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

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)
      const mockAddress = '0x' + randomBytes(256).toString('hex')

      // -------------------------------------
      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        TOKEN_B_DECIMAL
      )
      const minSwapReturnAmount = swapReturnAmount.sub(
        parseUnits('1', TOKEN_B_DECIMAL)
      )

      // -------------------------------------
      const swapData: SwapData[] = [
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: mock.tokenA.address,
          to: mock.tokenB.address,
          fromAmount: amountWithoutFee[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              mock.tokenA.address,
              mock.tokenB.address,
              dZapDiamond.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      const genericBridgeData: GenericBridgeData[] = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: CHAIN_IDS.ARBITRUM_MAINNET,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: mock.tokenB.address,
          to: mock.tokenB.address,
          receiver: mockAddress,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: CHAIN_IDS.POLYGON_MAINNET,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const relayData: RelayData[] = [
        {
          requestId: relayRequestIds[0],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
        {
          requestId: relayRequestIds[1],
          permit: DEFAULT_ENCODDED_PERMIT,
        },
      ]

      // -------------------------------------

      await expect(
        contracts.relayBridgeFacet
          .connect(user)
          .swapAndBridgeViaRelay(
            transactionId,
            integratorAddress,
            genericBridgeData,
            swapData,
            relayData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.relayBridgeFacet,
        ERRORS.InvalidLength
      )
    })
  })
})
