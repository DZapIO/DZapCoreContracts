import { ethers } from 'hardhat'
import { expect } from 'chai'

import { BPS_MULTIPLIER, CONTRACTS, ERRORS } from '../../constants'
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
  BridgeManagerFacet,
} from '../../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  getSelectorsUsingContract,
  getSighash,
} from '../../scripts/utils/diamond'
import { parseUnits } from 'ethers/lib/utils'
import { equal } from 'assert'
import { DiamondCut } from '../../types'
import { FacetCutAction } from 'hardhat-deploy/dist/types'

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
let bridgeManagerFacet: BridgeManagerFacet
let bridgeManagerFacetImp: BridgeManagerFacet
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

describe('AccessManagerFacet.test.ts', async () => {
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

  describe('(1) Access manager facet test', async () => {
    it('1.1 Should allow owner to give access to different executors for different functions', async () => {
      // Dex Access
      {
        const selector = getSighash(
          [
            dexManagerFacet.interface.functions['addDex(address)'],
            dexManagerFacet.interface.functions['batchAddDex(address[])'],
          ],
          dexManagerFacet.interface
        )

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector[0],
            dexManager.address
          )
        ).equal(false)

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector[1],
            dexManager.address
          )
        ).equal(false)

        // -------------------------------

        await accessManagerFacet
          .connect(owner)
          .setCanExecute(selector[0], dexManager.address, true)

        await accessManagerFacet
          .connect(owner)
          .setCanExecute(selector[1], dexManager.address, true)

        // -------------------------------

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector[0],
            dexManager.address
          )
        ).equal(true)

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector[1],
            dexManager.address
          )
        ).equal(true)

        // -------------------------------

        await accessManagerFacet
          .connect(owner)
          .setCanExecute(selector[1], dexManager.address, false)

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector[0],
            dexManager.address
          )
        ).equal(true)

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector[1],
            dexManager.address
          )
        ).equal(false)
      }

      // feeManager
      {
        const selector = getSighash(
          [
            feesFacet.interface.functions['setProtocolFeeVault(address)'],
            feesFacet.interface.functions[
              'setIntegratorInfo(address,uint8[],(uint256,uint256,uint256,uint256)[])'
            ],
          ],
          feesFacet.interface
        )

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector[0],
            feeManager.address
          )
        ).equal(false)

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector[1],
            feeManager.address
          )
        ).equal(false)

        // -------------------------------

        await accessManagerFacet
          .connect(owner)
          .setCanExecute(selector[0], feeManager.address, true)

        await accessManagerFacet
          .connect(owner)
          .setCanExecute(selector[1], feeManager.address, true)

        // -------------------------------

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector[0],
            feeManager.address
          )
        ).equal(true)

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector[1],
            feeManager.address
          )
        ).equal(true)

        // -------------------------------

        await accessManagerFacet
          .connect(owner)
          .setCanExecute(selector[1], feeManager.address, false)

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector[0],
            feeManager.address
          )
        ).equal(true)

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector[1],
            feeManager.address
          )
        ).equal(false)
      }

      // crossChainManager
      {
        const selector = getSighash(
          [
            bridgeManagerFacet.interface.functions[
              'updateSelectorInfo(address[],bytes4[],uint256[])'
            ],
          ],
          bridgeManagerFacet.interface
        )[0]

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector,
            crossChainManager.address
          )
        ).equal(false)

        // -------------------------------

        await accessManagerFacet
          .connect(owner)
          .setCanExecute(selector, dexManager.address, true)

        // -------------------------------

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector,
            dexManager.address
          )
        ).equal(true)

        // -------------------------------

        await accessManagerFacet
          .connect(owner)
          .setCanExecute(selector, dexManager.address, false)

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            selector,
            dexManager.address
          )
        ).equal(false)
      }
    })

    it('1.2 Should allow owner to give access to different executors for different functions (batch)', async () => {
      // Dex Access
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

        // ---------------------------

        await accessManagerFacet
          .connect(owner)
          .setBatchCanExecute(selectors, executors, canExecute)

        // ---------------------------

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            dexSelectors[0],
            dexManager.address
          )
        ).equal(true)

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            dexSelectors[1],
            dexManager.address
          )
        ).equal(true)

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            feeSelectors[0],
            feeManager.address
          )
        ).equal(true)

        expect(
          await accessManagerFacet.addressCanExecuteMethod(
            crossChainSelectors[0],
            crossChainManager.address
          )
        ).equal(true)
      }
    })

    it('1.3 Should revert if caller is not owner', async () => {
      const selector = getSighash(
        [
          dexManagerFacet.interface.functions['addDex(address)'],
          dexManagerFacet.interface.functions['batchAddDex(address[])'],
        ],
        dexManagerFacet.interface
      )
      const dexCanExecute = selector.map(() => true)
      const dexExecutors = selector.map(() => dexManager.address)

      await accessManagerFacet
        .connect(owner)
        .setCanExecute(selector[0], dexManager.address, true)

      await expect(
        accessManagerFacet
          .connect(deployer)
          .setCanExecute(selector[0], dexManager.address, true)
      ).revertedWithCustomError(accessManagerFacet, ERRORS.OnlyContractOwner)

      await expect(
        accessManagerFacet
          .connect(deployer)
          .setBatchCanExecute(selector, dexExecutors, dexCanExecute)
      ).revertedWithCustomError(accessManagerFacet, ERRORS.OnlyContractOwner)
    })

    it('1.3 Should revert if executor address is same as diamond address', async () => {
      const selector = getSighash(
        [
          dexManagerFacet.interface.functions['addDex(address)'],
          dexManagerFacet.interface.functions['batchAddDex(address[])'],
        ],
        dexManagerFacet.interface
      )

      await accessManagerFacet
        .connect(owner)
        .setCanExecute(selector[0], dexManager.address, true)

      await expect(
        accessManagerFacet
          .connect(owner)
          .setCanExecute(selector[0], accessManagerFacet.address, true)
      ).revertedWithCustomError(accessManagerFacet, ERRORS.CannotAuthorizeSelf)

      await expect(
        accessManagerFacet
          .connect(owner)
          .setBatchCanExecute(
            [selector[0]],
            [accessManagerFacet.address],
            [true]
          )
      ).revertedWithCustomError(accessManagerFacet, ERRORS.CannotAuthorizeSelf)
    })
  })
})
