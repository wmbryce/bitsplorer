"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import IncomingBlocks from "./_components/IncomingBlocks";
import { BlockType } from "@/types";

export default function Page() {
  const [blocks, setBlocks] = useState<BlockType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestBlockInfo, setLatestBlockInfo] = useState<{
    number: bigint;
    txCount: number;
    timestamp: Date;
  } | null>(null);
  const networkInfo = {
    name: sepolia.name,
    chainId: sepolia.id,
  };

  useEffect(() => {
    // Create a public client connected to Sepolia testnet
    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    // Fetch initial blocks
    const fetchInitialBlocks = async () => {
      try {
        const latestBlockNumber = await client.getBlockNumber();
        const initialBlocks: BlockType[] = [];

        // Fetch the last 5 blocks
        for (let i = 0; i < 5; i++) {
          const blockNumber = latestBlockNumber - BigInt(i);
          const block = await client.getBlock({
            blockNumber,
            includeTransactions: true, // Include transaction hashes to get count
          });
          initialBlocks.push(block as BlockType);
        }

        setBlocks(initialBlocks);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching initial blocks:", err);
        setError(
          "Failed to fetch blocks. Please check your network connection."
        );
        setLoading(false);
      }
    };

    fetchInitialBlocks();

    // Watch for new blocks
    const unwatch = client.watchBlocks({
      onBlock: async (block) => {
        console.log("New block detected:", block.number);
        // Fetch full block details with transactions
        try {
          const fullBlock = await client.getBlock({
            blockNumber: block.number,
            includeTransactions: true,
          });
          console.log(
            `Block #${fullBlock.number} - ${fullBlock.transactions.length} transactions`,
            fullBlock
          );
          // Update latest block info for real-time display
          setLatestBlockInfo({
            number: fullBlock.number,
            txCount: fullBlock.transactions.length,
            timestamp: new Date(),
          });
          setBlocks((prevBlocks) => {
            // Add new block to the beginning and keep only the latest 20
            const newBlocks = [fullBlock as BlockType, ...prevBlocks].slice(
              0,
              20
            );
            return newBlocks;
          });
        } catch (err) {
          console.error("Error fetching full block details:", err);
          // Fallback to basic block if fetch fails
          setBlocks((prevBlocks) => {
            const newBlocks = [block as BlockType, ...prevBlocks].slice(0, 20);
            return newBlocks;
          });
        }
      },
      onError: (err) => {
        console.error("Error watching blocks:", err);
        setError("Error receiving new blocks");
      },
      emitOnBegin: false,
      poll: true,
      pollingInterval: 12_000, // Poll every 12 seconds (Sepolia block time)
    });

    // Cleanup function
    return () => {
      unwatch();
    };
  }, []);

  return (
    <section className="flex flex-col items-start h-full justify-start flex-1 py-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tighter font-slate-900">
          Bitsplorer
        </h1>
        <p className="text-normal font-regular text-slate-700">
          Welcome to Bitsplorer. Explore the blockchain and see the latest
          blocks as they are minted.
        </p>
        <div className="flex items-center gap-4 mt-2">
          {networkInfo && (
            <p className="text-sm font-medium text-slate-500">
              Connected to {networkInfo.name} (Chain ID: {networkInfo.chainId})
            </p>
          )}
          {latestBlockInfo && (
            <p className="text-sm font-semibold text-green-600 animate-pulse">
              ⚡ Latest: Block #{String(latestBlockInfo.number)} (
              {latestBlockInfo.txCount} txs)
            </p>
          )}
        </div>
        {error && (
          <p className="text-sm font-medium text-red-500 mt-2">{error}</p>
        )}
      </header>
      <main className="flex flex-col flex-1 h-full w-full">
        <IncomingBlocks blocks={blocks} loading={loading} />
      </main>
    </section>
  );
}
