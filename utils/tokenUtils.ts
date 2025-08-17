import { BigNumberish, Signer } from 'ethers'
import { ethers } from 'hardhat'
import { CONTRACTS, DZAP_NATIVE, NATIVE_ADDRESS } from '../constants'
import { ERC20 } from '../typechain-types'

export const isNative = (token: string) => {
  token = ethers.getAddress(token)
  return token == NATIVE_ADDRESS || token == DZAP_NATIVE
}

export const approveToken = async (
  signer: Signer,
  tokenAddress: string,
  spender: string,
  approveAmount: BigNumberish
) => {
  const erc20 = (await ethers.getContractAt(
    CONTRACTS.ERC20,
    tokenAddress
  )) as unknown as ERC20

  const allowance = await erc20
    .connect(signer)
    .allowance(await signer.getAddress(), spender)
  approveAmount = BigInt(approveAmount)

  if (allowance < approveAmount) {
    const tx = await erc20.connect(signer).approve(spender, approveAmount)
    console.log('Approving token tx', tx.hash)
    await tx.wait()
    console.log('Completed Token Approval')
  } else {
    console.log('Already Approved')
  }
}
