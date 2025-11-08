import { Card } from "@/app/_components/Card";
// import type { Transaction } from "@/types";
import { cn } from "@/utils/cn";
import type { ViemTransaction } from "@/types/index";

interface TransactionMatrixProps {
  transactions: ViemTransaction[];
}

export function TransactionMatrix({ transactions }: TransactionMatrixProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Transaction Matrix</h3>
      <div className="grid grid-cols-15 gap-1 mb-4">
        {transactions.map((tx, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-sm",
              "bg-gray-700",
              "hover:scale-110 transition-transform cursor-pointer"
            )}
            // title={`${tx.status} - ${tx.value.toFixed(4)} ETH`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-green-500/80" />
          <span className="text-muted-foreground">
            Success ({transactions.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-500/80" />
          {/* <span className="text-muted-foreground">Failed ({failedCount})</span> */}
        </div>
      </div>
    </Card>
  );
}
