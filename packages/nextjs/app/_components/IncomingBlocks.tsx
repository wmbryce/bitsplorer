"use client";

import React from "react";
import Block from "@/app/_components/Block";
import type { BlockType } from "@/types/index";
import { useMemo } from "react";
import { motion } from "motion/react";

const IncomingBlocks: React.FC<{ blocks: BlockType[] }> = ({ blocks }) => {
  const displayBlocks = useMemo(() => {
    if (blocks.length === 0) return [];

    // Leading placeholder for the block that hasn't been mined yet
    const nextBlock = { number: BigInt(Number(blocks[0]?.number ?? 0) + 1) };
    return [nextBlock, ...blocks.slice(0, 6)];
  }, [blocks]);

  return (
    <section className="flex flex-col items-start justify-start flex-1 h-full relative">
      <motion.ol className="flex flex-col items-start justify-start space-y-4 mt-6 w-full overflow-y-auto">
        {displayBlocks.map(
          (block: BlockType | { number: bigint }, index: number) => (
            <Block
              key={String(block.number)}
              block={block}
              index={index + 1}
            />
          )
        )}
      </motion.ol>
      <div className="absolute z-30 bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-slate-100 to-transparent via-transparent via-12%"></div>
    </section>
  );
};

export default IncomingBlocks;
