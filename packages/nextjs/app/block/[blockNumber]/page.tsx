"use client";

import { use, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlockType } from "@/types/index";
import { createPublicClient, http } from "viem";
import { getChainConfig } from "@/utils/chains";

function BlockDetailContent({
  params,
}: {
  params: Promise<{ blockNumber: string }>;
}) {
  const { blockNumber } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const chainParam = searchParams.get("chain");
  const chainConfig = getChainConfig(chainParam);

  const [block, setBlock] = useState<BlockType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const client = createPublicClient({
          chain: chainConfig.chain,
          transport: http(),
        });

        const blockData = await client.getBlock({
          blockNumber: BigInt(blockNumber),
          includeTransactions: true,
        });

        setBlock(blockData as unknown as BlockType);
      } catch (err) {
        console.error("Error fetching block:", err);
        setError("Failed to fetch block details");
      } finally {
        setLoading(false);
      }
    };

    fetchBlockDetails();
  }, [blockNumber, chainConfig.chain]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-600">Loading block details...</div>
      </div>
    );
  }

  if (error || !block) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-lg text-red-600">{error || "Block not found"}</div>
        <button
          onClick={() => router.push(`/?chain=${chainConfig.id}`)}
          className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800"
        >
          Back to Blocks
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/?chain=${chainConfig.id}`)}
          className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 mb-4"
        >
          ← Back to Blocks
        </button>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Block #{String(block.number)}
        </h1>
        <p className="text-slate-600">
          {chainConfig.chain.name} (Chain ID: {chainConfig.chain.id})
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Block Overview */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Block Overview
          </h2>
        </div>

        <div className="divide-y divide-slate-200">
          {/* Block Hash */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-slate-700">Block Hash</div>
            <div className="md:col-span-2 font-mono text-sm break-all text-slate-600">
              {block.hash}
            </div>
          </div>

          {/* Timestamp */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-slate-700">Timestamp</div>
            <div className="md:col-span-2 text-slate-600">
              {block.timestamp
                ? new Date(Number(block.timestamp) * 1000).toLocaleString()
                : "N/A"}
            </div>
          </div>

          {/* Parent Hash */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-slate-700">Parent Hash</div>
            <div className="md:col-span-2 font-mono text-sm break-all text-slate-600">
              {block.parentHash}
            </div>
          </div>

          {/* Miner */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-slate-700">Miner</div>
            <div className="md:col-span-2 font-mono text-sm break-all text-slate-600">
              {block.miner}
            </div>
          </div>

          {/* Transactions */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-slate-700">Transactions</div>
            <div className="md:col-span-2 text-slate-600">
              {block.transactions.length} transactions
            </div>
          </div>

          {/* Gas Used */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-slate-700">Gas Used</div>
            <div className="md:col-span-2 text-slate-600">
              {String(block.gasUsed)} / {String(block.gasLimit)} (
              {((Number(block.gasUsed) / Number(block.gasLimit)) * 100).toFixed(
                2
              )}
              %)
            </div>
          </div>

          {/* Base Fee Per Gas */}
          {block.baseFeePerGas && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="font-medium text-slate-700">Base Fee Per Gas</div>
              <div className="md:col-span-2 text-slate-600">
                {String(block.baseFeePerGas)} wei
              </div>
            </div>
          )}

          {/* Blob Gas Used */}
          {block.blobGasUsed && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="font-medium text-slate-700">Blob Gas Used</div>
              <div className="md:col-span-2 text-slate-600">
                {String(block.blobGasUsed)}
              </div>
            </div>
          )}

          {/* Excess Blob Gas */}
          {block.excessBlobGas && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="font-medium text-slate-700">Excess Blob Gas</div>
              <div className="md:col-span-2 text-slate-600">
                {String(block.excessBlobGas)}
              </div>
            </div>
          )}

          {/* Size */}
          {block.size && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="font-medium text-slate-700">Size</div>
              <div className="md:col-span-2 text-slate-600">
                {String(block.size)} bytes
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-slate-700">Difficulty</div>
            <div className="md:col-span-2 text-slate-600">
              {String(block.difficulty)}
            </div>
          </div>

          {/* Total Difficulty */}
          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="font-medium text-slate-700">Total Difficulty</div>
            <div className="md:col-span-2 text-slate-600">
              {String(block.totalDifficulty)}
            </div>
          </div>

          {/* Nonce */}
          {block.nonce && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="font-medium text-slate-700">Nonce</div>
              <div className="md:col-span-2 font-mono text-sm text-slate-600">
                {block.nonce}
              </div>
            </div>
          )}

          {/* Extra Data */}
          {block.extraData && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="font-medium text-slate-700">Extra Data</div>
              <div className="md:col-span-2 font-mono text-sm break-all text-slate-600">
                {block.extraData}
              </div>
            </div>
          )}

          {/* State Root */}
          {block.stateRoot && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="font-medium text-slate-700">State Root</div>
              <div className="md:col-span-2 font-mono text-sm break-all text-slate-600">
                {block.stateRoot}
              </div>
            </div>
          )}

          {/* Transactions Root */}
          {block.transactionsRoot && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="font-medium text-slate-700">
                Transactions Root
              </div>
              <div className="md:col-span-2 font-mono text-sm break-all text-slate-600">
                {block.transactionsRoot}
              </div>
            </div>
          )}

          {/* Receipts Root */}
          {block.receiptsRoot && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="font-medium text-slate-700">Receipts Root</div>
              <div className="md:col-span-2 font-mono text-sm break-all text-slate-600">
                {block.receiptsRoot}
              </div>
            </div>
          )}

          {/* Withdrawals Root */}
          {block.withdrawalsRoot && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="font-medium text-slate-700">Withdrawals Root</div>
              <div className="md:col-span-2 font-mono text-sm break-all text-slate-600">
                {block.withdrawalsRoot}
              </div>
            </div>
          )}

          {/* Withdrawals Count */}
          {block.withdrawals && block.withdrawals.length > 0 && (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="font-medium text-slate-700">Withdrawals</div>
              <div className="md:col-span-2 text-slate-600">
                {block.withdrawals.length} withdrawals
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BlockDetailPage({
  params,
}: {
  params: Promise<{ blockNumber: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-slate-600">Loading block details...</div>
        </div>
      }
    >
      <BlockDetailContent params={params} />
    </Suspense>
  );
}
