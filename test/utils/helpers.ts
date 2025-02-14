import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber, Wallet } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { FacetCutAction } from 'hardhat-deploy/dist/types'
import { ADDRESS_ZERO, CONTRACTS, ZERO } from '../../constants'
import {
  getSelectorsUsingContract,
  getSighash,
} from '../../scripts/utils/diamond'
import {
  AccessManagerFacet,
  BatchBridgeCallFacet,
  BatchSwapFacet,
  BridgeManagerFacet,
  BridgeMock,
  CrossChainFacet,
  DexManagerFacet,
  DiamondCutFacet,
  DiamondInit,
  DiamondLoupeFacet,
  DirectTransferAdapter,
  DZapDiamond,
  ERC20Mock,
  ExchangeMock,
  FeesFacet,
  GasZipAdapter,
  GasZipFacet,
  GenericBridgeAdapter,
  MockGasZipRouter,
  OwnershipFacet,
  Permit2,
  RelayBridgeAdapter,
  RelayBridgeFacet,
  SwapFacet,
  SwapTransferFacet,
  WithdrawFacet,
  WNATIVE,
} from '../../typechain-types'
import { AccessContractObj, DiamondCut, PermitType } from '../../types'
import { GasZipReciever } from '../constants/gasZip'
import { duration, latest } from './time'
import { getPermit2SignatureAndCalldataForApprove } from './permit'
import { ERC20 } from '../../typechain-types/contracts/Test/Permit2Mock.sol'
import { calculateOffset, encodePermitData } from '../../scripts/core/helper'
import { DEFAULT_BYTES } from '../../constants/others'
import {
  GasZipData,
  GasZipDataForContract,
  GasZipDataForDirectDeposit,
} from '../types'
import { hexRightPad } from '../../utils'

