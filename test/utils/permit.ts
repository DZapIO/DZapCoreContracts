import { BigNumberish, constants, Wallet } from 'ethers'
import { ethers } from 'hardhat'
import { ERC20Mock, Permit2 } from '../../typechain-types'
// import { DaiMock, ERC20Mock, Permit2 } from '../../typechain-types'
import {
  AllowanceTransfer,
  MaxAllowanceExpiration,
  MaxAllowanceTransferAmount,
  MaxSigDeadline,
  MaxSignatureTransferAmount,
  PermitSingle,
  PermitTransferFrom,
  SignatureTransfer,
} from '@uniswap/permit2-sdk'
import { latest } from './time'

export async function getPermitSignatureAndCalldata(
  wallet: Wallet,
  token: ERC20Mock,
  spender: string,
  value: BigNumberish = constants.MaxUint256,
  deadline = constants.MaxUint256,
  permitConfig?: {
    nonce?: BigNumberish
    name?: string
    chainId?: number
    version?: string
  }
) {
  const [nonce, name, version, chainId] = await Promise.all([
    permitConfig?.nonce ?? token.nonces(wallet.address),
    permitConfig?.name ?? token.name(),
    permitConfig?.version ?? '1',
    permitConfig?.chainId ?? wallet.getChainId(),
  ])

  const message = await wallet._signTypedData(
    {
      name,
      version,
      chainId,
      verifyingContract: token.address,
    },
    {
      Permit: [
        {
          name: 'owner',
          type: 'address',
        },
        {
          name: 'spender',
          type: 'address',
        },
        {
          name: 'value',
          type: 'uint256',
        },
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
    },
    {
      owner: wallet.address,
      spender,
      value,
      nonce,
      deadline,
    }
  )

  const signature = ethers.utils.splitSignature(message)

  const data = ethers.utils.defaultAbiCoder.encode(
    ['address', 'address', 'uint256', 'uint256', 'uint8', 'bytes32', 'bytes32'],
    [
      wallet.address,
      spender,
      value,
      deadline,
      signature.v,
      signature.r,
      signature.s,
    ]
  )

  return { signature, data }
}

// export async function getDaiPermitSignatureAndCalldata(
//   wallet: Wallet,
//   token: DaiMock,
//   spender: string,
//   expiry = constants.MaxUint256,
//   allowed = true,
//   permitConfig?: {
//     nonce?: BigNumberish
//     name?: string
//     chainId?: number
//     version?: string
//   }
// ) {
//   const [nonce, name, version, chainId] = await Promise.all([
//     permitConfig?.nonce ?? token.getNonce(wallet.address),
//     permitConfig?.name ?? token.name(),
//     permitConfig?.version ?? '1',
//     permitConfig?.chainId ?? wallet.getChainId(),
//   ])

//   const message = await wallet._signTypedData(
//     {
//       name,
//       version,
//       verifyingContract: token.address,
//       salt: ethers.utils.hexZeroPad(ethers.utils.hexlify(chainId), 32),
//     },
//     {
//       Permit: [
//         {
//           name: 'holder',
//           type: 'address',
//         },
//         {
//           name: 'spender',
//           type: 'address',
//         },
//         {
//           name: 'nonce',
//           type: 'uint256',
//         },
//         {
//           name: 'expiry',
//           type: 'uint256',
//         },
//         {
//           name: 'allowed',
//           type: 'bool',
//         },
//       ],
//     },
//     {
//       holder: wallet.address,
//       spender,
//       nonce,
//       expiry,
//       allowed,
//     }
//   )

//   const signature = ethers.utils.splitSignature(message)

//   const data = ethers.utils.defaultAbiCoder.encode(
//     [
//       'address',
//       'address',
//       'uint256',
//       'uint256',
//       'bool',
//       'uint8',
//       'bytes32',
//       'bytes32',
//     ],
//     [
//       wallet.address,
//       spender,
//       nonce,
//       expiry,
//       allowed,
//       signature.v,
//       signature.r,
//       signature.s,
//     ]
//   )

//   return { signature, data }
// }

export async function getPermit2SignatureAndCalldataForApprove(
  permit2: Permit2,
  wallet: Wallet,
  token: string,
  spender: string,
  amount: BigNumberish = MaxAllowanceTransferAmount,
  sigDeadline = MaxSigDeadline,
  expiration = MaxAllowanceExpiration,
  userNonce?: number
) {
  const nonce =
    userNonce ?? (await permit2.allowance(wallet.address, token, spender)).nonce

  const permit: PermitSingle = {
    details: {
      token,
      amount,
      expiration,
      nonce,
    },
    spender,
    sigDeadline,
  }

  const chainId = await wallet.getChainId()
  const { domain, types, values } = AllowanceTransfer.getPermitData(
    permit,
    permit2.address,
    chainId
  )

  const signature = await wallet._signTypedData(domain, types, values)
  const msgHash = AllowanceTransfer.hash(permit, permit2.address, chainId)
  // const sig = ethers.utils.splitSignature(signature)

  const data = ethers.utils.defaultAbiCoder.encode(
    [
      'address owner',
      'tuple(address token, uint160 amount, uint48 expiration, uint48 nonce) details',
      'address spender',
      'uint256 sigDeadline',
      'bytes signature',
    ],
    [
      wallet.address,
      permit.details,
      permit.spender,
      permit.sigDeadline,
      signature,
    ]
  )

  const customPermitDataForTransfer = ethers.utils.defaultAbiCoder.encode(
    [
      'uint160 allowanceAmount',
      'uint48 nonce',
      'uint48 expiration',
      'uint256 sigDeadline',
      'bytes signature',
    ],
    [
      permit.details.amount,
      permit.details.nonce,
      permit.details.expiration,
      permit.sigDeadline,
      signature,
    ]
  )

  return { signature, msgHash, data, customPermitDataForTransfer }
}

export async function getPermit2SignatureAndCalldataForTransfer(
  permit2: Permit2,
  wallet: Wallet,
  token: string,
  spender: string,
  amount: BigNumberish = MaxSignatureTransferAmount,
  deadline = MaxSigDeadline,
  userNonce?: BigNumberish
) {
  const nonce = userNonce ?? (await latest())
  const permit: PermitTransferFrom = {
    permitted: {
      token,
      amount,
    },
    spender,
    nonce,
    deadline,
  }

  const chainId = await wallet.getChainId()
  const { domain, types, values } = SignatureTransfer.getPermitData(
    permit,
    permit2.address,
    chainId
  )

  const signature = await wallet._signTypedData(domain, types, values)
  const msgHash = SignatureTransfer.hash(permit, permit2.address, chainId)
  //   const sig = splitSignature(signature);

  const permitDetails = {
    permitted: {
      token,
      amount,
    },
    nonce,
    deadline,
  }
  const transferDetails = {
    to: spender,
    requestedAmount: amount,
  }

  const data = ethers.utils.defaultAbiCoder.encode(
    [
      'tuple(address token, uint256 amount) permitted',
      'uint256 nonce',
      'uint256 deadline',
      'tuple(address to, uint256 requestedAmount) transferDetails',
      'address owner',
      'bytes signature',
    ],
    [
      permitDetails.permitted,
      permitDetails.nonce,
      permitDetails.deadline,
      transferDetails,
      wallet.address,
      signature,
    ]
  )

  const customPermitDataForTransfer = ethers.utils.defaultAbiCoder.encode(
    ['uint256 nonce', 'uint256 deadline', 'bytes signature'],
    [permitDetails.nonce, permitDetails.deadline, signature]
  )

  return { signature, msgHash, data, customPermitDataForTransfer }
}
