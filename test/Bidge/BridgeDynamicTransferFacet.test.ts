import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { ethers } from 'hardhat'

import {
  BPS_DENOMINATOR,
  BPS_MULTIPLIER,
  CONTRACTS,
  DZAP_NATIVE,
  ERRORS,
  EVENTS,
  HARDHAT_CHAIN_ID,
  NATIVE_ADDRESS,
  ZERO,
} from '../../constants'
import { encodePermitData, getFeeData } from '../../scripts/core/helper'
import {
  getSelectorsUsingContract,
  getSelectorsUsingFunSig,
  getSighash,
} from '../../scripts/utils/diamond'
import { convertBNToNegative, snapshot, updateBalance } from '../utils'

import {
  AccessManagerFacet,
  BatchBridgeCallFacet,
  BridgeDynamicTransferFacet,
  BridgeManagerFacet,
  BridgeMock,
  CrossChainFacet,
  DZapDiamond,
  DexManagerFacet,
  DiamondCutFacet,
  DiamondInit,
  DiamondLoupeFacet,
  ERC20Mock,
  ExchangeMock,
  Executor,
  FeesFacet,
  OwnershipFacet,
  Permit2,
  Receiver,
  SwapFacet,
  WNATIVE,
  WithdrawFacet,
} from '../../typechain-types'
import {
  DiamondCut,
  FacetCutAction,
  FeeInfo,
  FeeType,
  PermitType,
} from '../../types'
import { DEFAULT_BYTES } from '../../constants/others'
import { randomBytes } from 'crypto'

let dZapDiamond: DZapDiamond
let diamondInit: DiamondInit
let diamondCutFacetImp: DiamondCutFacet
let diamondCutFacet: DiamondCutFacet
let diamondLoupeFacetImp: DiamondLoupeFacet
let ownershipFacetImp: OwnershipFacet
let accessManagerFacetImp: AccessManagerFacet
let accessManagerFacet: AccessManagerFacet
let dexManagerFacetImp: DexManagerFacet
let dexManagerFacet: DexManagerFacet
let feesFacetImp: FeesFacet
let feesFacet: FeesFacet
let withdrawFacetImp: WithdrawFacet
let swapFacetImp: SwapFacet
let swapFacet: SwapFacet
let crossChainFacet: CrossChainFacet
let crossChainFacetImp: CrossChainFacet
let bridgeManagerFacetImp: BridgeManagerFacet
let executor: Executor
let receiver: Receiver
let bridgeManagerFacet: BridgeManagerFacet
let bridgeDynamicTransferFacet: BridgeDynamicTransferFacet
let bridgeDynamicTransferFacetImp: BridgeDynamicTransferFacet
let batchBridgeCallFacet: BatchBridgeCallFacet
let batchBridgeCallFacetImp: BatchBridgeCallFacet

const TOKEN_A_DECIMAL = 18
const TOKEN_B_DECIMAL = 6
let permit2: Permit2
let mockExchange: ExchangeMock
let mockBridge: BridgeMock
let tokenA: ERC20Mock
let tokenB: ERC20Mock
let wNative: WNATIVE

let signers: SignerWithAddress[]
let deployer: SignerWithAddress
let owner: SignerWithAddress
let protoFeeVault: SignerWithAddress
let integrator1: SignerWithAddress
let integrator2: SignerWithAddress
let dexManager: SignerWithAddress
let swapManager: SignerWithAddress
let crossChainManager: SignerWithAddress
let feeManager: SignerWithAddress
let withdrawManager: SignerWithAddress

let snapshotId: string

const MAX_TOKEN_FEE = 10 * BPS_MULTIPLIER
const MAX_FIXED_FEE_AMOUNT = ethers.utils.parseUnits('1')
const feeInfo1: FeeInfo[] = [
  {
    tokenFee: BigNumber.from(1 * BPS_MULTIPLIER),
    fixedNativeFeeAmount: ZERO,
    dzapTokenShare: BigNumber.from(100 * BPS_MULTIPLIER),
    dzapFixedNativeShare: ZERO,
  },
  {
    tokenFee: BigNumber.from(2 * BPS_MULTIPLIER),
    fixedNativeFeeAmount: parseUnits('.5'),
    dzapTokenShare: BigNumber.from(100 * BPS_MULTIPLIER),
    dzapFixedNativeShare: BigNumber.from(100 * BPS_MULTIPLIER),
  },
]

const feeInfo2: FeeInfo[] = [
  {
    tokenFee: BigNumber.from(1 * BPS_MULTIPLIER),
    fixedNativeFeeAmount: parseUnits('0.5'),
    dzapTokenShare: BigNumber.from(50 * BPS_MULTIPLIER),
    dzapFixedNativeShare: BigNumber.from(50 * BPS_MULTIPLIER),
  },
  {
    tokenFee: BigNumber.from(2 * BPS_MULTIPLIER),
    fixedNativeFeeAmount: parseUnits('1'),
    dzapTokenShare: BigNumber.from(50 * BPS_MULTIPLIER),
    dzapFixedNativeShare: BigNumber.from(50 * BPS_MULTIPLIER),
  },
]

const validateBridgeEventData = (eventBridgeData, bridgeData, minAmountIn) => {
  expect(eventBridgeData[0]).equal(bridgeData.bridge)
  expect(ethers.utils.getAddress(eventBridgeData[1])).equal(bridgeData.to)
  expect(ethers.utils.getAddress(eventBridgeData[2])).equal(bridgeData.receiver)
  expect(ethers.utils.getAddress(eventBridgeData[3])).equal(bridgeData.from)
  expect(eventBridgeData[4]).equal(bridgeData.hasSourceSwaps)
  expect(eventBridgeData[5]).equal(bridgeData.hasDestinationCall)
  expect(eventBridgeData[6]).equal(minAmountIn)
  expect(eventBridgeData[7]).equal(
    BigNumber.from(bridgeData.destinationChainId)
  )
}

