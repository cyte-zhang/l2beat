import { Bytes } from '@l2beat/shared'

import { ContractValue } from '../../types'

export function valueToBigInt(value: bigint | Bytes | ContractValue) {
  if (value instanceof Bytes) {
    return BigInt(value.toString())
  }
  if (Array.isArray(value) || typeof value === 'object') {
    throw new Error('Cannot convert value to bigint')
  }
  try {
    return BigInt(value)
  } catch (e) {
    throw new Error('Cannot convert value to bigint')
  }
}
