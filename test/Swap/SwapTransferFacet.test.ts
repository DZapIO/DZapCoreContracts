import { ethers } from 'hardhat'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import {
  BPS_MULTIPLIER,
  CONTRACTS,
  DZAP_NATIVE,
  ERRORS,
  EVENTS,
  NATIVE_ADDRESS,
  ZERO,
  ZERO_ADDRESS,
  BPS_DENOMINATOR,
} from '../../constants'
import {
  convertBNToNegative,
  duration,
  generateRandomWallet,
  getPermit2SignatureAndCalldataForApprove,
  getPermitSignatureAndCalldata,
  latest,
  snapshot,
  updateBalance,
} from '../utils'
import { getFeeData, encodePermitData } from '../../scripts/core/helper'
import {
  getSelectorsUsingContract,
  getSelectorsUsingFunSig,
  getSighash,
} from '../../scripts/utils/diamond'

import {
  AccessManagerFacet,
  DZapDiamond,
  DexManagerFacet,
  DiamondCutFacet,
  DiamondLoupeFacet,
  FeesFacet,
  OwnershipFacet,
  SwapFacet,
  WithdrawFacet,
  ExchangeMock,
  ERC20Mock,
  WNATIVE,
  DiamondInit,
  Permit2,
  CrossChainFacet,
  BridgeMock,
  Executor,
  Receiver,
  BridgeManagerFacet,
  BatchSwapFacet,
  SwapTransferFacet,
} from '../../typechain-types'
import {
  DiamondCut,
  FacetCutAction,
  FeeInfo,
  FeeType,
  PermitType,
} from '../../types'

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
let swapTransferFacet: SwapTransferFacet
let swapTransferFacetImp: SwapTransferFacet
let batchSwapFacet: BatchSwapFacet
let batchSwapFacetImp: BatchSwapFacet
let crossChainFacet: CrossChainFacet
let crossChainFacetImp: CrossChainFacet
let executor: Executor
let receiver: Receiver
let bridgeManagerFacet: BridgeManagerFacet
let bridgeManagerFacetImp: BridgeManagerFacet

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
    dzapTokenShare: BigNumber.from(60 * BPS_MULTIPLIER),
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

