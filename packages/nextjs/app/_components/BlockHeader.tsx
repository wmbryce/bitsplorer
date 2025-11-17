import { Card } from "@/app/_components/Card";
import type { Block } from "@/types";
import { isEVMBlock, isSolanaBlock } from "@/types";

interface BlockHeaderProps {
  block: Block;
}

export function BlockHeader({ block }: BlockHeaderProps) {
  // Get block identifier (number for EVM, slot for Solana)
  const blockIdentifier = isEVMBlock(block)
    ? block.number?.toString() ?? "N/A"
    : isSolanaBlock(block)
    ? block.slot?.toString() ?? "N/A"
    : "N/A";

  const blockIdentifierLabel = isEVMBlock(block) ? "Block Number" : "Slot";

  // Format timestamp
  let timestamp = "N/A";
  if (isEVMBlock(block) && block.timestamp) {
    timestamp =
      new Date(Number(block.timestamp) * 1000).toLocaleString("en-GB", {
        timeZone: "GMT",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " GMT";
  } else if (isSolanaBlock(block) && block.blockTime) {
    timestamp =
      new Date(Number(block.blockTime) * 1000).toLocaleString("en-GB", {
        timeZone: "GMT",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " GMT";
  }

  // Get transaction count
  const txCount = Array.isArray(block.transactions)
    ? block.transactions.length
    : 0;

  // Get block hash
  const blockHash = isEVMBlock(block)
    ? block.hash ?? "N/A"
    : isSolanaBlock(block)
    ? block.blockhash
    : "N/A";

  // Get producer (miner for EVM, leader for Solana)
  const producer = isEVMBlock(block)
    ? block.miner
    : isSolanaBlock(block)
    ? block.leader
    : "N/A";

  const producerLabel = isEVMBlock(block) ? "Miner" : "Leader";

  return (
    <Card className="p-4 bg-slate-100">
      <div className="bg-slate-200 rounded-md p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">
              {blockIdentifierLabel}
            </div>
            <h1 className="text-5xl font-bold text-slate-900 tracking-tighter">
              <span className="text-3xl font-bold text-slate-500 mr-1">#</span>
              {blockIdentifier}
            </h1>
          </div>
          <div className="flex gap-8 bg-slate-100 rounded-md p-4">
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
              <div className="font-mono text-2xl font-bold text-slate-900 bg-slate-200 rounded-md px-3 py-1">
                {txCount}
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 bg-slate-100 rounded-md p-4 overflow-scroll">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">
              Block Hash
            </div>
            <code className="block w-full rounded bg-muted px-2 py-2 font-semibold uppercase text-slate-600 font-mono text-[10px] sm:text-xs whitespace-nowrap overflow-x-auto bg-slate-200">
              {blockHash}
            </code>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">
              {producerLabel}
            </div>
            <code className="block rounded bg-muted px-2 py-2 font-semibold uppercase text-slate-600 font-mono text-[10px] sm:text-xs whitespace-nowrap overflow-x-auto bg-slate-200">
              {producer}
            </code>
          </div>
        </div>
      </div>
    </Card>
  );
}
