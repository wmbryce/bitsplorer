// Viem Transaction type - represents a full transaction object returned from getBlock with includeTransactions: true
export type ViemTransaction = {
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

// Serialized version (after serializeTransaction - all BigInts become strings)
export type SerializedTransaction = {
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

export type BlockType = {
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
  transactions: string[] | ViemTransaction[]; // Can be hashes or full transactions
  transactionsRoot: string | null;
  uncles: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withdrawals: any[]; // Could be further typed based on withdrawal structure
  withdrawalsRoot: string | null;
};

export interface BlockData {
  number: number;
  timestamp: string;
  hash: string;
  parentHash: string;
  miner: string;
  gasUsed: number;
  gasLimit: number;
  baseFee: number;
  transactions: number;
  totalValue: number;
  avgGasPrice: number;
  blockReward: number;
  size: number;
}