export const validateBridgeEventData = (
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

export const validateSwapEventData = (
  eventSwapData,
  swapData,
  minReturn,
  leftoverFromAmount = ZERO
) => {
  expect(eventSwapData[0]).equal(swapData.callTo)
  expect(eventSwapData[1]).equal(swapData.from)
  expect(eventSwapData[2]).equal(swapData.to)
  expect(eventSwapData[3]).equal(swapData.fromAmount)
  expect(eventSwapData[4]).equal(leftoverFromAmount)
  expect(eventSwapData[5]).equal(minReturn)
}

export const deployAndAdapters = async (
  dZapDiamondAddress: string,
  bridgeManager: SignerWithAddress
) => {
  const bridgeManagerFacet = (await ethers.getContractAt(
    CONTRACTS.BridgeManagerFacet,
    dZapDiamondAddress
  )) as any as BridgeManagerFacet

  const GasZipAdapter = await ethers.getContractFactory(CONTRACTS.GasZipAdapter)
  const gasZipAdapter = (await GasZipAdapter.deploy()) as any as GasZipAdapter

  const DirectTransferAdapter = await ethers.getContractFactory(
    CONTRACTS.DirectTransferAdapter
  )
  const directTransferAdapter =
    (await DirectTransferAdapter.deploy()) as any as DirectTransferAdapter

  const RelayBridgeAdapter = await ethers.getContractFactory(
    CONTRACTS.RelayBridgeAdapter
  )
  const relayBridgeAdapter =
    (await RelayBridgeAdapter.deploy()) as any as RelayBridgeAdapter

  const GenericBridgeAdapter = await ethers.getContractFactory(
    CONTRACTS.GenericBridgeAdapter
  )
  const genericBridgeAdapter =
    (await GenericBridgeAdapter.deploy()) as any as GenericBridgeAdapter

  await bridgeManagerFacet
    .connect(bridgeManager)
    .addAdapters([
      gasZipAdapter.address,
      directTransferAdapter.address,
      relayBridgeAdapter.address,
      genericBridgeAdapter.address,
    ])

  return {
    gasZipAdapter,
    directTransferAdapter,
    relayBridgeAdapter,
    genericBridgeAdapter,
  }
}

export const deployFacets = async (facetObj: { [key: string]: any[] }) => {
  const cutData: DiamondCut[] = []
  const facetNames = Object.keys(facetObj)
  for (let i = 0; i < facetNames.length; i++) {
    const facetName = facetNames[i]
    const ContractFactory = await ethers.getContractFactory(facetName)
    const contract = await ContractFactory.deploy(...facetObj[facetName])
    await contract.deployed()

    const tempCutData = {
      facetAddress: contract.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectorsUsingContract(contract, facetName)
        .selectors,
    }
    cutData.push(tempCutData)
  }
  return cutData
}

export const deployAndIntializeDimond = async ({
  owner,
  cutData,
  permit2Address,
  protoFeeVaultAddrsess,
  maxTokenFee,
  maxFixedTokenFee,
}) => {
  const DiamondCutFacet = await ethers.getContractFactory(
    CONTRACTS.DiamondCutFacet
  )
  const DiamondInit = await ethers.getContractFactory(CONTRACTS.DiamondInit)
  const DZapDiamond = await ethers.getContractFactory(CONTRACTS.DZapDiamond)

  const diamondCutFacetImp = await DiamondCutFacet.deploy()
  await diamondCutFacetImp.deployed()

  const diamondInit = (await DiamondInit.deploy()) as DiamondInit
  await diamondInit.deployed()

  const dZapDiamond = (await DZapDiamond.deploy(
    owner.address,
    diamondCutFacetImp.address
  )) as DZapDiamond
  await dZapDiamond.deployed()

  // ------------------------------

  const { data: initData } = await diamondInit.populateTransaction.initialize(
    permit2Address,
    protoFeeVaultAddrsess,
    maxTokenFee,
    maxFixedTokenFee
  )

  const diamondCutFacet = (await ethers.getContractAt(
    CONTRACTS.DiamondCutFacet,
    dZapDiamond.address
  )) as DiamondCutFacet

  await diamondCutFacet
    .connect(owner)
    .diamondCut(cutData, diamondInit.address, initData as string)

  return dZapDiamond
}

export const setAccessControl = async (
  owner: SignerWithAddress,
  accessContractObj: AccessContractObj,
  contractAddress: string
) => {
  let selectors: string[] = []
  let executors: string[] = []
  let canExecute: boolean[] = []
  const accessManagerFacet = (await ethers.getContractAt(
    CONTRACTS.AccessManagerFacet,
    contractAddress
  )) as AccessManagerFacet

  const facetNames = Object.keys(accessContractObj)
  for (let i = 0; i < facetNames.length; i++) {
    const facetName = facetNames[i]
    const ContractFactory = await ethers.getContractFactory(facetName)
    const iface = ContractFactory.interface
    const { functionNames, executor } = accessContractObj[facetName]

    const fragments = functionNames.map((funName) => iface.getFunction(funName))
    const tempSelectors = getSighash(fragments, iface)
    const tempExecutors = tempSelectors.map(() => executor)

    selectors = [...selectors, ...tempSelectors]
    executors = [...executors, ...tempExecutors]
  }
  canExecute = selectors.map(() => true)

  const tx = await accessManagerFacet
    .connect(owner)
    .setBatchCanExecute(selectors, executors, canExecute)
  await tx.wait()
}

export const getAllFacets = async (contractAddress: string) => {
  const diamondCutFacet = (await ethers.getContractAt(
    CONTRACTS.DiamondCutFacet,
    contractAddress
  )) as DiamondCutFacet
  const diamondInit = (await ethers.getContractAt(
    CONTRACTS.DiamondInit,
    contractAddress
  )) as DiamondInit
  const diamondLoupeFacet = (await ethers.getContractAt(
    CONTRACTS.DiamondLoupeFacet,
    contractAddress
  )) as DiamondLoupeFacet

  const feesFacet = (await ethers.getContractAt(
    CONTRACTS.FeesFacet,
    contractAddress
  )) as FeesFacet
  const accessManagerFacet = (await ethers.getContractAt(
    CONTRACTS.AccessManagerFacet,
    contractAddress
  )) as AccessManagerFacet
  const withdrawFacet = (await ethers.getContractAt(
    CONTRACTS.WithdrawFacet,
    contractAddress
  )) as WithdrawFacet
  const ownershipFacet = (await ethers.getContractAt(
    CONTRACTS.OwnershipFacet,
    contractAddress
  )) as OwnershipFacet

  const dexManagerFacet = (await ethers.getContractAt(
    CONTRACTS.DexManagerFacet,
    contractAddress
  )) as DexManagerFacet
  const bridgeManagerFacet = (await ethers.getContractAt(
    CONTRACTS.BridgeManagerFacet,
    contractAddress
  )) as BridgeManagerFacet

  const swapFacet = (await ethers.getContractAt(
    CONTRACTS.SwapFacet,
    contractAddress
  )) as SwapFacet
  const swapTransferFacet = (await ethers.getContractAt(
    CONTRACTS.SwapTransferFacet,
    contractAddress
  )) as SwapTransferFacet
  const batchSwapFacet = (await ethers.getContractAt(
    CONTRACTS.BatchSwapFacet,
    contractAddress
  )) as BatchSwapFacet

  const crossChainFacet = (await ethers.getContractAt(
    CONTRACTS.CrossChainFacet,
    contractAddress
  )) as CrossChainFacet
  const relayBridgeFacet = (await ethers.getContractAt(
    CONTRACTS.RelayBridgeFacet,
    contractAddress
  )) as RelayBridgeFacet
  const gasZipFacet = (await ethers.getContractAt(
    CONTRACTS.GasZipFacet,
    contractAddress
  )) as GasZipFacet
  const batchBridgeCallFacet = (await ethers.getContractAt(
    CONTRACTS.BatchBridgeCallFacet,
    contractAddress
  )) as BatchBridgeCallFacet

  return {
    diamondCutFacet,
    diamondInit,
    diamondLoupeFacet,
    feesFacet,
    dexManagerFacet,
    bridgeManagerFacet,
    accessManagerFacet,
    withdrawFacet,
    ownershipFacet,
    swapFacet,
    swapTransferFacet,
    batchSwapFacet,
    crossChainFacet,
    relayBridgeFacet,
    gasZipFacet,
    batchBridgeCallFacet,
  }
}

export const getMockContract = async (
  deployer: SignerWithAddress,
  TOKEN_A_DECIMAL: number,
  TOKEN_B_DECIMAL: number
) => {
  const ERC20Artifact = await ethers.getContractFactory(CONTRACTS.ERC20Mock)
  const tokenA = (await ERC20Artifact.connect(deployer).deploy(
    'MTokenA',
    'MA',
    TOKEN_A_DECIMAL,
    parseUnits('10000', TOKEN_A_DECIMAL)
  )) as ERC20Mock

  const tokenB = (await ERC20Artifact.connect(deployer).deploy(
    'MTokenB',
    'MB',
    TOKEN_B_DECIMAL,
    parseUnits('10000', TOKEN_A_DECIMAL)
  )) as ERC20Mock

  const WNativeArtifact = await ethers.getContractFactory(CONTRACTS.WNATIVE)
  const wNative = (await WNativeArtifact.connect(deployer).deploy()) as WNATIVE

  const Permit2Artifact = await ethers.getContractFactory(CONTRACTS.Permit2)
  const permit2 = (await Permit2Artifact.connect(deployer).deploy()) as Permit2

  const ExchangeMock = await ethers.getContractFactory(CONTRACTS.ExchangeMock)
  const mockExchange = (await ExchangeMock.connect(
    deployer
  ).deploy()) as ExchangeMock

  const BridgeMock = await ethers.getContractFactory(
    CONTRACTS.BridgeMock,
    deployer
  )
  const mockBridge = (await BridgeMock.connect(deployer).deploy()) as BridgeMock

  const MockGasZipRouter = await ethers.getContractFactory(
    CONTRACTS.MockGasZipRouter
  )
  const mockGasZip = (await MockGasZipRouter.connect(deployer).deploy(
    deployer.address
  )) as MockGasZipRouter

  {
    await tokenA.mint(mockExchange.address, parseUnits('100', TOKEN_A_DECIMAL))
    await tokenB.mint(mockExchange.address, parseUnits('100', TOKEN_B_DECIMAL))

    await wNative.connect(deployer).deposit({ value: parseUnits('200') })
    await wNative
      .connect(deployer)
      .transfer(mockExchange.address, parseUnits('100'))

    await deployer.sendTransaction({
      to: mockExchange.address,
      value: parseUnits('100'),
    })
  }

  return {
    tokenA,
    tokenB,
    wNative,
    permit2,
    mockExchange,
    mockBridge,
    mockGasZip,
  }
}

function isEVMAddress(address: string): boolean {
  return address.length === 42
}

function encodeGasZipChainIds(shorts) {
  return shorts.reduce((acc, short) => {
    const hexShort = ethers.utils
      .hexZeroPad(ethers.utils.hexlify(short), 2)
      .slice(2)
    return acc + hexShort
  }, '')
}

export const getEncodedGasZipData = (data: GasZipDataForContract) => {
  const { destChains, reciever } = createGasZipCallDataForContractDeposit(data)

  const encodedData = ethers.utils.defaultAbiCoder.encode(
    ['bytes32', 'uint256'],
    [reciever, destChains]
  )

  return { encodedData, destChains, reciever }
}

// Function to create a protected salt
export const createGasZipCallDataForContractDeposit = (
  data: GasZipDataForContract
) => {
  let reciever = data.reciever
  let calldata = '0x'
  if (data.recieverType === GasZipReciever.EvmReciver) {
    reciever = hexRightPad(data.reciever, 32)
  } else if (data.reciever.length != 32 * 2 + 2) {
    throw Error('Non EVM Reciever is not valid')
  }

  const destChains = data.desChainId.reduce(
    (p, c) => (p << BigInt(8)) + BigInt(c),
    BigInt(0)
  )

  return {
    destChains,
    reciever,
  }
}

export const createGasZipCallDataForDirectDeposit = (
  data: GasZipDataForDirectDeposit
) => {
  let calldata = '0x'
  if (data.recieverType === GasZipReciever.MsgSender) {
    calldata += '01'
  } else if (data.recieverType === GasZipReciever.EvmReciver) {
    if (!data.reciever || !isEVMAddress(data.reciever))
      throw Error('Reciever is undefined')
    const reciever = ethers.utils.getAddress(data.reciever)

    calldata += '02' + reciever.substring(2)
  } else {
    throw new Error('Not implemented')
  }

  return calldata + encodeGasZipChainIds(data.desChainId)
}

export const getPermi2ApprovetData = async (
  permit2: Permit2,
  user: Wallet,
  tokenAddress: string,
  dZapDiamondAddress: string,
  amount: BigNumber,
  deadlineInMin = 10,
  expirationInMin = 30
) => {
  const deadline = (await latest()).add(duration.minutes(deadlineInMin))
  const expiration = (await latest()).add(duration.minutes(expirationInMin))

  const { customPermitDataForTransfer } =
    await getPermit2SignatureAndCalldataForApprove(
      permit2,
      user,
      tokenAddress,
      dZapDiamondAddress,
      amount,
      deadline,
      expiration
    )

  return encodePermitData(
    customPermitDataForTransfer,
    PermitType.PERMIT2_APPROVE
  )
}

export const addBridgeSelectors = async (
  mockBridge: BridgeMock,
  bridgeManagerFacet: BridgeManagerFacet,
  bridgeManager: SignerWithAddress
) => {
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
      mockBridge.interface.functions['bridge(address,address,uint256,bool)'],
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
    .connect(bridgeManager)
    .updateSelectorInfo(routers, selectors, selectorInfo)
}
