import { Suspense } from "react";
import { BlockHeader } from "@/app/_components/BlockHeader";
import { QuickStats } from "@/app/_components/QuickStats";
import { ValueFlowTimeline } from "@/app/_components/FlowValueTimeline";
import { GasEfficiencyGauge } from "@/app/_components/GasEfficiencyGauge";
import { RecentTransactions } from "@/app/_components/RecentTransactions";
import { BlockType } from "@/types/index";
import { use } from "react";
import Skeleton from "@/app/_components/Skeleton";

interface BlockDetailsProps {
  blockPromise: Promise<BlockType>;
}

export function BlockDetails({ blockPromise }: BlockDetailsProps) {
  const block = use(blockPromise);

  return (
    <Suspense fallback={<Skeleton className="w-full h-full" />}>
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
    </Suspense>
  );
}
