import { NextRequest } from "next/server";
import { getChainConfig, isSolanaChain } from "@/utils/chains";
import {
  fetchBlock,
  fetchLatestBlockNumber,
  watchBlocks,
} from "@/utils/blockchain-providers";
import { fetchRecentSolanaBlocks } from "@/utils/blockchain-providers/solana-provider";
import { serializeBlock } from "@/utils/adapters/block-adapter";
import type { Block } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chainParam = searchParams.get("chain");
  const chainConfig = getChainConfig(chainParam);

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
        // Fetch and send initial blocks using the provider abstraction
        const initialBlocks = [];

        if (isSolanaChain(chainConfig)) {
          // For Solana, use the special function that fetches confirmed blocks
          // Fetch fewer blocks to avoid rate limits
          const solanaBlocks = await fetchRecentSolanaBlocks(chainConfig, 3);
          solanaBlocks.forEach((block) => {
            initialBlocks.push(serializeBlock(block));
          });
        } else {
          // For EVM chains, fetch by block number
          const latestBlockNumber = await fetchLatestBlockNumber(chainConfig);
          for (let i = 0; i < 5; i++) {
            const blockIdentifier = latestBlockNumber - BigInt(i);
            const block = await fetchBlock(chainConfig, blockIdentifier, false);
            initialBlocks.push(serializeBlock(block));
          }
        }

        // Send initial blocks
        send({ type: "initial", blocks: initialBlocks }, "initial");

        // Watch for new blocks using the provider abstraction
        const unwatch = watchBlocks(
          chainConfig,
          async (block: Block) => {
            try {
              const blockId =
                chainConfig.chainType === "EVM"
                  ? "number" in block
                    ? String(block.number)
                    : "unknown"
                  : "slot" in block
                  ? String(block.slot)
                  : "unknown";

              const txCount =
                "transactions" in block && Array.isArray(block.transactions)
                  ? block.transactions.length
                  : 0;

              console.log(
                `New block: ${
                  chainConfig.chainType === "EVM" ? "#" : "Slot "
                }${blockId} - ${txCount} transactions`
              );

              // Send new block (convert BigInt values to strings for JSON serialization)
              send(
                {
                  type: "newBlock",
                  block: serializeBlock(block),
                },
                "block"
              );
            } catch (err) {
              console.error("Error processing block:", err);
              // Send error but don't close the stream
              send(
                { type: "error", message: "Error processing block" },
                "error"
              );
            }
          },
          (err: Error) => {
            console.error("Error watching blocks:", err);
            send({ type: "error", message: "Error watching blocks" }, "error");
          }
        );

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
