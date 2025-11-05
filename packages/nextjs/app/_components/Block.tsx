import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BlobVisualizer from "@/app/_components/BlobVisualizer";
import Skeleton from "@/app/_components/Skeleton";
import type { BlockType } from "@/types/index";
import { motion } from "motion/react";

type BlockProps = {
  block: BlockType | { number: bigint };
  index: number;
};

const Block: React.FC<BlockProps> = ({ block, index }) => {
  const searchParams = useSearchParams();
  const chainParam = searchParams.get("chain");

  const isBlockType = (
    block: BlockType | { number: bigint }
  ): block is BlockType => {
    return typeof block === "object" && "timestamp" in block && "hash" in block;
  };

  const blockLink = `/block/${block.number}${
    chainParam ? `?chain=${chainParam}` : ""
  }`;
  const isFullBlock = isBlockType(block);

  const blockContent = (
    <>
      <div className="flex flex-col justify-start items-end bg-slate-200 py-2 px-4 rounded-md min-w-[80px]">
        <h2 className="text-2xl font-bold text-slate-900 mb-0 tracking-tighter">
          <span className="text-base font-bold text-slate-500 mr-1">#</span>
          {String(block?.number)}
        </h2>
        {isFullBlock ? (
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
            {isFullBlock && block?.hash}
          </p>
        </div>
        <BlobVisualizer
          minted={index !== 0}
          transactionCount={isFullBlock ? block.transactions.length : 0}
        />
      </div>
    </>
  );

  console.log(block.number, index);
  return (
    <motion.li
      layoutId={`block-${block.number}`}
      key={`block-${block.number}`}
      initial={{ opacity: index === 0 ? 0 : 1, y: -180 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.04,
        ease: "easeInOut",
      }}
      layout="position"
      className={`flex flex-col md:flex-row gap-3 flex-1 bg-slate-50 p-4 w-full border border-slate-200 rounded-md ${
        isFullBlock
          ? "cursor-pointer hover:border-slate-400 hover:shadow-md transition-all"
          : ""
      }`}
    >
      {isFullBlock ? (
        <Link href={blockLink} className="contents">
          {blockContent}
        </Link>
      ) : (
        blockContent
      )}
    </motion.li>
  );
};

export default Block;
