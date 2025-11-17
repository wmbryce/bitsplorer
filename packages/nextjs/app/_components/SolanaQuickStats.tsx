import { Card } from "@/app/_components/Card";
import { Zap, Clock, Hash, Award } from "lucide-react";
import type { SolanaBlock } from "@/types/solana";

interface SolanaQuickStatsProps {
  block: SolanaBlock;
}

export function SolanaQuickStats({ block }: SolanaQuickStatsProps) {
  // Calculate total rewards in SOL (1 SOL = 1 billion lamports)
  const totalRewards = block.rewards
    ? (
        Number(
          block.rewards.reduce((sum, r) => sum + r.lamports, BigInt(0))
        ) / 1_000_000_000
      ).toFixed(4)
    : "0";

  const blockHeight = block.blockHeight?.toString() ?? "N/A";

  const stats = [
    {
      icon: Hash,
      label: "Block Height",
      value: blockHeight,
      change: null,
    },
    {
      icon: Clock,
      label: "Transactions",
      value: `${block.transactions.length}`,
      change: null,
    },
    {
      icon: Award,
      label: "Total Rewards",
      value: `${totalRewards} SOL`,
      change: null,
    },
    {
      icon: Zap,
      label: "Parent Slot",
      value: block.parentSlot.toString(),
      change: null,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 bg-slate-200">
              <stat.icon className="h-5 w-5 text-primary text-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-muted-foreground mb-1">
                {stat.label}
              </div>
              <div className="font-mono font-bold text-slate-900 text-sm">
                {stat.value}
              </div>
              {stat.change && (
                <div className="text-xs text-green-600">{stat.change}</div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

