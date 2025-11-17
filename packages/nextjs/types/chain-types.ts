// Chain type discriminator
export type ChainType = 'EVM' | 'SOLANA';

// Base normalized block interface that all chains must provide
export interface NormalizedBlock {
  chainType: ChainType;
  blockNumber: bigint; // For EVM this is block.number, for Solana this is slot
  timestamp: bigint; // Unix timestamp in seconds
  hash: string; // Block hash or blockhash
  parentHash: string; // Previous block/slot hash
  transactionCount: number;
  producer: string; // Miner (EVM) or Leader/Validator (Solana)
}

// Base normalized transaction interface
export interface NormalizedTransaction {
  chainType: ChainType;
  signature: string; // Transaction hash (EVM) or signature (Solana)
  from: string;
  to: string | null;
  value: bigint; // Value in smallest unit (wei for ETH, lamports for SOL)
  fee: bigint; // Transaction fee
}

