import type { Block } from '@l2beat/shared-pure'

export interface BlockClient {
  getLatestBlockNumber(): Promise<number>
  getBlockWithTransactions(blockNumber: number | 'latest'): Promise<Block>
  chain: string
}