const validateSwapEventData = (
  eventSwapData,
  swapData,
  minReturn,
  leftoverFromAmount = ZERO
) => {
  expect(eventSwapData[0]).equal(swapData.callTo)
  expect(eventSwapData[1]).equal(swapData.from)
  expect(eventSwapData[2]).equal(swapData.to)
  expect(eventSwapData[3]).equal(swapData.fromAmount)
  expect(eventSwapData[4]).equal(leftoverFromAmount)
  expect(eventSwapData[5]).equal(minReturn)
}

const destinationChainId1 = BigNumber.from(56)
const destinationChainId2 = BigNumber.from(137)

describe('BridgeDynamicTransferFacet.test.ts', async () => {
  beforeEach(async () => {
    signers = await ethers.getSigners()
    deployer = signers[0]
    owner = signers[1]
    protoFeeVault = signers[2]
    integrator1 = signers[3]
    integrator2 = signers[4]
    dexManager = signers[5]
    swapManager = signers[6]
    crossChainManager = signers[7]
    feeManager = signers[8]
    withdrawManager = signers[9]

    await updateBalance(deployer.address)

    // -----------------------------------------
    // mock
    {
      const ERC20Artifact = await ethers.getContractFactory(CONTRACTS.ERC20Mock)
      tokenA = (await ERC20Artifact.connect(deployer).deploy(
        'MTokenA',
        'MA',
        TOKEN_A_DECIMAL,
        parseUnits('10000', TOKEN_A_DECIMAL)
      )) as ERC20Mock

      tokenB = (await ERC20Artifact.connect(deployer).deploy(
        'MTokenB',
        'MB',
        TOKEN_B_DECIMAL,
        parseUnits('10000', TOKEN_B_DECIMAL)
      )) as ERC20Mock

      const WNativeArtifact = await ethers.getContractFactory(CONTRACTS.WNATIVE)
      wNative = (await WNativeArtifact.connect(deployer).deploy()) as WNATIVE

      const Permit2Artifact = await ethers.getContractFactory(CONTRACTS.Permit2)
      permit2 = (await Permit2Artifact.connect(deployer).deploy()) as Permit2

      const ExchangeMock = await ethers.getContractFactory(
        CONTRACTS.ExchangeMock
      )
      mockExchange = (await ExchangeMock.connect(
        deployer
      ).deploy()) as ExchangeMock

      const BridgeMock = await ethers.getContractFactory(
        CONTRACTS.BridgeMock,
        deployer
      )
      mockBridge = (await BridgeMock.connect(deployer).deploy()) as BridgeMock
    }

    // -----------------------------------------
    // mock exchange token transfer
    {
      await tokenA.mint(
        mockExchange.address,
        parseUnits('100', TOKEN_A_DECIMAL)
      )
      await tokenB.mint(
        mockExchange.address,
        parseUnits('100', TOKEN_B_DECIMAL)
      )

      await wNative.connect(deployer).deposit({ value: parseUnits('200') })
      await wNative
        .connect(deployer)
        .transfer(mockExchange.address, parseUnits('100'))

      await deployer.sendTransaction({
        to: mockExchange.address,
        value: parseUnits('100'),
      })
    }

    // -----------------------------------------
    // diamondCutFacet, diamondInit, dZapDiamond
    {
      const DiamondCutFacet = await ethers.getContractFactory(
        CONTRACTS.DiamondCutFacet
      )
      diamondCutFacet = (await DiamondCutFacet.deploy()) as DiamondCutFacet
      await diamondCutFacet.deployed()

      const DiamondInit = await ethers.getContractFactory(CONTRACTS.DiamondInit)
      diamondInit = (await DiamondInit.deploy()) as DiamondInit
      await diamondInit.deployed()

      const DZapDiamond = await ethers.getContractFactory(CONTRACTS.DZapDiamond)
      dZapDiamond = (await DZapDiamond.deploy(
        owner.address,
        diamondCutFacet.address
      )) as DZapDiamond
      await dZapDiamond.deployed()
    }

    {
      diamondCutFacet = (await ethers.getContractAt(
        CONTRACTS.DiamondCutFacet,
        dZapDiamond.address
      )) as DiamondCutFacet
      feesFacet = (await ethers.getContractAt(
        CONTRACTS.FeesFacet,
        dZapDiamond.address
      )) as FeesFacet
      dexManagerFacet = (await ethers.getContractAt(
        CONTRACTS.DexManagerFacet,
        dZapDiamond.address
      )) as DexManagerFacet
      accessManagerFacet = (await ethers.getContractAt(
        CONTRACTS.AccessManagerFacet,
        dZapDiamond.address
      )) as AccessManagerFacet
      swapFacet = (await ethers.getContractAt(
        CONTRACTS.SwapFacet,
        dZapDiamond.address
      )) as SwapFacet
      crossChainFacet = (await ethers.getContractAt(
        CONTRACTS.CrossChainFacet,
        dZapDiamond.address
      )) as CrossChainFacet
      bridgeManagerFacet = (await ethers.getContractAt(
        CONTRACTS.BridgeManagerFacet,
        dZapDiamond.address
      )) as BridgeManagerFacet
      bridgeDynamicTransferFacet = (await ethers.getContractAt(
        CONTRACTS.BridgeDynamicTransferFacet,
        dZapDiamond.address
      )) as BridgeDynamicTransferFacet
      batchBridgeCallFacet = (await ethers.getContractAt(
        CONTRACTS.BatchBridgeCallFacet,
        dZapDiamond.address
      )) as BatchBridgeCallFacet
    }

    // -----------------------------------------
    // facets
    {
      const DiamondLoupeFacet = await ethers.getContractFactory(
        CONTRACTS.DiamondLoupeFacet
      )
      diamondLoupeFacetImp =
        (await DiamondLoupeFacet.deploy()) as DiamondLoupeFacet
      await diamondLoupeFacetImp.deployed()

      const OwnershipFacet = await ethers.getContractFactory(
        CONTRACTS.OwnershipFacet,
        deployer
      )
      ownershipFacetImp = (await OwnershipFacet.deploy()) as OwnershipFacet
      await ownershipFacetImp.deployed()

      const AccessManagerFacet = await ethers.getContractFactory(
        CONTRACTS.AccessManagerFacet,
        deployer
      )
      accessManagerFacetImp =
        (await AccessManagerFacet.deploy()) as AccessManagerFacet
      await accessManagerFacetImp.deployed()

      const DexManagerFacet = await ethers.getContractFactory(
        CONTRACTS.DexManagerFacet,
        deployer
      )
      dexManagerFacetImp = (await DexManagerFacet.deploy()) as DexManagerFacet
      await dexManagerFacetImp.deployed()

      const FeesFacet = await ethers.getContractFactory(
        CONTRACTS.FeesFacet,
        deployer
      )
      feesFacetImp = (await FeesFacet.deploy()) as FeesFacet
      await feesFacetImp.deployed()

      const WithdrawFacet = await ethers.getContractFactory(
        CONTRACTS.WithdrawFacet,
        deployer
      )
      withdrawFacetImp = (await WithdrawFacet.deploy()) as WithdrawFacet
      await withdrawFacetImp.deployed()

      const SwapFacet = await ethers.getContractFactory(
        CONTRACTS.SwapFacet,
        deployer
      )
      swapFacetImp = (await SwapFacet.deploy()) as SwapFacet
      await swapFacetImp.deployed()

      const CrossChainFacet = await ethers.getContractFactory(
        CONTRACTS.CrossChainFacet,
        deployer
      )
      crossChainFacetImp = (await CrossChainFacet.deploy()) as CrossChainFacet
      await crossChainFacetImp.deployed()

      const BridgeManagerFacet = await ethers.getContractFactory(
        CONTRACTS.BridgeManagerFacet,
        deployer
      )
      bridgeManagerFacetImp =
        (await BridgeManagerFacet.deploy()) as BridgeManagerFacet
      await bridgeManagerFacetImp.deployed()

      const BridgeDynamicTransferFacet = await ethers.getContractFactory(
        CONTRACTS.BridgeDynamicTransferFacet,
        deployer
      )
      bridgeDynamicTransferFacetImp =
        (await BridgeDynamicTransferFacet.deploy()) as BridgeDynamicTransferFacet
      await bridgeDynamicTransferFacetImp.deployed()

      const BatchBridgeCallFacet = await ethers.getContractFactory(
        CONTRACTS.BatchBridgeCallFacet,
        deployer
      )
      batchBridgeCallFacetImp =
        (await BatchBridgeCallFacet.deploy()) as BatchBridgeCallFacet
      await batchBridgeCallFacetImp.deployed()
    }

    // -----------------------------------------
    // diamondCut
    {
      const cutData: DiamondCut[] = [
        {
          facetAddress: diamondLoupeFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            diamondLoupeFacetImp,
            CONTRACTS.DiamondLoupeFacet
          ).selectors,
        },
        {
          facetAddress: ownershipFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            ownershipFacetImp,
            CONTRACTS.OwnershipFacet
          ).selectors,
        },
        {
          facetAddress: accessManagerFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            accessManagerFacetImp,
            CONTRACTS.AccessManagerFacet
          ).selectors,
        },
        {
          facetAddress: dexManagerFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            dexManagerFacetImp,
            CONTRACTS.DexManagerFacet
          ).selectors,
        },
        {
          facetAddress: feesFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            feesFacetImp,
            CONTRACTS.FeesFacet
          ).selectors,
        },
        {
          facetAddress: withdrawFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            withdrawFacetImp,
            CONTRACTS.WithdrawFacet
          ).selectors,
        },
        {
          facetAddress: swapFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            swapFacetImp,
            CONTRACTS.SwapFacet
          ).selectors,
        },
        {
          facetAddress: crossChainFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            crossChainFacetImp,
            CONTRACTS.CrossChainFacet
          ).selectors,
        },
        {
          facetAddress: bridgeManagerFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            bridgeManagerFacetImp,
            CONTRACTS.BridgeManagerFacet
          ).selectors,
        },
        {
          facetAddress: bridgeDynamicTransferFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            bridgeDynamicTransferFacetImp,
            CONTRACTS.BridgeDynamicTransferFacet
          ).selectors,
        },
        {
          facetAddress: batchBridgeCallFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            batchBridgeCallFacetImp,
            CONTRACTS.BatchBridgeCallFacet
          ).selectors,
        },
      ]

      const { data: initData } =
        await diamondInit.populateTransaction.initialize(
          permit2.address,
          protoFeeVault.address,
          MAX_TOKEN_FEE,
          MAX_FIXED_FEE_AMOUNT
        )

      await diamondCutFacet
        .connect(owner)
        .diamondCut(cutData, diamondInit.address, initData as string)
    }

    // ----------------------------------------
    // access
    {
      const dexSelectors = getSighash(
        [
          dexManagerFacet.interface.functions['addDex(address)'],
          dexManagerFacet.interface.functions['batchAddDex(address[])'],
          dexManagerFacet.interface.functions['removeDex(address)'],
          dexManagerFacet.interface.functions['batchRemoveDex(address[])'],
          dexManagerFacet.interface.functions[
            'setFunctionApprovalBySignature(address,bytes4,bool)'
          ],
          dexManagerFacet.interface.functions[
            'batchSetFunctionApprovalBySignature(address[],bytes4[],bool[])'
          ],
        ],
        dexManagerFacet.interface
      )
      const dexCanExecute = dexSelectors.map(() => true)
      const dexExecutors = dexSelectors.map(() => dexManager.address)

      const feeSelectors = getSighash(
        [
          feesFacet.interface.functions['setProtocolFeeVault(address)'],
          feesFacet.interface.functions[
            'setIntegratorInfo(address,uint8[],(uint256,uint256,uint256,uint256)[])'
          ],
          feesFacet.interface.functions['removeIntegrator(address)'],
        ],
        dexManagerFacet.interface
      )
      const feeCanExecute = feeSelectors.map(() => true)
      const feeExecutors = feeSelectors.map(() => feeManager.address)

      const crossChainSelectors = getSighash(
        [
          bridgeManagerFacet.interface.functions[
            'updateSelectorInfo(address[],bytes4[],uint256[])'
          ],
          bridgeManagerFacet.interface.functions[
            'addAggregatorsAndBridges(address[])'
          ],
          bridgeManagerFacet.interface.functions[
            'removeAggregatorsAndBridges(address[])'
          ],
        ],
        bridgeManagerFacet.interface
      )

      const crossChainCanExecute = crossChainSelectors.map(() => true)
      const crossChainExecutors = crossChainSelectors.map(
        () => crossChainManager.address
      )

      const selectors = [
        ...dexSelectors,
        ...feeSelectors,
        ...crossChainSelectors,
      ]
      const executors = [
        ...dexExecutors,
        ...feeExecutors,
        ...crossChainExecutors,
      ]
      const canExecute = [
        ...dexCanExecute,
        ...feeCanExecute,
        ...crossChainCanExecute,
      ]

      await accessManagerFacet
        .connect(owner)
        .setBatchCanExecute(selectors, executors, canExecute)
    }

    // ----------------------------------------
    // set integrator
    {
      await feesFacet
        .connect(feeManager)
        .setIntegratorInfo(
          integrator1.address,
          [FeeType.SWAP, FeeType.BRIDGE],
          feeInfo1
        )

      await feesFacet
        .connect(feeManager)
        .setIntegratorInfo(
          integrator2.address,
          [FeeType.SWAP, FeeType.BRIDGE],
          feeInfo2
        )
    }

    // ----------------------------------------
    // deploy executor and receiver
    {
      const Executor = await ethers.getContractFactory(CONTRACTS.Executor)
      executor = (await Executor.deploy(dZapDiamond.address)) as Executor
      await executor.deployed()

      const Receiver = await ethers.getContractFactory(CONTRACTS.Receiver)
      receiver = (await Receiver.deploy(
        owner.address,
        executor.address
      )) as Receiver
      await receiver.deployed()
    }

    snapshotId = await snapshot.take()
  })

  describe('1) bridgeViaTransfer', () => {
    it('1.1 Should allow user to bridge token from one chain to other multiple chain(src: native, dest: native)', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      // -------------------------------------

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            transferData,
            {
              value,
            }
          )
      )
        .emit(bridgeDynamicTransferFacet, EVENTS.BridgeTransferStarted)
        .changeEtherBalances(
          [user, recipient, protoFeeVault, integrator1, mockTransferAddress],
          [
            convertBNToNegative(value.sub(extra)),
            ZERO,
            fixedNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            tokenFeeData[0].integratorFee,
            amountWithoutFee[0],
          ]
        )

      const eventFilter =
        bridgeDynamicTransferFacet.filters.BridgeTransferStarted()
      const data = await bridgeDynamicTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)

      validateBridgeEventData(
        args.bridgeData,
        genericBridgeDataForTransfer,
        amountWithoutFee[0]
      )

      // -------------------------------------
    })

    it('1.2 Should revert if destToken length is invalid is 255', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]
      const mockAddress = '0x' + randomBytes(256).toString('hex')

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: mockAddress,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            transferData,
            {
              value,
            }
          )
      ).revertedWithCustomError(batchBridgeCallFacet, ERRORS.InvalidLength)
    })

    it('1.3 Should revert if receiver length is invalid is 255', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]
      const mockAddress = '0x' + randomBytes(256).toString('hex')

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: mockAddress,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            transferData,
            {
              value,
            }
          )
      ).revertedWithCustomError(batchBridgeCallFacet, ERRORS.InvalidLength)
    })

    it('1.4 Should revert if amount is zero', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: 0,
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            transferData,
            {
              value,
            }
          )
      ).revertedWithCustomError(batchBridgeCallFacet, ERRORS.InvalidAmount)
    })

    it('1.5 Should revert if dest chainId is same is src', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: HARDHAT_CHAIN_ID,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            transferData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        batchBridgeCallFacet,
        ERRORS.CannotBridgeToSameNetwork
      )
    })

    it('1.6 Should revert if it contains source swap', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: true,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            transferData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        batchBridgeCallFacet,
        ERRORS.InformationMismatch
      )
    })

    it('1.7 Should revert if it contains dest swap', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: true,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            transferData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        batchBridgeCallFacet,
        ERRORS.InformationMismatch
      )
    })
  })

  describe('2) bridgeMultipleTokensViaTransfer', () => {
    it('2.1 Should allow user to bridge multiple token from one chain to other multiple chain', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = [signers[14], signers[15]]
      const mockTransferAddress = [signers[18], signers[19]]

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const genericBridgeDataForTransfer = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId1,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenA.address,
          to: tokenB.address,
          receiver: recipient[1].address,
          minAmountIn: amounts[1],
          destinationChainId: destinationChainId2,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const transferData = [
        {
          transferTo: mockTransferAddress[0].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          transferTo: mockTransferAddress[1].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const [
        userBeforeA,
        mockTransferAddressBeforeA,
        protoFeeVaultBeforeA,
        integrator1BeforeA,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenA.balanceOf(mockTransferAddress[1].address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator1.address),
      ])

      // -------------------------------------

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeMultipleTokensViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            transferData,
            {
              value,
            }
          )
      )
        .emit(
          bridgeDynamicTransferFacet,
          EVENTS.MultiTokenBridgeTransferStarted
        )
        .changeEtherBalances(
          [
            user,
            recipient[0],
            protoFeeVault,
            integrator1,
            mockTransferAddress[0],
          ],
          [
            convertBNToNegative(value.sub(extra)),
            ZERO,
            fixedNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            tokenFeeData[0].integratorFee,
            amountWithoutFee[0],
          ]
        )

      const eventFilter =
        bridgeDynamicTransferFacet.filters.MultiTokenBridgeTransferStarted()
      const data = await bridgeDynamicTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)

      validateBridgeEventData(
        args.bridgeData[0],
        genericBridgeDataForTransfer[0],
        amountWithoutFee[0]
      )
      validateBridgeEventData(
        args.bridgeData[1],
        genericBridgeDataForTransfer[1],
        amountWithoutFee[1]
      )

      // -------------------------------------

      const [
        userAfterA,
        mockTransferAddressAfterA,
        protoFeeVaultAfterA,
        integrator1AfterA,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenA.balanceOf(mockTransferAddress[1].address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator1.address),
      ])

      expect(userAfterA).equal(userBeforeA.sub(amounts[1]))
      expect(mockTransferAddressAfterA).equal(
        mockTransferAddressBeforeA.add(amountWithoutFee[1])
      )
      expect(protoFeeVaultAfterA).equal(
        protoFeeVaultBeforeA.add(tokenFeeData[1].dzapFee)
      )
      expect(integrator1AfterA).equal(
        integrator1BeforeA.add(tokenFeeData[1].integratorFee)
      )
    })

    it('2.2 Should revert if destToken length is invalid is 255', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]
      const mockAddress = '0x' + randomBytes(256).toString('hex')

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: mockAddress,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeMultipleTokensViaTransfer(
            transactionId,
            integratorAddress,
            [genericBridgeDataForTransfer],
            [transferData],
            {
              value,
            }
          )
      ).revertedWithCustomError(batchBridgeCallFacet, ERRORS.InvalidLength)
    })

    it('2.3 Should revert if receiver length is invalid is 255', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]
      const mockAddress = '0x' + randomBytes(256).toString('hex')

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: mockAddress,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeMultipleTokensViaTransfer(
            transactionId,
            integratorAddress,
            [genericBridgeDataForTransfer],
            [transferData],
            {
              value,
            }
          )
      ).revertedWithCustomError(batchBridgeCallFacet, ERRORS.InvalidLength)
    })

    it('2.4 Should revert if amount is zero', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: 0,
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeMultipleTokensViaTransfer(
            transactionId,
            integratorAddress,
            [genericBridgeDataForTransfer],
            [transferData],
            {
              value,
            }
          )
      ).revertedWithCustomError(batchBridgeCallFacet, ERRORS.InvalidAmount)
    })

    it('2.5 Should revert if dest chainId is same is src', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: HARDHAT_CHAIN_ID,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeMultipleTokensViaTransfer(
            transactionId,
            integratorAddress,
            [genericBridgeDataForTransfer],
            [transferData],
            {
              value,
            }
          )
      ).revertedWithCustomError(
        batchBridgeCallFacet,
        ERRORS.CannotBridgeToSameNetwork
      )
    })

    it('2.6 Should revert if it contains source swap', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: true,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeMultipleTokensViaTransfer(
            transactionId,
            integratorAddress,
            [genericBridgeDataForTransfer],
            [transferData],
            {
              value,
            }
          )
      ).revertedWithCustomError(
        batchBridgeCallFacet,
        ERRORS.InformationMismatch
      )
    })

    it('2.7 Should revert if it contains dest swap', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: true,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .bridgeMultipleTokensViaTransfer(
            transactionId,
            integratorAddress,
            [genericBridgeDataForTransfer],
            [transferData],
            {
              value,
            }
          )
      ).revertedWithCustomError(
        batchBridgeCallFacet,
        ERRORS.InformationMismatch
      )
    })
  })

  describe('3) swapAndBridge', () => {
    beforeEach(async () => {
      // swap
      {
        const selectors = getSelectorsUsingFunSig([
          'function swap(address,address,address,uint256,bool,bool)',
        ])
        const dexs = selectors.map(() => mockExchange.address)
        const approval = selectors.map(() => true)

        await dexManagerFacet
          .connect(dexManager)
          .batchAddDex([mockExchange.address])
      }
    })

    it('3.1 Should allow user to swap src token then bridge them to destination chain (swap erc20 -> erc20)', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = [signers[14], signers[15]]
      const mockTransferAddress = [signers[18], signers[19]]
      const rate = await mockExchange.rate()

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
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

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              crossChainFacet.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const genericBridgeDataForTransfer = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId1,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenB.address,
          to: tokenB.address,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: destinationChainId2,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const transferData = [
        {
          transferTo: mockTransferAddress[0].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          transferTo: mockTransferAddress[1].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const [
        userBeforeA,
        userBeforeB,
        protoFeeVaultBeforeA,
        integrator1BeforeA,
        mockTransferAddressBeforeB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator1.address),
        tokenB.balanceOf(mockTransferAddress[1].address),
      ])

      // -------------------------------------

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .swapAndBridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            swapData,
            transferData,
            {
              value,
            }
          )
      )
        .emit(bridgeDynamicTransferFacet, EVENTS.SwapBridgeTransferStarted)
        .changeEtherBalances(
          [
            user,
            recipient[0],
            protoFeeVault,
            integrator1,
            mockTransferAddress[0],
          ],
          [
            convertBNToNegative(value.sub(extra)),
            ZERO,
            fixedNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            tokenFeeData[0].integratorFee,
            amountWithoutFee[0],
          ]
        )

      const eventFilter =
        bridgeDynamicTransferFacet.filters.SwapBridgeTransferStarted()
      const data = await bridgeDynamicTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.swapInfo.length).eql(1)

      validateBridgeEventData(
        args.bridgeData[0],
        genericBridgeDataForTransfer[0],
        amountWithoutFee[0]
      )
      validateBridgeEventData(
        args.bridgeData[1],
        genericBridgeDataForTransfer[1],
        swapReturnAmount
      )

      validateSwapEventData(args.swapInfo[0], swapData[0], swapReturnAmount)

      // -------------------------------------

      const [
        userAfterA,
        userAfterB,
        protoFeeVaultAfterA,
        integrator1AfterA,
        mockTransferAddressAfterB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator1.address),
        tokenB.balanceOf(mockTransferAddress[1].address),
      ])

      expect(userAfterA).equal(userBeforeA.sub(amounts[1]))
      expect(userAfterB).equal(userBeforeB)
      expect(mockTransferAddressAfterB).equal(
        mockTransferAddressBeforeB.add(swapReturnAmount)
      )
      expect(protoFeeVaultAfterA).equal(
        protoFeeVaultBeforeA.add(tokenFeeData[1].dzapFee)
      )
      expect(integrator1AfterA).equal(
        integrator1BeforeA.add(tokenFeeData[1].integratorFee)
      )
    })

    it('3.2 Should allow user to swap src token then bridge them to destination chain (swap native -> erc20)', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = [signers[14], signers[15]]
      const mockTransferAddress = [signers[18], signers[19]]
      const rate = await mockExchange.rate()

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(amountWithoutFee[0].mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_B_DECIMAL
      )
      const minSwapReturnAmount = swapReturnAmount.sub(
        parseUnits('1', TOKEN_B_DECIMAL)
      )

      // -------------------------------------

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: NATIVE_ADDRESS,
          to: tokenB.address,
          fromAmount: amounts[0],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              NATIVE_ADDRESS,
              tokenB.address,
              crossChainFacet.address,
              amountWithoutFee[0],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const genericBridgeDataForTransfer = [
        {
          bridge: 'TestBridge1',
          from: tokenB.address,
          to: tokenB.address,
          receiver: recipient[0].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: destinationChainId1,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient[1].address,
          minAmountIn: amounts[1],
          destinationChainId: destinationChainId2,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const transferData = [
        {
          transferTo: mockTransferAddress[0].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          transferTo: mockTransferAddress[1].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const [
        userBeforeA,
        userBeforeB,
        protoFeeVaultBeforeA,
        integrator1BeforeA,
        mockTransferAddressBeforeA,
        mockTransferAddressBeforeB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator1.address),
        tokenA.balanceOf(mockTransferAddress[1].address),
        tokenB.balanceOf(mockTransferAddress[0].address),
      ])

      // -------------------------------------

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .swapAndBridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            swapData,
            transferData,
            {
              value,
            }
          )
      )
        .emit(bridgeDynamicTransferFacet, EVENTS.SwapBridgeTransferStarted)
        .changeEtherBalances(
          [
            user,
            recipient[0],
            protoFeeVault,
            integrator1,
            mockTransferAddress[0],
            mockExchange,
          ],
          [
            convertBNToNegative(value.sub(extra)),
            ZERO,
            fixedNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            tokenFeeData[0].integratorFee,
            ZERO,
            amountWithoutFee[0],
          ]
        )

      const eventFilter =
        bridgeDynamicTransferFacet.filters.SwapBridgeTransferStarted()
      const data = await bridgeDynamicTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)

      validateBridgeEventData(
        args.bridgeData[0],
        genericBridgeDataForTransfer[0],
        swapReturnAmount
      )
      validateBridgeEventData(
        args.bridgeData[1],
        genericBridgeDataForTransfer[1],
        amountWithoutFee[1]
      )

      // -------------------------------------

      const [
        userAfterA,
        userAfterB,
        protoFeeVaultAfterA,
        integrator1AfterA,
        mockTransferAddressAfterA,
        mockTransferAddressAfterB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator1.address),
        tokenA.balanceOf(mockTransferAddress[1].address),
        tokenB.balanceOf(mockTransferAddress[0].address),
      ])

      expect(userAfterA).equal(userBeforeA.sub(amounts[1]))
      expect(userAfterB).equal(userBeforeB)

      expect(mockTransferAddressAfterA).equal(
        mockTransferAddressBeforeA.add(amountWithoutFee[1])
      )
      expect(mockTransferAddressAfterB).equal(
        mockTransferAddressBeforeB.add(swapReturnAmount)
      )
      expect(protoFeeVaultAfterA).equal(
        protoFeeVaultBeforeA.add(tokenFeeData[1].dzapFee)
      )
      expect(integrator1AfterA).equal(
        integrator1BeforeA.add(tokenFeeData[1].integratorFee)
      )
    })

    it('3.3 Should allow user to swap src token then bridge them to destination chain (swap erc20 -> native)', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = [signers[14], signers[15]]
      const mockTransferAddress = [signers[18], signers[19]]
      const rate = await mockExchange.rate()

      // -------------------------------------
      const amounts = [
        parseUnits('10', TOKEN_B_DECIMAL),
        parseUnits('20', TOKEN_A_DECIMAL),
      ]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = fixedNativeFeeAmount.add(extra)

      // -------------------------------------
      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      await tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await tokenB
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_B_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[0].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_B_DECIMAL
        ),
        18
      )
      const minSwapReturnAmount = swapReturnAmount.sub(parseUnits('1'))

      // -------------------------------------

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenB.address,
          to: NATIVE_ADDRESS,
          fromAmount: amounts[0],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenB.address,
              NATIVE_ADDRESS,
              crossChainFacet.address,
              amountWithoutFee[0],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const genericBridgeDataForTransfer = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: destinationChainId1,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient[1].address,
          minAmountIn: amounts[1],
          destinationChainId: destinationChainId2,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const transferData = [
        {
          transferTo: mockTransferAddress[0].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          transferTo: mockTransferAddress[1].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const [
        userBeforeA,
        userBeforeB,
        protoFeeVaultBeforeA,
        protoFeeVaultBeforeB,
        integrator1BeforeA,
        integrator1BeforeB,
        mockTransferAddressBeforeA,
        mockTransferAddressBeforeB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator1.address),
        tokenB.balanceOf(integrator1.address),
        tokenA.balanceOf(mockTransferAddress[1].address),
        tokenB.balanceOf(mockTransferAddress[0].address),
      ])

      // -------------------------------------

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .swapAndBridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            swapData,
            transferData,
            {
              value,
            }
          )
      )
        .emit(bridgeDynamicTransferFacet, EVENTS.SwapBridgeTransferStarted)
        .changeEtherBalances(
          [
            user,
            recipient[0],
            protoFeeVault,
            integrator1,
            mockTransferAddress[0],
            mockExchange,
          ],
          [
            convertBNToNegative(value.sub(extra)),
            ZERO,
            fixedNativeFeeAmount,
            ZERO,
            swapReturnAmount,
            convertBNToNegative(swapReturnAmount),
          ]
        )

      const eventFilter =
        bridgeDynamicTransferFacet.filters.SwapBridgeTransferStarted()
      const data = await bridgeDynamicTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)

      validateBridgeEventData(
        args.bridgeData[0],
        genericBridgeDataForTransfer[0],
        swapReturnAmount
      )
      validateBridgeEventData(
        args.bridgeData[1],
        genericBridgeDataForTransfer[1],
        amountWithoutFee[1]
      )

      // -------------------------------------

      const [
        userAfterA,
        userAfterB,
        protoFeeVaultAfterA,
        protoFeeVaultAfterB,
        integrator1AfterA,
        integrator1AfterB,
        mockTransferAddressAfterA,
        mockTransferAddressAfterB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator1.address),
        tokenB.balanceOf(integrator1.address),
        tokenA.balanceOf(mockTransferAddress[1].address),
        tokenB.balanceOf(mockTransferAddress[0].address),
      ])

      expect(userAfterA).equal(userBeforeA.sub(amounts[1]))
      expect(userAfterB).equal(userBeforeB.sub(amounts[0]))

      expect(mockTransferAddressAfterA).equal(
        mockTransferAddressBeforeA.add(amountWithoutFee[1])
      )
      expect(mockTransferAddressAfterB).equal(mockTransferAddressBeforeB)

      expect(protoFeeVaultAfterA).equal(
        protoFeeVaultBeforeA.add(tokenFeeData[1].dzapFee)
      )
      expect(integrator1AfterA).equal(
        integrator1BeforeA.add(tokenFeeData[1].integratorFee)
      )

      expect(protoFeeVaultAfterB).equal(
        protoFeeVaultBeforeB.add(tokenFeeData[0].dzapFee)
      )
      expect(integrator1AfterB).equal(
        integrator1BeforeB.add(tokenFeeData[0].integratorFee)
      )
    })

    it('3.4 Should allow user to swap src token, return leftOver then bridge them to destination chain', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = [signers[14], signers[15]]
      const mockTransferAddress = [signers[18], signers[19]]
      const rate = await mockExchange.rate()
      const leftOverPercent = await mockExchange.leftOverPercent()

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
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
      const leftOverFromAmount = amountWithoutFee[1]
        .mul(leftOverPercent)
        .div(BPS_DENOMINATOR)

      // -------------------------------------

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              crossChainFacet.address,
              amountWithoutFee[1],
              true,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const genericBridgeDataForTransfer = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId1,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenB.address,
          to: tokenB.address,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: destinationChainId2,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const transferData = [
        {
          transferTo: mockTransferAddress[0].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          transferTo: mockTransferAddress[1].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const [
        userBeforeA,
        userBeforeB,
        protoFeeVaultBeforeA,
        integrator1BeforeA,
        mockTransferAddressBeforeB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator1.address),
        tokenB.balanceOf(mockTransferAddress[1].address),
      ])

      // -------------------------------------

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .swapAndBridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            swapData,
            transferData,
            {
              value,
            }
          )
      )
        .emit(bridgeDynamicTransferFacet, EVENTS.SwapBridgeTransferStarted)
        .changeEtherBalances(
          [
            user,
            recipient[0],
            protoFeeVault,
            integrator1,
            mockTransferAddress[0],
          ],
          [
            convertBNToNegative(value.sub(extra)),
            ZERO,
            fixedNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            tokenFeeData[0].integratorFee,
            amountWithoutFee[0],
          ]
        )

      const eventFilter =
        bridgeDynamicTransferFacet.filters.SwapBridgeTransferStarted()
      const data = await bridgeDynamicTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.swapInfo.length).eql(1)

      validateBridgeEventData(
        args.bridgeData[0],
        genericBridgeDataForTransfer[0],
        amountWithoutFee[0]
      )
      validateBridgeEventData(
        args.bridgeData[1],
        genericBridgeDataForTransfer[1],
        swapReturnAmount
      )
      validateSwapEventData(
        args.swapInfo[0],
        swapData[0],
        swapReturnAmount,
        leftOverFromAmount
      )

      // -------------------------------------

      const [
        userAfterA,
        userAfterB,
        protoFeeVaultAfterA,
        integrator1AfterA,
        mockTransferAddressAfterB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator1.address),
        tokenB.balanceOf(mockTransferAddress[1].address),
      ])

      expect(userAfterA).equal(
        userBeforeA.sub(amounts[1]).add(leftOverFromAmount)
      )
      expect(userAfterB).equal(userBeforeB)
      expect(mockTransferAddressAfterB).equal(
        mockTransferAddressBeforeB.add(swapReturnAmount)
      )
      expect(protoFeeVaultAfterA).equal(
        protoFeeVaultBeforeA.add(tokenFeeData[1].dzapFee)
      )
      expect(integrator1AfterA).equal(
        integrator1BeforeA.add(tokenFeeData[1].integratorFee)
      )
    })

    it('3.5 Should allow user to swap src token, then bridge them to destination chain and return extra native tokens', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = [signers[14], signers[15]]
      const mockTransferAddress = [signers[18], signers[19]]

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const genericBridgeDataForTransfer = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId1,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenA.address,
          to: tokenB.address,
          receiver: recipient[1].address,
          minAmountIn: amounts[1],
          destinationChainId: destinationChainId2,
          hasSourceSwaps: false,
          hasDestinationCall: true,
        },
      ]

      const transferData = [
        {
          transferTo: mockTransferAddress[0].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          transferTo: mockTransferAddress[1].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const [
        userBeforeA,
        mockTransferAddressBeforeA,
        protoFeeVaultBeforeA,
        integrator1BeforeA,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenA.balanceOf(mockTransferAddress[1].address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator1.address),
      ])

      // -------------------------------------

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .swapAndBridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            [],
            transferData,
            {
              value,
            }
          )
      )
        .emit(bridgeDynamicTransferFacet, EVENTS.SwapBridgeTransferStarted)
        .changeEtherBalances(
          [
            user,
            recipient[0],
            protoFeeVault,
            integrator1,
            mockTransferAddress[0],
          ],
          [
            convertBNToNegative(value.sub(extra)),
            ZERO,
            fixedNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            tokenFeeData[0].integratorFee,
            amountWithoutFee[0],
          ]
        )

      const eventFilter =
        bridgeDynamicTransferFacet.filters.SwapBridgeTransferStarted()
      const data = await bridgeDynamicTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.swapInfo.length).eql(0)

      validateBridgeEventData(
        args.bridgeData[0],
        genericBridgeDataForTransfer[0],
        amountWithoutFee[0]
      )
      validateBridgeEventData(
        args.bridgeData[1],
        genericBridgeDataForTransfer[1],
        amountWithoutFee[1]
      )

      // -------------------------------------

      const [
        userAfterA,
        mockTransferAddressAfterA,
        protoFeeVaultAfterA,
        integrator1AfterA,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenA.balanceOf(mockTransferAddress[1].address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator1.address),
      ])

      expect(userAfterA).equal(userBeforeA.sub(amounts[1]))
      expect(mockTransferAddressAfterA).equal(
        mockTransferAddressBeforeA.add(amountWithoutFee[1])
      )
      expect(protoFeeVaultAfterA).equal(
        protoFeeVaultBeforeA.add(tokenFeeData[1].dzapFee)
      )
      expect(integrator1AfterA).equal(
        integrator1BeforeA.add(tokenFeeData[1].integratorFee)
      )
    })

    it('3.6 Should revert if receiver length is invalid is 255', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]
      const mockAddress = '0x' + randomBytes(256).toString('hex')

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: mockAddress,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .swapAndBridgeViaTransfer(
            transactionId,
            integratorAddress,
            [genericBridgeDataForTransfer],
            [],
            [transferData],
            {
              value,
            }
          )
      ).revertedWithCustomError(batchBridgeCallFacet, ERRORS.InvalidLength)
    })

    it('3.7 Should revert if receiver length is invalid is 255', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]
      const mockAddress = '0x' + randomBytes(256).toString('hex')

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: mockAddress,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .swapAndBridgeViaTransfer(
            transactionId,
            integratorAddress,
            [genericBridgeDataForTransfer],
            [],
            [transferData],
            {
              value,
            }
          )
      ).revertedWithCustomError(batchBridgeCallFacet, ERRORS.InvalidLength)
    })

    it('3.8 Should revert if amount is zero', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: 0,
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .swapAndBridgeViaTransfer(
            transactionId,
            integratorAddress,
            [genericBridgeDataForTransfer],
            [],
            [transferData],
            {
              value,
            }
          )
      ).revertedWithCustomError(batchBridgeCallFacet, ERRORS.InvalidAmount)
    })

    it('3.9 Should revert if dest chainId is same is src', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      const mockTransferAddress = signers[18]

      const transferData = {
        transferTo: mockTransferAddress.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: HARDHAT_CHAIN_ID,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .swapAndBridgeViaTransfer(
            transactionId,
            integratorAddress,
            [genericBridgeDataForTransfer],
            [],
            [transferData],
            {
              value,
            }
          )
      ).revertedWithCustomError(
        batchBridgeCallFacet,
        ERRORS.CannotBridgeToSameNetwork
      )
    })

    it('3.10 Should revert if callTo is not whitelisted', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = [signers[14], signers[15]]
      const mockTransferAddress = [signers[18], signers[19]]
      const rate = await mockExchange.rate()

      await dexManagerFacet.connect(dexManager).removeDex(mockExchange.address)

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
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

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              crossChainFacet.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const genericBridgeDataForTransfer = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId1,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenB.address,
          to: tokenB.address,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: destinationChainId2,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const transferData = [
        {
          transferTo: mockTransferAddress[0].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          transferTo: mockTransferAddress[1].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // -------------------------------------

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .swapAndBridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            swapData,
            transferData,
            {
              value,
            }
          )
      )
        .revertedWithCustomError(
          bridgeDynamicTransferFacet,
          ERRORS.UnAuthorizedCall
        )
        .withArgs(swapData[0].callTo)
    })

    it('3.11 Should revert if swap amount is 0', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = [signers[14], signers[15]]
      const mockTransferAddress = [signers[18], signers[19]]
      const rate = await mockExchange.rate()

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
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

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: ZERO,
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              crossChainFacet.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const genericBridgeDataForTransfer = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId1,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenB.address,
          to: tokenB.address,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: destinationChainId2,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const transferData = [
        {
          transferTo: mockTransferAddress[0].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          transferTo: mockTransferAddress[1].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // -------------------------------------

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .swapAndBridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            swapData,
            transferData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        bridgeDynamicTransferFacet,
        ERRORS.NoSwapFromZeroBalance
      )
    })

    it('3.12 Should revert if swap to token and bridge from tokens does not matches', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = [signers[14], signers[15]]
      const mockTransferAddress = [signers[18], signers[19]]
      const rate = await mockExchange.rate()

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5')
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------
      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
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

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              crossChainFacet.address,
              amountWithoutFee[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const genericBridgeDataForTransfer = [
        {
          bridge: 'TestBridge1',
          from: NATIVE_ADDRESS,
          to: NATIVE_ADDRESS,
          receiver: recipient[0].address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId1,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: NATIVE_ADDRESS,
          to: tokenB.address,
          receiver: recipient[1].address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: destinationChainId2,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const transferData = [
        {
          transferTo: mockTransferAddress[0].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          transferTo: mockTransferAddress[1].address,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // -------------------------------------

      await expect(
        bridgeDynamicTransferFacet
          .connect(user)
          .swapAndBridgeViaTransfer(
            transactionId,
            integratorAddress,
            genericBridgeDataForTransfer,
            swapData,
            transferData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        bridgeDynamicTransferFacet,
        ERRORS.InvalidSwapDetails
      )
    })
  })
})
