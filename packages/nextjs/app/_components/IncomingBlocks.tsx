"use client";

import React from "react";
import Block from "@/app/_components/Block";
import type { Block as BlockType } from "@/types/index";
import { isEVMBlock, isSolanaBlock } from "@/types";
import { useMemo } from "react";
import { motion } from "motion/react";

const IncomingBlocks: React.FC<{ blocks: BlockType[] }> = ({
  blocks,
  //   loading,
}) => {
  const displayBlocks = useMemo(() => {
    if (blocks.length === 0) return [];
    
    // Get the next block identifier based on chain type
    const firstBlock = blocks[0];
    let nextBlockIdentifier: bigint;
    
    if (isEVMBlock(firstBlock)) {
      nextBlockIdentifier = BigInt(Number(firstBlock.number ?? 0) + 1);
    } else if (isSolanaBlock(firstBlock)) {
      nextBlockIdentifier = BigInt(Number(firstBlock.slot ?? 0) + 1);
    } else {
      nextBlockIdentifier = BigInt(0);
    }
    
    const nextBlock = { number: nextBlockIdentifier };
    return [nextBlock, ...blocks.slice(0, 6)];
  }, [blocks]);

  //   console.log(displayBlocks);

  return (
    <section className="flex flex-col items-start justify-start flex-1 h-full relative">
      <motion.ol className="flex flex-col items-start justify-start space-y-4 mt-6 w-full overflow-y-auto">
        {displayBlocks.map(
          (block: BlockType | { number: bigint }, index: number) => {
            const key = "number" in block 
              ? block.number.toString()
              : "slot" in block 
              ? (block as any).slot.toString()
              : index;
            return <Block key={key} block={block} index={index + 1} />;
          }
        )}
      </motion.ol>
      <div className="absolute z-30 bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-slate-100 to-transparent via-transparent via-12%"></div>
    </section>
  );
};

export default IncomingBlocks;
