import { NextRequest } from "next/server";
import { createPublicClient, http } from "viem";
import { getChainConfig } from "@/utils/chains";
import type { BlockType } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const serializeBlock = (block: BlockType) => {
  // Helper to serialize transactions (which may contain BigInt values)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializeTransactions = (transactions: any[]) => {
    return transactions.map((tx) => {
      if (typeof tx === "string") return tx; // Just a hash
      // Full transaction object with potential BigInt values
      return {
        ...tx,
        blockNumber: tx.blockNumber?.toString(),
        gas: tx.gas?.toString(),
        gasPrice: tx.gasPrice?.toString(),
        maxFeePerGas: tx.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
        value: tx.value?.toString(),
        chainId: tx.chainId?.toString(),
        v: tx.v?.toString(),
      };
    });
  };

  // Helper to serialize withdrawals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chainParam = searchParams.get("chain");
  const chainConfig = getChainConfig(chainParam);

  // Create a public client connected to the selected chain
  const client = createPublicClient({
    chain: chainConfig.chain,
    transport: http(),
  });

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Helper to send SSE messages
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const send = (data: any, event?: string) => {
        const message = event ? `event: ${event}\n` : "";
        controller.enqueue(
          encoder.encode(`${message}data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        // Fetch and send initial blocks
        const latestBlockNumber = await client.getBlockNumber();
        const initialBlocks = [];

        for (let i = 0; i < 5; i++) {
          const blockNumber = latestBlockNumber - BigInt(i);
          const block = await client.getBlock({
            blockNumber,
            includeTransactions: false,
          });

          // Convert BigInt values to strings for JSON serialization
          initialBlocks.push(serializeBlock(block as BlockType));
        }

        // Send initial blocks
        send({ type: "initial", blocks: initialBlocks }, "initial");

        // Watch for new blocks
        const unwatch = client.watchBlocks({
          onBlock: async (block) => {
            try {
              // Fetch full block details with transactions
              const fullBlock = await client.getBlock({
                blockNumber: block.number,
                includeTransactions: false,
              });

              console.log(
                `Block #${fullBlock.number} - ${fullBlock.transactions.length} transactions`
              );

              // Send new block (convert BigInt values to strings for JSON serialization)
              send(
                {
                  type: "newBlock",
                  block: serializeBlock(fullBlock as BlockType),
                },
                "block"
              );
            } catch (err) {
              console.error("Error fetching full block details:", err);
              // Send error but don't close the stream
              send(
                { type: "error", message: "Error fetching block details" },
                "error"
              );
            }
          },
          onError: (err) => {
            console.error("Error watching blocks:", err);
            send({ type: "error", message: "Error watching blocks" }, "error");
          },
          emitOnBegin: false,
          poll: true,
          pollingInterval: chainConfig.pollingInterval,
        });

        // Handle client disconnect
        request.signal.addEventListener("abort", () => {
          console.log("Client disconnected, cleaning up...");
          unwatch();
          controller.close();
        });
      } catch (error) {
        console.error("Error in SSE stream:", error);
        send(
          {
            type: "error",
            message:
              "Failed to fetch blocks. Please check your network connection.",
          },
          "error"
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in nginx
    },
  });
}
