import { Card } from "@/app/_components/Card";
import type { BlockType } from "@/types";

interface BlockHeaderProps {
  block: BlockType;
}

export function BlockHeader({ block }: BlockHeaderProps) {
  // Format timestamp
  const timestamp = block.timestamp
    ? new Date(Number(block?.timestamp) * 1000).toLocaleString("en-GB", {
        timeZone: "GMT",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " GMT"
    : "N/A";

  // Get transaction count
  const txCount = Array.isArray(block.transactions)
    ? block.transactions.length
    : 0;

  return (
    <Card className="p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-1">
            Block Number
          </div>
          <h1 className="text-5xl font-bold text-slate-900 tracking-tighter">
            <span className="text-3xl font-bold text-slate-500 mr-1">#</span>
            {block.number?.toString() ?? "N/A"}
          </h1>
        </div>
        <div className="flex gap-8">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">
              Timestamp
            </div>
            <div className="font-mono text-sm font-semibold text-slate-600 bg-slate-200 rounded-md px-3 py-2">
              {timestamp}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">
              Transactions
            </div>
            <div className="font-mono text-2xl font-bold text-slate-900 ">
              {txCount}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-1">
            Block Hash
          </div>
          <code className="block rounded bg-muted px-3 py-2 font-semibold uppercase text-slate-600 font-mono text-xs break-all overflow-hidden text-ellipsis whitespace-nowrap bg-slate-200">
            {block.hash ?? "N/A"}
          </code>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-1">
            Miner
          </div>
          <code className="block rounded bg-muted px-3 py-2 font-semibold uppercase text-slate-600 font-mono text-xs break-all bg-slate-200">
            {block.miner}
          </code>
        </div>
      </div>
    </Card>
  );
}
