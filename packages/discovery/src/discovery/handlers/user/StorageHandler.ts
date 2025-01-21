import type { Bytes, EthereumAddress } from '@l2beat/shared-pure'
import { utils } from 'ethers'
import * as z from 'zod'

import { getErrorMessage } from '../../../utils/getErrorMessage'
import type { IProvider } from '../../provider/IProvider'
import type { Handler, HandlerResult } from '../Handler'
import {
  Reference,
  type ReferenceInput,
  generateReferenceInput,
  getReferencedName,
  resolveReference,
} from '../reference'
import { SingleSlot } from '../storageCommon'
import { NumberFromString } from '../types'
import { bytes32ToContractValue } from '../utils/bytes32ToContractValue'
import { valueToBigInt } from '../utils/valueToBigInt'

export type StorageHandlerDefinition = z.infer<typeof StorageHandlerDefinition>
export const StorageHandlerDefinition = z.strictObject({
  type: z.literal('storage'),
  slot: z.union([SingleSlot, z.array(SingleSlot).min(1)]),
  offset: z.optional(
    z.union([z.number().int().nonnegative(), NumberFromString, Reference]),
  ),
  returnType: z.optional(z.enum(['address', 'bytes', 'number', 'uint8'])),
  ignoreRelative: z.optional(z.boolean()),
})

export class StorageHandler implements Handler {
  readonly dependencies: string[]

  constructor(
    readonly field: string,
    private readonly definition: StorageHandlerDefinition,
  ) {
    this.dependencies = getDependencies(definition)
  }

  async execute(
    provider: IProvider,
    address: EthereumAddress,
    previousResults: Record<string, HandlerResult | undefined>,
  ): Promise<HandlerResult> {
    const referenceInput = generateReferenceInput(
      previousResults,
      provider,
      address,
    )
    const resolved = resolveDependencies(this.definition, referenceInput)

    let storage: Bytes
    try {
      const slot = computeSlot(resolved)
      storage = await provider.getStorage(address, slot)
    } catch (e) {
      return { field: this.field, error: getErrorMessage(e) }
    }
    return {
      field: this.field,
      value: bytes32ToContractValue(storage, resolved.returnType),
      ignoreRelative: this.definition.ignoreRelative,
    }
  }
}

function getDependencies(definition: StorageHandlerDefinition): string[] {
  const dependencies: string[] = []
  const add = (value: string | undefined) => value && dependencies.push(value)

  add(getReferencedName(definition.offset))
  add(getReferencedName(definition.slot))
  if (Array.isArray(definition.slot)) {
    for (const value of definition.slot) {
      add(getReferencedName(value))
    }
  }
  return dependencies
}

type ResolvedDefinition = ReturnType<typeof resolveDependencies>
function resolveDependencies(
  definition: StorageHandlerDefinition,
  referenceInput: ReferenceInput,
): {
  slot: bigint | bigint[]
  offset: bigint
  returnType: 'number' | 'address' | 'bytes' | 'uint8'
} {
  let offset = 0n
  if (definition.offset) {
    const resolved = resolveReference(definition.offset, referenceInput)
    offset = valueToBigInt(resolved)
  }

  let slot: bigint | bigint[]
  if (Array.isArray(definition.slot)) {
    slot = definition.slot.map((x) => {
      const resolved = resolveReference(x, referenceInput)
      return valueToBigInt(resolved)
    })
  } else {
    const resolved = resolveReference(definition.slot, referenceInput)
    slot = valueToBigInt(resolved)
  }

  const returnType: 'number' | 'address' | 'bytes' | 'uint8' =
    definition.returnType ?? 'bytes'

  return {
    slot,
    offset,
    returnType,
  }
}

function computeSlot(resolved: ResolvedDefinition): bigint {
  if (!Array.isArray(resolved.slot)) {
    return resolved.slot + resolved.offset
  }

  const parts = [...resolved.slot]
  while (parts.length >= 3) {
    // biome-ignore lint/style/noNonNullAssertion: we know it's there
    const a = parts.shift()!
    // biome-ignore lint/style/noNonNullAssertion: we know it's there
    const b = parts.shift()!
    parts.unshift(hashBigints([b, a]))
  }
  const slot = hashBigints(parts.reverse())
  return slot + resolved.offset
}

function hashBigints(values: bigint[]): bigint {
  return BigInt(
    utils.keccak256(
      utils.defaultAbiCoder.encode(
        values.map(() => 'uint256'),
        values,
      ),
    ),
  )
}
