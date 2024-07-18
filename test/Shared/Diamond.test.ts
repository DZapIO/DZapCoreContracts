import { ethers } from 'hardhat'
import { expect } from 'chai'

import {
  CONTRACTS,
  ERRORS,
  ZERO,
  ADDRESS_ZERO,
  BPS_DENOMINATOR,
  BPS_MULTIPLIER,
} from '../../constants'
import { snapshot, updateBalance } from '../utils'

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
} from '../../typechain-types'
import { DiamondCut, FacetCutAction } from '../../types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { getSelectorsUsingContract } from '../../scripts/utils/diamond'
import { parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'

let dZapDiamond: DZapDiamond
let diamondInit: DiamondInit
let diamondCutFacetImp: DiamondCutFacet
let diamondCutFacet: DiamondCutFacet
let diamondLoupeFacetImp: DiamondLoupeFacet
let ownershipFacetImp: OwnershipFacet
let accessManagerFacetImp: AccessManagerFacet
let dexManagerFacetImp: DexManagerFacet
let dexManagerFacet: DexManagerFacet
let feesFacetImp: FeesFacet
let feesFacet: FeesFacet
let withdrawFacetImp: WithdrawFacet
let swapFacetImp: SwapFacet
let swapFacet: SwapFacet
let crossChainFacet: CrossChainFacet
let crossChainFacetImp: CrossChainFacet
let executor: Executor
let receiver: Receiver

const MAX_TOKEN_FEE = 10 * BPS_MULTIPLIER
const MAX_FIXED_FEE_AMOUNT = ethers.utils.parseUnits('1')
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

describe('Diamond.test.ts', async () => {
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
      swapFacet = (await ethers.getContractAt(
        CONTRACTS.SwapFacet,
        dZapDiamond.address
      )) as SwapFacet
      crossChainFacet = (await ethers.getContractAt(
        CONTRACTS.CrossChainFacet,
        dZapDiamond.address
      )) as CrossChainFacet
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
    }

    // -----------------------------------------

    snapshotId = await snapshot.take()
  })

  beforeEach(async () => {
    await snapshot.revert(snapshotId)
  })

  describe('(1) DiamondInit', async () => {
    let cutData: DiamondCut[]

    beforeEach(() => {
      // diamondCut
      cutData = [
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
      ]
    })

    it('1.1 Should add facets and initialize them', async () => {
      const { data: initData } =
        await diamondInit.populateTransaction.initialize(
          permit2.address,
          protoFeeVault.address,
          MAX_TOKEN_FEE,
          MAX_FIXED_FEE_AMOUNT
        )

      await expect(feesFacet.maxTokenFee()).reverted
      await expect(feesFacet.maxFixedNativeFeeAmount()).reverted
      await expect(feesFacet.protocolFeeVault()).reverted

      await diamondCutFacet
        .connect(owner)
        .diamondCut(cutData, diamondInit.address, initData as string)

      expect(await feesFacet.maxTokenFee()).equal(MAX_TOKEN_FEE)
      expect(await feesFacet.maxFixedNativeFeeAmount()).equal(
        MAX_FIXED_FEE_AMOUNT
      )
      expect(await feesFacet.protocolFeeVault()).equal(protoFeeVault.address)

      {
        const permitStorageSlot = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes('dzap.storage.library.permit')
        )
        const storageValue = await ethers.provider.getStorageAt(
          dZapDiamond.address,
          permitStorageSlot
        )

        const boolHex = storageValue.slice(0, 2 + 12 * 2)
        const addressHex = storageValue.slice(2 + 12 * 2)

        const permitAddress = ethers.utils.getAddress(addressHex)
        const initialized = ethers.utils.hexValue(boolHex) === '0x1'

        expect(permitAddress).equal(permit2.address)
        expect(initialized).equal(true)
      }
    })

    it('1.2 Should revert if caller is not owner', async () => {
      const { data: initData } =
        await diamondInit.populateTransaction.initialize(
          permit2.address,
          protoFeeVault.address,
          MAX_TOKEN_FEE,
          MAX_FIXED_FEE_AMOUNT
        )

      await expect(
        diamondCutFacet
          .connect(signers[10])
          .diamondCut(cutData, diamondInit.address, initData as string)
      ).revertedWithCustomError(diamondCutFacet, ERRORS.OnlyContractOwner)
    })

    it('1.3 Should revert if permit is zero address', async () => {
      const { data: initData } =
        await diamondInit.populateTransaction.initialize(
          ADDRESS_ZERO,
          protoFeeVault.address,
          MAX_TOKEN_FEE,
          MAX_FIXED_FEE_AMOUNT
        )

      await expect(
        diamondCutFacet
          .connect(owner)
          .diamondCut(cutData, diamondInit.address, initData as string)
      )
        .revertedWithCustomError(diamondCutFacet, ERRORS.InitReverted)
        .withArgs(diamondInit.interface.getSighash(ERRORS.ZeroAddress))
    })

    it('1.4 Should revert if protocol vault has zero address', async () => {
      const { data: initData } =
        await diamondInit.populateTransaction.initialize(
          permit2.address,
          ADDRESS_ZERO,
          MAX_TOKEN_FEE,
          MAX_FIXED_FEE_AMOUNT
        )

      await expect(
        diamondCutFacet
          .connect(owner)
          .diamondCut(cutData, diamondInit.address, initData as string)
      )
        .revertedWithCustomError(diamondCutFacet, ERRORS.InitReverted)
        .withArgs(diamondInit.interface.getSighash(ERRORS.ZeroAddress))
    })

    it('1.5 Should revert if maxFee is zero is zero', async () => {
      const { data: initData } =
        await diamondInit.populateTransaction.initialize(
          permit2.address,
          protoFeeVault.address,
          ZERO,
          MAX_FIXED_FEE_AMOUNT
        )

      await expect(
        diamondCutFacet
          .connect(owner)
          .diamondCut(cutData, diamondInit.address, initData as string)
      )
        .revertedWithCustomError(diamondCutFacet, ERRORS.InitReverted)
        .withArgs(diamondInit.interface.getSighash(ERRORS.InvalidFee))
    })

    it('1.6 Should revert if maxFee is zero is zero', async () => {
      const { data: initData } =
        await diamondInit.populateTransaction.initialize(
          permit2.address,
          protoFeeVault.address,
          BigNumber.from(BPS_DENOMINATOR).add(1),
          MAX_FIXED_FEE_AMOUNT
        )

      await expect(
        diamondCutFacet
          .connect(owner)
          .diamondCut(cutData, diamondInit.address, initData as string)
      )
        .revertedWithCustomError(diamondCutFacet, ERRORS.InitReverted)
        .withArgs(diamondInit.interface.getSighash(ERRORS.FeeTooHigh))
    })

    it('1.7 Should revert it is already initialize', async () => {
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

      await expect(
        diamondCutFacet
          .connect(owner)
          .diamondCut([], diamondInit.address, initData as string)
      )
        .revertedWithCustomError(diamondCutFacet, ERRORS.InitReverted)
        .withArgs(diamondInit.interface.getSighash(ERRORS.AlreadyInitialized))
    })
  })
})
