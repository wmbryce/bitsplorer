import { createPublicClient, http } from "viem";
import type { ChainConfig } from "@/utils/chains";
import type { EVMBlock } from "@/types";

export function createEVMClient(chainConfig: ChainConfig & { chainType: 'EVM' }) {
  return createPublicClient({
    chain: chainConfig.chain,
    transport: http(),
  });
}

export async function fetchEVMBlock(
  chainConfig: ChainConfig & { chainType: 'EVM' },
  blockNumber: bigint,
  includeTransactions = false
): Promise<EVMBlock> {
  const client = createEVMClient(chainConfig);
  const block = await client.getBlock({
    blockNumber,
    includeTransactions,
  });

  return {
    ...block,
    chainType: 'EVM',
  } as EVMBlock;
}

export async function fetchLatestEVMBlockNumber(
  chainConfig: ChainConfig & { chainType: 'EVM' }
): Promise<bigint> {
  const client = createEVMClient(chainConfig);
  return await client.getBlockNumber();
}

export type EVMBlockWatchCallback = (block: EVMBlock) => void;
export type EVMBlockWatchErrorCallback = (error: Error) => void;

export function watchEVMBlocks(
  chainConfig: ChainConfig & { chainType: 'EVM' },
  onBlock: EVMBlockWatchCallback,
  onError: EVMBlockWatchErrorCallback
): () => void {
  const client = createEVMClient(chainConfig);

  const unwatch = client.watchBlocks({
    onBlock: async (block) => {
      try {
        // Fetch full block details
        const fullBlock = await client.getBlock({
          blockNumber: block.number,
          includeTransactions: false,
        });

        onBlock({
          ...fullBlock,
          chainType: 'EVM',
        } as EVMBlock);
      } catch (err) {
        onError(err as Error);
      }
    },
    onError: (err) => {
      onError(err as Error);
    },
    emitOnBegin: false,
    poll: true,
    pollingInterval: chainConfig.pollingInterval,
  });

  return unwatch;
}

