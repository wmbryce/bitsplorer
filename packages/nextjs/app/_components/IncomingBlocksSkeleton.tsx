import React from "react";

const BlockSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-3 flex-1 bg-slate-50 p-4 w-full border border-slate-200 rounded-md">
      {/* Block number and timestamp section */}
      <div className="flex flex-col justify-start items-end bg-slate-200 py-2 px-4 rounded-md min-w-[80px]">
        <div className="animate-pulse">
          <div className="h-8 w-20 bg-slate-300 rounded mb-1"></div>
          <div className="h-5 w-24 bg-slate-300 rounded"></div>
        </div>
      </div>

      {/* Hash and blob visualizer section */}
      <div className="flex flex-col flex-1">
        <div className="flex flex-row items-center pl-2 bg-slate-200 rounded-md mb-2 z-10">
          <div className="animate-pulse w-full h-[16px] my-1">
            <div className="h-4 w-3/4 bg-slate-300 rounded"></div>
          </div>
        </div>
        {/* BlobVisualizer skeleton */}
        <div className="animate-pulse">
          <div className="h-32 w-full bg-slate-300 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

const IncomingBlocksSkeleton: React.FC = () => {
  return (
    <section className="flex flex-col items-start justify-start flex-1 h-full relative">
      <div className="flex flex-col items-start justify-start space-y-4 mt-6 w-full overflow-y-auto">
        {/* Render 7 skeleton blocks to match the displayBlocks structure */}
        {Array.from({ length: 7 }).map((_, index) => (
          <BlockSkeleton key={index} />
        ))}
      </div>
      <div className="absolute z-30 bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-slate-100 to-transparent via-transparent via-12%"></div>
    </section>
  );
};

export default IncomingBlocksSkeleton;
