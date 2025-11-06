import { Card } from "@/app/_components/Cardd";
import type { BlockData } from "@/types";

interface BlockHeaderProps {
  blockData: BlockData;
}

export function BlockHeader({ blockData }: BlockHeaderProps) {
  return (
    <Card className="p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Block Number</div>
          <h1 className="font-mono text-5xl font-bold">#{blockData.number}</h1>
        </div>
        <div className="flex gap-8">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Timestamp</div>
            <div className="font-mono text-sm">{blockData.timestamp}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Transactions
            </div>
            <div className="font-mono text-2xl font-bold">
              {blockData.transactions}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Block Hash</div>
          <code className="block rounded bg-muted px-3 py-2 font-mono text-xs break-all">
            {blockData.hash}
          </code>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Miner</div>
          <code className="block rounded bg-muted px-3 py-2 font-mono text-xs break-all">
            {blockData.miner}
          </code>
        </div>
      </div>
    </Card>
  );
}
