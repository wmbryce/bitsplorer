"use client";

import { Card } from "@/app/_components/Card";
import type { ViemTransaction } from "@/types";
import { formatEther } from "viem";
import { useState, useMemo } from "react";

interface RecentTransactionsProps {
  transactions: string[] | ViemTransaction[];
  itemsPerPage?: number;
}

export function RecentTransactions({
  transactions,
  itemsPerPage = 10,
}: RecentTransactionsProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter out string transactions (just hashes) and only show full transaction objects
  const fullTransactions = transactions.filter(
    (tx): tx is ViemTransaction => typeof tx !== "string"
  );

  // Sort transactions by value (transaction size) in descending order
  const sortedTransactions = useMemo(() => {
    return [...fullTransactions].sort((a, b) => {
      // Compare bigint values
      if (a.value > b.value) return -1;
      if (a.value < b.value) return 1;
      return 0;
    });
  }, [fullTransactions]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayTransactions = sortedTransactions.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  console.log("transactions", transactions);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold tracking-tighter mb-4">
        Recent Transactions
      </h3>
      {sortedTransactions.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No transaction details available. Block was fetched without full
          transaction data.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-slate-200 rounded-md p-4">
            <table className="w-full rounded-md p-4">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Transaction Hash
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    From
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    To
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Value (ETH)
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Gas Limit
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayTransactions.map((tx, i) => (
                  <tr
                    key={tx.hash || i}
                    className="border-b border-slate-300 hover:bg-muted/30 transition-colors bg-slate-100 rounded-md p-4"
                  >
                    <td className="py-3 px-2">
                      <div className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                        {tx.hash}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-mono text-xs text-muted-foreground">
                        {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-mono text-xs text-muted-foreground">
                        {tx.to ? (
                          <>
                            {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                          </>
                        ) : (
                          <span className="text-xs italic">
                            Contract Creation
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="font-mono text-sm font-bold">
                        {parseFloat(formatEther(tx.value)).toFixed(6)}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="font-mono text-xs text-muted-foreground">
                        {tx.gas.toString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-
                {Math.min(endIndex, sortedTransactions.length)} of{" "}
                {sortedTransactions.length} transactions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm rounded-md border border-border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm rounded-md border border-border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
