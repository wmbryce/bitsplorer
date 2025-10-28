"use client";

import { Suspense } from "react";
import IncomingBlocks from "./_components/IncomingBlocks";
import { getChainConfig, getChainIds, SUPPORTED_CHAINS } from "@/utils/chains";
import { useSearchParams, useRouter } from "next/navigation";
import { useBlockStream } from "@/hooks/useBlockStream";

function BitsplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chainParam = searchParams.get("chain");
  const chainConfig = getChainConfig(chainParam);

  // Use custom hook to manage blockchain streaming
  const { blocks, loading, error, latestBlockInfo } = useBlockStream(
    chainConfig.id
  );

  const networkInfo = {
    name: chainConfig.chain.name,
    chainId: chainConfig.chain.id,
  };

  const handleChainChange = (newChainId: string) => {
    router.push(`?chain=${newChainId}`);
  };

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
