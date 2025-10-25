import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

type BlobVisualizerProps = {
  minted: boolean;
  transactionCount: number;
};

const BlobVisualizer: React.FC<BlobVisualizerProps> = ({
  minted,
  transactionCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const animationStartedRef = useRef(false);
  const totalBlocksRef = useRef(144);
  const [blobs, setBlobs] = useState(() => new Array(144).fill(minted ? 1 : 0));
  const [completed, setCompleted] = useState(minted);
  const [, forceUpdate] = useState(0);
  const [displayedTxCount, setDisplayedTxCount] = useState(
    minted ? transactionCount : 0
  );

  // Calculate number of blocks that fit in the container
  useEffect(() => {
    const calculateBlocks = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const blockSize = 12; // w-3 = 12px
      const gap = 2; // gap-[2px]
      const blockWithGap = blockSize + gap;

      // Calculate blocks per row (subtract one gap since last block doesn't have gap)
      const blocksPerRow = Math.floor((containerWidth + gap) / blockWithGap);

      // Each block represents 1 transaction
      const transactionsPerBlock = 1;
      // Default to 40 transactions if none specified
      const txCount = transactionCount || 80;
      const totalBlocksNeeded = Math.max(
        Math.ceil(txCount / transactionsPerBlock),
        blocksPerRow // Minimum: at least one row
      );

      const total = totalBlocksNeeded;

      if (totalBlocksRef.current !== total) {
        totalBlocksRef.current = total;
        setBlobs(new Array(total).fill(minted ? 1 : 0));
        currentIndexRef.current = 0;
        forceUpdate((prev) => prev + 1);
      }
    };

    calculateBlocks();

    // Recalculate on window resize
    const resizeObserver = new ResizeObserver(calculateBlocks);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [minted, transactionCount]);

  // Handle minted state changes
  useEffect(() => {
    if (minted && !completed) {
      setBlobs(new Array(totalBlocksRef.current).fill(1));
      setDisplayedTxCount(transactionCount || 40);
      setCompleted(true);
    }
  }, [minted, completed, transactionCount]);

  // Handle animation
  useEffect(() => {
    if (!completed && !minted && !animationStartedRef.current) {
      animationStartedRef.current = true;
      currentIndexRef.current = 0;

      const targetTxCount = transactionCount || 80;
      const totalDuration = totalBlocksRef.current * 100; // Total animation time in ms
      //   const txCountInterval = Math.max(
      //     Math.floor(totalDuration / targetTxCount),
      //     10
      //   );
      const txCountInterval = 200;

      // Counter animation
      const counterInterval = setInterval(() => {
        setDisplayedTxCount((prev) => {
          if (prev < targetTxCount) {
            return Math.min(prev + 1, targetTxCount);
          } else {
            clearInterval(counterInterval);
            return targetTxCount;
          }
        });
      }, txCountInterval);

      // Block filling animation
      const blockInterval = setInterval(() => {
        const idx = currentIndexRef.current;
        if (idx < totalBlocksRef.current) {
          setBlobs((currentBlobs) => {
            const newBlobs = [...currentBlobs];
            newBlobs[idx] = 1;
            return newBlobs;
          });
          currentIndexRef.current++;
        } else {
          clearInterval(blockInterval);
          setCompleted(true);
        }
      }, 200);

      return () => {
        clearInterval(counterInterval);
        clearInterval(blockInterval);
        animationStartedRef.current = false;
      };
    }
  }, [completed, minted, transactionCount]);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 m-0">
          {displayedTxCount} transaction{displayedTxCount !== 1 ? "s" : ""}
        </p>
      </div>
      <div
        ref={containerRef}
        className="flex flex-row flex-wrap gap-[2px] w-full"
      >
        {blobs.map((blob, index) => (
          <div
            key={index}
            className={cn(
              "w-3 h-3 transition-all duration-200",
              blob === 1 ? "bg-slate-800" : "bg-slate-100"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default BlobVisualizer;
