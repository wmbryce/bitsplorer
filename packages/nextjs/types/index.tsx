import type { ChainType } from "./chain-types";
import type {
  SolanaBlock,
  SolanaTransaction,
  SerializedSolanaBlock,
  SerializedSolanaTransaction,
} from "./solana";

// EVM Transaction type - represents a full transaction object returned from getBlock with includeTransactions: true
export type EVMTransaction = {
  chainType?: "EVM"; // Optional for backward compatibility
  // Transaction identifiers
  hash: string;
  nonce: bigint;
  blockHash: string | null;
  blockNumber: bigint | null;
  transactionIndex: bigint | null;

  // Addresses
  from: string;
  to: string | null; // null for contract creation

  // Value and data
  value: bigint;
  input: string; // Transaction calldata

  // Gas
  gas: bigint; // Gas limit
  gasPrice?: bigint; // Legacy transactions

  // EIP-1559 (Type 2 transactions)
  maxFeePerGas?: bigint | null;
  maxPriorityFeePerGas?: bigint | null;

  // Transaction type (0 = legacy, 1 = EIP-2930, 2 = EIP-1559, 3 = EIP-4844)
  type: string;
  typeHex?: string | null;

  // EIP-2930 Access List
  accessList?: Array<{
    address: string;
    storageKeys: string[];
  }>;

  // Signature
  v: bigint;
  r: string;
  s: string;

  // Chain
  chainId?: number;

  // EIP-4844 (Blob transactions)
  blobVersionedHashes?: string[];
  maxFeePerBlobGas?: bigint;

  // Parsed version (with yParity for newer transaction types)
  yParity?: number;
};

// Serialized EVM transaction (after serializeTransaction - all BigInts become strings)
export type SerializedEVMTransaction = {
  chainType?: "EVM";
  hash: string;
  nonce: string;
  blockHash: string | null;
  blockNumber: string | null;
  transactionIndex: string | null;
  from: string;
  to: string | null;
  value: string;
  input: string;
  gas: string;
  gasPrice?: string;
  maxFeePerGas?: string | null;
  maxPriorityFeePerGas?: string | null;
  type: string;
  typeHex?: string | null;
  accessList?: Array<{
    address: string;
    storageKeys: string[];
  }>;
  v: string;
  r: string;
  s: string;
  chainId?: number;
  blobVersionedHashes?: string[];
  maxFeePerBlobGas?: string;
  yParity?: number;
};

export type EVMBlock = {
  chainType?: "EVM"; // Optional for backward compatibility
  baseFeePerGas: bigint | null;
  blobGasUsed: bigint | null;
  difficulty: bigint;
  excessBlobGas: bigint | null;
  extraData: string;
  gasLimit: bigint;
  gasUsed: bigint;
  hash: string | null;
  logsBloom: string | null;
  miner: string;
  mixHash: string;
  nonce: string | null;
  number: bigint | null;
  parentBeaconBlockRoot: string | null;
  parentHash: string | null;
  receiptsRoot: string | null;
  sha3Uncles: string | null;
  size: bigint | null;
  stateRoot: string | null;
  timestamp: bigint | null;
  totalDifficulty: bigint;
  transactions: string[] | EVMTransaction[]; // Can be hashes or full transactions
  transactionsRoot: string | null;
  uncles: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withdrawals: any[]; // Could be further typed based on withdrawal structure
  withdrawalsRoot: string | null;
};

// Discriminated union types for multi-chain support
export type Block = EVMBlock | SolanaBlock;
export type Transaction = EVMTransaction | SolanaTransaction;
export type SerializedTransaction =
  | SerializedEVMTransaction
  | SerializedSolanaTransaction;

// Type guards
export function isEVMBlock(block: Block): block is EVMBlock {
  return !block.chainType || block.chainType === "EVM";
}

export function isSolanaBlock(block: Block): block is SolanaBlock {
  return block.chainType === "SOLANA";
}

export function isEVMTransaction(tx: Transaction): tx is EVMTransaction {
  return !tx.chainType || tx.chainType === "EVM";
}

export function isSolanaTransaction(tx: Transaction): tx is SolanaTransaction {
  return tx.chainType === "SOLANA";
}

// Backward compatibility exports
export type ViemTransaction = EVMTransaction;
export type BlockType = EVMBlock;
