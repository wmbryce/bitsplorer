import type { Block } from "@/types";
import { isEVMBlock, isSolanaBlock } from "@/types";
import { EVMQuickStats } from "./EVMQuickStats";
import { SolanaQuickStats } from "./SolanaQuickStats";

interface QuickStatsProps {
  block: Block;
}

export function QuickStats({ block }: QuickStatsProps) {
  if (isEVMBlock(block)) {
    return <EVMQuickStats block={block} />;
  } else if (isSolanaBlock(block)) {
    return <SolanaQuickStats block={block} />;
  }
  
  return null;
}
