import { ethers } from 'hardhat'
import { expect } from 'chai'
import { ContractFactory } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import {
  BPS_MULTIPLIER,
  CONTRACTS,
  DZAP_NATIVE,
  ERRORS,
  EVENTS,
  ZERO,
  MAX_FIXED_FEE_AMOUNT,
  MAX_TOKEN_FEE,
} from '../../constants'
import { convertBNToNegative, latest, snapshot, updateBalance } from '../utils'
import { encodePermitData } from '../../scripts/core/helper'
import {
  getSelectorsUsingContract,
  getSelectorsUsingFunSig,
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
  Executor,
  Receiver,
} from '../../typechain-types'
import { DiamondCut, FacetCutAction, PermitType } from '../types'

const TOKEN_A_DECIMAL = 18
const TOKEN_B_DECIMAL = 6
let permit2: Permit2
let mockExchange: ExchangeMock
let tokenA: ERC20Mock
let tokenB: ERC20Mock
let wNative: WNATIVE

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
let executor: Executor
let receiver: Receiver

let ExecutorFactory: ContractFactory
let ReceiverFactory: ContractFactory

let signers: SignerWithAddress[]
let deployer: SignerWithAddress
let owner: SignerWithAddress
let protoFeeVault: SignerWithAddress

let snapshotId: string

