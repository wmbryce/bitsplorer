import { BlockType } from "@/types/index";
import { createPublicClient, http } from "viem";
import { getChainConfig } from "@/utils/chains";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlockDetails } from "../_components/BlockDetails";
import { Suspense } from "react";
import { SkeletonLayout } from "../_components/SkeletonLayout";

export default async function BlockDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ blockNumber: string }>;
  searchParams: Promise<{ chain: string }>;
}) {
  const { blockNumber } = await params;
  const { chain } = await searchParams;
  const chainConfig = getChainConfig(chain);

  const getBlock = async () => {
    const client = createPublicClient({
      chain: chainConfig.chain,
      transport: http(),
    });
    const blockData = await client.getBlock({
      blockNumber: BigInt(blockNumber),
      includeTransactions: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 4000));
    return blockData as unknown as BlockType;
  };

  const blockPromise = getBlock();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blocks
          </Link>
        </div>
        <Suspense fallback={<SkeletonLayout />}>
          <BlockDetails blockPromise={blockPromise} />
        </Suspense>
      </div>
    </div>
  );
}
