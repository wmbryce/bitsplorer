import { Card } from "@/app/_components/Cardd";
import type { BlockData } from "@/types";

interface GasEfficiencyGaugeProps {
  blockData: BlockData;
}

export function GasEfficiencyGauge({ blockData }: GasEfficiencyGaugeProps) {
  const efficiency = (blockData.gasUsed / blockData.gasLimit) * 100;
  const rotation = (efficiency / 100) * 180 - 90;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Gas Efficiency</h3>
      <div className="relative w-full aspect-square max-w-[200px] mx-auto">
        <svg viewBox="0 0 200 120" className="w-full">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="20"
            className="text-muted"
          />
          {/* Filled arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="20"
            strokeDasharray={`${(efficiency / 100) * 251.2} 251.2`}
            className="text-primary"
          />
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="currentColor"
            strokeWidth="3"
            className="text-foreground"
            transform={`rotate(${rotation} 100 100)`}
          />
          <circle cx="100" cy="100" r="8" className="fill-foreground" />
        </svg>
        <div className="text-center mt-2">
          <div className="text-3xl font-bold font-mono">
            {efficiency.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">Utilization</div>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Used</span>
          <span className="font-mono">
            {blockData.gasUsed.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Limit</span>
          <span className="font-mono">
            {blockData.gasLimit.toLocaleString()}
          </span>
        </div>
      </div>
    </Card>
  );
}
