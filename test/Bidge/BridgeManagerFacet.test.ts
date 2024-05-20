import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { ethers } from 'hardhat'

import {
  ADDRESS_ZERO,
  BPS_MULTIPLIER,
  CONTRACTS,
  DEFAULT_BYTES,
  ERRORS,
  EVENTS,
  MAX_FIXED_FEE_AMOUNT,
  MAX_TOKEN_FEE,
  ZERO,
} from '../../constants'
import {
  getSelectorsUsingContract,
  getSighash,
} from '../../scripts/utils/diamond'
import { snapshot, updateBalance } from '../utils'

import { expect } from 'chai'
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

      expect(await bridgeManagerFacet.isWhitelisted(mockBridge1.address)).eql(
        true
      )
      expect(await bridgeManagerFacet.isWhitelisted(mockBridge2.address)).eql(
        true
      )
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

      expect(await bridgeManagerFacet.isWhitelisted(mockBridge1.address)).eql(
        true
      )
      expect(await bridgeManagerFacet.isWhitelisted(mockBridge2.address)).eql(
        true
      )
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
      expect(await bridgeManagerFacet.isWhitelisted(mockBridge1.address)).eql(
        false
      )
      expect(await bridgeManagerFacet.isWhitelisted(mockBridge2.address)).eql(
        false
      )
      // -------------------------------------
      await expect(
        bridgeManagerFacet
          .connect(owner)
          .updateSelectorInfo(routers, selectors, selectorInfo)
      )
        .emit(bridgeManagerFacet, EVENTS.SelectorToInfoUpdated)
        .withArgs(routers, selectors, selectorInfo)

      // -------------------------------------

      expect(await bridgeManagerFacet.isWhitelisted(mockBridge1.address)).eql(
        true
      )
      expect(await bridgeManagerFacet.isWhitelisted(mockBridge2.address)).eql(
        true
      )
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

      expect(await bridgeManagerFacet.isWhitelisted(mockBridge1.address)).eql(
        true
      )
      expect(await bridgeManagerFacet.isWhitelisted(mockBridge2.address)).eql(
        false
      )

      // -------------------------------------
      await expect(
        bridgeManagerFacet
          .connect(crossChainManager)
          .updateSelectorInfo(routers, selectors, selectorInfo)
      )
        .emit(bridgeManagerFacet, EVENTS.SelectorToInfoUpdated)
        .withArgs(routers, selectors, selectorInfo)

      // -------------------------------------

      expect(await bridgeManagerFacet.isWhitelisted(mockBridge1.address)).eql(
        true
      )
      expect(await bridgeManagerFacet.isWhitelisted(mockBridge2.address)).eql(
        true
      )
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

      expect(await bridgeManagerFacet.isWhitelisted(mockBridge1.address)).eql(
        true
      )
      expect(await bridgeManagerFacet.isWhitelisted(mockBridge2.address)).eql(
        true
      )

      // -------------------------------------

      await expect(
        bridgeManagerFacet
          .connect(owner)
          .removeAggregatorsAndBridges([mockBridge2.address])
      )
        .emit(bridgeManagerFacet, EVENTS.BridgeRemoved)
        .withArgs([mockBridge2.address])

      // -------------------------------------

      expect(await bridgeManagerFacet.isWhitelisted(mockBridge1.address)).eql(
        true
      )
      expect(await bridgeManagerFacet.isWhitelisted(mockBridge2.address)).eql(
        false
      )
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

      expect(await bridgeManagerFacet.isWhitelisted(mockBridge1.address)).eql(
        true
      )
      expect(await bridgeManagerFacet.isWhitelisted(mockBridge2.address)).eql(
        true
      )

      // -------------------------------------

      await expect(
        bridgeManagerFacet
          .connect(crossChainManager)
          .removeAggregatorsAndBridges([mockBridge2.address])
      )
        .emit(bridgeManagerFacet, EVENTS.BridgeRemoved)
        .withArgs([mockBridge2.address])

      // -------------------------------------

      expect(await bridgeManagerFacet.isWhitelisted(mockBridge1.address)).eql(
        true
      )
      expect(await bridgeManagerFacet.isWhitelisted(mockBridge2.address)).eql(
        false
      )
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
})
