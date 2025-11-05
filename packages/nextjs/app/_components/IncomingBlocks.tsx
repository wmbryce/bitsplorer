"use client";

import React, { useEffect, useState } from "react";
import Block from "@/app/_components/Block";
import type { BlockType } from "@/types/index";
import { motion } from "motion/react";

const IncomingBlocks: React.FC<{ blocks: BlockType[]; loading: boolean }> = ({
  blocks,
  loading,
}) => {
  const [nextBlock, setNextBlock] = useState<bigint>(BigInt(0));

  useEffect(() => {
    if (blocks.length > 0) {
      setNextBlock(BigInt(Number(blocks[0]?.number ?? 0) + 1));
    }
  }, [blocks]);
  const displayBlocks = blocks.length > 0 ? blocks.slice(0, 6) : [];

  return (
    <section className="flex flex-col items-start justify-start flex-1 h-full relative">
      <ol
        // layout
        className="flex flex-col items-start justify-start space-y-4 mt-6 w-full overflow-y-auto"
      >
        {nextBlock !== BigInt(0) ? (
          <Block block={{ number: nextBlock }} index={0} key={nextBlock} />
        ) : null}
        {displayBlocks.map((block: BlockType, index: number) => (
          <Block key={block.number} block={block} index={index + 2} />
        ))}
      </ol>
      <div className="absolute z-30 bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-slate-100 to-transparent via-transparent via-12%"></div>
    </section>
  );
};

export default IncomingBlocks;
