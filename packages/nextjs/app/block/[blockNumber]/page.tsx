"use client";

import { use, useEffect, useState, useTransition } from "react";
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

export default function BlockDetailPage({
  params,
}: {
  params: Promise<{ blockNumber: string }>;
}) {
  const { blockNumber } = use(params);
  const searchParams = useSearchParams();
  const chainParam = searchParams.get("chain");
  const chainConfig = getChainConfig(chainParam);

  const [block, setBlock] = useState<BlockType | null>(null);
  const [status, startTransition, isPending] = useTransition();

  useEffect(() => {
    const fetchBlockDetails = async () => {
      try {
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
      }
    };
    startTransition(() => {
      fetchBlockDetails();
    });
  }, [blockNumber, chainConfig.chain, startTransition]);

  if (!block) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-600">Block not found</div>
      </div>
    );
  }

  return (
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
          <QuickStats block={block} />

          <div className="grid gap-4 lg:grid-cols-3">
            <ValueFlowTimeline block={block} />
            <GasEfficiencyGauge block={block} />
          </div>
          {/* <TransactionMatrix transactions={transactions} /> */}
          <RecentTransactions transactions={block.transactions} limit={8} />
        </div>
      </div>
    </div>
  );
}