describe('SwapTransferFacet.test.ts', async () => {
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
      batchSwapFacet = (await ethers.getContractAt(
        CONTRACTS.BatchSwapFacet,
        dZapDiamond.address
      )) as BatchSwapFacet
      swapTransferFacet = (await ethers.getContractAt(
        CONTRACTS.SwapTransferFacet,
        dZapDiamond.address
      )) as SwapTransferFacet
      crossChainFacet = (await ethers.getContractAt(
        CONTRACTS.CrossChainFacet,
        dZapDiamond.address
      )) as CrossChainFacet
      bridgeManagerFacet = (await ethers.getContractAt(
        CONTRACTS.BridgeManagerFacet,
        dZapDiamond.address
      )) as BridgeManagerFacet
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

      const SwapTransferFacet = await ethers.getContractFactory(
        CONTRACTS.SwapTransferFacet,
        deployer
      )
      swapTransferFacetImp =
        (await SwapTransferFacet.deploy()) as SwapTransferFacet
      await swapTransferFacetImp.deployed()

      const BatchSwapFacet = await ethers.getContractFactory(
        CONTRACTS.BatchSwapFacet,
        deployer
      )
      batchSwapFacetImp = (await BatchSwapFacet.deploy()) as BatchSwapFacet
      await batchSwapFacetImp.deployed()

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
      await crossChainFacetImp.deployed()
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
          facetAddress: swapTransferFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            swapTransferFacetImp,
            CONTRACTS.SwapTransferFacet
          ).selectors,
        },
        {
          facetAddress: batchSwapFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            batchSwapFacet,
            CONTRACTS.BatchSwapFacet
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
        ],
        dexManagerFacet.interface
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
    // dex manger
    {
      const selectors = getSelectorsUsingFunSig([
        'function swap(address,address,address,uint256,bool,bool)',
        'function bridgeAndSwap(address,address,uint256,bytes)',
      ])
      const dexs = selectors.map(() => mockExchange.address)
      const approval = selectors.map(() => true)

      await dexManagerFacet
        .connect(dexManager)
        .batchAddDex([mockExchange.address])

      await dexManagerFacet
        .connect(dexManager)
        .batchSetFunctionApprovalBySignature(dexs, selectors, approval)
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

  beforeEach(async () => {
    await snapshot.revert(snapshotId)
  })

  describe('1) swap', async () => {
    it('1.1 Should allow user to swap single token (Erc20 -> Erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------
      const from = tokenB.address
      const to = tokenA.address
      const amounts = [parseUnits('1', TOKEN_B_DECIMAL)]

      await tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await tokenB
        .connect(user)
        .approve(swapFacet.address, parseUnits('100', TOKEN_B_DECIMAL))

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          false,
          false
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), TOKEN_B_DECIMAL),
        TOKEN_A_DECIMAL
      )

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: from,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount,
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      const [recipientBalanceBeforeA, userBalanceBeforeB] = await Promise.all([
        tokenA.balanceOf(recipient),
        tokenB.balanceOf(user.address),
      ])

      // ----------------------------------------------------------------
      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData[0]
          )
      )
        .emit(swapTransferFacet, EVENTS.Swapped)
        .withArgs(transactionId, integratorAddress, user.address, recipient, [
          mockExchange.address,
          swapData[0].from,
          swapData[0].to,
          swapData[0].fromAmount,
          ZERO,
          minAmount,
        ])

      const [recipientBalanceAfterA, userBalanceAfterB] = await Promise.all([
        tokenA.balanceOf(recipient),
        tokenB.balanceOf(user.address),
      ])

      const eventFilter = swapTransferFacet.filters.Swapped()
      const data = await swapTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)
      expect(args.swapInfo.dex).equal(mockExchange.address)
      expect(args.swapInfo.fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo.leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo.returnToAmount).equal(minAmount)

      expect(userBalanceAfterB).equal(userBalanceBeforeB.sub(amounts[0]))
      expect(recipientBalanceAfterA).equal(
        recipientBalanceBeforeA.add(minAmount)
      )

      // ----------------------------------------------------------------
    })

    it('1.2 Should allow user to swap single token (Erc20 -> Native)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------
      const from = tokenA.address
      const to = NATIVE_ADDRESS
      const amounts = [parseUnits('1', TOKEN_A_DECIMAL)]
      const value = amounts[0]

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          false,
          false
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), TOKEN_A_DECIMAL),
        18
      )

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: from,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount,
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      const [userBalanceBeforeA] = await Promise.all([
        tokenA.balanceOf(user.address),
      ])

      // ----------------------------------------------------------------
      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData[0],
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.Swapped)
        .withArgs(transactionId, integratorAddress, user.address, recipient, [
          mockExchange.address,
          swapData[0].from,
          swapData[0].to,
          swapData[0].fromAmount,
          ZERO,
          minAmount,
        ])
        .changeEtherBalances([recipient], [minAmount])

      const [userBalanceAfterA] = await Promise.all([
        tokenA.balanceOf(user.address),
      ])

      const eventFilter = swapTransferFacet.filters.Swapped()
      const data = await swapTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)
      expect(args.swapInfo.dex).equal(mockExchange.address)
      expect(args.swapInfo.fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo.leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo.returnToAmount).equal(minAmount)

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[0]))

      // ----------------------------------------------------------------
    })

    it('1.3 Should allow user to swap single token (Native -> Erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------
      const from = NATIVE_ADDRESS
      const to = tokenA.address
      const amounts = [parseUnits('1')]
      const value = amounts[0]

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          false,
          false
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_A_DECIMAL
      )

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount,
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      const [recipientBalanceBeforeA] = await Promise.all([
        tokenA.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------
      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData[0],
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.Swapped)
        .withArgs(transactionId, integratorAddress, user.address, recipient, [
          mockExchange.address,
          swapData[0].from,
          swapData[0].to,
          swapData[0].fromAmount,
          ZERO,
          minAmount,
        ])
        .changeEtherBalances([user], [convertBNToNegative(amounts[0])])

      const [recipientBalanceAfterA] = await Promise.all([
        tokenA.balanceOf(recipient),
      ])

      const eventFilter = swapTransferFacet.filters.Swapped()
      const data = await swapTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)
      expect(args.swapInfo.dex).equal(mockExchange.address)
      expect(args.swapInfo.fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo.leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo.returnToAmount).equal(minAmount)

      expect(recipientBalanceAfterA).equal(
        recipientBalanceBeforeA.add(minAmount)
      )

      // ----------------------------------------------------------------
    })

    it('1.4 Should allow user to swap single token, return excess eth sent, and left over (Erc20 -> Erc20)', async () => {
      const rate = await mockExchange.rate()
      const leftOverPercent = await mockExchange.leftOverPercent()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      const from = tokenB.address
      const to = tokenA.address
      const amounts = [parseUnits('1', TOKEN_B_DECIMAL)]
      const extra = parseUnits('5')
      const value = extra

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          true,
          false
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), TOKEN_B_DECIMAL),
        TOKEN_A_DECIMAL
      )

      const leftOverFromAmount = amounts[0]
        .mul(leftOverPercent)
        .div(BPS_DENOMINATOR)

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: from,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount,
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      // ----------------------------------------------------------------

      await tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await tokenB
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100', TOKEN_B_DECIMAL))

      const [userBalanceBeforeB, recipientBalanceBeforeA] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData[0],
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.Swapped)
        .withArgs(transactionId, integratorAddress, user.address, recipient, [
          mockExchange.address,
          swapData[0].from,
          swapData[0].to,
          swapData[0].fromAmount,
          leftOverFromAmount,
          minAmount,
        ])
        .changeEtherBalances([user], [ZERO])

      // ----------------------------------------------------------------

      const [userBalanceAfterB, recipientBalanceAfterA] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(recipient),
      ])

      expect(userBalanceAfterB).equal(
        userBalanceBeforeB.sub(amounts[0].sub(leftOverFromAmount))
      )
      expect(recipientBalanceAfterA).equal(
        recipientBalanceBeforeA.add(minAmount)
      )
    })

    it('1.5 Should allow user to swap single token, return excess eth sent, and left over (Erc20 -> Native)', async () => {
      const rate = await mockExchange.rate()
      const leftOverPercent = await mockExchange.leftOverPercent()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      const from = tokenB.address
      const to = DZAP_NATIVE
      const amounts = [parseUnits('1', TOKEN_B_DECIMAL)]
      const extra = parseUnits('5')
      const value = extra

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          true,
          false
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), TOKEN_B_DECIMAL),
        18
      )

      const leftOverFromAmount = amounts[0]
        .mul(leftOverPercent)
        .div(BPS_DENOMINATOR)

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: from,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount,
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      // ----------------------------------------------------------------

      await tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await tokenB
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100', TOKEN_B_DECIMAL))

      const [userBalanceBeforeB] = await Promise.all([
        tokenB.balanceOf(user.address),
      ])

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData[0],
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.Swapped)
        .withArgs(transactionId, integratorAddress, user.address, recipient, [
          mockExchange.address,
          swapData[0].from,
          swapData[0].to,
          swapData[0].fromAmount,
          leftOverFromAmount,
          minAmount,
        ])
        .changeEtherBalances([user, recipient], [ZERO, minAmount])

      // ----------------------------------------------------------------

      const [userBalanceAfterB] = await Promise.all([
        tokenB.balanceOf(user.address),
      ])

      expect(userBalanceAfterB).equal(
        userBalanceBeforeB.sub(amounts[0].sub(leftOverFromAmount))
      )
    })

    it('1.6 Should allow user to swap, return excess eth sent, and left over (Native -> ERC20)', async () => {
      const rate = await mockExchange.rate()
      const leftOverPercent = await mockExchange.leftOverPercent()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      const from = NATIVE_ADDRESS
      const to = tokenA.address
      const amounts = [parseUnits('1')]
      const extra = parseUnits('5')
      const value = amounts[0].add(extra)

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          true,
          false
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_A_DECIMAL
      )

      const leftOverFromAmount = amounts[0]
        .mul(leftOverPercent)
        .div(BPS_DENOMINATOR)

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: from,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount,
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      const recipientBalanceBefore = await tokenA.balanceOf(recipient)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData[0],
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.Swapped)
        .withArgs(transactionId, integratorAddress, user.address, recipient, [
          mockExchange.address,
          swapData[0].from,
          swapData[0].to,
          swapData[0].fromAmount,
          leftOverFromAmount,
          minAmount,
        ])
        .changeEtherBalances(
          [user],
          [convertBNToNegative(value.sub(leftOverFromAmount.add(extra)))]
        )

      // ----------------------------------------------------------------

      const recipientBalanceAfter = await tokenA.balanceOf(recipient)
      expect(recipientBalanceAfter).equal(recipientBalanceBefore.add(minAmount))
    })

    it('1.7 Should allow user to swap single token, using permit approve (Erc20 -> Erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      const from = tokenB.address
      const to = tokenA.address
      const amounts = [parseUnits('1', TOKEN_B_DECIMAL)]
      const value = ZERO

      // ----------------------------------------------------------------

      const deadline = (await latest()).add(duration.minutes(10))

      const { data } = await getPermitSignatureAndCalldata(
        user,
        tokenB,
        dZapDiamond.address,
        amounts[0],
        deadline
      )
      const encodedPermitData = encodePermitData(data, PermitType.PERMIT)

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          false,
          false
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), TOKEN_B_DECIMAL),
        TOKEN_A_DECIMAL
      )

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: from,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount,
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      // ----------------------------------------------------------------

      await tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await tokenB
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100', TOKEN_B_DECIMAL))

      const [userBalanceBeforeB, recipientBalanceBeforeA] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData[0],
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.Swapped)
        .withArgs(transactionId, integratorAddress, user.address, recipient, [
          mockExchange.address,
          swapData[0].from,
          swapData[0].to,
          swapData[0].fromAmount,
          0,
          minAmount,
        ])
        .changeEtherBalances([user], [ZERO])

      // ----------------------------------------------------------------

      const [userBalanceAfterB, recipientBalanceAfterA] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(recipient),
        tokenB.balanceOf(integratorAddress),
        tokenB.balanceOf(protoFeeVault.address),
      ])

      expect(userBalanceAfterB).equal(userBalanceBeforeB.sub(amounts[0]))
      expect(recipientBalanceAfterA).equal(
        recipientBalanceBeforeA.add(minAmount)
      )
    })

    it('1.8 Should allow user to swap single token, using permit2 approve (Erc20 -> Erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      const from = tokenB.address
      const to = tokenA.address
      const amounts = [parseUnits('1', TOKEN_B_DECIMAL)]
      const value = ZERO

      // ----------------------------------------------------------------

      //   const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // permit2 approve
      const deadline = (await latest()).add(duration.minutes(10))
      const expiration = (await latest()).add(duration.minutes(30))

      const { customPermitDataForTransfer } =
        await getPermit2SignatureAndCalldataForApprove(
          permit2,
          user,
          tokenB.address,
          dZapDiamond.address,
          amounts[0],
          deadline,
          expiration
        )

      const encodedPermitData = encodePermitData(
        customPermitDataForTransfer,
        PermitType.PERMIT2_APPROVE
      )

      await tokenB
        .connect(user)
        .approve(permit2.address, ethers.constants.MaxUint256)

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          false,
          false
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), TOKEN_B_DECIMAL),
        TOKEN_A_DECIMAL
      )

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: from,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount,
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      // ----------------------------------------------------------------

      await tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await tokenB
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100', TOKEN_B_DECIMAL))

      const [userBalanceBeforeB, recipientBalanceBeforeA] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData[0],
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.Swapped)
        .withArgs(transactionId, integratorAddress, user.address, recipient, [
          mockExchange.address,
          swapData[0].from,
          swapData[0].to,
          swapData[0].fromAmount,
          0,
          minAmount,
        ])
        .changeTokenBalance(tokenA, recipient, minAmount)
        .changeEtherBalances([user], [ZERO])

      // ----------------------------------------------------------------

      const [userBalanceAfterB, recipientBalanceAfterA] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenA.balanceOf(recipient),
        tokenB.balanceOf(integratorAddress),
        tokenB.balanceOf(protoFeeVault.address),
      ])

      expect(userBalanceAfterB).equal(userBalanceBeforeB.sub(amounts[0]))
      expect(recipientBalanceAfterA).equal(
        recipientBalanceBeforeA.add(minAmount)
      )
    })

    it('1.9 Should revert if recipient is zero address', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(transactionId, integratorAddress, ZERO_ADDRESS, {
            callTo: mockExchange.address,
            approveTo: mockExchange.address,
            from: DZAP_NATIVE,
            to: tokenB.address,
            fromAmount: 100,
            minToAmount: 100,
            swapCallData: '0x',
            permit: encodedPermitData,
          })
      ).revertedWithCustomError(swapTransferFacet, ERRORS.ZeroAddress)
    })

    it('1.10 Should revert if integrator is not allowed', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(transactionId, signers[10].address, recipient, {
            callTo: mockExchange.address,
            approveTo: mockExchange.address,
            from: DZAP_NATIVE,
            to: tokenB.address,
            fromAmount: 100,
            minToAmount: 100,
            swapCallData: '0x',
            permit: encodedPermitData,
          })
      ).revertedWithCustomError(swapTransferFacet, ERRORS.IntegratorNotAllowed)
    })

    it('1.11 Should revert if from amount is zero', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      const callData = (
        await mockExchange.populateTransaction.swap(
          tokenA.address,
          tokenB.address,
          dZapDiamond.address,
          parseUnits('1'),
          false,
          false
        )
      ).data as string

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(transactionId, integratorAddress, recipient, {
            callTo: mockExchange.address,
            approveTo: mockExchange.address,
            from: tokenA.address,
            to: tokenB.address,
            fromAmount: 0,
            minToAmount: 100,
            swapCallData: callData,
            permit: encodedPermitData,
          })
      ).revertedWithCustomError(swapTransferFacet, ERRORS.NoSwapFromZeroBalance)
    })

    it('1.12 Should revert if callTo(dex) is not approved', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet.connect(user).swapAndTransfer(
          transactionId,
          integratorAddress,
          recipient,
          {
            callTo: executor.address,
            approveTo: mockExchange.address,
            from: DZAP_NATIVE,
            to: tokenB.address,
            fromAmount: 100,
            minToAmount: 100,
            swapCallData: '0x',
            permit: encodedPermitData,
          },
          { value: 100 }
        )
      ).revertedWithCustomError(
        swapTransferFacet,
        ERRORS.ContractCallNotAllowed
      )
    })

    it('1.13 Should revert if approveTo(dex) is not approved', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet.connect(user).swapAndTransfer(
          transactionId,
          integratorAddress,
          recipient,
          {
            callTo: mockExchange.address,
            approveTo: executor.address,
            from: DZAP_NATIVE,
            to: tokenB.address,
            fromAmount: 100,
            minToAmount: 100,
            swapCallData: '0x',
            permit: encodedPermitData,
          },
          { value: 100 }
        )
      ).revertedWithCustomError(
        swapTransferFacet,
        ERRORS.ContractCallNotAllowed
      )
    })

    it('1.14 Should revert if swap call fails', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------
      const from = NATIVE_ADDRESS
      const to = tokenA.address
      const amounts = [parseUnits('1')]
      const value = amounts[0]

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          false,
          true
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_A_DECIMAL
      )

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: from,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount,
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      // ----------------------------------------------------------------
      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData[0],
            {
              value,
            }
          )
      )
        .revertedWithCustomError(swapTransferFacet, ERRORS.SwapCallFailed)
        .withArgs(mockExchange.interface.getSighash('SwapFailedFromExchange'))
    })

    it('1.15 Should revert if slippage is too high', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------
      const from = NATIVE_ADDRESS
      const to = tokenA.address
      const amounts = [parseUnits('1')]
      const value = amounts[0]

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          false,
          false
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_A_DECIMAL
      )

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: from,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount.add(1),
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      // ----------------------------------------------------------------
      await expect(
        swapTransferFacet
          .connect(user)
          .swapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData[0],
            {
              value,
            }
          )
      )
        .revertedWithCustomError(swapTransferFacet, ERRORS.SlippageTooLow)
        .withArgs(swapData[0].minToAmount, minAmount)
    })
  })

  describe('2) multiSwap', async () => {
    it('2.1 Should allow user to swap multiple tokens(erc20 -> native, erc20 -> erc20, )', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      const amounts = [parseUnits('5', TOKEN_A_DECIMAL), parseUnits('10')]
      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          18
        ),
        parseUnits(
          formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
      ]

      // ----------------------------------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      await wNative.connect(user).deposit({ value: parseUnits('10') })
      await wNative
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // ----------------------------------------------------------------

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: DZAP_NATIVE,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              NATIVE_ADDRESS,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: wNative.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              wNative.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const value = ZERO

      // ----------------------------------------------------------------

      const [userBalanceBeforeA, userBalanceBeforeWN, recipientBalanceBeforeB] =
        await Promise.all([
          tokenA.balanceOf(user.address),
          wNative.balanceOf(user.address),
          tokenB.balanceOf(recipient),
        ])

      // ----------------------------------------------------------------
      // tokenA -> eth
      // wNative -> tokenB

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user, recipient], [ZERO, minAmount[0]])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const data = await swapTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [userBalanceAfterA, userBalanceAfterWN, recipientBalanceAfterB] =
        await Promise.all([
          tokenA.balanceOf(user.address),
          wNative.balanceOf(user.address),
          tokenB.balanceOf(recipient),
        ])

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[0]))
      expect(userBalanceAfterWN).equal(userBalanceBeforeWN.sub(amounts[1]))
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[1])
      )
    })

    it('2.2 Should allow user to swap multiple tokens(erc20 -> erc20, native -> erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      const amounts = [parseUnits('5', TOKEN_A_DECIMAL), parseUnits('10')]
      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          18
        ),
        parseUnits(
          formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
      ]

      // ----------------------------------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // ----------------------------------------------------------------

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: wNative.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              wNative.address,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              DZAP_NATIVE,
              tokenB.address,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const value = amounts[1]

      // ----------------------------------------------------------------

      const [
        userBalanceBeforeA,
        recipientBalanceBeforeWN,
        recipientBalanceBeforeB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        wNative.balanceOf(recipient),
        tokenB.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------
      // tokenA -> wNative
      // eth -> tokenB

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user], [convertBNToNegative(amounts[1])])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const data = await swapTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [
        userBalanceAfterA,
        recipientBalanceAfterWN,
        recipientBalanceAfterB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        wNative.balanceOf(recipient),
        tokenB.balanceOf(recipient),
      ])

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[0]))
      expect(recipientBalanceAfterWN).equal(
        recipientBalanceBeforeWN.add(minAmount[0])
      )
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[1])
      )
    })

    it('2.3 Should allow user to swap multiple tokens and return leftover and extra native(erc20 -> erc20, native -> erc20)', async () => {
      const rate = await mockExchange.rate()
      const leftOverPercent = await mockExchange.leftOverPercent()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      const amounts = [parseUnits('5', TOKEN_A_DECIMAL), parseUnits('10')]

      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          18
        ),
        parseUnits(
          formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
      ]

      const leftOverFromAmount = [
        amounts[0].mul(leftOverPercent).div(BPS_DENOMINATOR),
        amounts[1].mul(leftOverPercent).div(BPS_DENOMINATOR),
      ]
      // ----------------------------------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // ----------------------------------------------------------------

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: wNative.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              wNative.address,
              dZapDiamond.address,
              amounts[0],
              true,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              DZAP_NATIVE,
              tokenB.address,
              dZapDiamond.address,
              amounts[1],
              true,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const extra = parseUnits('0.5')
      const value = amounts[1].add(extra)

      // ----------------------------------------------------------------

      const [
        userBalanceBeforeA,
        recipientBalanceBeforeWN,
        recipientBalanceBeforeB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        wNative.balanceOf(recipient),
        tokenB.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------
      // tokenA -> wNative
      // eth -> tokenB

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances(
          [user],
          [convertBNToNegative(value.sub(leftOverFromAmount[1].add(extra)))]
        )

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const data = await swapTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(leftOverFromAmount[0])
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(leftOverFromAmount[1])
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [
        userBalanceAfterA,
        recipientBalanceAfterWN,
        recipientBalanceAfterB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        wNative.balanceOf(recipient),
        tokenB.balanceOf(recipient),
        tokenA.balanceOf(integratorAddress),
        tokenA.balanceOf(protoFeeVault.address),
      ])

      expect(userBalanceAfterA).equal(
        userBalanceBeforeA.sub(amounts[0]).add(leftOverFromAmount[0])
      )
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[1])
      )
      expect(recipientBalanceAfterWN).equal(
        recipientBalanceBeforeWN.add(minAmount[0])
      )
    })

    it('2.4 Should allow user to swap tokens, using permit approve (Erc20 -> Erc20, native -> erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      // const from = tokenB.address
      // const to = tokenA.address
      const amounts = [parseUnits('1', TOKEN_A_DECIMAL), parseUnits('10')]
      const value = amounts[1]

      // ----------------------------------------------------------------

      const deadline = (await latest()).add(duration.minutes(10))

      const { data } = await getPermitSignatureAndCalldata(
        user,
        tokenA,
        dZapDiamond.address,
        amounts[0],
        deadline
      )
      const encodedPermitData = encodePermitData(data, PermitType.PERMIT)

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA.connect(user).approve(swapTransferFacet.address, ZERO)

      // ----------------------------------------------------------------

      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          TOKEN_B_DECIMAL
        ),
        parseUnits(
          formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodedPermitData,
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              DZAP_NATIVE,
              tokenB.address,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // ----------------------------------------------------------------

      const [userBalanceBeforeA, recipientBalanceBeforeB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user], [convertBNToNegative(value)])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const eventData = await swapTransferFacet.queryFilter(eventFilter)
      const args = eventData[eventData.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [userBalanceAfterA, recipientBalanceAfterB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[0]))
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[1].add(minAmount[0]))
      )
    })

    it('2.5 Should allow user to swap tokens, using permit approve (Erc20 -> Erc20, native -> erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      // const from = tokenB.address
      // const to = tokenA.address
      const amounts = [parseUnits('1', TOKEN_A_DECIMAL), parseUnits('10')]
      const value = amounts[1]

      // ----------------------------------------------------------------

      // permit2 approve
      const deadline = (await latest()).add(duration.minutes(10))
      const expiration = (await latest()).add(duration.minutes(30))

      const { customPermitDataForTransfer } =
        await getPermit2SignatureAndCalldataForApprove(
          permit2,
          user,
          tokenA.address,
          dZapDiamond.address,
          amounts[0],
          deadline,
          expiration
        )

      const encodedPermitData = encodePermitData(
        customPermitDataForTransfer,
        PermitType.PERMIT2_APPROVE
      )

      await tokenA
        .connect(user)
        .approve(permit2.address, ethers.constants.MaxUint256)

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA.connect(user).approve(swapTransferFacet.address, ZERO)

      // ----------------------------------------------------------------

      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          TOKEN_B_DECIMAL
        ),
        parseUnits(
          formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodedPermitData,
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              DZAP_NATIVE,
              tokenB.address,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // ----------------------------------------------------------------

      const [userBalanceBeforeA, recipientBalanceBeforeB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user], [convertBNToNegative(value)])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const eventData = await swapTransferFacet.queryFilter(eventFilter)
      const args = eventData[eventData.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [userBalanceAfterA, recipientBalanceAfterB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[0]))
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[1].add(minAmount[0]))
      )
    })

    it('2.6 Should allow user to swap tokens, using permit approve (Erc20 -> Erc20, Erc20 -> Erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      // const from = tokenB.address
      // const to = tokenA.address
      const amounts = [
        parseUnits('1', TOKEN_A_DECIMAL),
        parseUnits('5', TOKEN_A_DECIMAL),
      ]
      const value = ZERO

      // ----------------------------------------------------------------

      const deadline = (await latest()).add(duration.minutes(10))

      const { data } = await getPermitSignatureAndCalldata(
        user,
        tokenA,
        dZapDiamond.address,
        amounts[0].add(amounts[1]),
        deadline
      )
      const encodedPermitData = encodePermitData(data, PermitType.PERMIT)

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA.connect(user).approve(swapTransferFacet.address, ZERO)

      // ----------------------------------------------------------------

      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          TOKEN_B_DECIMAL
        ),
        parseUnits(
          formatUnits(
            amounts[1].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          18
        ),
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodedPermitData,
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: DZAP_NATIVE,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              DZAP_NATIVE,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // ----------------------------------------------------------------

      const [userBalanceBeforeA, recipientBalanceBeforeB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user, recipient], [ZERO, minAmount[1]])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const eventData = await swapTransferFacet.queryFilter(eventFilter)
      const args = eventData[eventData.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [userBalanceAfterA, recipientBalanceAfterB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      expect(userBalanceAfterA).equal(
        userBalanceBeforeA.sub(amounts[0]).sub(amounts[1])
      )
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[0])
      )
    })

    it('2.7 Should allow user to swap tokens, using permit2 approve (Erc20 -> Erc20, Erc20 -> Erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      // const from = tokenB.address
      // const to = tokenA.address
      const amounts = [
        parseUnits('1', TOKEN_A_DECIMAL),
        parseUnits('5', TOKEN_A_DECIMAL),
      ]
      const value = ZERO

      // ----------------------------------------------------------------

      // permit2 approve
      const deadline = (await latest()).add(duration.minutes(10))
      const expiration = (await latest()).add(duration.minutes(30))

      const { customPermitDataForTransfer } =
        await getPermit2SignatureAndCalldataForApprove(
          permit2,
          user,
          tokenA.address,
          dZapDiamond.address,
          amounts[0].add(amounts[1]),
          deadline,
          expiration
        )

      const encodedPermitData = encodePermitData(
        customPermitDataForTransfer,
        PermitType.PERMIT2_APPROVE
      )

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA.connect(user).approve(swapTransferFacet.address, ZERO)
      await tokenA
        .connect(user)
        .approve(permit2.address, ethers.constants.MaxUint256)

      // ----------------------------------------------------------------

      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          TOKEN_B_DECIMAL
        ),
        parseUnits(
          formatUnits(
            amounts[1].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          18
        ),
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodedPermitData,
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: DZAP_NATIVE,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              DZAP_NATIVE,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT2_APPROVE),
        },
      ]

      // ----------------------------------------------------------------

      const [userBalanceBeforeA, recipientBalanceBeforeB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user, recipient], [ZERO, minAmount[1]])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const eventData = await swapTransferFacet.queryFilter(eventFilter)
      const args = eventData[eventData.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [userBalanceAfterA, recipientBalanceAfterB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      expect(userBalanceAfterA).equal(
        userBalanceBeforeA.sub(amounts[0]).sub(amounts[1])
      )
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[0])
      )
    })

    it('2.8 Should revert if recipient is zero address', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapAndTransfer(
            transactionId,
            integratorAddress,
            ZERO_ADDRESS,
            [
              {
                callTo: mockExchange.address,
                approveTo: mockExchange.address,
                from: DZAP_NATIVE,
                to: tokenB.address,
                fromAmount: 100,
                minToAmount: 100,
                swapCallData: '0x',
                permit: encodedPermitData,
              },
            ]
          )
      ).revertedWithCustomError(swapTransferFacet, ERRORS.ZeroAddress)
    })

    it('2.9 Should revert if integrator is not allowed', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapAndTransfer(transactionId, signers[10].address, recipient, [
            {
              callTo: mockExchange.address,
              approveTo: mockExchange.address,
              from: DZAP_NATIVE,
              to: tokenB.address,
              fromAmount: 100,
              minToAmount: 100,
              swapCallData: '0x',
              permit: encodedPermitData,
            },
          ])
      ).revertedWithCustomError(swapTransferFacet, ERRORS.IntegratorNotAllowed)
    })

    it('2.10 Should revert if from amount is zero', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      const callData = (
        await mockExchange.populateTransaction.swap(
          tokenA.address,
          tokenB.address,
          dZapDiamond.address,
          parseUnits('1'),
          false,
          false
        )
      ).data as string

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapAndTransfer(transactionId, integratorAddress, recipient, [
            {
              callTo: mockExchange.address,
              approveTo: mockExchange.address,
              from: tokenA.address,
              to: tokenB.address,
              fromAmount: 0,
              minToAmount: 100,
              swapCallData: callData,
              permit: encodedPermitData,
            },
          ])
      ).revertedWithCustomError(swapTransferFacet, ERRORS.NoSwapFromZeroBalance)
    })

    it('2.11 Should revert if callTo(dex) is not approved', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet.connect(user).multiSwapAndTransfer(
          transactionId,
          integratorAddress,
          recipient,
          [
            {
              callTo: executor.address,
              approveTo: mockExchange.address,
              from: DZAP_NATIVE,
              to: tokenB.address,
              fromAmount: 100,
              minToAmount: 100,
              swapCallData: '0x',
              permit: encodedPermitData,
            },
          ],
          { value: 100 }
        )
      ).revertedWithCustomError(
        swapTransferFacet,
        ERRORS.ContractCallNotAllowed
      )
    })

    it('2.12 Should revert if approveTo(dex) is not approved', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet.connect(user).multiSwapAndTransfer(
          transactionId,
          integratorAddress,
          recipient,
          [
            {
              callTo: mockExchange.address,
              approveTo: executor.address,
              from: DZAP_NATIVE,
              to: tokenB.address,
              fromAmount: 100,
              minToAmount: 100,
              swapCallData: '0x',
              permit: encodedPermitData,
            },
          ],
          { value: 100 }
        )
      ).revertedWithCustomError(
        swapTransferFacet,
        ERRORS.ContractCallNotAllowed
      )
    })

    it('2.13 Should revert if swap call fails', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      const amounts = [parseUnits('5', TOKEN_A_DECIMAL), parseUnits('10')]

      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          18
        ),
        parseUnits(
          formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
      ]

      // ----------------------------------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(swapFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      await wNative.connect(user).deposit({ value: parseUnits('10') })
      await wNative
        .connect(user)
        .approve(swapFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // ----------------------------------------------------------------

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: DZAP_NATIVE,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              NATIVE_ADDRESS,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: wNative.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              wNative.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[1],
              false,
              true
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const value = ZERO

      // ----------------------------------------------------------------
      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .revertedWithCustomError(swapTransferFacet, ERRORS.SwapCallFailed)
        .withArgs(mockExchange.interface.getSighash('SwapFailedFromExchange'))
    })

    it('2.14 Should revert if slippage is too high', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------
      const from = NATIVE_ADDRESS
      const to = tokenA.address
      const amounts = [parseUnits('1')]
      const value = amounts[0]

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          false,
          false
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_A_DECIMAL
      )

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount.add(1),
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      // ----------------------------------------------------------------
      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .revertedWithCustomError(swapTransferFacet, ERRORS.SlippageTooLow)
        .withArgs(swapData[0].minToAmount, minAmount)
    })
  })

  describe('3) multiSwapWithoutRevert', async () => {
    it('3.1 Should allow user to swap multiple tokens(erc20 -> native, erc20 -> erc20, )', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      const amounts = [parseUnits('5', TOKEN_A_DECIMAL), parseUnits('10')]
      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          18
        ),
        parseUnits(
          formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
      ]

      // ----------------------------------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(swapFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      await wNative.connect(user).deposit({ value: parseUnits('10') })
      await wNative
        .connect(user)
        .approve(swapFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // ----------------------------------------------------------------

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: DZAP_NATIVE,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              NATIVE_ADDRESS,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: wNative.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              wNative.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const value = ZERO

      // ----------------------------------------------------------------

      const [userBalanceBeforeA, userBalanceBeforeWN, recipientBalanceBeforeB] =
        await Promise.all([
          tokenA.balanceOf(user.address),
          wNative.balanceOf(user.address),
          tokenB.balanceOf(recipient),
        ])

      // ----------------------------------------------------------------
      // tokenA -> eth
      // wNative -> tokenB

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user, recipient], [ZERO, minAmount[0]])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const data = await swapTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [userBalanceAfterA, userBalanceAfterWN, recipientBalanceAfterB] =
        await Promise.all([
          tokenA.balanceOf(user.address),
          wNative.balanceOf(user.address),
          tokenB.balanceOf(recipient),
        ])

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[0]))
      expect(userBalanceAfterWN).equal(userBalanceBeforeWN.sub(amounts[1]))
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[1])
      )
    })

    it('3.2 Should allow user to swap multiple tokens(erc20 -> erc20, native -> erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      const amounts = [parseUnits('5', TOKEN_A_DECIMAL), parseUnits('10')]
      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          18
        ),
        parseUnits(
          formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
      ]

      // ----------------------------------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // ----------------------------------------------------------------

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: wNative.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              wNative.address,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              DZAP_NATIVE,
              tokenB.address,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const value = amounts[1]

      // ----------------------------------------------------------------

      const [
        userBalanceBeforeA,
        recipientBalanceBeforeWN,
        recipientBalanceBeforeB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        wNative.balanceOf(recipient),
        tokenB.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------
      // tokenA -> wNative
      // eth -> tokenB

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user], [convertBNToNegative(amounts[1])])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const data = await swapTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [
        userBalanceAfterA,
        recipientBalanceAfterWN,
        recipientBalanceAfterB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        wNative.balanceOf(recipient),
        tokenB.balanceOf(recipient),
      ])

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[0]))
      expect(recipientBalanceAfterWN).equal(
        recipientBalanceBeforeWN.add(minAmount[0])
      )
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[1])
      )
    })

    it('3.3 Should allow user to swap multiple tokens and return leftover and extra native(erc20 -> erc20, native -> erc20)', async () => {
      const rate = await mockExchange.rate()
      const leftOverPercent = await mockExchange.leftOverPercent()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      const amounts = [parseUnits('5', TOKEN_A_DECIMAL), parseUnits('10')]

      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          18
        ),
        parseUnits(
          formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
      ]

      const leftOverFromAmount = [
        amounts[0].mul(leftOverPercent).div(BPS_DENOMINATOR),
        amounts[1].mul(leftOverPercent).div(BPS_DENOMINATOR),
      ]
      // ----------------------------------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // ----------------------------------------------------------------

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: wNative.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              wNative.address,
              dZapDiamond.address,
              amounts[0],
              true,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              DZAP_NATIVE,
              tokenB.address,
              dZapDiamond.address,
              amounts[1],
              true,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const extra = parseUnits('0.5')
      const value = amounts[1].add(extra)

      // ----------------------------------------------------------------

      const [
        userBalanceBeforeA,
        recipientBalanceBeforeWN,
        recipientBalanceBeforeB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        wNative.balanceOf(recipient),
        tokenB.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------
      // tokenA -> wNative
      // eth -> tokenB

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances(
          [user],
          [convertBNToNegative(value.sub(leftOverFromAmount[1].add(extra)))]
        )

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const data = await swapTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(leftOverFromAmount[0])
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(leftOverFromAmount[1])
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [
        userBalanceAfterA,
        recipientBalanceAfterWN,
        recipientBalanceAfterB,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        wNative.balanceOf(recipient),
        tokenB.balanceOf(recipient),
        tokenA.balanceOf(integratorAddress),
        tokenA.balanceOf(protoFeeVault.address),
      ])

      expect(userBalanceAfterA).equal(
        userBalanceBeforeA.sub(amounts[0]).add(leftOverFromAmount[0])
      )
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[1])
      )
      expect(recipientBalanceAfterWN).equal(
        recipientBalanceBeforeWN.add(minAmount[0])
      )
    })

    it('3.4 Should allow user to swap tokens, using permit approve (Erc20 -> Erc20, native -> erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      // const from = tokenB.address
      // const to = tokenA.address
      const amounts = [parseUnits('1', TOKEN_A_DECIMAL), parseUnits('10')]
      const value = amounts[1]

      // ----------------------------------------------------------------

      const deadline = (await latest()).add(duration.minutes(10))

      const { data } = await getPermitSignatureAndCalldata(
        user,
        tokenA,
        dZapDiamond.address,
        amounts[0],
        deadline
      )
      const encodedPermitData = encodePermitData(data, PermitType.PERMIT)

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA.connect(user).approve(swapTransferFacet.address, ZERO)

      // ----------------------------------------------------------------

      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          TOKEN_B_DECIMAL
        ),
        parseUnits(
          formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodedPermitData,
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              DZAP_NATIVE,
              tokenB.address,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // ----------------------------------------------------------------

      const [userBalanceBeforeA, recipientBalanceBeforeB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user], [convertBNToNegative(value)])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const eventData = await swapTransferFacet.queryFilter(eventFilter)
      const args = eventData[eventData.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [userBalanceAfterA, recipientBalanceAfterB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[0]))
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[1].add(minAmount[0]))
      )
    })

    it('3.5 Should allow user to swap tokens, using permit approve (Erc20 -> Erc20, native -> erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      // const from = tokenB.address
      // const to = tokenA.address
      const amounts = [parseUnits('1', TOKEN_A_DECIMAL), parseUnits('10')]
      const value = amounts[1]

      // ----------------------------------------------------------------

      // permit2 approve
      const deadline = (await latest()).add(duration.minutes(10))
      const expiration = (await latest()).add(duration.minutes(30))

      const { customPermitDataForTransfer } =
        await getPermit2SignatureAndCalldataForApprove(
          permit2,
          user,
          tokenA.address,
          dZapDiamond.address,
          amounts[0],
          deadline,
          expiration
        )

      const encodedPermitData = encodePermitData(
        customPermitDataForTransfer,
        PermitType.PERMIT2_APPROVE
      )

      await tokenA
        .connect(user)
        .approve(permit2.address, ethers.constants.MaxUint256)

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA.connect(user).approve(swapTransferFacet.address, ZERO)

      // ----------------------------------------------------------------

      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          TOKEN_B_DECIMAL
        ),
        parseUnits(
          formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodedPermitData,
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              DZAP_NATIVE,
              tokenB.address,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // ----------------------------------------------------------------

      const [userBalanceBeforeA, recipientBalanceBeforeB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user], [convertBNToNegative(value)])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const eventData = await swapTransferFacet.queryFilter(eventFilter)
      const args = eventData[eventData.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [userBalanceAfterA, recipientBalanceAfterB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[0]))
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[1].add(minAmount[0]))
      )
    })

    it('3.6 Should allow user to swap tokens, using permit approve (Erc20 -> Erc20, Erc20 -> Erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      // const from = tokenB.address
      // const to = tokenA.address
      const amounts = [
        parseUnits('1', TOKEN_A_DECIMAL),
        parseUnits('5', TOKEN_A_DECIMAL),
      ]
      const value = ZERO

      // ----------------------------------------------------------------

      const deadline = (await latest()).add(duration.minutes(10))

      const { data } = await getPermitSignatureAndCalldata(
        user,
        tokenA,
        dZapDiamond.address,
        amounts[0].add(amounts[1]),
        deadline
      )
      const encodedPermitData = encodePermitData(data, PermitType.PERMIT)

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA.connect(user).approve(swapTransferFacet.address, ZERO)

      // ----------------------------------------------------------------

      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          TOKEN_B_DECIMAL
        ),
        parseUnits(
          formatUnits(
            amounts[1].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          18
        ),
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodedPermitData,
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: DZAP_NATIVE,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              DZAP_NATIVE,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // ----------------------------------------------------------------

      const [userBalanceBeforeA, recipientBalanceBeforeB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user, recipient], [ZERO, minAmount[1]])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const eventData = await swapTransferFacet.queryFilter(eventFilter)
      const args = eventData[eventData.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [userBalanceAfterA, recipientBalanceAfterB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      expect(userBalanceAfterA).equal(
        userBalanceBeforeA.sub(amounts[0]).sub(amounts[1])
      )
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[0])
      )
    })

    it('3.7 Should allow user to swap tokens, using permit2 approve (Erc20 -> Erc20, Erc20 -> Erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------
      // native to tokenA
      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      // const from = tokenB.address
      // const to = tokenA.address
      const amounts = [
        parseUnits('1', TOKEN_A_DECIMAL),
        parseUnits('5', TOKEN_A_DECIMAL),
      ]
      const value = ZERO

      // ----------------------------------------------------------------

      // permit2 approve
      const deadline = (await latest()).add(duration.minutes(10))
      const expiration = (await latest()).add(duration.minutes(30))

      const { customPermitDataForTransfer } =
        await getPermit2SignatureAndCalldataForApprove(
          permit2,
          user,
          tokenA.address,
          dZapDiamond.address,
          amounts[0].add(amounts[1]),
          deadline,
          expiration
        )

      const encodedPermitData = encodePermitData(
        customPermitDataForTransfer,
        PermitType.PERMIT2_APPROVE
      )

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA.connect(user).approve(swapTransferFacet.address, ZERO)
      await tokenA
        .connect(user)
        .approve(permit2.address, ethers.constants.MaxUint256)

      // ----------------------------------------------------------------

      const minAmount = [
        parseUnits(
          formatUnits(
            amounts[0].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          TOKEN_B_DECIMAL
        ),
        parseUnits(
          formatUnits(
            amounts[1].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          18
        ),
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[0],
              false,
              false
            )
          ).data as string,
          permit: encodedPermitData,
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: DZAP_NATIVE,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              DZAP_NATIVE,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT2_APPROVE),
        },
      ]

      // ----------------------------------------------------------------

      const [userBalanceBeforeA, recipientBalanceBeforeB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user, recipient], [ZERO, minAmount[1]])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const eventData = await swapTransferFacet.queryFilter(eventFilter)
      const args = eventData[eventData.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(minAmount[0])

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // ----------------------------------------------------------------

      const [userBalanceAfterA, recipientBalanceAfterB] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenB.balanceOf(recipient),
      ])

      expect(userBalanceAfterA).equal(
        userBalanceBeforeA.sub(amounts[0]).sub(amounts[1])
      )
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[0])
      )
    })

    it('3.8 Should allow user to swap multiple tokens and not revert tx if all swap have not failed(Native -> ERC20, Erc20 -> Erc20, Ec20 -> Erc20)', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address

      // ----------------------------------------------------------------

      const amounts = [
        parseUnits('10'), // Native
        parseUnits('5', TOKEN_A_DECIMAL),
        parseUnits('1'), // wNative
      ]

      const minAmount = [
        parseUnits(
          formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
        parseUnits(
          formatUnits(
            amounts[1].mul(rate).div(BPS_MULTIPLIER),
            TOKEN_A_DECIMAL
          ),
          TOKEN_B_DECIMAL
        ),
        parseUnits(
          formatUnits(amounts[2].mul(rate).div(BPS_MULTIPLIER), 18),
          TOKEN_B_DECIMAL
        ),
      ]

      // ----------------------------------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      await wNative.connect(user).deposit({ value: parseUnits('100') })
      await wNative
        .connect(user)
        .approve(swapTransferFacet.address, parseUnits('100'))

      // ----------------------------------------------------------------

      const [userBalanceBeforeA, userBalanceBeforeWN, recipientBalanceBeforeB] =
        await Promise.all([
          tokenA.balanceOf(user.address),
          wNative.balanceOf(user.address),
          tokenB.balanceOf(recipient),
        ])

      // ----------------------------------------------------------------

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: tokenB.address,
          fromAmount: amounts[0],
          minToAmount: minAmount[0],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              DZAP_NATIVE,
              tokenB.address,
              dZapDiamond.address,
              amounts[0],
              false,
              true
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: minAmount[1],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: wNative.address,
          to: tokenB.address,
          fromAmount: amounts[2],
          minToAmount: minAmount[2],
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              wNative.address,
              tokenB.address,
              dZapDiamond.address,
              amounts[2],
              false,
              true
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]
      const value = amounts[0]

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .emit(swapTransferFacet, EVENTS.MultiSwapped)
        .changeEtherBalances([user, recipient], [ZERO, ZERO])

      // ----------------------------------------------------------------

      const eventFilter = swapTransferFacet.filters.MultiSwapped()
      const data = await swapTransferFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      // ----------------------------------------------------------------

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.recipient).equal(recipient)

      // swap 0
      expect(args.swapInfo[0].dex).equal(mockExchange.address)
      expect(args.swapInfo[0].fromToken).equal(swapData[0].from)
      expect(args.swapInfo[0].toToken).equal(swapData[0].to)
      expect(args.swapInfo[0].fromAmount).equal(swapData[0].fromAmount)
      expect(args.swapInfo[0].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[0].returnToAmount).equal(ZERO)

      // swap 1
      expect(args.swapInfo[1].dex).equal(mockExchange.address)
      expect(args.swapInfo[1].fromToken).equal(swapData[1].from)
      expect(args.swapInfo[1].toToken).equal(swapData[1].to)
      expect(args.swapInfo[1].fromAmount).equal(swapData[1].fromAmount)
      expect(args.swapInfo[1].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[1].returnToAmount).equal(minAmount[1])

      // swap 2
      expect(args.swapInfo[2].dex).equal(mockExchange.address)
      expect(args.swapInfo[2].fromToken).equal(swapData[2].from)
      expect(args.swapInfo[2].toToken).equal(swapData[2].to)
      expect(args.swapInfo[2].fromAmount).equal(swapData[2].fromAmount)
      expect(args.swapInfo[2].leftOverFromAmount).equal(ZERO)
      expect(args.swapInfo[2].returnToAmount).equal(ZERO)

      // ----------------------------------------------------------------
      const [userBalanceAfterA, userBalanceAfterWN, recipientBalanceAfterB] =
        await Promise.all([
          tokenA.balanceOf(user.address),
          wNative.balanceOf(user.address),
          tokenB.balanceOf(recipient),
        ])

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[1]))
      expect(userBalanceAfterWN).equal(userBalanceBeforeWN)
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minAmount[1])
      )
    })

    it('3.9 Should revert if recipient is zero address', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            integratorAddress,
            ZERO_ADDRESS,
            [
              {
                callTo: mockExchange.address,
                approveTo: mockExchange.address,
                from: DZAP_NATIVE,
                to: tokenB.address,
                fromAmount: 100,
                minToAmount: 100,
                swapCallData: '0x',
                permit: encodedPermitData,
              },
            ]
          )
      ).revertedWithCustomError(swapTransferFacet, ERRORS.ZeroAddress)
    })

    it('3.10 Should revert if integrator is not allowed', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            signers[10].address,
            recipient,
            [
              {
                callTo: mockExchange.address,
                approveTo: mockExchange.address,
                from: DZAP_NATIVE,
                to: tokenB.address,
                fromAmount: 100,
                minToAmount: 100,
                swapCallData: '0x',
                permit: encodedPermitData,
              },
            ]
          )
      ).revertedWithCustomError(swapTransferFacet, ERRORS.IntegratorNotAllowed)
    })

    it('3.11 Should revert if from amount is zero', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      const callData = (
        await mockExchange.populateTransaction.swap(
          tokenA.address,
          tokenB.address,
          dZapDiamond.address,
          parseUnits('1'),
          false,
          false
        )
      ).data as string

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            [
              {
                callTo: mockExchange.address,
                approveTo: mockExchange.address,
                from: tokenA.address,
                to: tokenB.address,
                fromAmount: 0,
                minToAmount: 100,
                swapCallData: callData,
                permit: encodedPermitData,
              },
            ]
          )
      ).revertedWithCustomError(swapTransferFacet, ERRORS.NoSwapFromZeroBalance)
    })

    it('3.12 Should revert if callTo(dex) is not approved', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet.connect(user).multiSwapWithoutRevertAndTransfer(
          transactionId,
          integratorAddress,
          recipient,
          [
            {
              callTo: executor.address,
              approveTo: mockExchange.address,
              from: DZAP_NATIVE,
              to: tokenB.address,
              fromAmount: 100,
              minToAmount: 100,
              swapCallData: '0x',
              permit: encodedPermitData,
            },
          ],
          { value: 100 }
        )
      ).revertedWithCustomError(
        swapTransferFacet,
        ERRORS.ContractCallNotAllowed
      )
    })

    it('3.13 Should revert if approveTo(dex) is not approved', async () => {
      // ----------------------------------------------------------------
      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------

      await expect(
        swapTransferFacet.connect(user).multiSwapWithoutRevertAndTransfer(
          transactionId,
          integratorAddress,
          recipient,
          [
            {
              callTo: mockExchange.address,
              approveTo: executor.address,
              from: DZAP_NATIVE,
              to: tokenB.address,
              fromAmount: 100,
              minToAmount: 100,
              swapCallData: '0x',
              permit: encodedPermitData,
            },
          ],
          { value: 100 }
        )
      ).revertedWithCustomError(
        swapTransferFacet,
        ERRORS.ContractCallNotAllowed
      )
    })

    it('3.14 Should revert if all swap swap call fails', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------
      const from = NATIVE_ADDRESS
      const to = tokenA.address
      const amounts = [parseUnits('1')]
      const value = amounts[0]

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          false,
          true
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_A_DECIMAL
      )

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount,
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      // ----------------------------------------------------------------
      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      ).revertedWithCustomError(swapTransferFacet, EVENTS.AllSwapsFailed)
    })

    it('3.15 Should revert if slippage is too high', async () => {
      const rate = await mockExchange.rate()

      // ----------------------------------------------------------------

      // native to tokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14].address
      const encodedPermitData = encodePermitData('0x', PermitType.PERMIT)

      // ----------------------------------------------------------------
      const from = NATIVE_ADDRESS
      const to = tokenA.address
      const amounts = [parseUnits('1')]
      const value = amounts[0]

      // ----------------------------------------------------------------

      const callData = (
        await mockExchange.populateTransaction.swap(
          from,
          to,
          dZapDiamond.address,
          amounts[0],
          false,
          false
        )
      ).data as string

      const minAmount = parseUnits(
        formatUnits(amounts[0].mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_A_DECIMAL
      )

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: DZAP_NATIVE,
          to: to,
          fromAmount: amounts[0],
          minToAmount: minAmount.add(1),
          swapCallData: callData,
          permit: encodedPermitData,
        },
      ]

      // ----------------------------------------------------------------
      await expect(
        swapTransferFacet
          .connect(user)
          .multiSwapWithoutRevertAndTransfer(
            transactionId,
            integratorAddress,
            recipient,
            swapData,
            {
              value,
            }
          )
      )
        .revertedWithCustomError(swapTransferFacet, ERRORS.SlippageTooLow)
        .withArgs(swapData[0].minToAmount, minAmount)
    })
  })
})
