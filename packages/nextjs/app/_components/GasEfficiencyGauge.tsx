import { Card } from "@/app/_components/Card";
import type { BlockType } from "@/types";

interface GasEfficiencyGaugeProps {
  block: BlockType;
}

export function GasEfficiencyGauge({ block }: GasEfficiencyGaugeProps) {
  const efficiency = (Number(block.gasUsed) / Number(block.gasLimit)) * 100;
  const rotation = (efficiency / 100) * 180 - 90;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold tracking-tighter mb-4">
        Gas Efficiency
      </h3>
      <div className="relative w-full mx-auto bg-slate-200 rounded-md p-4">
        <svg viewBox="0 0 200 120" className="w-full bg-slate-100 rounded-md">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--color-slate-500)"
            strokeWidth="20"
            className="text-muted"
          />
          {/* Filled arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--color-slate-700)"
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
            stroke="var(--color-slate-600)"
            strokeWidth="3"
            className="text-foreground"
            transform={`rotate(${rotation} 100 100)`}
          />
          <circle cx="100" cy="100" r="8" className="fill-foreground" />
        </svg>
        <div className="text-center mt-2">
          <div className="text-3xl font-bold font-mono text-slate-900">
            {efficiency.toFixed(1)}%
          </div>
          <div className="text-xs font-semibold text-muted-foreground">
            Utilization
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm bg-slate-200 rounded-md p-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground font-semibold">Used</span>
          <span className="font-mono text-slate-900">
            {Number(block.gasUsed).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-semibold">Limit</span>
          <span className="font-mono text-slate-900"></span>
          <div className="font-mono text-slate-900">
            {Number(block.gasLimit).toLocaleString()}
          </div>
        </div>
      </div>
    </Card>
  );
}
