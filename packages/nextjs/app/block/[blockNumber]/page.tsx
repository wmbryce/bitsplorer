"use client";

import { use, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlockType } from "@/types/index";
import { createPublicClient, http } from "viem";
import { getChainConfig } from "@/utils/chains";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlockHeader } from "@/app/_components/BlockHeader";
import { QuickStats } from "@/app/_components/QuickStats";
import { ValueFlowTimeline } from "@/app/_components/FlowValueTimeline";
import { GasEfficiencyGauge } from "@/app/_components/GasEfficiencyGauge";
import { TransactionMatrix } from "@/app/_components/TransactionMatrix";
import { RecentTransactions } from "@/app/_components/RecentTransactions";
import type { BlockData, Transaction } from "@/types";

const blockData: BlockData = {
  number: 23737722,
  timestamp: "04:01:11 GMT",
  hash: "0XF6635EA47F37BF992F69A0AB1C51ED03D4D6BA234FBC391CD978F6A61928662F",
  parentHash:
    "0X0DB9C06EFEDF995BECB817E191BEB677C15BB12DAFC7C23DFDEA677238E307E0",
  miner: "0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326",
  gasUsed: 29847563,
  gasLimit: 30000000,
  baseFee: 12.5,
  transactions: 195,
  totalValue: 1247.83,
  avgGasPrice: 15.2,
  blockReward: 2.05,
  size: 89234,
};

const transactions: Transaction[] = Array.from({ length: 195 }, (_, i) => ({
  hash: `0x${Math.random().toString(16).slice(2, 66)}`,
  value: Math.random() * 10,
  gasUsed: Math.floor(Math.random() * 200000) + 21000,
  status: Math.random() > 0.05 ? "success" : "failed",
}));

export default function BlockDetailPage({
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

  if (!block) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-600">Block not found</div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-slate-600">Loading block details...</div>
        </div>
      }
    >
      <div className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blocks
            </Link>
          </div>

          <div className="space-y-8">
            <BlockHeader block={block} />
            <QuickStats blockData={blockData} />

            <div className="grid gap-4 lg:grid-cols-3">
              <ValueFlowTimeline
                blockData={blockData}
                transactions={transactions}
              />
              <GasEfficiencyGauge blockData={blockData} />
            </div>

            <TransactionMatrix transactions={transactions} />

            <RecentTransactions transactions={transactions} limit={8} />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
