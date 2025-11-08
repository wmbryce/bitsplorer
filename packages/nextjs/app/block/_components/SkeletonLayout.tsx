import { Card } from "@/app/_components/Card";
import Skeleton from "@/app/_components/Skeleton";

export function SkeletonLayout() {
  // Static heights for timeline bars to avoid using Math.random() during render
  const barHeights = [
    "h-24",
    "h-32",
    "h-28",
    "h-40",
    "h-36",
    "h-44",
    "h-32",
    "h-38",
    "h-30",
    "h-34",
  ];

  return (
    <div className="space-y-8">
      {/* BlockHeader Skeleton */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <Skeleton className="w-24 h-4 mb-1" />
            <Skeleton className="w-48 h-14" />
          </div>
          <div className="flex gap-8">
            <div>
              <Skeleton className="w-16 h-3 mb-1" />
              <Skeleton className="w-32 h-5" />
            </div>
            <div>
              <Skeleton className="w-20 h-3 mb-1" />
              <Skeleton className="w-16 h-8" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Skeleton className="w-20 h-3 mb-1" />
            <Skeleton className="w-full h-10 rounded" />
          </div>
          <div>
            <Skeleton className="w-12 h-3 mb-1" />
            <Skeleton className="w-full h-10 rounded" />
          </div>
        </div>
      </Card>

      {/* QuickStats Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="flex-1 min-w-0">
                <Skeleton className="w-16 h-3 mb-1" />
                <Skeleton className="w-24 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ValueFlowTimeline and GasEfficiencyGauge Skeleton */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* ValueFlowTimeline Skeleton */}
        <Card className="p-6 lg:col-span-2">
          <Skeleton className="w-40 h-6 mb-4" />
          <div className="flex items-end justify-between gap-2 h-48 mb-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex-1 h-full flex flex-col items-center gap-2"
              >
                <div className="w-full flex flex-col justify-end h-full">
                  <Skeleton className={`w-full rounded-t ${barHeights[i]}`} />
                </div>
                <Skeleton className="w-6 h-4" />
                <Skeleton className="w-8 h-3" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm pt-4 border-t border-border">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="w-20 h-7 mx-auto mb-1" />
                <Skeleton className="w-16 h-3 mx-auto" />
              </div>
            ))}
          </div>
        </Card>

        {/* GasEfficiencyGauge Skeleton */}
        <Card className="p-6">
          <Skeleton className="w-32 h-6 mb-4" />
          <div className="relative w-full aspect-square max-w-[200px] mx-auto">
            <Skeleton className="w-full h-[120px] rounded-full" />
            <div className="text-center mt-2">
              <Skeleton className="w-20 h-10 mx-auto mb-1" />
              <Skeleton className="w-16 h-3 mx-auto" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="w-12 h-4" />
                <Skeleton className="w-24 h-4" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* RecentTransactions Skeleton */}
      <Card className="p-6">
        <Skeleton className="w-44 h-6 mb-4" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-3/4 h-3" />
              </div>
              <Skeleton className="w-24 h-5" />
              <Skeleton className="w-16 h-3" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
