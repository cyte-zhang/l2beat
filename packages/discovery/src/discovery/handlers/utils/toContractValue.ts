import type { ContractValue } from '@l2beat/discovery-types'
import { BigNumber } from 'ethers'

export function toContractValue(value: unknown): ContractValue {
  if (Array.isArray(value)) {
    return value.map(toContractValue)
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }
  if (BigNumber.isBigNumber(value)) {
    if (
      value.gt(Number.MAX_SAFE_INTEGER.toString()) ||
      value.lt(Number.MIN_SAFE_INTEGER.toString())
    ) {
      return value.toString()
    } else {
      return value.toNumber()
    }
  }
  return `${value}`
}
