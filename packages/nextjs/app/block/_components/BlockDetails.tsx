import { BlockHeader } from "@/app/_components/BlockHeader";
import { QuickStats } from "@/app/_components/QuickStats";
import { ValueFlowTimeline } from "@/app/_components/FlowValueTimeline";
import { GasEfficiencyGauge } from "@/app/_components/GasEfficiencyGauge";
import { ComputeUnitsGauge } from "@/app/_components/ComputeUnitsGauge";
import { RecentTransactions } from "@/app/_components/RecentTransactions";
import { Block, isEVMBlock, isSolanaBlock } from "@/types/index";
import { use } from "react";

interface BlockDetailsProps {
  blockPromise: Promise<Block>;
}

export function BlockDetails({ blockPromise }: BlockDetailsProps) {
  const block = use(blockPromise);

  return (
    <div className="space-y-8">
      <BlockHeader block={block} />
      <QuickStats block={block} />
      
      {/* Chain-specific visualizations */}
      {isEVMBlock(block) && (
        <div className="grid gap-4 lg:grid-cols-3">
          <ValueFlowTimeline block={block} />
          <GasEfficiencyGauge block={block} />
        </div>
      )}
      
      {isSolanaBlock(block) && (
        <div className="grid gap-4 lg:grid-cols-3">
          <ComputeUnitsGauge block={block} />
        </div>
      )}
      
      {/* <TransactionMatrix transactions={transactions} /> */}
      <RecentTransactions transactions={block.transactions} />
    </div>
  );
}
