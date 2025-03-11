import { ethers } from 'hardhat'
import { DZAP_NATIVE, NATIVE_ADDRESS } from '../constants'
import { BigNumberish, Signer } from 'ethers'
import { ERC20 } from '../typechain-types'

export const isNative = (token: string) => {
  token = ethers.utils.getAddress(token)
  return token == NATIVE_ADDRESS || token == DZAP_NATIVE
}

export const approveToken = async (
  signer: Signer,
  tokenAddress: string,
  spender: string,
  approveAmount: BigNumberish
) => {
  const erc20 = (await ethers.getContractAt(
    '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20',
    tokenAddress
  )) as ERC20

  const allowance = await erc20.connect(signer).allowance(spender, spender)

  if (!allowance.gt(0)) {
    const tx = await erc20.connect(signer).approve(spender, approveAmount)
    console.log('Approving token tx', tx.hash)
    await tx.wait()
    console.log('Completed Token Approval')
  } else {
    console.log('Already Approved')
  }
}
