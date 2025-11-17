import type { ChainConfig } from "@/utils/chains";
import { isEVMChain, isSolanaChain } from "@/utils/chains";
import type { Block } from "@/types";
import {
  fetchEVMBlock,
  fetchLatestEVMBlockNumber,
  watchEVMBlocks,
  type EVMBlockWatchCallback,
  type EVMBlockWatchErrorCallback,
} from "./evm-provider";
import {
  fetchSolanaBlock,
  fetchLatestSolanaSlot,
  watchSolanaBlocks,
  type SolanaBlockWatchCallback,
  type SolanaBlockWatchErrorCallback,
} from "./solana-provider";

// Unified block fetching
export async function fetchBlock(
  chainConfig: ChainConfig,
  blockIdentifier: bigint,
  includeTransactions = false
): Promise<Block> {
  if (isEVMChain(chainConfig)) {
    return await fetchEVMBlock(chainConfig, blockIdentifier, includeTransactions);
  } else if (isSolanaChain(chainConfig)) {
    return await fetchSolanaBlock(chainConfig, blockIdentifier, includeTransactions);
  }
  throw new Error(`Unsupported chain type: ${chainConfig.chainType}`);
}

// Unified latest block/slot fetching
export async function fetchLatestBlockNumber(chainConfig: ChainConfig): Promise<bigint> {
  if (isEVMChain(chainConfig)) {
    return await fetchLatestEVMBlockNumber(chainConfig);
  } else if (isSolanaChain(chainConfig)) {
    return await fetchLatestSolanaSlot(chainConfig);
  }
  throw new Error(`Unsupported chain type: ${chainConfig.chainType}`);
}

// Unified block watching
type BlockWatchCallback = (block: Block) => void;
type BlockWatchErrorCallback = (error: Error) => void;

export function watchBlocks(
  chainConfig: ChainConfig,
  onBlock: BlockWatchCallback,
  onError: BlockWatchErrorCallback
): () => void {
  if (isEVMChain(chainConfig)) {
    return watchEVMBlocks(
      chainConfig,
      onBlock as EVMBlockWatchCallback,
      onError as EVMBlockWatchErrorCallback
    );
  } else if (isSolanaChain(chainConfig)) {
    return watchSolanaBlocks(
      chainConfig,
      onBlock as SolanaBlockWatchCallback,
      onError as SolanaBlockWatchErrorCallback
    );
  }
  throw new Error(`Unsupported chain type: ${chainConfig.chainType}`);
}

// Re-export provider-specific functions if needed
export * from "./evm-provider";
export * from "./solana-provider";

