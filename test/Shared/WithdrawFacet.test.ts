import { ethers } from 'hardhat'
import { expect } from 'chai'

import {
  CONTRACTS,
  ERRORS,
  EVENTS,
  DZAP_NATIVE,
  MAX_FIXED_FEE_AMOUNT,
  MAX_TOKEN_FEE,
} from '../../constants'
import { convertBNToNegative, snapshot, updateBalance } from '../utils'

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
import {
  getSelectorsUsingContract,
  getSighash,
} from '../../scripts/utils/diamond'
import { parseUnits } from 'ethers/lib/utils'

let dZapDiamond: DZapDiamond
let diamondInit: DiamondInit
let diamondCutFacetImp: DiamondCutFacet
let diamondCutFacet: DiamondCutFacet
let diamondLoupeFacetImp: DiamondLoupeFacet
let ownershipFacetImp: OwnershipFacet
let ownershipFacet: OwnershipFacet
let accessManagerFacetImp: AccessManagerFacet
let accessManagerFacet: AccessManagerFacet
let dexManagerFacetImp: DexManagerFacet
let dexManagerFacet: DexManagerFacet
let feesFacetImp: FeesFacet
let feesFacet: FeesFacet
let withdrawFacetImp: WithdrawFacet
let withdrawFacet: WithdrawFacet
let swapFacetImp: SwapFacet
let swapFacet: SwapFacet
let crossChainFacet: CrossChainFacet
let crossChainFacetImp: CrossChainFacet
let executor: Executor
let receiver: Receiver

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

describe('WithdrawFacet.test.ts', async () => {
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
      ownershipFacet = (await ethers.getContractAt(
        CONTRACTS.OwnershipFacet,
        dZapDiamond.address
      )) as OwnershipFacet
      withdrawFacet = (await ethers.getContractAt(
        CONTRACTS.WithdrawFacet,
        dZapDiamond.address
      )) as WithdrawFacet
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

  describe('1.1 withdraw', async () => {
    beforeEach(async () => {
      const selectors = getSighash(
        [
          withdrawFacet.interface.functions[
            'withdraw(address,address,uint256)'
          ],
          withdrawFacet.interface.functions[
            'executeCallAndWithdraw(address,bytes,address,address,uint256)'
          ],
        ],
        withdrawFacet.interface
      )
      const executors = selectors.map(() => withdrawManager.address)
      const canExecute = selectors.map(() => true)

      await accessManagerFacet
        .connect(owner)
        .setBatchCanExecute(selectors, executors, canExecute)

      await tokenA
        .connect(deployer)
        .transfer(dZapDiamond.address, parseUnits('10', TOKEN_A_DECIMAL))

      await deployer.sendTransaction({
        to: dZapDiamond.address,
        value: parseUnits('10'),
      })
    })

    it('1.1.1 Should allow owner/withdrawManger to withdraw tokens left in contract', async () => {
      // --------------------
      {
        const to = signers[12].address
        const amount = parseUnits('5', TOKEN_A_DECIMAL)

        await expect(
          withdrawFacet.connect(owner).withdraw(tokenA.address, to, amount)
        )
          .emit(withdrawFacet, EVENTS.LogWithdraw)
          .withArgs(tokenA.address, to, amount)
          .changeTokenBalances(
            tokenA,
            [dZapDiamond.address, to],
            [convertBNToNegative(amount), amount]
          )
      }

      // --------------------
      {
        const to = signers[13].address
        const amount = parseUnits('10')

        await expect(
          withdrawFacet
            .connect(withdrawManager)
            .withdraw(DZAP_NATIVE, to, amount)
        )
          .emit(withdrawFacet, EVENTS.LogWithdraw)
          .withArgs(tokenA.address, to, amount)
          .changeEtherBalances(
            [dZapDiamond.address, to],
            [convertBNToNegative(amount), amount]
          )
      }
    })

    it('1.1.2 Should revert if caller is not owner/withdrawManager', async () => {
      await expect(
        withdrawFacet
          .connect(deployer)
          .withdraw(DZAP_NATIVE, signers[12].address, 100)
      ).revertedWithCustomError(withdrawFacet, ERRORS.UnAuthorized)
    })
  })
})
