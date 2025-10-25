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
            includeTransactions: false,
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
      onBlock: (block) => {
        console.log("New block received:", block.number);
        setBlocks((prevBlocks) => {
          // Add new block to the beginning and keep only the latest 20
          const newBlocks = [block as BlockType, ...prevBlocks].slice(0, 20);
          return newBlocks;
        });
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
        {networkInfo && (
          <p className="text-sm font-medium text-slate-500 mt-2">
            Connected to {networkInfo.name} (Chain ID: {networkInfo.chainId})
          </p>
        )}
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
