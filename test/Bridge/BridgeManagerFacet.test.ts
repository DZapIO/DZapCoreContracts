import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { ethers } from 'hardhat'

import {
  ADDRESS_ZERO,
  BPS_MULTIPLIER,
  CONTRACTS,
  ERRORS,
  EVENTS,
  ZERO,
} from '../../constants'
import {
  getSelectorsUsingContract,
  getSighash,
} from '../../scripts/utils/diamond'
import { forkNetwork, impersonate, snapshot, updateBalance } from '../utils'

import { expect } from 'chai'
import { CHAIN_IDS } from '../../config'
import { DEFAULT_BYTES } from '../../constants/others'
import { calculateOffset } from '../../scripts/core/helper'
import {
  AccessManagerFacet,
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
import { DiamondCut, FacetCutAction, FeeInfo, FeeType } from '../../types'
import { getRpcUrl } from '../../utils/network'

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
let mockBridge1: BridgeMock
let mockBridge2: BridgeMock
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

describe('BridgeManagerFacet.test.ts', async () => {
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
      mockBridge1 = (await BridgeMock.connect(deployer).deploy()) as BridgeMock
      mockBridge2 = (await BridgeMock.connect(deployer).deploy()) as BridgeMock
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
          bridgeManagerFacet.interface.functions['addAdapters(address[])'],
          bridgeManagerFacet.interface.functions['removeAdapters(address[])'],
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

  let routers: string[]
  let selectors: string[]
  let selectorInfo: BigNumber[]

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

    selectors = getSighash(
      [
        mockBridge1.interface.functions['bridge(address,address,uint256,bool)'],
        mockBridge2.interface.functions[
          'bridgeAndSwap(address,address,uint256,bytes,bool)'
        ],
      ],
      mockBridge1.interface
    )
    selectorInfo = [
      BigNumber.from(offsetByBytes1),
      BigNumber.from(offsetByBytes2),
    ]

    routers = [mockBridge1.address, mockBridge2.address]
  })

  describe('1) addAggregatorsAndBridges', () => {
    it('1.1 Should allow owner to whitelist bridge', async () => {
      // -------------------------------------

      await expect(
        bridgeManagerFacet.connect(owner).addAggregatorsAndBridges(routers)
      )
        .emit(bridgeManagerFacet, EVENTS.BridgeAdded)
        .withArgs(routers)

      // -------------------------------------

      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge1.address)
      ).eql(true)
      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge2.address)
      ).eql(true)
    })

    it('1.2 Should allow crossChainManager to whitelist bridge', async () => {
      // -------------------------------------

      await expect(
        bridgeManagerFacet
          .connect(crossChainManager)
          .addAggregatorsAndBridges(routers)
      )
        .emit(bridgeManagerFacet, EVENTS.BridgeAdded)
        .withArgs(routers)

      // -------------------------------------

      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge1.address)
      ).eql(true)
      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge2.address)
      ).eql(true)
    })

    it('1.3 Should revert if caller is not owner/crossChainManager', async () => {
      await expect(
        bridgeManagerFacet.connect(dexManager).addAggregatorsAndBridges(routers)
      ).revertedWithCustomError(bridgeManagerFacet, ERRORS.UnAuthorized)
    })

    it('1.4 Should revert if bridge address is same as dzap address', async () => {
      await expect(
        bridgeManagerFacet
          .connect(crossChainManager)
          .addAggregatorsAndBridges([bridgeManagerFacet.address])
      ).revertedWithCustomError(bridgeManagerFacet, ERRORS.CannotAuthorizeSelf)
    })
  })

  describe('2) updateSelectorInfo', () => {
    it('2.1 Should allow owner to updateSelectorInfo (bridge is not whitelisted)', async () => {
      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge1.address)
      ).eql(false)
      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge2.address)
      ).eql(false)
      // -------------------------------------
      await expect(
        bridgeManagerFacet
          .connect(owner)
          .updateSelectorInfo(routers, selectors, selectorInfo)
      )
        .emit(bridgeManagerFacet, EVENTS.SelectorToInfoUpdated)
        .withArgs(routers, selectors, selectorInfo)

      // -------------------------------------

      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge1.address)
      ).eql(true)
      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge2.address)
      ).eql(true)
      expect(
        await bridgeManagerFacet.getSelectorInfo(routers[0], selectors[0])
      ).eql([true, selectorInfo[0]])
      expect(
        await bridgeManagerFacet.getSelectorInfo(routers[0], selectors[1])
      ).eql([true, ZERO])
      expect(
        await bridgeManagerFacet.getSelectorInfo(routers[1], selectors[1])
      ).eql([true, selectorInfo[1]])
      expect(
        await bridgeManagerFacet.getSelectorInfo(routers[1], selectors[0])
      ).eql([true, ZERO])
    })

    it('2.2 Should allow crossChainManger to updateSelectorInfo (bridge is whitelisted)', async () => {
      await bridgeManagerFacet
        .connect(crossChainManager)
        .addAggregatorsAndBridges([mockBridge1.address])

      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge1.address)
      ).eql(true)
      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge2.address)
      ).eql(false)

      // -------------------------------------
      await expect(
        bridgeManagerFacet
          .connect(crossChainManager)
          .updateSelectorInfo(routers, selectors, selectorInfo)
      )
        .emit(bridgeManagerFacet, EVENTS.SelectorToInfoUpdated)
        .withArgs(routers, selectors, selectorInfo)

      // -------------------------------------

      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge1.address)
      ).eql(true)
      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge2.address)
      ).eql(true)
      expect(
        await bridgeManagerFacet.getSelectorInfo(routers[0], selectors[0])
      ).eql([true, selectorInfo[0]])
      expect(
        await bridgeManagerFacet.getSelectorInfo(routers[1], selectors[1])
      ).eql([true, selectorInfo[1]])
    })

    it('2.3 Should revert if caller is not owner/crossChainManager', async () => {
      await expect(
        bridgeManagerFacet
          .connect(dexManager)
          .updateSelectorInfo(routers, selectors, selectorInfo)
      ).revertedWithCustomError(bridgeManagerFacet, ERRORS.UnAuthorized)
    })

    it('2.4 Should revert if bridge address is same as dzap address', async () => {
      await expect(
        bridgeManagerFacet
          .connect(crossChainManager)
          .updateSelectorInfo(
            [bridgeManagerFacet.address],
            [selectors[0]],
            [selectorInfo[0]]
          )
      ).revertedWithCustomError(bridgeManagerFacet, ERRORS.CannotAuthorizeSelf)
    })
  })

  describe('3) removeAggregatorsAndBridges', () => {
    it('3.1 Should allow owner to blacklist bridge', async () => {
      // -------------------------------------
      await bridgeManagerFacet
        .connect(crossChainManager)
        .updateSelectorInfo(routers, selectors, selectorInfo)

      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge1.address)
      ).eql(true)
      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge2.address)
      ).eql(true)

      // -------------------------------------

      await expect(
        bridgeManagerFacet
          .connect(owner)
          .removeAggregatorsAndBridges([mockBridge2.address])
      )
        .emit(bridgeManagerFacet, EVENTS.BridgeRemoved)
        .withArgs([mockBridge2.address])

      // -------------------------------------

      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge1.address)
      ).eql(true)
      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge2.address)
      ).eql(false)
      expect(
        await bridgeManagerFacet.getSelectorInfo(routers[1], selectors[1])
      ).eql([false, selectorInfo[0]])
      expect(
        await bridgeManagerFacet.getSelectorInfo(routers[1], selectors[0])
      ).eql([false, ZERO])
    })

    it('3.2 Should allow crossChainManager to blacklist bridge', async () => {
      // -------------------------------------

      await bridgeManagerFacet
        .connect(crossChainManager)
        .updateSelectorInfo(routers, selectors, selectorInfo)

      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge1.address)
      ).eql(true)
      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge2.address)
      ).eql(true)

      // -------------------------------------

      await expect(
        bridgeManagerFacet
          .connect(crossChainManager)
          .removeAggregatorsAndBridges([mockBridge2.address])
      )
        .emit(bridgeManagerFacet, EVENTS.BridgeRemoved)
        .withArgs([mockBridge2.address])

      // -------------------------------------

      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge1.address)
      ).eql(true)
      expect(
        await bridgeManagerFacet.isBridgeWhitelisted(mockBridge2.address)
      ).eql(false)
      expect(
        await bridgeManagerFacet.getSelectorInfo(routers[0], selectors[0])
      ).eql([true, selectorInfo[0]])
      expect(
        await bridgeManagerFacet.getSelectorInfo(routers[1], selectors[1])
      ).eql([false, selectorInfo[1]])
    })

    it('3.3 Should revert if caller is not owner/crossChainManager', async () => {
      await expect(
        bridgeManagerFacet
          .connect(dexManager)
          .removeAggregatorsAndBridges(routers)
      ).revertedWithCustomError(bridgeManagerFacet, ERRORS.UnAuthorized)
    })

    it('3.4 Should revert if bridge address is same as dzap address', async () => {
      await expect(
        bridgeManagerFacet
          .connect(crossChainManager)
          .removeAggregatorsAndBridges([mockBridge1.address])
      ).revertedWithCustomError(bridgeManagerFacet, ERRORS.BridgeNotAdded)
    })
  })

  describe('4) addAdapters', () => {
    let mockAdapters: string[] = []

    beforeEach(async () => {
      mockAdapters = [mockBridge1.address, mockBridge2.address]
    })

    it('4.1 Should allow owner to whitelist adapter', async () => {
      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[0])
      ).eql(false)
      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[1])
      ).eql(false)

      // -------------------------------------
      await expect(bridgeManagerFacet.connect(owner).addAdapters(mockAdapters))
        .emit(bridgeManagerFacet, EVENTS.AdaptersAdded)
        .withArgs(mockAdapters)

      // -------------------------------------

      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[0])
      ).eql(true)
      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[1])
      ).eql(true)
    })

    it('4.2 Should allow crossChainManager to whitelist adapter', async () => {
      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[0])
      ).eql(false)
      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[1])
      ).eql(false)

      // -------------------------------------
      await expect(
        bridgeManagerFacet.connect(crossChainManager).addAdapters(mockAdapters)
      )
        .emit(bridgeManagerFacet, EVENTS.AdaptersAdded)
        .withArgs(mockAdapters)

      // -------------------------------------

      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[0])
      ).eql(true)
      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[1])
      ).eql(true)
    })

    it('4.3 Should revert if caller is not owner/crossChainManager', async () => {
      await expect(
        bridgeManagerFacet
          .connect(crossChainManager)
          .addAdapters([bridgeManagerFacet.address])
      ).revertedWithCustomError(bridgeManagerFacet, ERRORS.CannotAuthorizeSelf)
    })

    it('4.4 Should revert if adapter address is same as dzap address', async () => {
      await expect(
        bridgeManagerFacet.connect(dexManager).addAdapters(mockAdapters)
      ).revertedWithCustomError(bridgeManagerFacet, ERRORS.UnAuthorized)
    })
  })

  describe('5) removeAdapters', () => {
    let mockAdapters: string[] = []

    beforeEach(async () => {
      mockAdapters = [mockBridge1.address, mockBridge2.address]

      await bridgeManagerFacet
        .connect(crossChainManager)
        .addAdapters(mockAdapters)
    })

    it('5.1 Should allow owner to blacklist bridge', async () => {
      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[0])
      ).eql(true)
      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[1])
      ).eql(true)

      // -------------------------------------

      await expect(
        bridgeManagerFacet.connect(owner).removeAdapters([mockAdapters[1]])
      )
        .emit(bridgeManagerFacet, EVENTS.AdaptersRemoved)
        .withArgs([mockAdapters[1]])

      // -------------------------------------
      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[0])
      ).eql(true)
      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[1])
      ).eql(false)
    })

    it('5.2 Should allow crossChainManager to blacklist bridge', async () => {
      // -------------------------------------

      await expect(
        bridgeManagerFacet
          .connect(crossChainManager)
          .removeAdapters(mockAdapters)
      )
        .emit(bridgeManagerFacet, EVENTS.AdaptersRemoved)
        .withArgs(mockAdapters)

      // -------------------------------------
      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[0])
      ).eql(false)
      expect(
        await bridgeManagerFacet.isAdapterWhitelisted(mockAdapters[1])
      ).eql(false)
    })

    it('5.3 Should revert if caller is not owner/crossChainManager', async () => {
      await expect(
        bridgeManagerFacet.connect(dexManager).removeAdapters(mockAdapters)
      ).revertedWithCustomError(bridgeManagerFacet, ERRORS.UnAuthorized)
    })

    it('5.4 Should revert if bridge address is same as dzap address', async () => {
      await bridgeManagerFacet
        .connect(crossChainManager)
        .removeAdapters(mockAdapters)

      await expect(
        bridgeManagerFacet
          .connect(crossChainManager)
          .removeAdapters([mockAdapters[1]])
      ).revertedWithCustomError(bridgeManagerFacet, ERRORS.AdapterNotAdded)
    })
  })

  describe('6) Storage Upgrade Test', () => {
    const oldBridgeManagerAbi = [
      'error BridgeNotAdded(address)',
      'error CannotAuthorizeSelf()',
      'error UnAuthorized()',
      'event BridgeAdded(address[] bridges)',
      'event BridgeRemoved(address[] bridges)',
      'event SelectorToInfoUpdated(address[] bridges, bytes4[] selectors, uint256[] info)',
      'function addAggregatorsAndBridges(address[] _bridgeAddresses)',
      'function getSelectorInfo(address _bridge, bytes4 _selector) view returns (bool, uint256)',
      'function isWhitelisted(address _bridge) view returns (bool)',
      'function removeAggregatorsAndBridges(address[] _bridgeAddresses)',
      'function updateSelectorInfo(address[] _bridgeAddresses, bytes4[] _selectors, uint256[] _offset)',
    ]

    it('6.1 Should update the storage mapping without making colisions', async () => {
      // fork old dzap at a block
      const dzapAddress = '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6'
      const jsonRpcUrl = getRpcUrl(CHAIN_IDS.ARBITRUM_MAINNET)
      await forkNetwork(jsonRpcUrl, 303497900)

      const owner = await impersonate(
        '0x45679CDF728abdcdfce0F03A8f1D22BA49BAbC72'
      )
      await updateBalance(owner.address)

      // ----------------
      const bridgesAddress = [
        '0xe35e9842fceaCA96570B734083f4a58e8F7C5f2A',
        '0x9Ce3447B58D58e8602B7306316A5fF011B92d189',
        '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
        '0xfE96910cF84318d1B8a5e2a6962774711467C0be',
      ]
      const adaptersAddress = [
        '0x16c1E305BDcE64578A7837822E6D715B50301B17',
        '0xc3aa1d86e034cE4EB7aEc9AD8a3924E137163961',
        '0xD3564bAA559a62775AACa5ffA02A4F2B61F6f63F',
      ]

      // ----------------

      const oldBridgeManager = await ethers.getContractAt(
        oldBridgeManagerAbi,
        dzapAddress
      )

      expect(await oldBridgeManager.isWhitelisted(bridgesAddress[0])).equal(
        true
      )
      expect(await oldBridgeManager.isWhitelisted(bridgesAddress[1])).equal(
        true
      )
      expect(await oldBridgeManager.isWhitelisted(bridgesAddress[2])).equal(
        true
      )
      expect(await oldBridgeManager.isWhitelisted(bridgesAddress[3])).equal(
        false
      )
      expect(await oldBridgeManager.isWhitelisted(adaptersAddress[0])).equal(
        false
      )
      expect(await oldBridgeManager.isWhitelisted(adaptersAddress[1])).equal(
        false
      )
      expect(await oldBridgeManager.isWhitelisted(adaptersAddress[2])).equal(
        false
      )

      // -----------------

      const BridgeManagerFacet = await ethers.getContractFactory(
        CONTRACTS.BridgeManagerFacet
      )
      const bridgeManagerFacet = await BridgeManagerFacet.deploy()

      const { selectors: oldSelectors } = await getSelectorsUsingContract(
        oldBridgeManager,
        'OldBridgeManagerFacet'
      )
      const { selectors: newSelectors } = await getSelectorsUsingContract(
        bridgeManagerFacet,
        'NewBridgeManagerFacet'
      )

      const initData = {
        address: ethers.constants.AddressZero,
        data: '0x',
      }

      const cutData = [
        {
          facetAddress: ADDRESS_ZERO,
          action: FacetCutAction.Remove,
          functionSelectors: oldSelectors,
        },
        {
          facetAddress: bridgeManagerFacet.address,
          action: FacetCutAction.Add,
          functionSelectors: newSelectors,
        },
      ]

      const diamondCut = await ethers.getContractAt(
        CONTRACTS.DiamondCutFacet,
        dzapAddress
      )
      await diamondCut
        .connect(owner)
        .diamondCut(cutData, initData.address, initData.data)

      // -----------------

      const newBridgeManager = (await ethers.getContractAt(
        CONTRACTS.BridgeManagerFacet,
        dzapAddress
      )) as BridgeManagerFacet

      // isBridgeWhitelisted
      expect(
        await newBridgeManager.isBridgeWhitelisted(bridgesAddress[0])
      ).equal(true)
      expect(
        await newBridgeManager.isBridgeWhitelisted(bridgesAddress[1])
      ).equal(true)
      expect(
        await newBridgeManager.isBridgeWhitelisted(bridgesAddress[2])
      ).equal(true)
      expect(
        await newBridgeManager.isBridgeWhitelisted(bridgesAddress[3])
      ).equal(false)
      expect(
        await newBridgeManager.isBridgeWhitelisted(adaptersAddress[0])
      ).equal(false)
      expect(
        await newBridgeManager.isBridgeWhitelisted(adaptersAddress[1])
      ).equal(false)
      expect(
        await newBridgeManager.isBridgeWhitelisted(adaptersAddress[2])
      ).equal(false)

      // isAdapterWhitelisted
      expect(
        await newBridgeManager.isAdapterWhitelisted(bridgesAddress[0])
      ).equal(false)
      expect(
        await newBridgeManager.isAdapterWhitelisted(bridgesAddress[1])
      ).equal(false)
      expect(
        await newBridgeManager.isAdapterWhitelisted(bridgesAddress[2])
      ).equal(false)
      expect(
        await newBridgeManager.isAdapterWhitelisted(bridgesAddress[3])
      ).equal(false)
      expect(
        await newBridgeManager.isAdapterWhitelisted(adaptersAddress[0])
      ).equal(false)
      expect(
        await newBridgeManager.isAdapterWhitelisted(adaptersAddress[1])
      ).equal(false)
      expect(
        await newBridgeManager.isAdapterWhitelisted(adaptersAddress[2])
      ).equal(false)

      // -----------------
      // add adapters
      await newBridgeManager.connect(owner).addAdapters(adaptersAddress)

      expect(
        await newBridgeManager.isBridgeWhitelisted(adaptersAddress[0])
      ).equal(false)
      expect(
        await newBridgeManager.isBridgeWhitelisted(adaptersAddress[1])
      ).equal(false)
      expect(
        await newBridgeManager.isBridgeWhitelisted(adaptersAddress[2])
      ).equal(false)

      expect(
        await newBridgeManager.isAdapterWhitelisted(adaptersAddress[0])
      ).equal(true)
      expect(
        await newBridgeManager.isAdapterWhitelisted(adaptersAddress[1])
      ).equal(true)
      expect(
        await newBridgeManager.isAdapterWhitelisted(adaptersAddress[2])
      ).equal(true)

      // -----------------
      // add new bridge

      await newBridgeManager
        .connect(owner)
        .addAggregatorsAndBridges([bridgesAddress[3]])
      expect(
        await newBridgeManager.isBridgeWhitelisted(bridgesAddress[3])
      ).equal(true)
      expect(
        await newBridgeManager.isAdapterWhitelisted(bridgesAddress[3])
      ).equal(false)

      // -----------------
      // add same bridge and adapter
      const addr = '0xC5a350853E4e36b73EB0C24aaA4b8816C9A3579a'

      await newBridgeManager.connect(owner).addAggregatorsAndBridges([addr])
      await newBridgeManager.connect(owner).addAdapters([addr])

      expect(await newBridgeManager.isBridgeWhitelisted(addr)).equal(true)
      expect(await newBridgeManager.isAdapterWhitelisted(addr)).equal(true)
    })
  })
})
