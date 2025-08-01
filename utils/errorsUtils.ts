import { AbiCoder, Interface } from 'ethers'

export const getErrorDataWithArgs = (
  iface: Interface,
  errorName: string,
  args: any[],
) => {
  const errorFragment = iface.getError(errorName)
  if (!errorFragment) throw 'Not found'

  const errorSelector = errorFragment.selector
  const types = errorFragment.inputs.map((input) => input.type)
  const errorArgs = AbiCoder.defaultAbiCoder()
    .encode(types, args)
    .replace(/^0x/, '')

  return errorSelector + errorArgs
}
