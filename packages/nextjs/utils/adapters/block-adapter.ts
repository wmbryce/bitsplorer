import type { EVMBlock, Block } from "@/types";
import type { SolanaBlock, SerializedSolanaBlock } from "@/types/solana";
import { serializeTransaction } from "viem";

// Serialize EVM Block (convert BigInt to strings for JSON)
export function serializeEVMBlock(block: EVMBlock) {
  // Helper to serialize transactions
  const serializeTransactions = (transactions: any[]) => {
    return transactions.map((tx) => {
      if (typeof tx === "string") return tx; // Just a hash
      // Full transaction object with potential BigInt values
      return serializeTransaction(tx);
    });
  };

  // Helper to serialize withdrawals
  const serializeWithdrawals = (withdrawals: any[]) => {
    if (!withdrawals) return withdrawals;
    return withdrawals.map((withdrawal) => ({
      ...withdrawal,
      amount: withdrawal.amount?.toString(),
      index: withdrawal.index?.toString(),
      validatorIndex: withdrawal.validatorIndex?.toString(),
    }));
  };

  return {
    ...block,
    chainType: 'EVM',
    number: block?.number?.toString(),
    timestamp: block?.timestamp?.toString(),
    gasLimit: block?.gasLimit?.toString(),
    gasUsed: block?.gasUsed?.toString(),
    baseFeePerGas: block?.baseFeePerGas?.toString(),
    difficulty: block?.difficulty?.toString(),
    totalDifficulty: block?.totalDifficulty?.toString(),
    size: block?.size?.toString(),
    blobGasUsed: block?.blobGasUsed?.toString(),
    excessBlobGas: block?.excessBlobGas?.toString(),
    transactions: serializeTransactions(block.transactions || []),
    withdrawals: serializeWithdrawals(block.withdrawals || []),
  };
}

// Serialize Solana Block (convert BigInt to strings for JSON)
export function serializeSolanaBlock(block: SolanaBlock): SerializedSolanaBlock {
  return {
    chainType: 'SOLANA',
    slot: block.slot.toString(),
    blockhash: block.blockhash,
    previousBlockhash: block.previousBlockhash,
    blockTime: block.blockTime?.toString() || null,
    blockHeight: block.blockHeight?.toString() || null,
    leader: block.leader,
    transactions: Array.isArray(block.transactions)
      ? block.transactions.map((tx) => {
          if (typeof tx === "string") return tx;
          return {
            chainType: 'SOLANA' as const,
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
        })
      : [],
    rewards: block.rewards?.map((r) => ({
      pubkey: r.pubkey,
      lamports: r.lamports.toString(),
      postBalance: r.postBalance.toString(),
      rewardType: r.rewardType,
      commission: r.commission,
    })) || null,
    parentSlot: block.parentSlot.toString(),
  };
}

// Generic serializer that handles both chain types
export function serializeBlock(block: Block) {
  if (!block.chainType || block.chainType === 'EVM') {
    return serializeEVMBlock(block as EVMBlock);
  } else if (block.chainType === 'SOLANA') {
    return serializeSolanaBlock(block as SolanaBlock);
  }
  throw new Error(`Unsupported chain type: ${(block as any).chainType}`);
}

