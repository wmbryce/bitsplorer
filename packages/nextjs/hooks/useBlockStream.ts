import { useEffect, useState } from "react";
import { Block, isEVMBlock, isSolanaBlock } from "@/types";

interface LatestBlockInfo {
  number: bigint; // Block number for EVM, slot for Solana
  txCount: number;
  timestamp: Date;
}

interface UseBlockStreamReturn {
  blocks: Block[];
  loading: boolean;
  error: string | null;
  latestBlockInfo: LatestBlockInfo | null;
}

/**
 * Custom hook to stream blockchain blocks via Server-Sent Events
 * @param chainId - The blockchain chain ID to stream blocks from
 * @returns Object containing blocks, loading state, error state, and latest block info
 */
export function useBlockStream(chainId: string): UseBlockStreamReturn {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestBlockInfo, setLatestBlockInfo] =
    useState<LatestBlockInfo | null>(null);

  useEffect(() => {
    // Create EventSource connection to SSE endpoint
    const eventSource = new EventSource(`/api/blocks?chain=${chainId}`);

    // Set loading state when connection starts
    let isInitialLoad = true;

    // Handle initial blocks
    eventSource.addEventListener("initial", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received initial blocks:", data.blocks.length);

        // Convert string values back to BigInt for blocks
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blocks = data.blocks.map((block: any) => {
          // Handle EVM blocks
          if (!block.chainType || block.chainType === 'EVM') {
            return {
              ...block,
              chainType: 'EVM',
              number: BigInt(block.number),
              timestamp: BigInt(block.timestamp),
              gasLimit: BigInt(block.gasLimit),
              gasUsed: BigInt(block.gasUsed),
              baseFeePerGas: block.baseFeePerGas
                ? BigInt(block.baseFeePerGas)
                : null,
              difficulty: block.difficulty ? BigInt(block.difficulty) : BigInt(0),
              totalDifficulty: block.totalDifficulty
                ? BigInt(block.totalDifficulty)
                : BigInt(0),
              size: BigInt(block.size),
              blobGasUsed: block.blobGasUsed ? BigInt(block.blobGasUsed) : null,
              excessBlobGas: block.excessBlobGas
                ? BigInt(block.excessBlobGas)
                : null,
            };
          }
          // Handle Solana blocks
          else if (block.chainType === 'SOLANA') {
            return {
              ...block,
              chainType: 'SOLANA',
              slot: BigInt(block.slot),
              blockTime: block.blockTime ? BigInt(block.blockTime) : null,
              blockHeight: block.blockHeight ? BigInt(block.blockHeight) : null,
              parentSlot: BigInt(block.parentSlot),
              rewards: block.rewards?.map((r: any) => ({
                ...r,
                lamports: BigInt(r.lamports),
                postBalance: BigInt(r.postBalance),
              })) || null,
            };
          }
          return block;
        });

        if (isInitialLoad) {
          setBlocks(blocks);
          setLoading(false);
          setError(null);
          setLatestBlockInfo(null);
          isInitialLoad = false;
        }
      } catch (err) {
        console.error("Error parsing initial blocks:", err);
        if (isInitialLoad) {
          setError("Failed to load initial blocks");
          setLoading(false);
          isInitialLoad = false;
        }
      }
    });

    // Handle new blocks
    eventSource.addEventListener("block", (event) => {
      try {
        const data = JSON.parse(event.data);
        const block = data.block;

        let fullBlock: Block;

        // Convert string values back to BigInt based on chain type
        if (!block.chainType || block.chainType === 'EVM') {
          console.log(`New EVM block detected: #${block.number}`);
          
          fullBlock = {
            ...block,
            chainType: 'EVM',
            number: BigInt(block.number),
            timestamp: BigInt(block.timestamp),
            gasLimit: BigInt(block.gasLimit),
            gasUsed: BigInt(block.gasUsed),
            baseFeePerGas: block.baseFeePerGas
              ? BigInt(block.baseFeePerGas)
              : null,
            difficulty: block.difficulty ? BigInt(block.difficulty) : BigInt(0),
            totalDifficulty: block.totalDifficulty
              ? BigInt(block.totalDifficulty)
              : BigInt(0),
            size: BigInt(block.size),
            blobGasUsed: block.blobGasUsed ? BigInt(block.blobGasUsed) : null,
            excessBlobGas: block.excessBlobGas
              ? BigInt(block.excessBlobGas)
              : null,
          };
        } else {
          console.log(`New Solana block detected: Slot ${block.slot}`);
          
          fullBlock = {
            ...block,
            chainType: 'SOLANA',
            slot: BigInt(block.slot),
            blockTime: block.blockTime ? BigInt(block.blockTime) : null,
            blockHeight: block.blockHeight ? BigInt(block.blockHeight) : null,
            parentSlot: BigInt(block.parentSlot),
            rewards: block.rewards?.map((r: any) => ({
              ...r,
              lamports: BigInt(r.lamports),
              postBalance: BigInt(r.postBalance),
            })) || null,
          };
        }

        // Update latest block info for real-time display
        const blockNumber = isEVMBlock(fullBlock) 
          ? fullBlock.number || BigInt(0)
          : isSolanaBlock(fullBlock)
          ? fullBlock.slot
          : BigInt(0);

        const txCount = Array.isArray((fullBlock as any).transactions)
          ? (fullBlock as any).transactions.length
          : 0;

        setLatestBlockInfo({
          number: blockNumber,
          txCount,
          timestamp: new Date(),
        });

        setBlocks((prevBlocks) => {
          // Add new block to the beginning and keep only the latest 20
          const newBlocks = [fullBlock, ...prevBlocks].slice(0, 20);
          return newBlocks;
        });
      } catch (err) {
        console.error("Error parsing new block:", err);
      }
    });

    // Handle errors
    eventSource.addEventListener("error", (event: Event) => {
      console.error("SSE error:", event);

      // Check if it's a MessageEvent with data
      if ("data" in event) {
        try {
          const data = JSON.parse((event as MessageEvent).data);
          setError(data.message || "Error receiving blocks");
        } catch {
          setError("Error receiving blocks");
        }
      }

      // EventSource will automatically try to reconnect
      // If we want to stop reconnecting, we can close it
      if (eventSource.readyState === EventSource.CLOSED) {
        setError("Connection closed. Please refresh the page.");
        setLoading(false);
      }
    });

    // Handle connection open
    eventSource.onopen = () => {
      console.log("SSE connection opened");
      setError(null);
    };

    // Cleanup function
    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, [chainId]);

  return { blocks, loading, error, latestBlockInfo };
}
