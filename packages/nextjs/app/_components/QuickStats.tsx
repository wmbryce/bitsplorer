import { Card } from "@/app/_components/Cardd";
import { Fuel, DollarSign, Clock, Database } from "lucide-react";
import type { BlockType } from "@/types";
import { formatUnits } from "viem";

interface QuickStatsProps {
  block: BlockType;
}

export function QuickStats({ block }: QuickStatsProps) {
  // Convert base fee from wei to gwei
  const baseFeeGwei = block.baseFeePerGas
    ? parseFloat(formatUnits(block.baseFeePerGas, 9)).toFixed(2)
    : "0";

  // Calculate block size in KB
  const sizeKB = block.size ? (Number(block.size) / 1024).toFixed(1) : "0";

  const stats = [
    {
      icon: Fuel,
      label: "Base Fee",
      value: `${baseFeeGwei} Gwei`,
      change: null,
    },
    {
      icon: DollarSign,
      label: "Gas Limit",
      value: `${Number(block.gasLimit).toLocaleString()}`,
      change: null,
    },
    {
      icon: Clock,
      label: "Transactions",
      value: `${block.transactions.length}`,
      change: null,
    },
    {
      icon: Database,
      label: "Block Size",
      value: `${sizeKB} KB`,
      change: null,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">
                {stat.label}
              </div>
              <div className="font-mono font-bold text-sm">{stat.value}</div>
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
