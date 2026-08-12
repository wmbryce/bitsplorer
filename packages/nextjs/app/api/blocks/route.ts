import { NextRequest } from "next/server";
import { serializeTransaction } from "viem";
import { getChainConfig } from "@/utils/chains";
import { createChainClient } from "@/utils/rpc";
import type { BlockType, ViemTransaction } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel terminates a streaming function when it hits this ceiling and the
 * browser's EventSource then reconnects. 300s is the maximum on every plan.
 */
export const maxDuration = 300;

/**
 * Vercel only sends keep-alive frames over HTTP/2; HTTP/1.1 clients and
 * intermediate proxies can drop a connection that goes idle, which happens
 * whenever the upstream RPC stalls or rate-limits between blocks.
 */
const HEARTBEAT_INTERVAL_MS = 15_000;

const serializeBlock = (block: BlockType) => {
  // Helper to serialize transactions (which may contain BigInt values)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializeTransactions = (transactions: any[]) => {
    return transactions.map((tx) => {
      if (typeof tx === "string") return tx; // Just a hash
      // Full transaction object with potential BigInt values
      return serializeTransaction(tx);
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
  const client = createChainClient(chainConfig);

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let closed = false;
      let unwatch: (() => void) | undefined;

      // Helper to send SSE messages
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const send = (data: any, event?: string) => {
        if (closed) return;
        const message = event ? `event: ${event}\n` : "";
        controller.enqueue(
          encoder.encode(`${message}data: ${JSON.stringify(data)}\n\n`)
        );
      };

      const heartbeat = setInterval(() => {
        if (closed) return;
        controller.enqueue(encoder.encode(": keepalive\n\n"));
      }, HEARTBEAT_INTERVAL_MS);

      // Runs from an abort listener, where a throw would go unhandled; the
      // runtime may already have torn the controller down by then.
      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        try {
          unwatch?.();
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener("abort", cleanup);

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
        unwatch = client.watchBlocks({
          onBlock: async (block) => {
            try {
              // Fetch full block details with transactions
              const fullBlock = await client.getBlock({
                blockNumber: block.number,
                includeTransactions: false,
              });

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

        // A request aborted before watchBlocks was assigned leaves the watcher
        // running, so re-run cleanup once it exists.
        if (request.signal.aborted) cleanup();
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
        cleanup();
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
