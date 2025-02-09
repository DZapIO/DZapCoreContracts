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
import { CHAIN_IDS } from '../../config'
import { encodePermitData, getFeeData } from '../../scripts/core/helper'
import { DZapDiamond } from '../../typechain-types'
import { AccessContractObj, FeeType, PermitType } from '../../types'
import {
  feeInfo1,
  feeInfo2,
  GasZipChainIds,
  GasZipReciever,
  MAX_FIXED_FEE_AMOUNT,
  MAX_TOKEN_FEE,
  TOKEN_A_DECIMAL,
  TOKEN_B_DECIMAL,
} from '../constants'
import {
  createGasZipCallData,
  deployAndIntializeDimond,
  deployFacets,
  getAllFacets,
  getMockContract,
  getPermi2ApprovetData,
  setAccessControl,
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
let gasZipDepositor: SignerWithAddress

let snapshotId: string

describe('GasZipFacet.test.ts', async () => {
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
    gasZipDepositor = signers[10]

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
      [CONTRACTS.GasZipFacet]: [gasZipDepositor.address],
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

    expect(await contracts.gasZipFacet.getGasZipDepositAddress()).eql(
      gasZipDepositor.address
    )
  })

  describe('1) bridgeTokensViaGasZip', () => {
    it('1.1 Should allow user to bridge token from one chain to other chain', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator2.address
      const recipient = signers[14]

      const gasZipCallData = createGasZipCallData({
        recieverType: GasZipReciever.EvmReciver,
        desChainId: [
          GasZipChainIds[CHAIN_IDS.ARBITRUM_MAINNET],
          GasZipChainIds[CHAIN_IDS.BASE_MAINNET],
        ],
        reciever: recipient.address,
      })

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

      const gasZipData = {
        data: gasZipCallData,
        depositAmount: amounts[0],
      }

      // -------------------------------------

      await expect(
        contracts.gasZipFacet
          .connect(user)
          .bridgeTokensViaGasZip(transactionId, integratorAddress, gasZipData, {
            value,
          })
      )
        .changeEtherBalances(
          [user, gasZipDepositor, protoFeeVault, integrator2],
          [
            convertBNToNegative(value),
            amountWithoutFee[0],
            fixedNativeData.dzapNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            fixedNativeData.integratorNativeFeeAmount.add(
              tokenFeeData[0].integratorFee
            ),
          ]
        )
        .emit(contracts.gasZipFacet, EVENTS.GasZipBridgeTransferStarted)
        .withArgs(transactionId, integratorAddress, user.address, [
          gasZipData.data.toLowerCase(),
          amountWithoutFee[0],
        ])
    })

    it('1.2 Should allow user to bridge token from one chain to other chain and return extra native', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      const gasZipCallData = createGasZipCallData({
        recieverType: GasZipReciever.EvmReciver,
        desChainId: [
          GasZipChainIds[CHAIN_IDS.ARBITRUM_MAINNET],
          GasZipChainIds[CHAIN_IDS.BASE_MAINNET],
        ],
        reciever: recipient.address,
      })

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

      const gasZipData = {
        data: gasZipCallData,
        depositAmount: amounts[0],
      }

      await expect(
        contracts.gasZipFacet
          .connect(user)
          .bridgeTokensViaGasZip(transactionId, integratorAddress, gasZipData, {
            value,
          })
      )
        .changeEtherBalances(
          [user, gasZipDepositor, protoFeeVault, integrator1],
          [
            convertBNToNegative(value.sub(extra)),
            amountWithoutFee[0],
            fixedNativeFeeAmount.add(tokenFeeData[0].dzapFee),
            tokenFeeData[0].integratorFee,
          ]
        )
        .emit(contracts.gasZipFacet, EVENTS.GasZipBridgeTransferStarted)
        .withArgs(transactionId, integratorAddress, user.address, [
          gasZipData.data.toLowerCase(),
          amountWithoutFee[0],
        ])
    })

    it('1.3 Should revert if amount is zero', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]

      const gasZipCallData = createGasZipCallData({
        recieverType: GasZipReciever.EvmReciver,
        desChainId: [
          GasZipChainIds[CHAIN_IDS.ARBITRUM_MAINNET],
          GasZipChainIds[CHAIN_IDS.BASE_MAINNET],
        ],
        reciever: recipient.address,
      })

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

      const gasZipData = {
        data: gasZipCallData,
        depositAmount: ZERO,
      }

      await expect(
        contracts.gasZipFacet
          .connect(user)
          .bridgeTokensViaGasZip(transactionId, integratorAddress, gasZipData, {
            value,
          })
      ).revertedWithCustomError(contracts.gasZipFacet, ERRORS.InvalidAmount)
    })
  })

  describe('2) swapAndBridgeTokensViaGasZip', () => {
    beforeEach(async () => {
      await contracts.dexManagerFacet
        .connect(dexManager)
        .batchAddDex([mock.mockExchange.address])
    })

    it('2.1 Should allow user to swap src token then bridge them to destination chain (swap erc20 -> native)', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]
      const rate = await mock.mockExchange.rate()

      const gasZipCallData = createGasZipCallData({
        recieverType: GasZipReciever.EvmReciver,
        desChainId: [
          GasZipChainIds[CHAIN_IDS.ARBITRUM_MAINNET],
          GasZipChainIds[CHAIN_IDS.BASE_MAINNET],
        ],
        reciever: recipient.address,
      })

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]
      const swapReturnAmount = parseUnits(
        formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), TOKEN_A_DECIMAL),
        18
      )
      const minSwapReturnAmount = swapReturnAmount.sub(parseUnits('1', 18))
      // const minSwapReturnAmount = swapReturnAmount

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          [amounts[0].add(swapReturnAmount)],
          FeeType.BRIDGE
        )

      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapData = [
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
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // -------------------------------------

      const gasZipData = {
        data: gasZipCallData,
        depositAmount: amounts[0],
      }

      // -------------------------------------

      const tx = contracts.gasZipFacet
        .connect(user)
        .swapAndBridgeTokensViaGasZip(
          transactionId,
          integratorAddress,
          swapData,
          gasZipData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [user, gasZipDepositor, protoFeeVault, integrator1, dZapDiamond],
        [
          convertBNToNegative(value),
          amountWithoutFee[0], // (amount[0] + swapAmount) - fee
          fixedNativeFeeAmount.add(tokenFeeData[0].dzapFee),
          tokenFeeData[0].integratorFee,
          0,
        ]
      )

      await expect(tx).changeTokenBalances(
        mock.tokenA,
        [
          user,
          mock.mockExchange,
          gasZipDepositor,
          protoFeeVault,
          integrator1,
          dZapDiamond,
        ],
        [convertBNToNegative(amounts[1]), amounts[1], 0, 0, 0, 0]
      )

      await expect(tx).emit(
        contracts.gasZipFacet,
        EVENTS.GasZipSwapBridgeTransferStarted
      )

      const eventFilter =
        contracts.gasZipFacet.filters.GasZipSwapBridgeTransferStarted()
      const data = await contracts.gasZipFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.swapInfo.length).eql(1)
      expect(args.gasZipData).eql([
        gasZipData.data.toLowerCase(),
        amountWithoutFee[0],
      ])
      validateSwapEventData(args.swapInfo[0], swapData[0], swapReturnAmount)
    })

    it('2.2 Should allow user to swap src token, return leftOver and extra then bridge them to destination chain', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]
      const rate = await mock.mockExchange.rate()
      const leftOverPercent = await mock.mockExchange.leftOverPercent()

      const gasZipCallData = createGasZipCallData({
        recieverType: GasZipReciever.EvmReciver,
        desChainId: [
          GasZipChainIds[CHAIN_IDS.ARBITRUM_MAINNET],
          GasZipChainIds[CHAIN_IDS.BASE_MAINNET],
        ],
        reciever: recipient.address,
      })

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]

      const swapReturnAmount = parseUnits(
        formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), TOKEN_A_DECIMAL),
        18
      )
      // const minSwapReturnAmount = swapReturnAmount.sub(parseUnits('1', 18))
      const minSwapReturnAmount = swapReturnAmount
      const leftOverFromAmount = amounts[1]
        .mul(leftOverPercent)
        .div(BPS_DENOMINATOR)

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          [amounts[0].add(swapReturnAmount)],
          FeeType.BRIDGE
        )

      const extra = parseUnits('0.5', TOKEN_A_DECIMAL)
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapData = [
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
              amounts[1],
              true,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // -------------------------------------

      const gasZipData = {
        data: gasZipCallData,
        depositAmount: amounts[0],
      }

      // -------------------------------------

      const tx = contracts.gasZipFacet
        .connect(user)
        .swapAndBridgeTokensViaGasZip(
          transactionId,
          integratorAddress,
          swapData,
          gasZipData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [user, gasZipDepositor, protoFeeVault, integrator1, dZapDiamond],
        [
          convertBNToNegative(value.sub(extra)),
          amountWithoutFee[0], // (amount[0] + swapAmount) - fee
          fixedNativeFeeAmount.add(tokenFeeData[0].dzapFee),
          tokenFeeData[0].integratorFee,
          0,
        ]
      )

      await expect(tx).changeTokenBalances(
        mock.tokenA,
        [
          user,
          mock.mockExchange,
          gasZipDepositor,
          protoFeeVault,
          integrator1,
          dZapDiamond,
        ],
        [
          convertBNToNegative(amounts[1].sub(leftOverFromAmount)),
          amounts[1].sub(leftOverFromAmount),
          0,
          0,
          0,
          0,
        ]
      )

      await expect(tx).emit(
        contracts.gasZipFacet,
        EVENTS.GasZipSwapBridgeTransferStarted
      )

      const eventFilter =
        contracts.gasZipFacet.filters.GasZipSwapBridgeTransferStarted()
      const data = await contracts.gasZipFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.swapInfo.length).eql(1)
      expect(args.gasZipData).eql([
        gasZipData.data.toLowerCase(),
        amountWithoutFee[0],
      ])
      validateSwapEventData(
        args.swapInfo[0],
        swapData[0],
        swapReturnAmount,
        leftOverFromAmount
      )
    })

    it('2.3 Should allow user to swap src token, using permit2', async () => {
      // -------------------------------------

      const user = await generateRandomWallet()
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]
      const rate = await mock.mockExchange.rate()

      const gasZipCallData = createGasZipCallData({
        recieverType: GasZipReciever.EvmReciver,
        desChainId: [
          GasZipChainIds[CHAIN_IDS.ARBITRUM_MAINNET],
          GasZipChainIds[CHAIN_IDS.BASE_MAINNET],
        ],
        reciever: recipient.address,
      })

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]
      const swapReturnAmount = parseUnits(
        formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), TOKEN_A_DECIMAL),
        18
      )
      const minSwapReturnAmount = swapReturnAmount

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          [amounts[0].add(swapReturnAmount)],
          FeeType.BRIDGE
        )

      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(mock.permit2.address, ethers.constants.MaxUint256)

      // -------------------------------------

      const encodedPermitData = await getPermi2ApprovetData(
        mock.permit2,
        user,
        mock.tokenA.address,
        dZapDiamond.address,
        amounts[0]
      )

      // -------------------------------------
      const swapData = [
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
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodedPermitData,
        },
      ]

      // -------------------------------------

      const gasZipData = {
        data: gasZipCallData,
        depositAmount: amounts[0],
      }

      // -------------------------------------

      const tx = contracts.gasZipFacet
        .connect(user)
        .swapAndBridgeTokensViaGasZip(
          transactionId,
          integratorAddress,
          swapData,
          gasZipData,
          {
            value,
          }
        )

      await expect(tx).changeEtherBalances(
        [user, gasZipDepositor, protoFeeVault, integrator1, dZapDiamond],
        [
          convertBNToNegative(value),
          amountWithoutFee[0], // (amount[0] + swapAmount) - fee
          fixedNativeFeeAmount.add(tokenFeeData[0].dzapFee),
          tokenFeeData[0].integratorFee,
          0,
        ]
      )

      await expect(tx).changeTokenBalances(
        mock.tokenA,
        [
          user,
          mock.mockExchange,
          gasZipDepositor,
          protoFeeVault,
          integrator1,
          dZapDiamond,
        ],
        [convertBNToNegative(amounts[1]), amounts[1], 0, 0, 0, 0]
      )

      await expect(tx).emit(
        contracts.gasZipFacet,
        EVENTS.GasZipSwapBridgeTransferStarted
      )

      const eventFilter =
        contracts.gasZipFacet.filters.GasZipSwapBridgeTransferStarted()
      const data = await contracts.gasZipFacet.queryFilter(eventFilter)
      const args = data[data.length - 1].args

      expect(args.transactionId).eql(transactionId)
      expect(args.integrator).eql(integratorAddress)
      expect(args.sender).eql(user.address)
      expect(args.swapInfo.length).eql(1)
      expect(args.gasZipData).eql([
        gasZipData.data.toLowerCase(),
        amountWithoutFee[0],
      ])
      validateSwapEventData(args.swapInfo[0], swapData[0], swapReturnAmount)
    })

    it('2.4 Should revert if swap dex is not allowed', async () => {
      await contracts.dexManagerFacet
        .connect(dexManager)
        .removeDex(mock.mockExchange.address)

      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]
      const rate = await mock.mockExchange.rate()

      const gasZipCallData = createGasZipCallData({
        recieverType: GasZipReciever.EvmReciver,
        desChainId: [
          GasZipChainIds[CHAIN_IDS.ARBITRUM_MAINNET],
          GasZipChainIds[CHAIN_IDS.BASE_MAINNET],
        ],
        reciever: recipient.address,
      })

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]
      const swapReturnAmount = parseUnits(
        formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), TOKEN_A_DECIMAL),
        18
      )
      const minSwapReturnAmount = swapReturnAmount.sub(parseUnits('1', 18))
      // const minSwapReturnAmount = swapReturnAmount

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          [amounts[0].add(swapReturnAmount)],
          FeeType.BRIDGE
        )

      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapData = [
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
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // -------------------------------------

      const gasZipData = {
        data: gasZipCallData,
        depositAmount: amounts[0],
      }

      // -------------------------------------

      await expect(
        contracts.gasZipFacet
          .connect(user)
          .swapAndBridgeTokensViaGasZip(
            transactionId,
            integratorAddress,
            swapData,
            gasZipData,
            {
              value,
            }
          )
      )
        .revertedWithCustomError(contracts.gasZipFacet, ERRORS.UnAuthorizedCall)
        .withArgs(swapData[0].callTo)
    })

    it('2.5 Should revert if amount is 0', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]
      const rate = await mock.mockExchange.rate()

      const gasZipCallData = createGasZipCallData({
        recieverType: GasZipReciever.EvmReciver,
        desChainId: [
          GasZipChainIds[CHAIN_IDS.ARBITRUM_MAINNET],
          GasZipChainIds[CHAIN_IDS.BASE_MAINNET],
        ],
        reciever: recipient.address,
      })

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]
      const swapReturnAmount = parseUnits(
        formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), TOKEN_A_DECIMAL),
        18
      )
      const minSwapReturnAmount = swapReturnAmount.sub(parseUnits('1', 18))
      // const minSwapReturnAmount = swapReturnAmount

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          [amounts[0].add(swapReturnAmount)],
          FeeType.BRIDGE
        )

      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapData = [
        {
          callTo: mock.mockExchange.address,
          approveTo: mock.mockExchange.address,
          from: mock.tokenA.address,
          to: NATIVE_ADDRESS,
          fromAmount: ZERO,
          minToAmount: minSwapReturnAmount,
          swapCallData: (
            await mock.mockExchange.populateTransaction.swap(
              mock.tokenA.address,
              NATIVE_ADDRESS,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // -------------------------------------

      const gasZipData = {
        data: gasZipCallData,
        depositAmount: amounts[0],
      }

      // -------------------------------------

      await expect(
        contracts.gasZipFacet
          .connect(user)
          .swapAndBridgeTokensViaGasZip(
            transactionId,
            integratorAddress,
            swapData,
            gasZipData,
            {
              value,
            }
          )
      ).revertedWithCustomError(
        contracts.gasZipFacet,
        ERRORS.NoSwapFromZeroBalance
      )
    })

    it('2.6 Should revert if swap to token is not native', async () => {
      // -------------------------------------

      const user = signers[12]
      const transactionId = ethers.utils.formatBytes32String('dummyId')
      const integratorAddress = integrator1.address
      const recipient = signers[14]
      const rate = await mock.mockExchange.rate()

      const gasZipCallData = createGasZipCallData({
        recieverType: GasZipReciever.EvmReciver,
        desChainId: [
          GasZipChainIds[CHAIN_IDS.ARBITRUM_MAINNET],
          GasZipChainIds[CHAIN_IDS.BASE_MAINNET],
        ],
        reciever: recipient.address,
      })

      // -------------------------------------
      const amounts = [parseUnits('20'), parseUnits('10', TOKEN_A_DECIMAL)]
      const swapReturnAmount = parseUnits(
        formatUnits(amounts[1].mul(rate).div(BPS_MULTIPLIER), TOKEN_A_DECIMAL),
        18
      )
      const minSwapReturnAmount = swapReturnAmount.sub(parseUnits('1', 18))
      // const minSwapReturnAmount = swapReturnAmount

      const { amountWithoutFee, fixedNativeFeeAmount, tokenFeeData } =
        await getFeeData(
          dZapDiamond.address,
          integratorAddress,
          [amounts[0].add(swapReturnAmount)],
          FeeType.BRIDGE
        )

      const extra = 0
      const value = amounts[0].add(fixedNativeFeeAmount).add(extra)

      // -------------------------------------

      await mock.tokenA.mint(user.address, parseUnits('100', TOKEN_A_DECIMAL))
      await mock.tokenA
        .connect(user)
        .approve(dZapDiamond.address, parseUnits('100', TOKEN_A_DECIMAL))

      // -------------------------------------
      const swapData = [
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
              NATIVE_ADDRESS,
              dZapDiamond.address,
              amounts[1],
              false,
              false
            )
          ).data as string,
          permit: encodePermitData('0x', PermitType.PERMIT),
        },
      ]

      // -------------------------------------

      const gasZipData = {
        data: gasZipCallData,
        depositAmount: amounts[0],
      }

      // -------------------------------------

      await expect(
        contracts.gasZipFacet
          .connect(user)
          .swapAndBridgeTokensViaGasZip(
            transactionId,
            integratorAddress,
            swapData,
            gasZipData,
            {
              value,
            }
          )
      ).revertedWithCustomError(contracts.gasZipFacet, ERRORS.NotNativeToken)
    })
  })
})
