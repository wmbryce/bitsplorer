import { Card } from "@/app/_components/Card";
import type { ViemTransaction } from "@/types";
import { formatEther } from "viem";

interface RecentTransactionsProps {
  transactions: string[] | ViemTransaction[];
  limit?: number;
}

export function RecentTransactions({
  transactions,
  limit = 8,
}: RecentTransactionsProps) {
  // Filter out string transactions (just hashes) and only show full transaction objects
  const fullTransactions = transactions.filter(
    (tx): tx is ViemTransaction => typeof tx !== "string"
  );

  const displayTransactions = fullTransactions.slice(0, limit);

  console.log("transactions", transactions);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      {displayTransactions.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No transaction details available. Block was fetched without full
          transaction data.
        </div>
      ) : (
        <div className="space-y-2">
          {displayTransactions.map((tx, i) => (
            <div
              key={tx.hash || i}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-muted-foreground truncate">
                  {tx.hash}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  From: {tx.from.slice(0, 10)}...
                  {tx.to && ` → To: ${tx.to.slice(0, 10)}...`}
                </div>
              </div>
              <div className="font-mono text-sm font-bold">
                {parseFloat(formatEther(tx.value)).toFixed(4)} ETH
              </div>
              <div className="text-xs text-muted-foreground">
                Gas: {tx.gas.toString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
