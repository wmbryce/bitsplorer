"use client";

import { useEffect, useState, Suspense } from "react";
import { createPublicClient, http } from "viem";
import IncomingBlocks from "./_components/IncomingBlocks";
import { BlockType } from "@/types";
import { getChainConfig, getChainIds, SUPPORTED_CHAINS } from "@/utils/chains";
import { useSearchParams, useRouter } from "next/navigation";

function BitsplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chainParam = searchParams.get("chain");
  const chainConfig = getChainConfig(chainParam);

  const [blocks, setBlocks] = useState<BlockType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestBlockInfo, setLatestBlockInfo] = useState<{
    number: bigint;
    txCount: number;
    timestamp: Date;
  } | null>(null);

  const networkInfo = {
    name: chainConfig.chain.name,
    chainId: chainConfig.chain.id,
  };

  const handleChainChange = (newChainId: string) => {
    router.push(`?chain=${newChainId}`);
  };

  useEffect(() => {
    // Create a public client connected to the selected chain
    const client = createPublicClient({
      chain: chainConfig.chain,
      transport: http(),
    });

    // Reset state when chain changes (initial setup)
    let mounted = true;
    // eslint-disable-next-line
    setBlocks([]);
    setLoading(true);
    setError(null);
    setLatestBlockInfo(null);

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

        if (mounted) {
          setBlocks(initialBlocks);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching initial blocks:", err);
        if (mounted) {
          setError(
            "Failed to fetch blocks. Please check your network connection."
          );
          setLoading(false);
        }
      }
    };

    fetchInitialBlocks();

    // Watch for new blocks
    const unwatch = client.watchBlocks({
      onBlock: async (block) => {
        if (!mounted) return;
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
          if (mounted) {
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
          }
        } catch (err) {
          console.error("Error fetching full block details:", err);
          // Fallback to basic block if fetch fails
          if (mounted) {
            setBlocks((prevBlocks) => {
              const newBlocks = [block as BlockType, ...prevBlocks].slice(
                0,
                20
              );
              return newBlocks;
            });
          }
        }
      },
      onError: (err) => {
        console.error("Error watching blocks:", err);
        if (mounted) {
          setError("Error receiving new blocks");
        }
      },
      emitOnBegin: false,
      poll: true,
      pollingInterval: chainConfig.pollingInterval,
    });

    // Cleanup function
    return () => {
      mounted = false;
      unwatch();
    };
  }, [chainConfig]);

  return (
    <section className="flex flex-col items-start h-full justify-start flex-1 py-8">
      <header className="w-full">
        <div className="flex flex-col items-start w-full mb-2 gap-4 bg-slate-200 rounded-md p-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter font-slate-900">
              Bitsplorer
            </h1>
            <p className="text-normal font-regular text-slate-700">
              Explore the latest blocks and transactions on active ethereum
              chains.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 px-4 py-3 bg-slate-100 rounded-md w-full">
            <div className="flex flex-col items-start gap-2">
              <label className="text-sm font-medium text-slate-600">
                Select Chain
              </label>
              <select
                value={chainConfig.id}
                onChange={(e) => handleChainChange(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-md bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer"
              >
                {getChainIds().map((chainId) => (
                  <option key={chainId} value={chainId}>
                    {SUPPORTED_CHAINS[chainId].name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4 mt-2">
              {networkInfo && (
                <p className="text-sm font-medium text-slate-500">
                  Connected to {networkInfo.name} (Chain ID:{" "}
                  {networkInfo.chainId})
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
          </div>
        </div>
      </header>
      <main className="flex flex-col flex-1 h-full w-full">
        <IncomingBlocks blocks={blocks} loading={loading} />
      </main>
    </section>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-slate-600">Loading...</div>
        </div>
      }
    >
      <BitsplorerContent />
    </Suspense>
  );
}
