import IncomingBlocks from "./_components/IncomingBlocks";
import { BlockType } from "@/types";

export default function Page() {
  const blocks: BlockType[] = [];

  return (
    <div className="flex flex-col items-start justify-start flex-1 py-8">
      <h1 className="text-4xl font-bold tracking-tighter font-slate-900">
        Bit Piq
      </h1>
      <p className="text-normal font-regular text-slate-700">
        Welcome to the hash betting game. Every 10 minutes a new block is mined.
        Bit piq, allows you to bet on the last four bits of that block hash.
      </p>
      <div className="flex flex-row justify-between gap-8">
        <IncomingBlocks blocks={blocks as BlockType[]} loading={!blocks} />
      </div>
    </div>
  );
}
