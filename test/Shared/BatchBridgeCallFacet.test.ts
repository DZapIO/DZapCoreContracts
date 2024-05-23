import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { ethers } from 'hardhat'

import {
  BPS_DENOMINATOR,
  BPS_MULTIPLIER,
  CONTRACTS,
  DZAP_NATIVE,
  EVENTS,
  MAX_FIXED_FEE_AMOUNT,
  MAX_TOKEN_FEE,
  NATIVE_ADDRESS,
  ZERO,
} from '../../constants'
import { encodePermitData, getFeeData } from '../../scripts/core/helper'
import {
  getSelectorsUsingContract,
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
  GenericCrossChainFacet,
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
let genericCrossChainFacet: GenericCrossChainFacet
let genericCrossChainFacetImp: GenericCrossChainFacet
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

describe('BatchBridgeCallFacet.test.ts', async () => {
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
      genericCrossChainFacet = (await ethers.getContractAt(
        CONTRACTS.GenericCrossChainFacet,
        dZapDiamond.address
      )) as GenericCrossChainFacet
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

      const GenericCrossChainFacet = await ethers.getContractFactory(
        CONTRACTS.GenericCrossChainFacet,
        deployer
      )
      genericCrossChainFacetImp =
        (await GenericCrossChainFacet.deploy()) as GenericCrossChainFacet
      await genericCrossChainFacetImp.deployed()

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
          facetAddress: genericCrossChainFacetImp.address,
          action: FacetCutAction.Add,
          functionSelectors: getSelectorsUsingContract(
            genericCrossChainFacetImp,
            CONTRACTS.GenericCrossChainFacet
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

  describe('1) BatchBridgeCall', async () => {
    const destinationChainId1 = BigNumber.from(56)
    const destinationChainId2 = BigNumber.from(137)
    const destinationChainId3 = BigNumber.from(700000)

    beforeEach(async () => {
      await bridgeManagerFacet
        .connect(crossChainManager)
        .addAggregatorsAndBridges([mockBridge.address])
    })

    it('1.1 Should allow user to bridge tokens from one chain to other multiple chain (only evm)', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('10'),
        parseUnits('5', TOKEN_B_DECIMAL),
        parseUnits('2'),
      ]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[1].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[2].mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        amountWithoutFee[1].sub(routerTokenFee[1]),
        amountWithoutFee[2].sub(routerTokenFee[2]),
      ]

      const extra = parseUnits('0.5')
      const value = amounts[0]
        .add(amounts[2])
        .add(fixedNativeFeeAmount)
        .add(routerNativeFeeAmount.mul(3))
        .add(extra)

      // -------------------------------------

      const bridgeData1 = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const crossChainData1 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            NATIVE_ADDRESS,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      await tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await tokenB
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_B_DECIMAL))

      const bridgeData2 = {
        bridge: 'TestBridge',
        from: tokenB.address,
        to: tokenB.address,
        receiver: recipient.address,
        minAmountIn: amounts[1],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const crossChainData2 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenB.address,
            amountWithoutFee[1],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      const bridgeData3 = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[2],
        destinationChainId: destinationChainId2,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }
      const crossChainData3 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            NATIVE_ADDRESS,
            amountWithoutFee[2],
            false
          )
        ).data as string,
      }

      // -------------------------------------
      const [
        userBalanceBeforeB,
        recipientBalanceBeforeB,
        vaultBalanceBeforeB,
        integratorBalanceBeforeB,
        routerBalanceBeforeB,
      ] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenB.balanceOf(recipient.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(integrator2.address),
        tokenB.balanceOf(mockBridge.address),
      ])

      // -------------------------------------

      await expect(
        batchBridgeCallFacet
          .connect(user)
          .batchBridgeCall(
            transactionId,
            integratorAddress,
            [crossChainData1, crossChainData2, crossChainData3],
            [bridgeData1, bridgeData2, bridgeData3],
            [],
            [],
            {
              value,
            }
          )
      )
        .emit(batchBridgeCallFacet, EVENTS.BatchBridgeTransferStart)
        .changeEtherBalances(
          [user, recipient, protoFeeVault, integrator1, mockBridge],
          [
            convertBNToNegative(value.sub(extra)),
            minReturn[0].add(minReturn[2]),
            fixedNativeFeeAmount
              .add(tokenFeeData[0].dzapFee)
              .add(tokenFeeData[2].dzapFee),
            tokenFeeData[0].integratorFee.add(tokenFeeData[2].integratorFee),
            routerNativeFeeAmount
              .mul(3)
              .add(routerTokenFee[0])
              .add(routerTokenFee[2]),
          ]
        )

      const eventFilter =
        batchBridgeCallFacet.filters.BatchBridgeTransferStart()
      const data = await batchBridgeCallFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.bridgeData.length).eql(3)
      expect(args.genericBridgeData.length).eql(0)

      expect(args.bridgeData[0]).eql([
        bridgeData1.bridge,
        bridgeData1.from,
        bridgeData1.to,
        bridgeData1.receiver,
        bridgeData1.hasSourceSwaps,
        bridgeData1.hasDestinationCall,
        amountWithoutFee[0],
        bridgeData1.destinationChainId,
      ])

      expect(args.bridgeData[1]).eql([
        bridgeData2.bridge,
        bridgeData2.from,
        bridgeData2.to,
        bridgeData2.receiver,
        bridgeData2.hasSourceSwaps,
        bridgeData2.hasDestinationCall,
        amountWithoutFee[1],
        bridgeData2.destinationChainId,
      ])

      expect(args.bridgeData[2]).eql([
        bridgeData3.bridge,
        bridgeData3.from,
        bridgeData3.to,
        bridgeData3.receiver,
        bridgeData3.hasSourceSwaps,
        bridgeData3.hasDestinationCall,
        amountWithoutFee[2],
        bridgeData3.destinationChainId,
      ])

      // -------------------------------------

      const [
        userBalanceAfterB,
        recipientBalanceAfterB,
        vaultBalanceAfterB,
        integratorBalanceAfterB,
        routerBalanceAfterB,
      ] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenB.balanceOf(recipient.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(integrator2.address),
        tokenB.balanceOf(mockBridge.address),
      ])

      expect(userBalanceAfterB).equal(userBalanceBeforeB.sub(amounts[1]))
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minReturn[1])
      )
      expect(vaultBalanceAfterB).equal(
        vaultBalanceBeforeB.add(tokenFeeData[1].dzapFee)
      )
      expect(integratorBalanceAfterB).equal(
        integratorBalanceBeforeB.add(tokenFeeData[1].integratorFee)
      )
      expect(routerBalanceAfterB).equal(
        routerBalanceBeforeB.add(routerTokenFee[1])
      )
    })

    it('1.2 Should allow user to bridge token from one chain to other multiple chain (only non-evm)', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('15'), parseUnits('5', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[1].mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        amountWithoutFee[1].sub(routerTokenFee[1]),
      ]

      const extra = parseUnits('0.5')
      const value = amounts[0]
        .add(fixedNativeFeeAmount)
        .add(routerNativeFeeAmount.mul(2))
        .add(extra)

      // -------------------------------------

      const genericBridgeData1 = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const genericCrossChainData1 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            NATIVE_ADDRESS,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      const genericBridgeData2 = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[1],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const genericCrossChainData2 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amountWithoutFee[1],
            false
          )
        ).data as string,
      }

      // -------------------------------------
      const [
        userBalanceBeforeA,
        recipientBalanceBeforeA,
        vaultBalanceBeforeA,
        integratorBalanceBeforeA,
        routerBalanceBeforeA,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenA.balanceOf(recipient.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator2.address),
        tokenA.balanceOf(mockBridge.address),
      ])

      // -------------------------------------

      await expect(
        batchBridgeCallFacet
          .connect(user)
          .batchBridgeCall(
            transactionId,
            integratorAddress,
            [genericCrossChainData1, genericCrossChainData2],
            [],
            [genericBridgeData1, genericBridgeData2],
            [],
            {
              value,
            }
          )
      )
        .emit(batchBridgeCallFacet, EVENTS.BatchBridgeTransferStart)
        .changeEtherBalances(
          [user, recipient, protoFeeVault, integrator1, mockBridge],
          [
            convertBNToNegative(value.sub(extra)),
            minReturn[0],
            fixedNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            tokenFeeData[0].integratorFee,
            routerNativeFeeAmount.mul(2).add(routerTokenFee[0]),
          ]
        )

      const eventFilter =
        batchBridgeCallFacet.filters.BatchBridgeTransferStart()
      const data = await batchBridgeCallFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.bridgeData.length).eql(0)
      expect(args.genericBridgeData.length).eql(2)

      expect(args.genericBridgeData[0]).eql([
        genericBridgeData1.bridge,
        ethers.utils.getAddress(genericBridgeData1.to).toLowerCase(),
        ethers.utils.getAddress(genericBridgeData1.receiver).toLowerCase(),
        genericBridgeData1.from,
        genericBridgeData1.hasSourceSwaps,
        genericBridgeData1.hasDestinationCall,
        amountWithoutFee[0],
        genericBridgeData1.destinationChainId,
      ])

      expect(args.genericBridgeData[1]).eql([
        genericBridgeData2.bridge,
        ethers.utils.getAddress(genericBridgeData2.to).toLowerCase(),
        ethers.utils.getAddress(genericBridgeData2.receiver).toLowerCase(),
        genericBridgeData2.from,
        genericBridgeData2.hasSourceSwaps,
        genericBridgeData2.hasDestinationCall,
        amountWithoutFee[1],
        genericBridgeData2.destinationChainId,
      ])

      // -------------------------------------

      const [
        userBalanceAfterA,
        recipientBalanceAfterA,
        vaultBalanceAfterA,
        integratorBalanceAfterA,
        routerBalanceAfterA,
      ] = await Promise.all([
        tokenA.balanceOf(user.address),
        tokenA.balanceOf(recipient.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator2.address),
        tokenA.balanceOf(mockBridge.address),
      ])

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[1]))
      expect(recipientBalanceAfterA).equal(
        recipientBalanceBeforeA.add(minReturn[1])
      )
      expect(vaultBalanceAfterA).equal(
        vaultBalanceBeforeA.add(tokenFeeData[1].dzapFee)
      )
      expect(integratorBalanceAfterA).equal(
        integratorBalanceBeforeA.add(tokenFeeData[1].integratorFee)
      )
      expect(routerBalanceAfterA).equal(
        routerBalanceBeforeA.add(routerTokenFee[1])
      )
    })

    it('1.3 Should allow user to bridge token from one chain to other multiple chain (evm + non-evm)', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('10'),
        parseUnits('5', TOKEN_B_DECIMAL),
        parseUnits('2'),
        parseUnits('15'),
        parseUnits('5', TOKEN_A_DECIMAL),
      ]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[1].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[2].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[3].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[4].mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        amountWithoutFee[1].sub(routerTokenFee[1]),
        amountWithoutFee[2].sub(routerTokenFee[2]),
        amountWithoutFee[3].sub(routerTokenFee[3]),
        amountWithoutFee[4].sub(routerTokenFee[4]),
      ]

      const extra = parseUnits('0.5')
      const value = amounts[0]
        .add(amounts[2])
        .add(amounts[3])
        .add(fixedNativeFeeAmount)
        .add(routerNativeFeeAmount.mul(5))
        .add(extra)

      // -------------------------------------

      const bridgeData1 = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const crossChainData1 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            NATIVE_ADDRESS,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      await tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await tokenB
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_B_DECIMAL))

      const bridgeData2 = {
        bridge: 'TestBridge',
        from: tokenB.address,
        to: tokenB.address,
        receiver: recipient.address,
        minAmountIn: amounts[1],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const crossChainData2 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenB.address,
            amountWithoutFee[1],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      const bridgeData3 = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[2],
        destinationChainId: destinationChainId2,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }
      const crossChainData3 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            NATIVE_ADDRESS,
            amountWithoutFee[2],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      const genericBridgeData1 = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[3],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }
      const genericCrossChainData1 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            NATIVE_ADDRESS,
            amountWithoutFee[3],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      const genericBridgeData2 = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[4],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }
      const genericCrossChainData2 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amountWithoutFee[4],
            false
          )
        ).data as string,
      }

      // -------------------------------------
      const [
        userBalanceBeforeB,
        recipientBalanceBeforeB,
        vaultBalanceBeforeB,
        integratorBalanceBeforeB,
        routerBalanceBeforeB,
        userBalanceBeforeA,
        recipientBalanceBeforeA,
        vaultBalanceBeforeA,
        integratorBalanceBeforeA,
        routerBalanceBeforeA,
      ] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenB.balanceOf(recipient.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(integrator2.address),
        tokenB.balanceOf(mockBridge.address),
        tokenA.balanceOf(user.address),
        tokenA.balanceOf(recipient.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator2.address),
        tokenA.balanceOf(mockBridge.address),
      ])

      // -------------------------------------

      await expect(
        batchBridgeCallFacet
          .connect(user)
          .batchBridgeCall(
            transactionId,
            integratorAddress,
            [
              crossChainData1,
              crossChainData2,
              crossChainData3,
              genericCrossChainData1,
              genericCrossChainData2,
            ],
            [bridgeData1, bridgeData2, bridgeData3],
            [genericBridgeData1, genericBridgeData2],
            [],
            {
              value,
            }
          )
      )
        .emit(batchBridgeCallFacet, EVENTS.BatchBridgeTransferStart)
        .changeEtherBalances(
          [user, recipient, protoFeeVault, integrator1, mockBridge],
          [
            convertBNToNegative(value.sub(extra)),
            minReturn[0].add(minReturn[2]).add(minReturn[3]),
            fixedNativeFeeAmount
              .add(tokenFeeData[0].dzapFee)
              .add(tokenFeeData[2].dzapFee)
              .add(tokenFeeData[3].dzapFee),
            tokenFeeData[0].integratorFee
              .add(tokenFeeData[2].integratorFee)
              .add(tokenFeeData[3].integratorFee),
            routerNativeFeeAmount
              .mul(5)
              .add(routerTokenFee[0])
              .add(routerTokenFee[2])
              .add(routerTokenFee[3]),
          ]
        )

      const eventFilter =
        batchBridgeCallFacet.filters.BatchBridgeTransferStart()
      const data = await batchBridgeCallFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.bridgeData.length).eql(3)
      expect(args.genericBridgeData.length).eql(2)

      expect(args.bridgeData[0]).eql([
        bridgeData1.bridge,
        bridgeData1.from,
        bridgeData1.to,
        bridgeData1.receiver,
        bridgeData1.hasSourceSwaps,
        bridgeData1.hasDestinationCall,
        amountWithoutFee[0],
        bridgeData1.destinationChainId,
      ])

      expect(args.bridgeData[1]).eql([
        bridgeData2.bridge,
        bridgeData2.from,
        bridgeData2.to,
        bridgeData2.receiver,
        bridgeData2.hasSourceSwaps,
        bridgeData2.hasDestinationCall,
        amountWithoutFee[1],
        bridgeData2.destinationChainId,
      ])

      expect(args.bridgeData[2]).eql([
        bridgeData3.bridge,
        bridgeData3.from,
        bridgeData3.to,
        bridgeData3.receiver,
        bridgeData3.hasSourceSwaps,
        bridgeData3.hasDestinationCall,
        amountWithoutFee[2],
        bridgeData3.destinationChainId,
      ])

      expect(args.genericBridgeData[0]).eql([
        genericBridgeData1.bridge,
        ethers.utils.getAddress(genericBridgeData1.to).toLowerCase(),
        ethers.utils.getAddress(genericBridgeData1.receiver).toLowerCase(),
        genericBridgeData1.from,
        genericBridgeData1.hasSourceSwaps,
        genericBridgeData1.hasDestinationCall,
        amountWithoutFee[3],
        genericBridgeData1.destinationChainId,
      ])

      expect(args.genericBridgeData[1]).eql([
        genericBridgeData2.bridge,
        ethers.utils.getAddress(genericBridgeData2.to).toLowerCase(),
        ethers.utils.getAddress(genericBridgeData2.receiver).toLowerCase(),
        genericBridgeData2.from,
        genericBridgeData2.hasSourceSwaps,
        genericBridgeData2.hasDestinationCall,
        amountWithoutFee[4],
        genericBridgeData2.destinationChainId,
      ])

      // -------------------------------------

      const [
        userBalanceAfterB,
        recipientBalanceAfterB,
        vaultBalanceAfterB,
        integratorBalanceAfterB,
        routerBalanceAfterB,
        userBalanceAfterA,
        recipientBalanceAfterA,
        vaultBalanceAfterA,
        integratorBalanceAfterA,
        routerBalanceAfterA,
      ] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenB.balanceOf(recipient.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(integrator2.address),
        tokenB.balanceOf(mockBridge.address),
        tokenA.balanceOf(user.address),
        tokenA.balanceOf(recipient.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator2.address),
        tokenA.balanceOf(mockBridge.address),
      ])

      expect(userBalanceAfterB).equal(userBalanceBeforeB.sub(amounts[1]))
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minReturn[1])
      )
      expect(vaultBalanceAfterB).equal(
        vaultBalanceBeforeB.add(tokenFeeData[1].dzapFee)
      )
      expect(integratorBalanceAfterB).equal(
        integratorBalanceBeforeB.add(tokenFeeData[1].integratorFee)
      )
      expect(routerBalanceAfterB).equal(
        routerBalanceBeforeB.add(routerTokenFee[1])
      )

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[4]))
      expect(recipientBalanceAfterA).equal(
        recipientBalanceBeforeA.add(minReturn[4])
      )
      expect(vaultBalanceAfterA).equal(
        vaultBalanceBeforeA.add(tokenFeeData[4].dzapFee)
      )
      expect(integratorBalanceAfterA).equal(
        integratorBalanceBeforeA.add(tokenFeeData[4].integratorFee)
      )
      expect(routerBalanceAfterA).equal(
        routerBalanceBeforeA.add(routerTokenFee[4])
      )
    })

    it('1.4 Should allow user to bridge token from one chain to other multiple chain (only dynamicTransfer)', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('5', TOKEN_B_DECIMAL)]

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

      await tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await tokenB
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_B_DECIMAL))

      // -------------------------------------

      const mockTransferAddress1 = signers[18]
      const mockTransferAddress2 = signers[19]

      const genericBridgeDataForTransfer1 = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const transferData1 = {
        transferTo: mockTransferAddress1.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer2 = {
        bridge: 'TestBridge',
        from: tokenB.address,
        to: tokenB.address,
        receiver: recipient.address,
        minAmountIn: amounts[1],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const transferData2 = {
        transferTo: mockTransferAddress2.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      // -------------------------------------
      const [
        userBalanceBeforeB,
        recipientBalanceBeforeB,
        vaultBalanceBeforeB,
        integratorBalanceBeforeB,
        mockTransferAddress2BalanceBeforeB,
      ] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenB.balanceOf(recipient.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(integrator2.address),
        tokenB.balanceOf(mockTransferAddress2.address),
      ])

      // -------------------------------------

      await expect(
        batchBridgeCallFacet
          .connect(user)
          .batchBridgeCall(
            transactionId,
            integratorAddress,
            [],
            [],
            [genericBridgeDataForTransfer1, genericBridgeDataForTransfer2],
            [transferData1, transferData2],
            {
              value,
            }
          )
      )
        .emit(batchBridgeCallFacet, EVENTS.BatchBridgeTransferStart)
        .changeEtherBalances(
          [user, recipient, protoFeeVault, integrator1, mockTransferAddress1],
          [
            convertBNToNegative(value.sub(extra)),
            ZERO,
            fixedNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            tokenFeeData[0].integratorFee,
            amountWithoutFee[0],
          ]
        )

      const eventFilter =
        batchBridgeCallFacet.filters.BatchBridgeTransferStart()
      const data = await batchBridgeCallFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.bridgeData.length).eql(0)
      expect(args.genericBridgeData.length).eql(2)

      expect(args.genericBridgeData[0]).eql([
        genericBridgeDataForTransfer1.bridge,
        ethers.utils.getAddress(genericBridgeDataForTransfer1.to).toLowerCase(),
        ethers.utils
          .getAddress(genericBridgeDataForTransfer1.receiver)
          .toLowerCase(),
        genericBridgeDataForTransfer1.from,
        genericBridgeDataForTransfer1.hasSourceSwaps,
        genericBridgeDataForTransfer1.hasDestinationCall,
        amountWithoutFee[0],
        genericBridgeDataForTransfer1.destinationChainId,
      ])

      expect(args.genericBridgeData[1]).eql([
        genericBridgeDataForTransfer2.bridge,
        ethers.utils.getAddress(genericBridgeDataForTransfer2.to).toLowerCase(),
        ethers.utils
          .getAddress(genericBridgeDataForTransfer2.receiver)
          .toLowerCase(),
        genericBridgeDataForTransfer2.from,
        genericBridgeDataForTransfer2.hasSourceSwaps,
        genericBridgeDataForTransfer2.hasDestinationCall,
        amountWithoutFee[1],
        genericBridgeDataForTransfer2.destinationChainId,
      ])

      // -------------------------------------

      const [
        userBalanceAfterB,
        recipientBalanceAfterB,
        vaultBalanceAfterB,
        integratorBalanceAfterB,
        mockTransferAddress2BalanceAfterB,
      ] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenB.balanceOf(recipient.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(integrator2.address),
        tokenB.balanceOf(mockTransferAddress2.address),
      ])

      expect(userBalanceAfterB).equal(userBalanceBeforeB.sub(amounts[1]))
      expect(recipientBalanceAfterB).equal(recipientBalanceBeforeB)
      expect(vaultBalanceAfterB).equal(
        vaultBalanceBeforeB.add(tokenFeeData[1].dzapFee)
      )
      expect(integratorBalanceAfterB).equal(
        integratorBalanceBeforeB.add(tokenFeeData[1].integratorFee)
      )
      expect(mockTransferAddress2BalanceAfterB).equal(
        mockTransferAddress2BalanceBeforeB.add(amountWithoutFee[1])
      )
    })

    it('1.5 Should allow user to bridge token from one chain to other multiple chain (evm  + dynamicTransfer)', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('10'),
        parseUnits('5', TOKEN_B_DECIMAL),
        parseUnits('2'),
        parseUnits('20'),
        parseUnits('5', TOKEN_B_DECIMAL),
      ]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[1].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[2].mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        amountWithoutFee[1].sub(routerTokenFee[1]),
        amountWithoutFee[2].sub(routerTokenFee[2]),
      ]

      const extra = parseUnits('0.5')
      const value = amounts[0]
        .add(amounts[2])
        .add(amounts[3])
        .add(fixedNativeFeeAmount)
        .add(routerNativeFeeAmount.mul(3))
        .add(extra)

      // -------------------------------------

      const bridgeData1 = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const crossChainData1 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            NATIVE_ADDRESS,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      await tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await tokenB
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_B_DECIMAL))

      const bridgeData2 = {
        bridge: 'TestBridge',
        from: tokenB.address,
        to: tokenB.address,
        receiver: recipient.address,
        minAmountIn: amounts[1],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const crossChainData2 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenB.address,
            amountWithoutFee[1],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      const bridgeData3 = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[2],
        destinationChainId: destinationChainId2,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }
      const crossChainData3 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            NATIVE_ADDRESS,
            amountWithoutFee[2],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      const mockTransferAddress1 = signers[18]
      const mockTransferAddress2 = signers[19]

      const genericBridgeDataForTransfer1 = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[3],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const transferData1 = {
        transferTo: mockTransferAddress1.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer2 = {
        bridge: 'TestBridge',
        from: tokenB.address,
        to: tokenB.address,
        receiver: recipient.address,
        minAmountIn: amounts[4],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const transferData2 = {
        transferTo: mockTransferAddress2.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      // -------------------------------------
      const [
        userBalanceBeforeB,
        recipientBalanceBeforeB,
        vaultBalanceBeforeB,
        integratorBalanceBeforeB,
        routerBalanceBeforeB,
        mockTransferAddress2BalanceBeforeB,
      ] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenB.balanceOf(recipient.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(integrator2.address),
        tokenB.balanceOf(mockBridge.address),
        tokenB.balanceOf(mockTransferAddress2.address),
      ])

      // -------------------------------------

      await expect(
        batchBridgeCallFacet
          .connect(user)
          .batchBridgeCall(
            transactionId,
            integratorAddress,
            [crossChainData1, crossChainData2, crossChainData3],
            [bridgeData1, bridgeData2, bridgeData3],
            [genericBridgeDataForTransfer1, genericBridgeDataForTransfer2],
            [transferData1, transferData2],
            {
              value,
            }
          )
      )
        .emit(batchBridgeCallFacet, EVENTS.BatchBridgeTransferStart)
        .changeEtherBalances(
          [
            user,
            recipient,
            protoFeeVault,
            integrator1,
            mockBridge,
            mockTransferAddress1,
          ],
          [
            convertBNToNegative(value.sub(extra)),
            minReturn[0].add(minReturn[2]),
            fixedNativeFeeAmount
              .add(tokenFeeData[0].dzapFee)
              .add(tokenFeeData[2].dzapFee)
              .add(tokenFeeData[3].dzapFee),
            tokenFeeData[0].integratorFee
              .add(tokenFeeData[2].integratorFee)
              .add(tokenFeeData[3].integratorFee),
            routerNativeFeeAmount
              .mul(3)
              .add(routerTokenFee[0])
              .add(routerTokenFee[2]),
            amountWithoutFee[3],
          ]
        )

      const eventFilter =
        batchBridgeCallFacet.filters.BatchBridgeTransferStart()
      const data = await batchBridgeCallFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.bridgeData.length).eql(3)
      expect(args.genericBridgeData.length).eql(2)

      expect(args.bridgeData[0]).eql([
        bridgeData1.bridge,
        bridgeData1.from,
        bridgeData1.to,
        bridgeData1.receiver,
        bridgeData1.hasSourceSwaps,
        bridgeData1.hasDestinationCall,
        amountWithoutFee[0],
        bridgeData1.destinationChainId,
      ])

      expect(args.bridgeData[1]).eql([
        bridgeData2.bridge,
        bridgeData2.from,
        bridgeData2.to,
        bridgeData2.receiver,
        bridgeData2.hasSourceSwaps,
        bridgeData2.hasDestinationCall,
        amountWithoutFee[1],
        bridgeData2.destinationChainId,
      ])

      expect(args.bridgeData[2]).eql([
        bridgeData3.bridge,
        bridgeData3.from,
        bridgeData3.to,
        bridgeData3.receiver,
        bridgeData3.hasSourceSwaps,
        bridgeData3.hasDestinationCall,
        amountWithoutFee[2],
        bridgeData3.destinationChainId,
      ])

      expect(args.genericBridgeData[0]).eql([
        genericBridgeDataForTransfer1.bridge,
        ethers.utils.getAddress(genericBridgeDataForTransfer1.to).toLowerCase(),
        ethers.utils
          .getAddress(genericBridgeDataForTransfer1.receiver)
          .toLowerCase(),
        genericBridgeDataForTransfer1.from,
        genericBridgeDataForTransfer1.hasSourceSwaps,
        genericBridgeDataForTransfer1.hasDestinationCall,
        amountWithoutFee[3],
        genericBridgeDataForTransfer1.destinationChainId,
      ])

      expect(args.genericBridgeData[1]).eql([
        genericBridgeDataForTransfer2.bridge,
        ethers.utils.getAddress(genericBridgeDataForTransfer2.to).toLowerCase(),
        ethers.utils
          .getAddress(genericBridgeDataForTransfer2.receiver)
          .toLowerCase(),
        genericBridgeDataForTransfer2.from,
        genericBridgeDataForTransfer2.hasSourceSwaps,
        genericBridgeDataForTransfer2.hasDestinationCall,
        amountWithoutFee[4],
        genericBridgeDataForTransfer2.destinationChainId,
      ])

      // -------------------------------------

      const [
        userBalanceAfterB,
        recipientBalanceAfterB,
        vaultBalanceAfterB,
        integratorBalanceAfterB,
        routerBalanceAfterB,
        mockTransferAddress2BalanceAfterB,
      ] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenB.balanceOf(recipient.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(integrator2.address),
        tokenB.balanceOf(mockBridge.address),
        tokenB.balanceOf(mockTransferAddress2.address),
      ])

      expect(userBalanceAfterB).equal(
        userBalanceBeforeB.sub(amounts[1].add(amounts[4]))
      )
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minReturn[1])
      )
      expect(vaultBalanceAfterB).equal(
        vaultBalanceBeforeB
          .add(tokenFeeData[1].dzapFee)
          .add(tokenFeeData[4].dzapFee)
      )
      expect(integratorBalanceAfterB).equal(
        integratorBalanceBeforeB
          .add(tokenFeeData[1].integratorFee)
          .add(tokenFeeData[4].integratorFee)
      )
      expect(routerBalanceAfterB).equal(
        routerBalanceBeforeB.add(routerTokenFee[1])
      )
      expect(mockTransferAddress2BalanceAfterB).equal(
        mockTransferAddress2BalanceBeforeB.add(amountWithoutFee[4])
      )
    })

    it('1.6 Should allow user to bridge token from one chain to other multiple chain (non-evm + dynamicTransfer)', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('15'),
        parseUnits('5', TOKEN_A_DECIMAL),
        parseUnits('20'),
        parseUnits('5', TOKEN_B_DECIMAL),
      ]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[1].mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        amountWithoutFee[1].sub(routerTokenFee[1]),
      ]

      const extra = parseUnits('0.5')
      const value = amounts[0]
        .add(amounts[2])
        .add(fixedNativeFeeAmount)
        .add(routerNativeFeeAmount.mul(2))
        .add(extra)

      // -------------------------------------

      await tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await tokenB
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_B_DECIMAL))

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const genericBridgeData1 = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }
      const genericCrossChainData1 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            NATIVE_ADDRESS,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      const genericBridgeData2 = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[1],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }
      const genericCrossChainData2 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amountWithoutFee[1],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      const mockTransferAddress1 = signers[18]
      const mockTransferAddress2 = signers[19]

      const genericBridgeDataForTransfer1 = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[2],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const transferData1 = {
        transferTo: mockTransferAddress1.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer2 = {
        bridge: 'TestBridge',
        from: tokenB.address,
        to: tokenB.address,
        receiver: recipient.address,
        minAmountIn: amounts[3],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const transferData2 = {
        transferTo: mockTransferAddress2.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      // -------------------------------------
      const [
        userBalanceBeforeB,
        recipientBalanceBeforeB,
        vaultBalanceBeforeB,
        integratorBalanceBeforeB,
        routerBalanceBeforeB,
        userBalanceBeforeA,
        recipientBalanceBeforeA,
        vaultBalanceBeforeA,
        integratorBalanceBeforeA,
        routerBalanceBeforeA,
        mockTransferAddress2BalanceBeforeB,
      ] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenB.balanceOf(recipient.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(integrator2.address),
        tokenB.balanceOf(mockBridge.address),
        tokenA.balanceOf(user.address),
        tokenA.balanceOf(recipient.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator2.address),
        tokenA.balanceOf(mockBridge.address),
        tokenB.balanceOf(mockTransferAddress2.address),
      ])

      // -------------------------------------

      await expect(
        batchBridgeCallFacet
          .connect(user)
          .batchBridgeCall(
            transactionId,
            integratorAddress,
            [genericCrossChainData1, genericCrossChainData2],
            [],
            [
              genericBridgeData1,
              genericBridgeData2,
              genericBridgeDataForTransfer1,
              genericBridgeDataForTransfer2,
            ],
            [transferData1, transferData2],
            {
              value,
            }
          )
      )
        .emit(batchBridgeCallFacet, EVENTS.BatchBridgeTransferStart)
        .changeEtherBalances(
          [
            user,
            recipient,
            protoFeeVault,
            integrator1,
            mockBridge,
            mockTransferAddress1,
          ],
          [
            convertBNToNegative(value.sub(extra)),
            minReturn[0],
            fixedNativeFeeAmount
              .add(tokenFeeData[0].dzapFee)
              .add(tokenFeeData[2].dzapFee),
            tokenFeeData[0].integratorFee.add(tokenFeeData[2].integratorFee),
            routerNativeFeeAmount.mul(2).add(routerTokenFee[0]),
            amountWithoutFee[2],
          ]
        )

      const eventFilter =
        batchBridgeCallFacet.filters.BatchBridgeTransferStart()
      const data = await batchBridgeCallFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.bridgeData.length).eql(0)
      expect(args.genericBridgeData.length).eql(4)

      expect(args.genericBridgeData[0]).eql([
        genericBridgeData1.bridge,
        ethers.utils.getAddress(genericBridgeData1.to).toLowerCase(),
        ethers.utils.getAddress(genericBridgeData1.receiver).toLowerCase(),
        genericBridgeData1.from,
        genericBridgeData1.hasSourceSwaps,
        genericBridgeData1.hasDestinationCall,
        amountWithoutFee[0],
        genericBridgeData1.destinationChainId,
      ])

      expect(args.genericBridgeData[1]).eql([
        genericBridgeData2.bridge,
        ethers.utils.getAddress(genericBridgeData2.to).toLowerCase(),
        ethers.utils.getAddress(genericBridgeData2.receiver).toLowerCase(),
        genericBridgeData2.from,
        genericBridgeData2.hasSourceSwaps,
        genericBridgeData2.hasDestinationCall,
        amountWithoutFee[1],
        genericBridgeData2.destinationChainId,
      ])

      expect(args.genericBridgeData[2]).eql([
        genericBridgeDataForTransfer1.bridge,
        ethers.utils.getAddress(genericBridgeDataForTransfer1.to).toLowerCase(),
        ethers.utils
          .getAddress(genericBridgeDataForTransfer1.receiver)
          .toLowerCase(),
        genericBridgeDataForTransfer1.from,
        genericBridgeDataForTransfer1.hasSourceSwaps,
        genericBridgeDataForTransfer1.hasDestinationCall,
        amountWithoutFee[2],
        genericBridgeDataForTransfer1.destinationChainId,
      ])

      expect(args.genericBridgeData[3]).eql([
        genericBridgeDataForTransfer2.bridge,
        ethers.utils.getAddress(genericBridgeDataForTransfer2.to).toLowerCase(),
        ethers.utils
          .getAddress(genericBridgeDataForTransfer2.receiver)
          .toLowerCase(),
        genericBridgeDataForTransfer2.from,
        genericBridgeDataForTransfer2.hasSourceSwaps,
        genericBridgeDataForTransfer2.hasDestinationCall,
        amountWithoutFee[3],
        genericBridgeDataForTransfer2.destinationChainId,
      ])

      // -------------------------------------

      const [
        userBalanceAfterB,
        recipientBalanceAfterB,
        vaultBalanceAfterB,
        integratorBalanceAfterB,
        routerBalanceAfterB,
        userBalanceAfterA,
        recipientBalanceAfterA,
        vaultBalanceAfterA,
        integratorBalanceAfterA,
        routerBalanceAfterA,
        mockTransferAddress2BalanceAfterB,
      ] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenB.balanceOf(recipient.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(integrator2.address),
        tokenB.balanceOf(mockBridge.address),
        tokenA.balanceOf(user.address),
        tokenA.balanceOf(recipient.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator2.address),
        tokenA.balanceOf(mockBridge.address),
        tokenB.balanceOf(mockTransferAddress2.address),
      ])

      expect(userBalanceAfterB).equal(userBalanceBeforeB.sub(amounts[3]))
      expect(recipientBalanceAfterB).equal(recipientBalanceBeforeB)
      expect(vaultBalanceAfterB).equal(
        vaultBalanceBeforeB.add(tokenFeeData[3].dzapFee)
      )
      expect(integratorBalanceAfterB).equal(
        integratorBalanceBeforeB.add(tokenFeeData[3].integratorFee)
      )
      expect(mockTransferAddress2BalanceAfterB).equal(
        mockTransferAddress2BalanceBeforeB.add(amountWithoutFee[3])
      )

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[1]))
      expect(recipientBalanceAfterA).equal(
        recipientBalanceBeforeA.add(minReturn[1])
      )
      expect(vaultBalanceAfterA).equal(
        vaultBalanceBeforeA.add(tokenFeeData[1].dzapFee)
      )
      expect(integratorBalanceAfterA).equal(
        integratorBalanceBeforeA.add(tokenFeeData[1].integratorFee)
      )
      expect(routerBalanceAfterA).equal(
        routerBalanceBeforeA.add(routerTokenFee[1])
      )
    })

    it('1.7 Should allow user to bridge token from one chain to other multiple chain (evm + non-evm + dynamicTransfer)', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('10'),
        parseUnits('5', TOKEN_B_DECIMAL),
        parseUnits('2'),
        parseUnits('15'),
        parseUnits('5', TOKEN_A_DECIMAL),
        parseUnits('20'),
        parseUnits('5', TOKEN_B_DECIMAL),
      ]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[1].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[2].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[3].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[4].mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        amountWithoutFee[1].sub(routerTokenFee[1]),
        amountWithoutFee[2].sub(routerTokenFee[2]),
        amountWithoutFee[3].sub(routerTokenFee[3]),
        amountWithoutFee[4].sub(routerTokenFee[4]),
      ]

      const extra = parseUnits('0.5')
      const value = amounts[0]
        .add(amounts[2])
        .add(amounts[3])
        .add(amounts[5])
        .add(fixedNativeFeeAmount)
        .add(routerNativeFeeAmount.mul(5))
        .add(extra)

      // -------------------------------------

      const bridgeData1 = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const crossChainData1 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            NATIVE_ADDRESS,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      await tokenB.mint(user.address, parseUnits('100', TOKEN_B_DECIMAL))
      await tokenB
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_B_DECIMAL))

      const bridgeData2 = {
        bridge: 'TestBridge',
        from: tokenB.address,
        to: tokenB.address,
        receiver: recipient.address,
        minAmountIn: amounts[1],
        destinationChainId: destinationChainId1,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const crossChainData2 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenB.address,
            amountWithoutFee[1],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      const bridgeData3 = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[2],
        destinationChainId: destinationChainId2,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }
      const crossChainData3 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            NATIVE_ADDRESS,
            amountWithoutFee[2],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      const genericBridgeData1 = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[3],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }
      const genericCrossChainData1 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            NATIVE_ADDRESS,
            amountWithoutFee[3],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      const genericBridgeData2 = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[4],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }
      const genericCrossChainData2 = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amountWithoutFee[4],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      const mockTransferAddress1 = signers[18]
      const mockTransferAddress2 = signers[19]

      const genericBridgeDataForTransfer1 = {
        bridge: 'TestBridge',
        from: NATIVE_ADDRESS,
        to: NATIVE_ADDRESS,
        receiver: recipient.address,
        minAmountIn: amounts[5],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const transferData1 = {
        transferTo: mockTransferAddress1.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const genericBridgeDataForTransfer2 = {
        bridge: 'TestBridge',
        from: tokenB.address,
        to: tokenB.address,
        receiver: recipient.address,
        minAmountIn: amounts[6],
        destinationChainId: destinationChainId3,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const transferData2 = {
        transferTo: mockTransferAddress2.address,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      // -------------------------------------
      const [
        userBalanceBeforeB,
        recipientBalanceBeforeB,
        vaultBalanceBeforeB,
        integratorBalanceBeforeB,
        routerBalanceBeforeB,
        userBalanceBeforeA,
        recipientBalanceBeforeA,
        vaultBalanceBeforeA,
        integratorBalanceBeforeA,
        routerBalanceBeforeA,
        mockTransferAddress2BalanceBeforeB,
      ] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenB.balanceOf(recipient.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(integrator2.address),
        tokenB.balanceOf(mockBridge.address),
        tokenA.balanceOf(user.address),
        tokenA.balanceOf(recipient.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator2.address),
        tokenA.balanceOf(mockBridge.address),
        tokenB.balanceOf(mockTransferAddress2.address),
      ])

      // -------------------------------------

      await expect(
        batchBridgeCallFacet
          .connect(user)
          .batchBridgeCall(
            transactionId,
            integratorAddress,
            [
              crossChainData1,
              crossChainData2,
              crossChainData3,
              genericCrossChainData1,
              genericCrossChainData2,
            ],
            [bridgeData1, bridgeData2, bridgeData3],
            [
              genericBridgeData1,
              genericBridgeData2,
              genericBridgeDataForTransfer1,
              genericBridgeDataForTransfer2,
            ],
            [transferData1, transferData2],
            {
              value,
            }
          )
      )
        .emit(batchBridgeCallFacet, EVENTS.BatchBridgeTransferStart)
        .changeEtherBalances(
          [
            user,
            recipient,
            protoFeeVault,
            integrator1,
            mockBridge,
            mockTransferAddress1,
          ],
          [
            convertBNToNegative(value.sub(extra)),
            minReturn[0].add(minReturn[2]).add(minReturn[3]),
            fixedNativeFeeAmount
              .add(tokenFeeData[0].dzapFee)
              .add(tokenFeeData[2].dzapFee)
              .add(tokenFeeData[3].dzapFee)
              .add(tokenFeeData[5].dzapFee),
            tokenFeeData[0].integratorFee
              .add(tokenFeeData[2].integratorFee)
              .add(tokenFeeData[3].integratorFee)
              .add(tokenFeeData[5].integratorFee),
            routerNativeFeeAmount
              .mul(5)
              .add(routerTokenFee[0])
              .add(routerTokenFee[2])
              .add(routerTokenFee[3]),
            amountWithoutFee[5],
          ]
        )

      const eventFilter =
        batchBridgeCallFacet.filters.BatchBridgeTransferStart()
      const data = await batchBridgeCallFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.bridgeData.length).eql(3)
      expect(args.genericBridgeData.length).eql(4)

      expect(args.bridgeData[0]).eql([
        bridgeData1.bridge,
        bridgeData1.from,
        bridgeData1.to,
        bridgeData1.receiver,
        bridgeData1.hasSourceSwaps,
        bridgeData1.hasDestinationCall,
        amountWithoutFee[0],
        bridgeData1.destinationChainId,
      ])

      expect(args.bridgeData[1]).eql([
        bridgeData2.bridge,
        bridgeData2.from,
        bridgeData2.to,
        bridgeData2.receiver,
        bridgeData2.hasSourceSwaps,
        bridgeData2.hasDestinationCall,
        amountWithoutFee[1],
        bridgeData2.destinationChainId,
      ])

      expect(args.bridgeData[2]).eql([
        bridgeData3.bridge,
        bridgeData3.from,
        bridgeData3.to,
        bridgeData3.receiver,
        bridgeData3.hasSourceSwaps,
        bridgeData3.hasDestinationCall,
        amountWithoutFee[2],
        bridgeData3.destinationChainId,
      ])

      expect(args.genericBridgeData[0]).eql([
        genericBridgeData1.bridge,
        ethers.utils.getAddress(genericBridgeData1.to).toLowerCase(),
        ethers.utils.getAddress(genericBridgeData1.receiver).toLowerCase(),
        genericBridgeData1.from,
        genericBridgeData1.hasSourceSwaps,
        genericBridgeData1.hasDestinationCall,
        amountWithoutFee[3],
        genericBridgeData1.destinationChainId,
      ])

      expect(args.genericBridgeData[1]).eql([
        genericBridgeData2.bridge,
        ethers.utils.getAddress(genericBridgeData2.to).toLowerCase(),
        ethers.utils.getAddress(genericBridgeData2.receiver).toLowerCase(),
        genericBridgeData2.from,
        genericBridgeData2.hasSourceSwaps,
        genericBridgeData2.hasDestinationCall,
        amountWithoutFee[4],
        genericBridgeData2.destinationChainId,
      ])

      expect(args.genericBridgeData[2]).eql([
        genericBridgeDataForTransfer1.bridge,
        ethers.utils.getAddress(genericBridgeDataForTransfer1.to).toLowerCase(),
        ethers.utils
          .getAddress(genericBridgeDataForTransfer1.receiver)
          .toLowerCase(),
        genericBridgeDataForTransfer1.from,
        genericBridgeDataForTransfer1.hasSourceSwaps,
        genericBridgeDataForTransfer1.hasDestinationCall,
        amountWithoutFee[5],
        genericBridgeDataForTransfer1.destinationChainId,
      ])

      expect(args.genericBridgeData[3]).eql([
        genericBridgeDataForTransfer2.bridge,
        ethers.utils.getAddress(genericBridgeDataForTransfer2.to).toLowerCase(),
        ethers.utils
          .getAddress(genericBridgeDataForTransfer2.receiver)
          .toLowerCase(),
        genericBridgeDataForTransfer2.from,
        genericBridgeDataForTransfer2.hasSourceSwaps,
        genericBridgeDataForTransfer2.hasDestinationCall,
        amountWithoutFee[6],
        genericBridgeDataForTransfer2.destinationChainId,
      ])

      // -------------------------------------

      const [
        userBalanceAfterB,
        recipientBalanceAfterB,
        vaultBalanceAfterB,
        integratorBalanceAfterB,
        routerBalanceAfterB,
        userBalanceAfterA,
        recipientBalanceAfterA,
        vaultBalanceAfterA,
        integratorBalanceAfterA,
        routerBalanceAfterA,
        mockTransferAddress2BalanceAfterB,
      ] = await Promise.all([
        tokenB.balanceOf(user.address),
        tokenB.balanceOf(recipient.address),
        tokenB.balanceOf(protoFeeVault.address),
        tokenB.balanceOf(integrator2.address),
        tokenB.balanceOf(mockBridge.address),
        tokenA.balanceOf(user.address),
        tokenA.balanceOf(recipient.address),
        tokenA.balanceOf(protoFeeVault.address),
        tokenA.balanceOf(integrator2.address),
        tokenA.balanceOf(mockBridge.address),
        tokenB.balanceOf(mockTransferAddress2.address),
      ])

      expect(userBalanceAfterB).equal(
        userBalanceBeforeB.sub(amounts[1].add(amounts[6]))
      )
      expect(recipientBalanceAfterB).equal(
        recipientBalanceBeforeB.add(minReturn[1])
      )
      expect(vaultBalanceAfterB).equal(
        vaultBalanceBeforeB
          .add(tokenFeeData[1].dzapFee)
          .add(tokenFeeData[6].dzapFee)
      )
      expect(integratorBalanceAfterB).equal(
        integratorBalanceBeforeB
          .add(tokenFeeData[1].integratorFee)
          .add(tokenFeeData[6].integratorFee)
      )
      expect(routerBalanceAfterB).equal(
        routerBalanceBeforeB.add(routerTokenFee[1])
      )
      expect(mockTransferAddress2BalanceAfterB).equal(
        mockTransferAddress2BalanceBeforeB.add(amountWithoutFee[6])
      )

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[4]))
      expect(recipientBalanceAfterA).equal(
        recipientBalanceBeforeA.add(minReturn[4])
      )
      expect(vaultBalanceAfterA).equal(
        vaultBalanceBeforeA.add(tokenFeeData[4].dzapFee)
      )
      expect(integratorBalanceAfterA).equal(
        integratorBalanceBeforeA.add(tokenFeeData[4].integratorFee)
      )
      expect(routerBalanceAfterA).equal(
        routerBalanceBeforeA.add(routerTokenFee[4])
      )
    })
  })
})
