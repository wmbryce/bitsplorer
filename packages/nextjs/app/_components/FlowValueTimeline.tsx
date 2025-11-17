import { Card } from "@/app/_components/Card";
import type { EVMBlock, EVMTransaction } from "@/types/index";
import { formatEther } from "viem";

interface ValueFlowTimelineProps {
  block: EVMBlock;
}

export function ValueFlowTimeline({ block }: ValueFlowTimelineProps) {
  // Group transactions into time slots (10 slots)
  const transactions = block.transactions.filter(
    (tx): tx is EVMTransaction => typeof tx !== "string"
  );

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const slotSize = Math.ceil(block.transactions.length / 10);
    const slotTransactions = transactions.slice(
      i * slotSize,
      (i + 1) * slotSize
    );

    return {
      time: `+${(i * 0.5).toFixed(1)}s`,
      value: formatEther(
        slotTransactions.reduce(
          (sum: bigint, tx: EVMTransaction) => sum + tx.value,
          BigInt(0)
        )
      ),
      txCount: slotTransactions.length,
    };
  });

  const maxValue = Math.max(...timeSlots.map((s) => Number(s.value)));
  const largestTx = Math.max(
    ...transactions.map((t) => Number(formatEther(t.value)))
  );

  const chartHeights = timeSlots.map((s) => {
    return {
      height: `${maxValue > 0 ? (Number(s.value) / maxValue) * 100 : 0}%`,
    };
  });

  console.log("timeSlots", timeSlots, block);

  return (
    <Card className="p-6 lg:col-span-2">
      <h3 className="text-lg font-semibold tracking-tighter mb-4">
        Value Flow Timeline
      </h3>
      <div className="flex items-end justify-between gap-2 h-50 mb-4 bg-slate-200 rounded-md p-4">
        {timeSlots.map((slot, i) => (
          <div
            key={i}
            className="flex-1 h-full flex flex-col items-center gap-2 bg-slate-100 rounded-md"
          >
            <div className="w-full flex flex-col justify-end h-full">
              <div
                className="w-full bg-gray-600 rounded-t h-full"
                style={{
                  height: chartHeights[i].height,
                }}
              />
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-muted-foreground pb-2">
                {slot.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div className="bg-slate-200 rounded-md p-4">
          <div className="font-mono font-bold text-lg text-slate-900">
            {parseFloat(
              formatEther(
                transactions.reduce((sum, tx) => sum + tx.value, BigInt(0))
              )
            ).toFixed(6)}
          </div>
          <div className="text-muted-foreground text-xs font-semibold">
            Total ETH
          </div>
        </div>
        <div className="bg-slate-200 rounded-md p-4">
          <div className="font-mono font-bold text-lg text-slate-900">
            {(
              Number(
                formatEther(
                  transactions.reduce((sum, tx) => sum + tx.value, BigInt(0))
                )
              ) / transactions.length
            ).toFixed(3)}
          </div>
          <div className="text-muted-foreground text-xs font-semibold">
            Avg per Tx
          </div>
        </div>
        <div className="bg-slate-200 rounded-md p-4">
          <div className="font-mono font-bold text-lg text-slate-900">
            {largestTx.toFixed(2)}
          </div>
          <div className="text-muted-foreground text-xs font-semibold">
            Largest Tx
          </div>
        </div>
      </div>
    </Card>
  );
}
