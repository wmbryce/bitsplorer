import type { ChainType } from './chain-types';

// Solana Block type based on @solana/web3.js BlockResponse
export type SolanaBlock = {
  chainType: 'SOLANA';
  slot: bigint; // Slot number (equivalent to block number)
  blockhash: string; // Block hash
  previousBlockhash: string; // Parent block hash
  blockTime: bigint | null; // Unix timestamp in seconds (can be null for recent blocks)
  blockHeight: bigint | null; // Block height (different from slot due to skipped slots)
  
  // Leader/validator info
  leader: string; // Validator public key that produced this block
  
  // Transactions
  transactions: SolanaTransaction[] | string[]; // Can be full transactions or just signatures
  
  // Rewards
  rewards: SolanaReward[] | null;
  
  // Parent slot
  parentSlot: bigint;
};

// Solana Transaction type
export type SolanaTransaction = {
  chainType: 'SOLANA';
  signature: string; // Transaction signature (hash equivalent)
  slot: bigint;
  blockTime: bigint | null;
  
  // Transaction message details
  fee: bigint; // Fee in lamports
  
  // Account keys involved
  accountKeys: string[];
  recentBlockhash: string;
  
  // Instructions
  instructions: SolanaInstruction[];
  
  // Compute budget
  computeUnitsConsumed?: bigint;
  
  // Status
  err: SolanaTransactionError | null; // null means success
  
  // Meta information
  meta: {
    err: SolanaTransactionError | null;
    fee: bigint;
    preBalances: bigint[];
    postBalances: bigint[];
    logMessages: string[] | null;
    computeUnitsConsumed?: bigint;
  } | null;
};

// Serialized version for JSON transport (BigInt -> string)
export type SerializedSolanaTransaction = {
  chainType: 'SOLANA';
  signature: string;
  slot: string;
  blockTime: string | null;
  fee: string;
  accountKeys: string[];
  recentBlockhash: string;
  instructions: SolanaInstruction[];
  computeUnitsConsumed?: string;
  err: SolanaTransactionError | null;
  meta: {
    err: SolanaTransactionError | null;
    fee: string;
    preBalances: string[];
    postBalances: string[];
    logMessages: string[] | null;
    computeUnitsConsumed?: string;
  } | null;
};

export type SolanaInstruction = {
  programId: string;
  accounts: number[]; // Indices into accountKeys
  data: string; // Base58 encoded instruction data
};

export type SolanaTransactionError = {
  InstructionError?: [number, any];
} | string | null;

export type SolanaReward = {
  pubkey: string;
  lamports: bigint;
  postBalance: bigint;
  rewardType: 'fee' | 'rent' | 'voting' | 'staking' | null;
  commission: number | null;
};

// Serialized Solana Block for JSON transport
export type SerializedSolanaBlock = {
  chainType: 'SOLANA';
  slot: string;
  blockhash: string;
  previousBlockhash: string;
  blockTime: string | null;
  blockHeight: string | null;
  leader: string;
  transactions: SerializedSolanaTransaction[] | string[];
  rewards: {
    pubkey: string;
    lamports: string;
    postBalance: string;
    rewardType: 'fee' | 'rent' | 'voting' | 'staking' | null;
    commission: number | null;
  }[] | null;
  parentSlot: string;
};

