import type { Transaction, EVMTransaction, SerializedEVMTransaction } from "@/types";
import type { SolanaTransaction, SerializedSolanaTransaction } from "@/types/solana";
import { serializeTransaction as serializeEVMTransaction } from "viem";

// Serialize EVM transaction
export function serializeEVMTx(tx: EVMTransaction): SerializedEVMTransaction {
  return serializeEVMTransaction(tx) as SerializedEVMTransaction;
}

// Serialize Solana transaction
export function serializeSolanaTx(tx: SolanaTransaction): SerializedSolanaTransaction {
  return {
    chainType: 'SOLANA',
    signature: tx.signature,
    slot: tx.slot.toString(),
    blockTime: tx.blockTime?.toString() || null,
    fee: tx.fee.toString(),
    accountKeys: tx.accountKeys,
    recentBlockhash: tx.recentBlockhash,
    instructions: tx.instructions,
    computeUnitsConsumed: tx.computeUnitsConsumed?.toString(),
    err: tx.err,
    meta: tx.meta
      ? {
          err: tx.meta.err,
          fee: tx.meta.fee.toString(),
          preBalances: tx.meta.preBalances.map((b) => b.toString()),
          postBalances: tx.meta.postBalances.map((b) => b.toString()),
          logMessages: tx.meta.logMessages,
          computeUnitsConsumed: tx.meta.computeUnitsConsumed?.toString(),
        }
      : null,
  };
}

// Generic transaction serializer
export function serializeTransaction(tx: Transaction) {
  if (typeof tx === 'string') return tx;
  
  if (!tx.chainType || tx.chainType === 'EVM') {
    return serializeEVMTx(tx as EVMTransaction);
  } else if (tx.chainType === 'SOLANA') {
    return serializeSolanaTx(tx as SolanaTransaction);
  }
  throw new Error(`Unsupported chain type: ${(tx as any).chainType}`);
}

