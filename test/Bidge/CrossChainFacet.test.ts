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
  ADDRESS_ZERO,
  BPS_DENOMINATOR,
} from '../../constants'
import { convertBNToNegative, snapshot, updateBalance } from '../utils'
import {
  getFeeData,
  encodePermitData,
  calculateOffset,
  getRevertMsg,
} from '../../scripts/core/helper'
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
} from '../../typechain-types'
import {
  DiamondCut,
  FacetCutAction,
  FeeInfo,
  FeeType,
  PermitType,
} from '../../types'
import { DEFAULT_BYTES } from '../../constants/others'

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

const validateMultiBridgeEventData = (
  eventBridgeData,
  bridgeData,
  minAmountIn
) => {
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

describe('CrossChainFacet.test.ts', async () => {
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

  beforeEach(async () => {
    await snapshot.revert(snapshotId)
  })

  describe('1) bridge', async () => {
    const destinationChainId = 56

    beforeEach(async () => {
      const parameterTypes1 = ['address', 'address', 'uint256']
      const parameterTypes2 = ['address', 'address', 'uint256', 'bytes']
      const parameterIndex = 2 // amount position

      const parameters1 = [ADDRESS_ZERO, ADDRESS_ZERO, ZERO]
      const parameters2 = [ADDRESS_ZERO, ADDRESS_ZERO, ZERO, DEFAULT_BYTES]

      const { offsetByBytes: offsetByBytes1 } = calculateOffset(
        parameterIndex,
        parameterTypes1,
        parameters1
      )
      const { offsetByBytes: offsetByBytes2 } = calculateOffset(
        parameterIndex,
        parameterTypes2,
        parameters2
      )

      const selectors = getSighash(
        [
          mockBridge.interface.functions[
            'bridge(address,address,uint256,bool)'
          ],
          mockBridge.interface.functions[
            'bridgeAndSwap(address,address,uint256,bytes,bool)'
          ],
        ],
        mockBridge.interface
      )

      const selectorInfo = [
        BigNumber.from(offsetByBytes1),
        BigNumber.from(offsetByBytes2),
      ]

      const routers = [mockBridge.address, mockBridge.address]

      await bridgeManagerFacet
        .connect(crossChainManager)
        .updateSelectorInfo(routers, selectors, selectorInfo)
    })

    it('1.1 Should allow user to bridge token from one chain to other chain', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10')]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      const bridgeData = {
        bridge: 'TestBridge',
        from: DZAP_NATIVE,
        to: DZAP_NATIVE,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const genericData = {
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

      const value = amounts[0]
        .add(fixedNativeFeeAmount)
        .add(routerNativeFeeAmount)

      const routerTokenFee = amountWithoutFee[0]
        .mul(routerFeePercent)
        .div(BPS_DENOMINATOR)

      const minReturn = amountWithoutFee[0].sub(routerTokenFee)

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value,
          })
      )
        .emit(crossChainFacet, EVENTS.BridgeTransferStarted)
        .withArgs(transactionId, integratorAddress, user.address, [
          bridgeData.bridge,
          bridgeData.from,
          bridgeData.to,
          bridgeData.receiver,
          amountWithoutFee[0],
          bridgeData.destinationChainId,
          bridgeData.hasSourceSwaps,
          bridgeData.hasDestinationCall,
        ])
        .changeEtherBalances(
          [user, recipient, protoFeeVault, mockBridge, integrator1],
          [
            convertBNToNegative(value),
            minReturn,
            tokenFeeData[0].totalFee.add(fixedNativeFeeAmount),
            routerTokenFee.add(routerNativeFeeAmount),
            ZERO,
          ]
        )
    })

    it('1.2 Should allow user to bridge token from one chain to other chain, and refund extra native', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const {
        amountWithoutFee,
        fixedNativeFeeAmount,
        tokenFeeData,
        fixedNativeData,
      } = await getFeeData(
        swapFacet.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const genericData = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      const extra = parseUnits('.3')
      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount).add(extra)

      const routerTokenFee = amountWithoutFee[0]
        .mul(routerFeePercent)
        .div(BPS_DENOMINATOR)

      const minReturn = amountWithoutFee[0].sub(routerTokenFee)

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
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value,
          })
      )
        .emit(crossChainFacet, EVENTS.BridgeTransferStarted)
        .withArgs(transactionId, integratorAddress, user.address, [
          bridgeData.bridge,
          bridgeData.from,
          bridgeData.to,
          bridgeData.receiver,
          amountWithoutFee[0],
          bridgeData.destinationChainId,
          bridgeData.hasSourceSwaps,
          bridgeData.hasDestinationCall,
        ])
        .changeEtherBalances(
          [user, integrator2, protoFeeVault, mockBridge],
          [
            convertBNToNegative(value.sub(extra)),
            fixedNativeData.integratorNativeFeeAmount,
            fixedNativeData.dzapNativeFeeAmount,
            routerNativeFeeAmount,
          ]
        )

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

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[0]))
      expect(recipientBalanceAfterA).equal(
        recipientBalanceBeforeA.add(minReturn)
      )
      expect(vaultBalanceAfterA).equal(
        vaultBalanceBeforeA.add(tokenFeeData[0].dzapFee)
      )
      expect(integratorBalanceAfterA).equal(
        integratorBalanceBeforeA.add(tokenFeeData[0].integratorFee)
      )
      expect(routerBalanceAfterA).equal(
        routerBalanceBeforeA.add(routerTokenFee)
      )
    })

    it('1.3 Should allow user to bridge token from one chain to other chain (give leftover swap return amount)', async () => {
      await bridgeManagerFacet
        .connect(crossChainManager)
        .updateSelectorInfo(
          [mockBridge.address],
          getSighash(
            [
              mockBridge.interface.functions[
                'bridge(address,address,uint256,bool)'
              ],
            ],
            mockBridge.interface
          ),
          [ZERO]
        )

      // -------------------------------------

      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const genericData = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      // -------------------------------------

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      const routerTokenFee = amountWithoutFee[0]
        .mul(routerFeePercent)
        .div(BPS_DENOMINATOR)

      const minReturn = amountWithoutFee[0].sub(routerTokenFee)

      // -------------------------------------

      const integratorBalanceBeforeN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultBeforeN = await ethers.provider.getBalance(
        protoFeeVault.address
      )

      const routerBeforeN = await ethers.provider.getBalance(mockBridge.address)

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value,
          })
      )
        .emit(crossChainFacet, EVENTS.BridgeTransferStarted)
        .withArgs(transactionId, integratorAddress, user.address, refundee, [
          bridgeData.bridge,
          bridgeData.from,
          bridgeData.to,
          bridgeData.receiver,
          amountWithoutFee[0],
          bridgeData.destinationChainId,
          bridgeData.hasSourceSwaps,
          bridgeData.hasDestinationCall,
        ])
        .changeTokenBalances(
          tokenA,
          [user, recipient, protoFeeVault, mockBridge],
          [
            convertBNToNegative(amounts[0]),
            minReturn,
            tokenFeeData[0].totalFee,
            routerTokenFee,
          ]
        )

      // -------------------------------------

      const integratorBalanceAfterN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultAfterN = await ethers.provider.getBalance(
        protoFeeVault.address
      )
      const routerAfterN = await ethers.provider.getBalance(mockBridge.address)

      expect(integratorBalanceAfterN).equal(integratorBalanceBeforeN.add(ZERO))
      expect(protoFeeVaultAfterN).equal(
        protoFeeVaultBeforeN.add(fixedNativeFeeAmount)
      )
      expect(routerAfterN).equal(routerBeforeN.add(routerNativeFeeAmount))
    })

    it('1.4 Should revert if amount is zero', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const genericData = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amounts[0],
            false
          )
        ).data as string,
      }

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      bridgeData.minAmountIn = ZERO

      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value,
          })
      ).revertedWithCustomError(crossChainFacet, ERRORS.InvalidAmount)
    })

    it('1.6 Should revert if destination chainId is same', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const genericData = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      bridgeData.destinationChainId = (
        await ethers.provider.getNetwork()
      ).chainId

      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value,
          })
      ).revertedWithCustomError(
        crossChainFacet,
        ERRORS.CannotBridgeToSameNetwork
      )
    })

    it('1.7 Should revert if it has source or dst swap', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const genericData = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      bridgeData.hasSourceSwaps = false
      bridgeData.hasDestinationCall = true

      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value,
          })
      ).revertedWithCustomError(crossChainFacet, ERRORS.InformationMismatch)

      bridgeData.hasSourceSwaps = true
      bridgeData.hasDestinationCall = false
      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value,
          })
      ).revertedWithCustomError(crossChainFacet, ERRORS.InformationMismatch)

      bridgeData.hasSourceSwaps = true
      bridgeData.hasDestinationCall = true
      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value,
          })
      ).revertedWithCustomError(crossChainFacet, ERRORS.InformationMismatch)
    })

    it('1.8 Should revert if callTo is not a contract', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const genericData = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      genericData.callTo = signers[12].address

      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value,
          })
      ).revertedWithCustomError(crossChainFacet, ERRORS.NotAContract)
    })

    it('1.9 Should revert if callTo is not authorized', async () => {
      {
        await bridgeManagerFacet
          .connect(crossChainManager)
          .removeAggregatorsAndBridges([mockBridge.address])
      }

      // -------------------------------------
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const genericData = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value,
          })
      )
        .revertedWithCustomError(crossChainFacet, ERRORS.UnAuthorizedCall)
        .withArgs(mockBridge.address)
    })

    it('1.10 Should revert if router call fails', async () => {
      // -------------------------------------
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const genericData = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amountWithoutFee[0],
            true
          )
        ).data as string,
      }

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value,
          })
      )
        .revertedWithCustomError(crossChainFacet, ERRORS.BridgeCallFailed)
        .withArgs(mockBridge.interface.getSighash('BridgeCallFailedFromRouter'))
    })

    it('1.11 Should revert if user has not transfer correct amount of native tokens', async () => {
      // -------------------------------------
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = {
        bridge: 'TestBridge',
        from: tokenA.address,
        to: tokenA.address,
        receiver: recipient.address,
        minAmountIn: amounts[0],
        destinationChainId: destinationChainId,
        hasSourceSwaps: false,
        hasDestinationCall: false,
      }

      const genericData = {
        callTo: mockBridge.address,
        approveTo: mockBridge.address,
        extraNative: routerNativeFeeAmount,
        permit: encodePermitData('0x', PermitType.PERMIT),
        callData: (
          await mockBridge.populateTransaction.bridge(
            recipient.address,
            tokenA.address,
            amountWithoutFee[0],
            false
          )
        ).data as string,
      }

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value: routerNativeFeeAmount,
          })
      ).reverted

      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value: fixedNativeFeeAmount,
          })
      ).reverted

      await expect(
        crossChainFacet
          .connect(user)
          .bridge(transactionId, integratorAddress, bridgeData, genericData, {
            value: fixedNativeFeeAmount.add(routerNativeFeeAmount).sub(1),
          })
      ).reverted
    })
  })

  describe('2) bridgeMultipleTokens', async () => {
    const destinationChainId = 56
    const destinationChainId2 = 10

    beforeEach(async () => {
      const parameterTypes1 = ['address', 'address', 'uint256']
      const parameterTypes2 = ['address', 'address', 'uint256', 'bytes']
      const parameterIndex = 2 // amount position

      const parameters1 = [ADDRESS_ZERO, ADDRESS_ZERO, ZERO]
      const parameters2 = [ADDRESS_ZERO, ADDRESS_ZERO, ZERO, DEFAULT_BYTES]

      const { offsetByBytes: offsetByBytes1 } = calculateOffset(
        parameterIndex,
        parameterTypes1,
        parameters1
      )
      const { offsetByBytes: offsetByBytes2 } = calculateOffset(
        parameterIndex,
        parameterTypes2,
        parameters2
      )

      const selectors = getSighash(
        [
          mockBridge.interface.functions[
            'bridge(address,address,uint256,bool)'
          ],
          mockBridge.interface.functions[
            'bridgeAndSwap(address,address,uint256,bytes,bool)'
          ],
        ],
        mockBridge.interface
      )

      const selectorInfo = [
        BigNumber.from(offsetByBytes1),
        BigNumber.from(offsetByBytes2),
      ]

      const routers = [mockBridge.address, mockBridge.address]

      await bridgeManagerFacet
        .connect(crossChainManager)
        .updateSelectorInfo(routers, selectors, selectorInfo)
    })

    it('2.1 Should allow user to bridge multiple token from one chain to other chain', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('10', TOKEN_A_DECIMAL),
        parseUnits('50', TOKEN_B_DECIMAL),
      ]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      await tokenB.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenB
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenB.address,
          to: tokenB.address,
          receiver: recipient.address,
          minAmountIn: amounts[1],
          destinationChainId: destinationChainId2,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amountWithoutFee[0],
              false
            )
          ).data as string,
        },
        {
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
        },
      ]

      // -------------------------------------

      const value = fixedNativeFeeAmount
        .add(routerNativeFeeAmount)
        .add(routerNativeFeeAmount)

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[1].mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        amountWithoutFee[1].sub(routerTokenFee[1]),
      ]

      // -------------------------------------

      const integratorBalanceBeforeN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultBeforeN = await ethers.provider.getBalance(
        protoFeeVault.address
      )
      const routerBeforeN = await ethers.provider.getBalance(mockBridge.address)

      const recipientBeforeB = await tokenB.balanceOf(recipient.address)
      const integratorBalanceBeforeB = await tokenB.balanceOf(integratorAddress)
      const protoFeeVaultBeforeB = await tokenB.balanceOf(protoFeeVault.address)

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value,
            }
          )
      )
        .emit(crossChainFacet, EVENTS.MultiTokenBridgeTransferStarted)
        .changeTokenBalances(
          tokenA,
          [user, recipient, protoFeeVault, mockBridge],
          [
            convertBNToNegative(amounts[0]),
            minReturn[0],
            tokenFeeData[0].totalFee,
            routerTokenFee[0],
          ]
        )

      // -------------------------------------

      const eventFilter =
        crossChainFacet.filters.MultiTokenBridgeTransferStarted()
      const data = await crossChainFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.sender).equal(user.address)
      // expect(args.refundee).equal(refundee.address)

      validateMultiBridgeEventData(
        args.bridgeData[0],
        bridgeData[0],
        amountWithoutFee[0]
      )

      validateMultiBridgeEventData(
        args.bridgeData[1],
        bridgeData[1],
        amountWithoutFee[1]
      )

      // -------------------------------------

      const integratorBalanceAfterN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultAfterN = await ethers.provider.getBalance(
        protoFeeVault.address
      )
      const routerAfterN = await ethers.provider.getBalance(mockBridge.address)

      const recipientAfterB = await tokenB.balanceOf(recipient.address)
      const integratorBalanceAfterB = await tokenB.balanceOf(integratorAddress)
      const protoFeeVaultAfterB = await tokenB.balanceOf(protoFeeVault.address)

      expect(recipientAfterB).equal(recipientBeforeB.add(minReturn[1]))
      expect(integratorBalanceAfterB).equal(integratorBalanceBeforeB.add(ZERO))
      expect(protoFeeVaultAfterB).equal(
        protoFeeVaultBeforeB.add(tokenFeeData[1].totalFee)
      )

      expect(integratorBalanceAfterN).equal(integratorBalanceBeforeN.add(ZERO))
      expect(protoFeeVaultAfterN).equal(
        protoFeeVaultBeforeN.add(fixedNativeFeeAmount)
      )
      expect(routerAfterN).equal(
        routerBeforeN.add(routerNativeFeeAmount).mul(2)
      )
    })

    it('2.2 Should allow user to bridge multiple token from one chain to other chain, and refund extra native', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL), parseUnits('50')]

      const {
        amountWithoutFee,
        fixedNativeFeeAmount,
        tokenFeeData,
        fixedNativeData,
      } = await getFeeData(
        swapFacet.address,
        integratorAddress,
        amounts,
        FeeType.BRIDGE
      )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // await tokenB.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      // await tokenB
      //   .connect(user)
      //   .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: DZAP_NATIVE,
          to: DZAP_NATIVE,
          receiver: recipient.address,
          minAmountIn: amounts[1],
          destinationChainId: destinationChainId2,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amountWithoutFee[0],
              false
            )
          ).data as string,
        },
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              DZAP_NATIVE,
              amountWithoutFee[1],
              false
            )
          ).data as string,
        },
      ]

      // -------------------------------------

      const extra = parseUnits('.7')
      const value = amounts[1]
        .add(fixedNativeFeeAmount)
        .add(routerNativeFeeAmount)
        .add(routerNativeFeeAmount)
        .add(extra)

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[1].mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        amountWithoutFee[1].sub(routerTokenFee[1]),
      ]

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
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value,
            }
          )
      )
        .emit(crossChainFacet, EVENTS.MultiTokenBridgeTransferStarted)
        .changeEtherBalances(
          [user, recipient, integrator2, protoFeeVault, mockBridge],
          [
            convertBNToNegative(value.sub(extra)),
            minReturn[1],
            fixedNativeData.integratorNativeFeeAmount.add(
              tokenFeeData[1].integratorFee
            ),
            fixedNativeData.dzapNativeFeeAmount.add(tokenFeeData[1].dzapFee),
            routerNativeFeeAmount.mul(2).add(routerTokenFee[1]),
          ]
        )

      // -------------------------------------

      const eventFilter =
        crossChainFacet.filters.MultiTokenBridgeTransferStarted()
      const data = await crossChainFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.sender).equal(user.address)

      validateMultiBridgeEventData(
        args.bridgeData[0],
        bridgeData[0],
        amountWithoutFee[0]
      )

      validateMultiBridgeEventData(
        args.bridgeData[1],
        bridgeData[1],
        amountWithoutFee[1]
      )

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

      expect(userBalanceAfterA).equal(userBalanceBeforeA.sub(amounts[0]))
      expect(recipientBalanceAfterA).equal(
        recipientBalanceBeforeA.add(minReturn[0])
      )
      expect(vaultBalanceAfterA).equal(
        vaultBalanceBeforeA.add(tokenFeeData[0].dzapFee)
      )
      expect(integratorBalanceAfterA).equal(
        integratorBalanceBeforeA.add(tokenFeeData[0].integratorFee)
      )
      expect(routerBalanceAfterA).equal(
        routerBalanceBeforeA.add(routerTokenFee[0])
      )
    })

    it('2.4 Should revert if amount is zero', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              // amountWithoutFee[0]
              amounts[0],
              false
            )
          ).data as string,
        },
      ]

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      bridgeData[0].minAmountIn = ZERO

      await expect(
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value,
            }
          )
      ).revertedWithCustomError(crossChainFacet, ERRORS.InvalidAmount)
    })

    it('2.5 Should revert if destination chainId is same', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              // amountWithoutFee[0]
              amounts[0],
              false
            )
          ).data as string,
        },
      ]

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      bridgeData[0].destinationChainId = (
        await ethers.provider.getNetwork()
      ).chainId

      await expect(
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        crossChainFacet,
        ERRORS.CannotBridgeToSameNetwork
      )
    })

    it('2.6 Should revert if it has source or dst swap', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              // amountWithoutFee[0]
              amounts[0],
              false
            )
          ).data as string,
        },
      ]

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      bridgeData[0].hasSourceSwaps = false
      bridgeData[0].hasDestinationCall = true

      await expect(
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value,
            }
          )
      ).revertedWithCustomError(crossChainFacet, ERRORS.InformationMismatch)

      bridgeData[0].hasSourceSwaps = true
      bridgeData[0].hasDestinationCall = false
      await expect(
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value,
            }
          )
      ).revertedWithCustomError(crossChainFacet, ERRORS.InformationMismatch)

      bridgeData[0].hasSourceSwaps = true
      bridgeData[0].hasDestinationCall = true
      await expect(
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value,
            }
          )
      ).revertedWithCustomError(crossChainFacet, ERRORS.InformationMismatch)
    })

    it('2.7 Should revert if callTo is not a contract', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              // amountWithoutFee[0]
              amounts[0],
              false
            )
          ).data as string,
        },
      ]

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      genericData[0].callTo = signers[12].address

      await expect(
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value,
            }
          )
      ).revertedWithCustomError(crossChainFacet, ERRORS.NotAContract)
    })

    it('2.8 Should revert if callTo is not authorized', async () => {
      {
        await bridgeManagerFacet
          .connect(crossChainManager)
          .removeAggregatorsAndBridges([mockBridge.address])
      }

      // -------------------------------------
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]
      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              // amountWithoutFee[0]
              amounts[0],
              false
            )
          ).data as string,
        },
      ]

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value,
            }
          )
      ).revertedWithCustomError(crossChainFacet, ERRORS.UnAuthorizedCall)
    })

    it('2.9 Should revert if even a single router call fails', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('10', TOKEN_A_DECIMAL),
        parseUnits('50', TOKEN_B_DECIMAL),
      ]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      await tokenB.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenB
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenB.address,
          to: tokenB.address,
          receiver: recipient.address,
          minAmountIn: amounts[1],
          destinationChainId: destinationChainId2,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              // amountWithoutFee[0]
              amounts[0],
              true
            )
          ).data as string,
        },
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenB.address,
              amounts[1],
              false
            )
          ).data as string,
        },
      ]

      const value = fixedNativeFeeAmount
        .add(routerNativeFeeAmount)
        .add(routerNativeFeeAmount)

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value,
            }
          )
      )
        .revertedWithCustomError(crossChainFacet, ERRORS.BridgeCallFailed)
        .withArgs(mockBridge.interface.getSighash('BridgeCallFailedFromRouter'))
    })

    it('2.10 Should revert if user has not transfer correct amount of native tokens', async () => {
      // -------------------------------------
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // tokenA to TokenA
      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]
      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              // amountWithoutFee[0]
              amounts[0],
              false
            )
          ).data as string,
        },
      ]

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value: routerNativeFeeAmount,
            }
          )
      ).reverted

      await expect(
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value: fixedNativeFeeAmount,
            }
          )
      ).reverted

      await expect(
        crossChainFacet
          .connect(user)
          .bridgeMultipleTokens(
            transactionId,
            integratorAddress,
            bridgeData,
            genericData,
            {
              value: fixedNativeFeeAmount.add(routerNativeFeeAmount).sub(1),
            }
          )
      ).reverted
    })
  })

  describe('3) swapAndBridge', async () => {
    const destinationChainId = 56
    const destinationChainId2 = 10

    beforeEach(async () => {
      // bridge
      {
        const parameterTypes1 = ['address', 'address', 'uint256', 'bool']
        const parameterTypes2 = [
          'address',
          'address',
          'uint256',
          'bytes',
          'bool',
        ]
        const parameterTypes3 = [
          'address',
          'address',
          'uint256',
          'bytes',
          'bool',
        ]
        const parameterIndex = 2 // amount position

        const parameters1 = [ADDRESS_ZERO, ADDRESS_ZERO, ZERO, false]
        const parameters2 = [
          ADDRESS_ZERO,
          ADDRESS_ZERO,
          ZERO,
          DEFAULT_BYTES,
          false,
        ]
        // const parameters3 = [
        //   ADDRESS_ZERO,
        //   ADDRESS_ZERO,
        //   ZERO,
        //   DEFAULT_BYTES,
        //   false,
        // ]

        const { offsetByBytes: offsetByBytes1 } = calculateOffset(
          parameterIndex,
          parameterTypes1,
          parameters1
        )
        const { offsetByBytes: offsetByBytes2 } = calculateOffset(
          parameterIndex,
          parameterTypes2,
          parameters2
        )
        // const { offsetByBytes: offsetByBytes3 } = calculateOffset(
        //   parameterIndex,
        //   parameterTypes2,
        //   parameters2
        // )

        const selectors = getSighash(
          [
            mockBridge.interface.functions[
              'bridge(address,address,uint256,bool)'
            ],
            mockBridge.interface.functions[
              'bridgeAndSwap(address,address,uint256,bytes,bool)'
            ],
            mockBridge.interface.functions[
              'sendCallToReceiver(address,address,uint256,bytes,bool)'
            ],
          ],
          mockBridge.interface
        )

        const selectorInfo = [
          BigNumber.from(offsetByBytes1),
          BigNumber.from(offsetByBytes2),
          ZERO,
        ]

        const routers = [
          mockBridge.address,
          mockBridge.address,
          mockBridge.address,
        ]

        await bridgeManagerFacet
          .connect(crossChainManager)
          .updateSelectorInfo(routers, selectors, selectorInfo)
      }

      // -------------------
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

        await dexManagerFacet
          .connect(dexManager)
          .batchSetFunctionApprovalBySignature(dexs, selectors, approval)
      }
    })

    it('3.1 Should allow user to swap src token then bridge them to destination chain', async () => {
      const rate = await mockExchange.rate()
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      // const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('10', TOKEN_A_DECIMAL),
        parseUnits('50', TOKEN_A_DECIMAL),
      ]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        TOKEN_B_DECIMAL
      )

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenB.address,
          to: tokenB.address,
          receiver: recipient.address,
          minAmountIn: swapReturnAmount,
          destinationChainId: destinationChainId2,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amountWithoutFee[0],
              false
            )
          ).data as string,
        },
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenB.address,
              swapReturnAmount,
              false
            )
          ).data as string,
        },
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: swapReturnAmount,
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

      // -------------------------------------

      const value = fixedNativeFeeAmount
        .add(routerNativeFeeAmount)
        .add(routerNativeFeeAmount)

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        swapReturnAmount.mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        swapReturnAmount.sub(routerTokenFee[1]),
      ]

      // -------------------------------------
      // native
      const integratorBalanceBeforeN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultBeforeN = await ethers.provider.getBalance(
        protoFeeVault.address
      )

      const routerBeforeN = await ethers.provider.getBalance(mockBridge.address)
      // const refundeeBeforeN = await ethers.provider.getBalance(refundee.address)

      // tokenB
      const routersBeforeB = await tokenB.balanceOf(mockBridge.address)
      const recipientBeforeB = await tokenB.balanceOf(recipient.address)

      // -------------------------------------
      // tokenA
      // tokenA -> tokenB

      await expect(
        crossChainFacet
          .connect(user)
          .swapAndBridge(
            transactionId,
            integratorAddress,
            bridgeData,
            swapData,
            genericData,
            {
              value,
            }
          )
      ).emit(crossChainFacet, EVENTS.SwapBridgeTransferStarted)

      // .changeTokenBalances(
      //   tokenA,
      //   [user, refundee, recipient, protoFeeVault, integrator1, mockBridge],
      //   [
      //     convertBNToNegative(amounts[0].add(amounts[1])),
      //     ZERO,
      //     minReturn[0],
      //     tokenFeeData[0].totalFee.add(tokenFeeData[1].totalFee),
      //     ZERO,
      //     routerTokenFee[0],
      //   ]
      // )

      // -------------------------------------

      const integratorBalanceAfterN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultAfterN = await ethers.provider.getBalance(
        protoFeeVault.address
      )
      const routerAfterN = await ethers.provider.getBalance(mockBridge.address)
      // const refundeeAfterN = await ethers.provider.getBalance(refundee.address)

      const routersAfterB = await tokenB.balanceOf(mockBridge.address)
      const recipientAfterB = await tokenB.balanceOf(recipient.address)

      expect(integratorBalanceAfterN).equal(integratorBalanceBeforeN.add(ZERO))
      expect(protoFeeVaultAfterN).equal(
        protoFeeVaultBeforeN.add(fixedNativeFeeAmount)
      )
      expect(routerAfterN).equal(
        routerBeforeN.add(routerNativeFeeAmount.mul(2))
      )
      // expect(refundeeAfterN).equal(refundeeBeforeN)

      expect(routersAfterB).equal(routersBeforeB.add(routerTokenFee[1]))
      expect(recipientAfterB).equal(recipientBeforeB.add(minReturn[1]))

      // -------------------------------------

      const eventFilter = crossChainFacet.filters.SwapBridgeTransferStarted()
      const data = await crossChainFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.sender).equal(user.address)
      // expect(args.refundee).equal(refundee.address)

      validateMultiBridgeEventData(
        args.bridgeData[0],
        bridgeData[0],
        amountWithoutFee[0]
      )

      validateMultiBridgeEventData(
        args.bridgeData[1],
        bridgeData[1],
        swapReturnAmount
      )

      expect(args.swapInfo[0]).eql([
        swapData[0].callTo,
        swapData[0].from,
        swapData[0].to,
        swapData[0].fromAmount,
        ZERO,
        swapReturnAmount,
      ])
    })

    it('3.2 Should allow user to swap src token then bridge them to destination chain (refund extra return amount)', async () => {
      const rate = await mockExchange.rate()
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      await bridgeManagerFacet
        .connect(crossChainManager)
        .updateSelectorInfo(
          [mockBridge.address],
          getSighash(
            [
              mockBridge.interface.functions[
                'bridge(address,address,uint256,bool)'
              ],
            ],
            mockBridge.interface
          ),
          [0]
        )

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      // const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('10', TOKEN_A_DECIMAL),
        parseUnits('50', TOKEN_A_DECIMAL),
      ]
      // const leftOver = [parseUnits('2', TOKEN_A_DECIMAL), ZERO]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

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

      const bridgeData = [
        {
          bridge: 'TestBridge1',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenB.address,
          to: tokenB.address,
          receiver: recipient.address,
          minAmountIn: minSwapReturnAmount,
          destinationChainId: destinationChainId2,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amountWithoutFee[0],
              false
            )
          ).data as string,
        },
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenB.address,
              minSwapReturnAmount,
              false
            )
          ).data as string,
        },
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: swapReturnAmount,
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

      // -------------------------------------

      const value = fixedNativeFeeAmount
        .add(routerNativeFeeAmount)
        .add(routerNativeFeeAmount)

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        minSwapReturnAmount.mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        minSwapReturnAmount.sub(routerTokenFee[1]),
      ]

      // -------------------------------------
      // native
      const integratorBalanceBeforeN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultBeforeN = await ethers.provider.getBalance(
        protoFeeVault.address
      )

      const routerBeforeN = await ethers.provider.getBalance(mockBridge.address)
      // const refundeeBeforeN = await ethers.provider.getBalance(refundee.address)

      // tokenB
      const routersBeforeB = await tokenB.balanceOf(mockBridge.address)
      const recipientBeforeB = await tokenB.balanceOf(recipient.address)
      const userBeforeB = await tokenB.balanceOf(user.address)

      // -------------------------------------
      // tokenA
      // tokenA -> tokenB

      await expect(
        crossChainFacet
          .connect(user)
          .swapAndBridge(
            transactionId,
            integratorAddress,
            bridgeData,
            swapData,
            genericData,
            {
              value,
            }
          )
      ).emit(crossChainFacet, EVENTS.SwapBridgeTransferStarted)

      // -------------------------------------

      const integratorBalanceAfterN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultAfterN = await ethers.provider.getBalance(
        protoFeeVault.address
      )
      const routerAfterN = await ethers.provider.getBalance(mockBridge.address)

      const routersAfterB = await tokenB.balanceOf(mockBridge.address)
      const recipientAfterB = await tokenB.balanceOf(recipient.address)
      const userAfterB = await tokenB.balanceOf(user.address)

      expect(integratorBalanceAfterN).equal(integratorBalanceBeforeN.add(ZERO))
      expect(protoFeeVaultAfterN).equal(
        protoFeeVaultBeforeN.add(fixedNativeFeeAmount)
      )
      expect(routerAfterN).equal(
        routerBeforeN.add(routerNativeFeeAmount.mul(2))
      )

      expect(userAfterB).equal(
        userBeforeB.add(swapReturnAmount.sub(minSwapReturnAmount))
      )
      expect(recipientAfterB).equal(recipientBeforeB.add(minReturn[1]))
      expect(recipientAfterB).equal(recipientBeforeB.add(minReturn[1]))

      // -------------------------------------

      const eventFilter = crossChainFacet.filters.SwapBridgeTransferStarted()
      const data = await crossChainFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.swapInfo[0]).eql([
        swapData[0].callTo,
        swapData[0].from,
        swapData[0].to,
        swapData[0].fromAmount,
        ZERO,
        swapReturnAmount,
      ])

      validateMultiBridgeEventData(
        args.bridgeData[0],
        bridgeData[0],
        amountWithoutFee[0]
      )

      validateMultiBridgeEventData(
        args.bridgeData[1],
        bridgeData[1],
        minSwapReturnAmount
      )
    })

    it('3.3 Should allow user to swap src token then bridge them to destination chain (replace offset)', async () => {
      const rate = await mockExchange.rate()
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      // const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('10', TOKEN_A_DECIMAL),
        parseUnits('50', TOKEN_A_DECIMAL),
      ]
      // const leftOver = [parseUnits('2', TOKEN_A_DECIMAL), ZERO]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        TOKEN_B_DECIMAL
      )
      const tempSwapReturnAmount = swapReturnAmount.sub(
        parseUnits('1', TOKEN_B_DECIMAL)
      )

      const bridgeData = [
        {
          bridge: 'TestBridge1',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenB.address,
          to: tokenB.address,
          receiver: recipient.address,
          minAmountIn: tempSwapReturnAmount,
          destinationChainId: destinationChainId2,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amountWithoutFee[0],
              false
            )
          ).data as string,
        },
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenB.address,
              tempSwapReturnAmount,
              false
            )
          ).data as string,
        },
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: swapReturnAmount,
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

      // -------------------------------------

      const value = fixedNativeFeeAmount
        .add(routerNativeFeeAmount)
        .add(routerNativeFeeAmount)

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        swapReturnAmount.mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        swapReturnAmount.sub(routerTokenFee[1]),
      ]

      // -------------------------------------
      // native
      const integratorBalanceBeforeN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultBeforeN = await ethers.provider.getBalance(
        protoFeeVault.address
      )

      const routerBeforeN = await ethers.provider.getBalance(mockBridge.address)
      // const refundeeBeforeN = await ethers.provider.getBalance(refundee.address)

      // tokenB
      const routersBeforeB = await tokenB.balanceOf(mockBridge.address)
      const recipientBeforeB = await tokenB.balanceOf(recipient.address)
      const userBeforeB = await tokenB.balanceOf(user.address)

      // -------------------------------------
      // tokenA
      // tokenA -> tokenB

      await expect(
        crossChainFacet
          .connect(user)
          .swapAndBridge(
            transactionId,
            integratorAddress,
            bridgeData,
            swapData,
            genericData,
            {
              value,
            }
          )
      ).emit(crossChainFacet, EVENTS.SwapBridgeTransferStarted)

      // -------------------------------------

      const integratorBalanceAfterN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultAfterN = await ethers.provider.getBalance(
        protoFeeVault.address
      )
      const routerAfterN = await ethers.provider.getBalance(mockBridge.address)

      const routersAfterB = await tokenB.balanceOf(mockBridge.address)
      const recipientAfterB = await tokenB.balanceOf(recipient.address)
      const userAfterB = await tokenB.balanceOf(user.address)

      expect(integratorBalanceAfterN).equal(integratorBalanceBeforeN.add(ZERO))
      expect(protoFeeVaultAfterN).equal(
        protoFeeVaultBeforeN.add(fixedNativeFeeAmount)
      )
      expect(routerAfterN).equal(
        routerBeforeN.add(routerNativeFeeAmount.mul(2))
      )

      expect(userAfterB).equal(userBeforeB)
      expect(recipientAfterB).equal(recipientBeforeB.add(minReturn[1]))
      expect(recipientAfterB).equal(recipientBeforeB.add(minReturn[1]))

      // -------------------------------------

      const eventFilter = crossChainFacet.filters.SwapBridgeTransferStarted()
      const data = await crossChainFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.swapInfo[0]).eql([
        swapData[0].callTo,
        swapData[0].from,
        swapData[0].to,
        swapData[0].fromAmount,
        ZERO,
        swapReturnAmount,
      ])

      validateMultiBridgeEventData(
        args.bridgeData[0],
        bridgeData[0],
        amountWithoutFee[0]
      )

      validateMultiBridgeEventData(
        args.bridgeData[1],
        bridgeData[1],
        swapReturnAmount
      )
    })

    it('3.4 Should allow user to bridge token to destination chain then swap them on dst chain', async () => {
      const rate = await mockExchange.rate()
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('10', TOKEN_A_DECIMAL),
        parseUnits('50', TOKEN_A_DECIMAL),
      ]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------

      const value = fixedNativeFeeAmount
        .add(routerNativeFeeAmount)
        .add(routerNativeFeeAmount)

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        amountWithoutFee[1].mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        amountWithoutFee[1].sub(routerTokenFee[1]),
      ]

      const swapReturnAmount = parseUnits(
        formatUnits(
          minReturn[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        TOKEN_B_DECIMAL
      )

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[1],
          destinationChainId: destinationChainId2,
          hasSourceSwaps: false,
          hasDestinationCall: true,
        },
      ]

      const swapDataDst = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: minReturn[1],
          minToAmount: swapReturnAmount,
          swapCallData: (
            await mockExchange.populateTransaction.swap(
              tokenA.address,
              tokenB.address,
              executor.address,
              minReturn[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      const swapDataSrc = []

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amountWithoutFee[0],
              false
            )
          ).data as string,
        },
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.sendCallToReceiver(
              receiver.address,
              tokenA.address,
              amountWithoutFee[1],
              (
                await receiver.populateTransaction.swapAndCompleteBridgeTokens(
                  transactionId,
                  recipient.address,
                  swapDataDst[0]
                )
              ).data as string,
              false
            )
          ).data as string,
        },
      ]

      // -------------------------------------
      // native
      const integratorBalanceBeforeN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultBeforeN = await ethers.provider.getBalance(
        protoFeeVault.address
      )

      const routerBeforeN = await ethers.provider.getBalance(mockBridge.address)
      const refundeeBeforeN = await ethers.provider.getBalance(refundee.address)

      const recipientBeforeB = await tokenB.balanceOf(recipient.address)

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .swapAndBridge(
            transactionId,
            integratorAddress,
            bridgeData,
            swapDataSrc,
            genericData,
            {
              value,
            }
          )
      )
        .emit(crossChainFacet, EVENTS.SwapBridgeTransferStarted)
        .changeTokenBalances(
          tokenA,
          [user, refundee, recipient, protoFeeVault, integrator1, mockBridge],
          [
            convertBNToNegative(amounts[0].add(amounts[1])),
            ZERO,
            minReturn[0],
            tokenFeeData[0].totalFee.add(tokenFeeData[1].totalFee),
            ZERO,
            routerTokenFee[0].add(routerTokenFee[1]),
          ]
        )

      // -------------------------------------

      const integratorBalanceAfterN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultAfterN = await ethers.provider.getBalance(
        protoFeeVault.address
      )
      const routerAfterN = await ethers.provider.getBalance(mockBridge.address)
      const refundeeAfterN = await ethers.provider.getBalance(refundee.address)

      const recipientAfterB = await tokenB.balanceOf(recipient.address)

      expect(integratorBalanceAfterN).equal(integratorBalanceBeforeN.add(ZERO))
      expect(protoFeeVaultAfterN).equal(
        protoFeeVaultBeforeN.add(fixedNativeFeeAmount)
      )
      expect(routerAfterN).equal(
        routerBeforeN.add(routerNativeFeeAmount.mul(2))
      )
      expect(refundeeAfterN).equal(refundeeBeforeN)

      expect(recipientAfterB).equal(recipientBeforeB.add(swapReturnAmount))

      // -------------------------------------

      const eventFilter = crossChainFacet.filters.SwapBridgeTransferStarted()
      const data = await crossChainFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.sender).equal(user.address)
      // expect(args.refundee).equal(refundee.address)

      validateMultiBridgeEventData(
        args.bridgeData[0],
        bridgeData[0],
        amountWithoutFee[0]
      )

      validateMultiBridgeEventData(
        args.bridgeData[1],
        bridgeData[1],
        amountWithoutFee[1]
      )

      expect(args.swapInfo).eql([])
    })

    it('3.5 Should allow user to swap src token, return leftOver then bridge then', async () => {
      const rate = await mockExchange.rate()
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()
      const leftOverPercent = await mockExchange.leftOverPercent()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('10', TOKEN_A_DECIMAL),
        parseUnits('50', TOKEN_A_DECIMAL),
      ]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        TOKEN_B_DECIMAL
      )
      const leftOverFromAmount = amountWithoutFee[1]
        .mul(leftOverPercent)
        .div(BPS_DENOMINATOR)

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenB.address,
          to: tokenB.address,
          receiver: recipient.address,
          minAmountIn: swapReturnAmount,
          destinationChainId: destinationChainId2,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amountWithoutFee[0],
              false
            )
          ).data as string,
        },
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenB.address,
              swapReturnAmount,
              false
            )
          ).data as string,
        },
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: swapReturnAmount,
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

      // -------------------------------------

      const value = fixedNativeFeeAmount
        .add(routerNativeFeeAmount)
        .add(routerNativeFeeAmount)

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        swapReturnAmount.mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        swapReturnAmount.sub(routerTokenFee[1]),
      ]

      // -------------------------------------
      // native
      const integratorBalanceBeforeN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultBeforeN = await ethers.provider.getBalance(
        protoFeeVault.address
      )

      const routerBeforeN = await ethers.provider.getBalance(mockBridge.address)
      const refundeeBeforeN = await ethers.provider.getBalance(refundee.address)

      // tokenB
      const routersBeforeB = await tokenB.balanceOf(mockBridge.address)
      const recipientBeforeB = await tokenB.balanceOf(recipient.address)

      // -------------------------------------
      // tokenA
      // tokenA -> tokenB
      await expect(
        crossChainFacet
          .connect(user)
          .swapAndBridge(
            transactionId,
            integratorAddress,
            bridgeData,
            swapData,
            genericData,
            {
              value,
            }
          )
      ).emit(crossChainFacet, EVENTS.SwapBridgeTransferStarted)
      // .changeTokenBalances(
      //   tokenA,
      //   [user, refundee, recipient, protoFeeVault, integrator1, mockBridge],
      //   [
      //     convertBNToNegative(amounts[0].add(amounts[1])),
      //     leftOverFromAmount,
      //     minReturn[0],
      //     tokenFeeData[0].totalFee.add(tokenFeeData[1].totalFee),
      //     ZERO,
      //     routerTokenFee[0],
      //   ]
      // )

      // -------------------------------------

      const integratorBalanceAfterN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultAfterN = await ethers.provider.getBalance(
        protoFeeVault.address
      )
      const routerAfterN = await ethers.provider.getBalance(mockBridge.address)
      const refundeeAfterN = await ethers.provider.getBalance(refundee.address)

      const routersAfterB = await tokenB.balanceOf(mockBridge.address)
      const recipientAfterB = await tokenB.balanceOf(recipient.address)

      expect(integratorBalanceAfterN).equal(integratorBalanceBeforeN.add(ZERO))
      expect(protoFeeVaultAfterN).equal(
        protoFeeVaultBeforeN.add(fixedNativeFeeAmount)
      )
      expect(routerAfterN).equal(
        routerBeforeN.add(routerNativeFeeAmount.mul(2))
      )
      expect(refundeeAfterN).equal(refundeeBeforeN)

      expect(routersAfterB).equal(routersBeforeB.add(routerTokenFee[1]))
      expect(recipientAfterB).equal(recipientBeforeB.add(minReturn[1]))

      // -------------------------------------

      const eventFilter = crossChainFacet.filters.SwapBridgeTransferStarted()
      const data = await crossChainFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.sender).equal(user.address)
      // expect(args.refundee).equal(refundee.address)

      validateMultiBridgeEventData(
        args.bridgeData[0],
        bridgeData[0],
        amountWithoutFee[0]
      )

      validateMultiBridgeEventData(
        args.bridgeData[1],
        bridgeData[1],
        swapReturnAmount
      )
    })

    it('3.6 Should allow user to swap src token,then bridge them to destination chain and return extra native tokens', async () => {
      const rate = await mockExchange.rate()
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()
      const routerFeePercent = await mockBridge.tokenFee()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [
        parseUnits('10', TOKEN_A_DECIMAL),
        parseUnits('50', TOKEN_A_DECIMAL),
      ]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapReturnAmount = parseUnits(
        formatUnits(
          amountWithoutFee[1].mul(rate).div(BPS_MULTIPLIER),
          TOKEN_A_DECIMAL
        ),
        TOKEN_B_DECIMAL
      )

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
        {
          bridge: 'TestBridge2',
          from: tokenB.address,
          to: tokenB.address,
          receiver: recipient.address,
          minAmountIn: swapReturnAmount,
          destinationChainId: destinationChainId2,
          hasSourceSwaps: true,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amountWithoutFee[0],
              false
            )
          ).data as string,
        },
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenB.address,
              swapReturnAmount,
              false
            )
          ).data as string,
        },
      ]

      const swapData = [
        {
          callTo: mockExchange.address,
          approveTo: mockExchange.address,
          from: tokenA.address,
          to: tokenB.address,
          fromAmount: amounts[1],
          minToAmount: swapReturnAmount,
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

      // -------------------------------------

      const extra = parseUnits('1')
      const value = fixedNativeFeeAmount
        .add(routerNativeFeeAmount)
        .add(routerNativeFeeAmount)
        .add(extra)

      const routerTokenFee = [
        amountWithoutFee[0].mul(routerFeePercent).div(BPS_DENOMINATOR),
        swapReturnAmount.mul(routerFeePercent).div(BPS_DENOMINATOR),
      ]

      const minReturn = [
        amountWithoutFee[0].sub(routerTokenFee[0]),
        swapReturnAmount.sub(routerTokenFee[1]),
      ]

      // -------------------------------------
      // native
      const integratorBalanceBeforeN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultBeforeN = await ethers.provider.getBalance(
        protoFeeVault.address
      )

      const routerBeforeN = await ethers.provider.getBalance(mockBridge.address)
      const refundeeBeforeN = await ethers.provider.getBalance(refundee.address)

      // tokenB
      const routersBeforeB = await tokenB.balanceOf(mockBridge.address)
      const recipientBeforeB = await tokenB.balanceOf(recipient.address)

      // -------------------------------------
      // tokenA
      // tokenA -> tokenB
      await expect(
        crossChainFacet
          .connect(user)
          .swapAndBridge(
            transactionId,
            integratorAddress,
            bridgeData,
            swapData,
            genericData,
            {
              value,
            }
          )
      ).emit(crossChainFacet, EVENTS.SwapBridgeTransferStarted)
      // .changeTokenBalances(
      //   tokenA,
      //   [user, refundee, recipient, protoFeeVault, integrator1, mockBridge],
      //   [
      //     convertBNToNegative(amounts[0].add(amounts[1])),
      //     ZERO,
      //     minReturn[0],
      //     tokenFeeData[0].totalFee.add(tokenFeeData[1].totalFee),
      //     ZERO,
      //     routerTokenFee[0],
      //   ]
      // )

      // -------------------------------------

      const integratorBalanceAfterN = await ethers.provider.getBalance(
        integratorAddress
      )
      const protoFeeVaultAfterN = await ethers.provider.getBalance(
        protoFeeVault.address
      )
      const routerAfterN = await ethers.provider.getBalance(mockBridge.address)
      const refundeeAfterN = await ethers.provider.getBalance(refundee.address)

      const routersAfterB = await tokenB.balanceOf(mockBridge.address)
      const recipientAfterB = await tokenB.balanceOf(recipient.address)

      expect(integratorBalanceAfterN).equal(integratorBalanceBeforeN.add(ZERO))
      expect(protoFeeVaultAfterN).equal(
        protoFeeVaultBeforeN.add(fixedNativeFeeAmount)
      )
      expect(routerAfterN).equal(
        routerBeforeN.add(routerNativeFeeAmount.mul(2))
      )
      // expect(refundeeAfterN).equal(refundeeBeforeN.add(extra))

      expect(routersAfterB).equal(routersBeforeB.add(routerTokenFee[1]))
      expect(recipientAfterB).equal(recipientBeforeB.add(minReturn[1]))

      // -------------------------------------

      const eventFilter = crossChainFacet.filters.SwapBridgeTransferStarted()
      const data = await crossChainFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).equal(transactionId)
      expect(args.integrator).equal(integratorAddress)
      expect(args.sender).equal(user.address)
      // expect(args.refundee).equal(refundee.address)

      validateMultiBridgeEventData(
        args.bridgeData[0],
        bridgeData[0],
        amountWithoutFee[0]
      )

      validateMultiBridgeEventData(
        args.bridgeData[1],
        bridgeData[1],
        swapReturnAmount
      )

      expect(args.swapInfo[0]).eql([
        swapData[0].callTo,
        swapData[0].from,
        swapData[0].to,
        swapData[0].fromAmount,
        ZERO,
        swapReturnAmount,
      ])
    })

    it('3.7 Should revert if amount is zero', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amounts[0],
              false
            )
          ).data as string,
        },
      ]

      const swapData = []

      bridgeData[0].minAmountIn = ZERO

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .swapAndBridge(
            transactionId,
            integratorAddress,
            bridgeData,
            swapData,
            genericData,
            {
              value,
            }
          )
      ).revertedWithCustomError(crossChainFacet, ERRORS.InvalidAmount)
    })

    it('3.8 Should revert if destination chainId is same', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amounts[0],
              false
            )
          ).data as string,
        },
      ]

      const swapData = []

      bridgeData[0].destinationChainId = (
        await ethers.provider.getNetwork()
      ).chainId

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .swapAndBridge(
            transactionId,
            integratorAddress,
            bridgeData,
            swapData,
            genericData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        crossChainFacet,
        ERRORS.CannotBridgeToSameNetwork
      )
    })

    it('3.9 Should revert if callTo is not a contract', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amounts[0],
              false
            )
          ).data as string,
        },
      ]

      const swapData = []

      genericData[0].callTo = signers[10].address

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .swapAndBridge(
            transactionId,
            integratorAddress,
            bridgeData,
            swapData,
            genericData,
            {
              value,
            }
          )
      ).revertedWithCustomError(crossChainFacet, ERRORS.NotAContract)
    })

    it('3.10 Should revert if callTo is not authorized', async () => {
      {
        await bridgeManagerFacet
          .connect(crossChainManager)
          .removeAggregatorsAndBridges([mockBridge.address])
      }

      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amounts[0],
              false
            )
          ).data as string,
        },
      ]

      const swapData = []

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .swapAndBridge(
            transactionId,
            integratorAddress,
            bridgeData,
            swapData,
            genericData,
            {
              value,
            }
          )
      ).revertedWithCustomError(crossChainFacet, ERRORS.UnAuthorizedCall)
    })

    it('3.11 Should revert if user has not transfer correct amount of native tokens', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amounts[0],
              false
            )
          ).data as string,
        },
      ]

      const swapData = []

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .swapAndBridge(
            transactionId,
            integratorAddress,
            bridgeData,
            swapData,
            genericData,
            {
              value: value.sub(1),
            }
          )
      ).reverted
    })

    it('3.12 Should revert if user has not transfer correct amount of native tokens', async () => {
      const routerNativeFeeAmount = await mockBridge.nativeFeeAmount()

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const refundee = signers[13]
      const recipient = signers[14]

      // -------------------------------------
      const amounts = [parseUnits('10', TOKEN_A_DECIMAL)]

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          swapFacet.address,
          integratorAddress,
          amounts,
          FeeType.BRIDGE
        )

      // -------------------------------------

      await tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await tokenA
        .connect(user)
        .approve(crossChainFacet.address, parseUnits('100', TOKEN_A_DECIMAL))

      const value = fixedNativeFeeAmount.add(routerNativeFeeAmount)

      // -------------------------------------

      const bridgeData = [
        {
          bridge: 'TestBridge',
          from: tokenA.address,
          to: tokenA.address,
          receiver: recipient.address,
          minAmountIn: amounts[0],
          destinationChainId: destinationChainId,
          hasSourceSwaps: false,
          hasDestinationCall: false,
        },
      ]

      const genericData = [
        {
          callTo: mockBridge.address,
          approveTo: mockBridge.address,
          extraNative: routerNativeFeeAmount,
          permit: encodePermitData('0x', PermitType.PERMIT),
          callData: (
            await mockBridge.populateTransaction.bridge(
              recipient.address,
              tokenA.address,
              amounts[0],
              true
            )
          ).data as string,
        },
      ]

      const swapData = []

      // -------------------------------------

      await expect(
        crossChainFacet
          .connect(user)
          .swapAndBridge(
            transactionId,
            integratorAddress,
            bridgeData,
            swapData,
            genericData,
            {
              value,
            }
          )
      )
        .revertedWithCustomError(crossChainFacet, ERRORS.BridgeCallFailed)
        .withArgs(mockBridge.interface.getSighash('BridgeCallFailedFromRouter'))
    })
  })
})
