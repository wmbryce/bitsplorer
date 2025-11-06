import { Card } from "@/app/_components/Cardd";
import type { Transaction } from "./types";

interface RecentTransactionsProps {
  transactions: Transaction[];
  limit?: number;
}

export function RecentTransactions({
  transactions,
  limit = 8,
}: RecentTransactionsProps) {
  const displayTransactions = transactions.slice(0, limit);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <div className="space-y-2">
        {displayTransactions.map((tx, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                tx.status === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs text-muted-foreground truncate">
                {tx.hash}
              </div>
            </div>
            <div className="font-mono text-sm font-bold">
              {tx.value.toFixed(4)} ETH
            </div>
            <div className="text-xs text-muted-foreground">
              {tx.gasUsed.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
