import IncomingBlocks from "./_components/IncomingBlocks";
import { BlockType } from "@/types";

export default function Page() {
  const blocks: BlockType[] = [];

  return (
    <section className="flex flex-col items-start h-full justify-start flex-1 py-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tighter font-slate-900">
          Bit Piq
        </h1>
        <p className="text-normal font-regular text-slate-700">
          Welcome to the hash betting game. Every 10 minutes a new block is
          mined. Bit piq, allows you to bet on the last four bits of that block
          hash.
        </p>
      </header>
      <main className="flex flex-col flex-1 h-full w-full">
        <IncomingBlocks blocks={blocks as BlockType[]} loading={!blocks} />
      </main>
    </section>
  );
}
