import { encodePermitData } from '../../scripts/core/helper'
import { PermitType } from '../../types'

export const TOKEN_A_DECIMAL = 18
export const TOKEN_B_DECIMAL = 6

export const DEFAULT_ENCODDED_PERMIT = encodePermitData('0x', PermitType.PERMIT)
