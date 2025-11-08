import { Card } from "@/app/_components/Card";
import type { BlockType, ViemTransaction } from "@/types/index";
import { formatEther } from "viem";

interface ValueFlowTimelineProps {
  block: BlockType;
}

export function ValueFlowTimeline({ block }: ValueFlowTimelineProps) {
  // Group transactions into time slots (10 slots)
  const transactions = block.transactions.filter(
    (tx): tx is ViemTransaction => typeof tx !== "string"
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
          (sum: bigint, tx: ViemTransaction) => sum + tx.value,
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
      <h3 className="text-lg font-semibold mb-4">Value Flow Timeline</h3>
      <div className="flex items-end justify-between gap-2 h-48 mb-4">
        {timeSlots.map((slot, i) => (
          <div
            key={i}
            className="flex-1 h-full flex flex-col items-center gap-2"
          >
            <div className="w-full flex flex-col justify-end h-full">
              <div
                className="w-full bg-gray-700 rounded-t h-full"
                style={{
                  height: chartHeights[i].height,
                }}
              />
            </div>
            <div className="text-center">
              {/* <div className="font-mono text-xs font-bold">{slot.txCount}</div> */}
              <div className="text-xs text-muted-foreground">{slot.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 text-center text-sm pt-4 border-t border-border">
        <div>
          <div className="font-mono font-bold text-lg">
            {parseFloat(
              formatEther(
                transactions.reduce((sum, tx) => sum + tx.value, BigInt(0))
              )
            ).toFixed(6)}
          </div>
          <div className="text-muted-foreground text-xs">Total ETH</div>
        </div>
        <div>
          <div className="font-mono font-bold text-lg">
            {(
              Number(
                formatEther(
                  transactions.reduce((sum, tx) => sum + tx.value, BigInt(0))
                )
              ) / transactions.length
            ).toFixed(3)}
          </div>
          <div className="text-muted-foreground text-xs">Avg per Tx</div>
        </div>
        <div>
          <div className="font-mono font-bold text-lg">
            {largestTx.toFixed(2)}
          </div>
          <div className="text-muted-foreground text-xs">Largest Tx</div>
        </div>
      </div>
    </Card>
  );
}