describe('Receiver.test.ts', async () => {
  beforeEach(async () => {
    signers = await ethers.getSigners()
    deployer = signers[0]
    owner = signers[1]
    protoFeeVault = signers[2]

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

    // -----------------------------------------

    // access
    // set integrator

    // -----------------------------------------
    // deploy executor and receiver
    {
      ExecutorFactory = await ethers.getContractFactory(CONTRACTS.Executor)
      executor = (await ExecutorFactory.deploy(dZapDiamond.address)) as Executor
      await executor.deployed()

      ReceiverFactory = await ethers.getContractFactory(CONTRACTS.Receiver)
      receiver = (await ReceiverFactory.deploy(
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

  describe('1) Deployment', async () => {
    it('1.1 Should deploy receiver contract correctly', async () => {
      const executor = (await ExecutorFactory.deploy(
        dZapDiamond.address
      )) as Executor
      await executor.deployed()

      const receiver = (await ReceiverFactory.deploy(
        owner.address,
        executor.address
      )) as Receiver
      await receiver.deployed()

      expect(await receiver.owner()).equal(owner.address)
      expect(await receiver.executor()).equal(executor.address)
    })
  })

  describe('2) setExecutor', async () => {
    it('2.1 Should allow owner to set new executor', async () => {
      const newExecutor = (await ExecutorFactory.deploy(
        dZapDiamond.address
      )) as Executor
      await executor.deployed()

      expect(await receiver.executor()).equal(executor.address)

      await expect(receiver.connect(owner).setExecutor(newExecutor.address))
        .emit(receiver, EVENTS.ExecutorSet)
        .withArgs(newExecutor.address)

      expect(await receiver.executor()).equal(newExecutor.address)
    })

    it('2.2 Should if caller is not owner', async () => {
      await expect(
        receiver.connect(deployer).setExecutor(executor.address)
      ).revertedWithCustomError(receiver, ERRORS.UnauthorizedCaller)
    })
  })

  describe('3) recoverToken', async () => {
    beforeEach(async () => {
      await tokenA
        .connect(deployer)
        .transfer(receiver.address, parseUnits('10', TOKEN_A_DECIMAL))

      await deployer.sendTransaction({
        to: receiver.address,
        value: parseUnits('10'),
      })
    })

    it('3.1 Should allow owner/withdrawManger to withdraw tokens left in contract', async () => {
      // --------------------
      {
        const to = signers[12].address
        const amount = parseUnits('5', TOKEN_A_DECIMAL)

        await expect(
          receiver.connect(owner).recoverToken(tokenA.address, to, amount)
        )
          .emit(receiver, EVENTS.TokensRecovered)
          .withArgs(tokenA.address, to, amount)
          .changeTokenBalances(
            tokenA,
            [receiver.address, to],
            [convertBNToNegative(amount), amount]
          )
      }

      // --------------------
      {
        const to = signers[13].address
        const amount = parseUnits('10')

        await expect(
          receiver.connect(owner).recoverToken(DZAP_NATIVE, to, amount)
        )
          .emit(receiver, EVENTS.TokensRecovered)
          .withArgs(tokenA.address, to, amount)
          .changeEtherBalances(
            [receiver.address, to],
            [convertBNToNegative(amount), amount]
          )
      }
    })

    it('3.2 Should if caller is not owner', async () => {
      await expect(
        receiver
          .connect(deployer)
          .recoverToken(DZAP_NATIVE, signers[13].address, 100)
      ).revertedWithCustomError(receiver, ERRORS.UnauthorizedCaller)
    })
  })

  describe('4) swapAndCompleteBridgeTokens', async () => {
    beforeEach(async () => {
      const selectors = getSelectorsUsingFunSig([
        'function swap(address,address,address,uint256,bool,bool)',
      ])
      const dexs = selectors.map(() => mockExchange.address)
      const approval = selectors.map(() => true)

      await dexManagerFacet.connect(owner).batchAddDex([mockExchange.address])

      await dexManagerFacet
        .connect(owner)
        .batchSetFunctionApprovalBySignature(dexs, selectors, approval)
    })

    it('4.1 Should swap token and send it to receiver (erc20)', async () => {
      const rate = await mockExchange.rate()

      // -------------------------------------

      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const bridgeDst = signers[12]
      const recipient = signers[14]
      const amount = parseUnits('10', TOKEN_A_DECIMAL)

      const swapReturnAmount = parseUnits(
        formatUnits(amount.mul(rate).div(BPS_MULTIPLIER), TOKEN_A_DECIMAL),
        TOKEN_B_DECIMAL
      )

      // -------------------------------------

      await tokenA.mint(bridgeDst.address, amount)
      await tokenA.connect(bridgeDst).approve(receiver.address, amount)

      // -------------------------------------

      const swapData = {
        callTo: mockExchange.address,
        approveTo: mockExchange.address,
        from: tokenA.address,
        to: tokenB.address,
        fromAmount: amount,
        minToAmount: swapReturnAmount,
        swapCallData: (
          await mockExchange.populateTransaction.swap(
            tokenA.address,
            tokenB.address,
            executor.address,
            amount,
            false,
            false
          )
        ).data as string,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const timestamp = (await latest()).add(1)

      // -------------------------------------

      const recipientBeforeB = await tokenB.balanceOf(recipient.address)

      // -------------------------------------
      await expect(
        receiver
          .connect(bridgeDst)
          .swapAndCompleteBridgeTokens(
            transactionId,
            recipient.address,
            swapData
          )
      )
        .emit(executor, EVENTS.TokenSwapped)
        .withArgs(
          transactionId,
          swapData.callTo,
          recipient.address,
          swapData.from,
          swapData.to,
          swapData.fromAmount,
          swapReturnAmount,
          ZERO,
          timestamp
        )
        .changeTokenBalances(tokenA, [mockExchange], [amount])

      // -------------------------------------

      const recipientAfterB = await tokenB.balanceOf(recipient.address)

      expect(recipientAfterB).equal(recipientBeforeB.add(swapReturnAmount))
    })

    it('4.2 Should send the srcToken to receiver if swap fails (erc20)', async () => {
      const rate = await mockExchange.rate()

      // -------------------------------------

      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const bridgeDst = signers[12]
      const recipient = signers[14]
      const amount = parseUnits('10', TOKEN_A_DECIMAL)

      const swapReturnAmount = parseUnits(
        formatUnits(amount.mul(rate).div(BPS_MULTIPLIER), TOKEN_A_DECIMAL),
        TOKEN_B_DECIMAL
      )

      // -------------------------------------

      const swapData = {
        callTo: mockExchange.address,
        approveTo: mockExchange.address,
        from: tokenA.address,
        to: tokenB.address,
        fromAmount: amount,
        minToAmount: swapReturnAmount,
        swapCallData: (
          await mockExchange.populateTransaction.swap(
            tokenA.address,
            tokenB.address,
            executor.address,
            amount,
            false,
            true
          )
        ).data as string,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const timestamp = (await latest()).add(1)
      // -------------------------------------

      await tokenA.mint(bridgeDst.address, amount)
      await tokenA.connect(bridgeDst).approve(receiver.address, amount)

      const recipientBeforeB = await tokenB.balanceOf(recipient.address)

      // -------------------------------------

      await expect(
        receiver
          .connect(bridgeDst)
          .swapAndCompleteBridgeTokens(
            transactionId,
            recipient.address,
            swapData
          )
      )
        .emit(receiver, EVENTS.DZapTransferRecovered)
        .withArgs(
          transactionId,
          swapData.from,
          recipient.address,
          amount,
          timestamp
        )
        .changeTokenBalances(tokenA, [mockExchange, recipient], [ZERO, amount])

      // -------------------------------------

      const recipientAfterB = await tokenB.balanceOf(recipient.address)
      expect(recipientAfterB).equal(recipientBeforeB)
    })

    it('4.3 Should send the srcToken to receiver if correct amount of tokens are not approve (erc20)', async () => {
      const rate = await mockExchange.rate()

      // -------------------------------------

      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const bridgeDst = signers[12]
      const recipient = signers[14]
      const amount = parseUnits('10', TOKEN_A_DECIMAL)

      const swapReturnAmount = parseUnits(
        formatUnits(amount.mul(rate).div(BPS_MULTIPLIER), TOKEN_A_DECIMAL),
        TOKEN_B_DECIMAL
      )

      // -------------------------------------
      const swapData = {
        callTo: mockExchange.address,
        approveTo: mockExchange.address,
        from: tokenA.address,
        to: tokenB.address,
        fromAmount: amount,
        minToAmount: swapReturnAmount,
        swapCallData: (
          await mockExchange.populateTransaction.swap(
            tokenA.address,
            tokenB.address,
            executor.address,
            amount,
            false,
            false
          )
        ).data as string,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const timestamp = (await latest()).add(1)

      await tokenA.mint(bridgeDst.address, amount)
      await tokenA.connect(bridgeDst).approve(receiver.address, amount.sub(1))

      const recipientBeforeB = await tokenB.balanceOf(recipient.address)

      // -------------------------------------

      await expect(
        receiver
          .connect(bridgeDst)
          .swapAndCompleteBridgeTokens(
            transactionId,
            recipient.address,
            swapData
          )
      )
        .emit(receiver, EVENTS.DZapTransferRecovered)
        .withArgs(
          transactionId,
          swapData.from,
          recipient.address,
          amount,
          timestamp
        )
        .changeTokenBalances(
          tokenA,
          [mockExchange, recipient],
          [ZERO, amount.sub(1)]
        )

      // -------------------------------------

      const recipientAfterB = await tokenB.balanceOf(recipient.address)
      expect(recipientAfterB).equal(recipientBeforeB)
    })

    it('4.4 Should swap token and send it to receiver (native)', async () => {
      const rate = await mockExchange.rate()

      // -------------------------------------

      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const bridgeDst = signers[12]
      const recipient = signers[14]
      const amount = parseUnits('10')

      const swapReturnAmount = parseUnits(
        formatUnits(amount.mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_B_DECIMAL
      )

      // -------------------------------------

      const swapData = {
        callTo: mockExchange.address,
        approveTo: mockExchange.address,
        from: DZAP_NATIVE,
        to: tokenB.address,
        fromAmount: amount,
        minToAmount: swapReturnAmount,
        swapCallData: (
          await mockExchange.populateTransaction.swap(
            DZAP_NATIVE,
            tokenB.address,
            executor.address,
            amount,
            false,
            false
          )
        ).data as string,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const timestamp = (await latest()).add(1)

      // -------------------------------------

      const recipientBeforeB = await tokenB.balanceOf(recipient.address)

      // -------------------------------------
      await expect(
        receiver
          .connect(bridgeDst)
          .swapAndCompleteBridgeTokens(
            transactionId,
            recipient.address,
            swapData,
            { value: amount }
          )
      )
        .emit(executor, EVENTS.TokenSwapped)
        .withArgs(
          transactionId,
          swapData.callTo,
          recipient.address,
          swapData.from,
          swapData.to,
          swapData.fromAmount,
          swapReturnAmount,
          ZERO,
          timestamp
        )
        .changeEtherBalances([mockExchange], [amount])

      // -------------------------------------

      const recipientAfterB = await tokenB.balanceOf(recipient.address)

      expect(recipientAfterB).equal(recipientBeforeB.add(swapReturnAmount))
    })

    it('4.5 Should send the srcToken to receiver if swap fails (native)', async () => {
      const rate = await mockExchange.rate()

      // -------------------------------------

      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const bridgeDst = signers[12]
      const recipient = signers[14]
      const amount = parseUnits('10')

      const swapReturnAmount = parseUnits(
        formatUnits(amount.mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_B_DECIMAL
      )

      // -------------------------------------

      const swapData = {
        callTo: mockExchange.address,
        approveTo: mockExchange.address,
        from: DZAP_NATIVE,
        to: tokenB.address,
        fromAmount: amount,
        minToAmount: swapReturnAmount,
        swapCallData: (
          await mockExchange.populateTransaction.swap(
            DZAP_NATIVE,
            tokenB.address,
            executor.address,
            amount,
            false,
            true
          )
        ).data as string,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const timestamp = (await latest()).add(1)

      // -------------------------------------

      const recipientBeforeB = await tokenB.balanceOf(recipient.address)

      // -------------------------------------
      await expect(
        receiver
          .connect(bridgeDst)
          .swapAndCompleteBridgeTokens(
            transactionId,
            recipient.address,
            swapData,
            { value: amount }
          )
      )
        .emit(receiver, EVENTS.DZapTransferRecovered)
        .withArgs(
          transactionId,
          swapData.from,
          recipient.address,
          amount,
          timestamp
        )
        .changeEtherBalances([mockExchange, recipient], [ZERO, amount])

      // -------------------------------------

      const recipientAfterB = await tokenB.balanceOf(recipient.address)
      expect(recipientAfterB).equal(recipientBeforeB)
    })

    it('4.6 Should send the srcToken to receiver if swap router is not approved by the diamond', async () => {
      await dexManagerFacet.connect(owner).removeDex(mockExchange.address)
      // --------------------------

      const rate = await mockExchange.rate()

      // -------------------------------------

      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const bridgeDst = signers[12]
      const recipient = signers[14]
      const amount = parseUnits('10')

      const swapReturnAmount = parseUnits(
        formatUnits(amount.mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_B_DECIMAL
      )

      // -------------------------------------

      const swapData = {
        callTo: mockExchange.address,
        approveTo: mockExchange.address,
        from: DZAP_NATIVE,
        to: tokenB.address,
        fromAmount: amount,
        minToAmount: swapReturnAmount,
        swapCallData: (
          await mockExchange.populateTransaction.swap(
            DZAP_NATIVE,
            tokenB.address,
            executor.address,
            amount,
            false,
            false
          )
        ).data as string,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const timestamp = (await latest()).add(1)

      // -------------------------------------

      const recipientBeforeB = await tokenB.balanceOf(recipient.address)

      // -------------------------------------
      await expect(
        receiver
          .connect(bridgeDst)
          .swapAndCompleteBridgeTokens(
            transactionId,
            recipient.address,
            swapData,
            { value: amount }
          )
      )
        .emit(receiver, EVENTS.DZapTransferRecovered)
        .withArgs(
          transactionId,
          swapData.from,
          recipient.address,
          amount,
          timestamp
        )
        .changeEtherBalances([mockExchange, recipient], [ZERO, amount])

      // -------------------------------------

      const recipientAfterB = await tokenB.balanceOf(recipient.address)
      expect(recipientAfterB).equal(recipientBeforeB)
    })

    it('4.8 Should send the srcToken to receiver if not approved by the diamond', async () => {
      await dexManagerFacet
        .connect(owner)
        .setFunctionApprovalBySignature(
          mockExchange.address,
          getSelectorsUsingFunSig([
            'function swap(address,address,address,uint256,bool,bool)',
          ])[0],
          false
        )
      // --------------------------

      await dexManagerFacet.connect(owner).removeDex(mockExchange.address)
      // --------------------------

      const rate = await mockExchange.rate()

      // -------------------------------------

      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const bridgeDst = signers[12]
      const recipient = signers[14]
      const amount = parseUnits('10')

      const swapReturnAmount = parseUnits(
        formatUnits(amount.mul(rate).div(BPS_MULTIPLIER), 18),
        TOKEN_B_DECIMAL
      )

      // -------------------------------------

      const swapData = {
        callTo: mockExchange.address,
        approveTo: mockExchange.address,
        from: DZAP_NATIVE,
        to: tokenB.address,
        fromAmount: amount,
        minToAmount: swapReturnAmount,
        swapCallData: (
          await mockExchange.populateTransaction.swap(
            DZAP_NATIVE,
            tokenB.address,
            executor.address,
            amount,
            false,
            false
          )
        ).data as string,
        permit: encodePermitData('0x', PermitType.PERMIT),
      }

      const timestamp = (await latest()).add(1)

      // -------------------------------------

      const recipientBeforeB = await tokenB.balanceOf(recipient.address)

      // -------------------------------------
      await expect(
        receiver
          .connect(bridgeDst)
          .swapAndCompleteBridgeTokens(
            transactionId,
            recipient.address,
            swapData,
            { value: amount }
          )
      )
        .emit(receiver, EVENTS.DZapTransferRecovered)
        .withArgs(
          transactionId,
          swapData.from,
          recipient.address,
          amount,
          timestamp
        )
        .changeEtherBalances([mockExchange, recipient], [ZERO, amount])

      // -------------------------------------

      const recipientAfterB = await tokenB.balanceOf(recipient.address)
      expect(recipientAfterB).equal(recipientBeforeB)
    })
  })
})
