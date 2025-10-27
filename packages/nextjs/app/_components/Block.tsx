import React from "react";
import BlobVisualizer from "@/app/_components/BlobVisualizer";
import Skeleton from "@/app/_components/Skeleton";
import type { BlockType } from "@/types/index";
import { motion } from "motion/react";

type BlockProps = {
  block: BlockType | { number: bigint };
  index: number;
};

const Block: React.FC<BlockProps> = ({ block, index }) => {
  const isBlockType = (
    block: BlockType | { number: bigint }
  ): block is BlockType => {
    return typeof block === "object" && "timestamp" in block && "hash" in block;
  };

  return (
    <motion.li
      layoutId={`block-${block.number}`}
      key={`block-${block.number}`}
      initial={index === 0 ? { opacity: 0 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        default: { ease: "easeInOut", delay: index === 0 ? 0.28 : 0 },
        layout: { duration: 0.3 }, // Controls the sliding animation
      }}
      className="flex flex-col md:flex-row gap-3 flex-1 bg-slate-50 p-4 w-full border border-slate-200 rounded-md"
    >
      <div className="flex flex-col justify-start items-end bg-slate-200 py-2 px-4 rounded-md min-w-[80px]">
        <h2 className="text-2xl font-bold text-slate-900 mb-0 tracking-tighter">
          <span className="text-base font-bold text-slate-500 mr-1">#</span>
          {String(block?.number)}
        </h2>
        {isBlockType(block) ? (
          <p className="text-md font-semibold text-slate-600 whitespace-nowrap my-0">
            {new Date(Number(block?.timestamp) * 1000).toLocaleString("en-GB", {
              timeZone: "GMT",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}{" "}
            GMT
          </p>
        ) : (
          <Skeleton className="w-full h-5" />
        )}
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex flex-row items-center pl-2 bg-slate-200 rounded-md mb-2 z-10">
          <p className="text-xs font-semibold text-slate-600 my-1 uppercase w-fit h-[16px] overflow-hidden text-ellipsis whitespace-nowrap">
            {isBlockType(block) && block?.hash}
          </p>
        </div>
        <BlobVisualizer
          minted={index !== 0}
          transactionCount={isBlockType(block) ? block.transactions.length : 0}
        />
      </div>
    </motion.li>
  );
};

export default Block;
