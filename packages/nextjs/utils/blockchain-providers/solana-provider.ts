import { Connection, BlockResponse, VersionedBlockResponse } from "@solana/web3.js";
import type { ChainConfig } from "@/utils/chains";
import type { SolanaBlock, SolanaTransaction } from "@/types/solana";

export function createSolanaClient(
  chainConfig: ChainConfig & { chainType: 'SOLANA' }
): Connection {
  return new Connection(chainConfig.rpcEndpoint, {
    commitment: chainConfig.commitment || 'confirmed',
  });
}

function convertBlockResponseToSolanaBlock(
  blockResponse: VersionedBlockResponse,
  slot: bigint
): SolanaBlock {
  // Handle transactions - when using 'none' for transactionDetails, 
  // transactions will be undefined, but we can use the signature array if available
  let transactions: string[] = [];
  
  if (blockResponse.transactions && Array.isArray(blockResponse.transactions)) {
    // If we have full transaction objects
    transactions = blockResponse.transactions.map((tx) => tx.transaction.signatures[0]);
  } else if (blockResponse.signatures && Array.isArray(blockResponse.signatures)) {
    // If we only have signatures (from transactionDetails: 'none')
    transactions = blockResponse.signatures;
  }
  
  return {
    chainType: 'SOLANA',
    slot: slot,
    blockhash: blockResponse.blockhash,
    previousBlockhash: blockResponse.previousBlockhash,
    blockTime: blockResponse.blockTime ? BigInt(blockResponse.blockTime) : null,
    blockHeight: blockResponse.blockHeight ? BigInt(blockResponse.blockHeight) : null,
    leader: blockResponse.rewards?.find((r) => r.rewardType === 'fee')?.pubkey || 'Unknown',
    transactions: transactions,
    rewards: blockResponse.rewards?.map((r) => ({
      pubkey: r.pubkey,
      lamports: BigInt(r.lamports),
      postBalance: BigInt(r.postBalance),
      rewardType: r.rewardType as 'fee' | 'rent' | 'voting' | 'staking' | null,
      commission: r.commission !== undefined ? r.commission : null,
    })) || null,
    parentSlot: BigInt(blockResponse.parentSlot),
  };
}

export async function fetchSolanaBlock(
  chainConfig: ChainConfig & { chainType: 'SOLANA' },
  slot: bigint,
  includeTransactions = false
): Promise<SolanaBlock> {
  const connection = createSolanaClient(chainConfig);
  
  const blockResponse = await connection.getBlock(Number(slot), {
    maxSupportedTransactionVersion: 0,
    transactionDetails: includeTransactions ? 'full' : 'none',
    rewards: true,
  });

  if (!blockResponse) {
    throw new Error(`Block not found for slot ${slot}`);
  }

  return convertBlockResponseToSolanaBlock(blockResponse, slot);
}

export async function fetchLatestSolanaSlot(
  chainConfig: ChainConfig & { chainType: 'SOLANA' }
): Promise<bigint> {
  const connection = createSolanaClient(chainConfig);
  const slot = await connection.getSlot(chainConfig.commitment || 'confirmed');
  return BigInt(slot);
}

// Helper function to fetch recent confirmed blocks
export async function fetchRecentSolanaBlocks(
  chainConfig: ChainConfig & { chainType: 'SOLANA' },
  count: number = 3 // Reduced from 5 to avoid rate limits
): Promise<SolanaBlock[]> {
  const connection = createSolanaClient(chainConfig);
  const currentSlot = await connection.getSlot(chainConfig.commitment || 'confirmed');
  
  // Get confirmed blocks (this returns actual blocks, skipping empty slots)
  // Look back fewer slots to reduce API calls
  const blockSlots = await connection.getBlocks(
    Math.max(0, currentSlot - 100), // Reduced from 1000 to 100 slots
    currentSlot,
    chainConfig.commitment || 'confirmed'
  );
  
  // Take the last N confirmed blocks
  const recentSlots = blockSlots.slice(-count);
  const blocks: SolanaBlock[] = [];
  
  // Fetch each block with a small delay to avoid rate limiting
  for (let i = 0; i < recentSlots.length; i++) {
    const slot = recentSlots[i];
    try {
      // Add delay between requests to avoid rate limits (except for first request)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const blockResponse = await connection.getBlock(slot, {
        maxSupportedTransactionVersion: 0,
        transactionDetails: 'none', // Use 'none' to avoid errors on empty blocks
        rewards: true,
      });
      
      if (blockResponse) {
        blocks.push(convertBlockResponseToSolanaBlock(blockResponse, BigInt(slot)));
      }
    } catch (err) {
      console.warn(`Failed to fetch block at slot ${slot}:`, err);
      // Continue to next block
    }
  }
  
  return blocks;
}

export type SolanaBlockWatchCallback = (block: SolanaBlock) => void;
export type SolanaBlockWatchErrorCallback = (error: Error) => void;

export function watchSolanaBlocks(
  chainConfig: ChainConfig & { chainType: 'SOLANA' },
  onBlock: SolanaBlockWatchCallback,
  onError: SolanaBlockWatchErrorCallback
): () => void {
  const connection = createSolanaClient(chainConfig);
  let lastProcessedSlot = 0;
  let isRunning = true;

  // Polling function
  const pollForNewBlocks = async () => {
    while (isRunning) {
      try {
        const currentSlot = await connection.getSlot(chainConfig.commitment || 'confirmed');

        // Process new blocks
        if (currentSlot > lastProcessedSlot) {
          // Only fetch the latest block to avoid overwhelming the RPC
          try {
            // Use 'none' for transaction details to avoid errors on blocks without transactions
            // We only need the count anyway, not the full transaction data
            const blockResponse = await connection.getBlock(currentSlot, {
              maxSupportedTransactionVersion: 0,
              transactionDetails: 'none',
              rewards: true,
            });

            if (blockResponse) {
              try {
                const block = convertBlockResponseToSolanaBlock(blockResponse, BigInt(currentSlot));
                onBlock(block);
              } catch (conversionErr) {
                console.warn(`Could not convert block for slot ${currentSlot}:`, conversionErr);
              }
            }
          } catch (blockErr) {
            // Block might not be available yet or has issues, skip
            console.warn(`Could not fetch block for slot ${currentSlot}:`, blockErr);
          }

          lastProcessedSlot = currentSlot;
        }

        // Wait for next poll interval
        await new Promise((resolve) => setTimeout(resolve, chainConfig.pollingInterval));
      } catch (err) {
        onError(err as Error);
        // Wait a bit longer on error before retrying
        await new Promise((resolve) => setTimeout(resolve, chainConfig.pollingInterval * 2));
      }
    }
  };

  // Start polling
  pollForNewBlocks();

  // Return cleanup function
  return () => {
    isRunning = false;
  };
}

