import { Card } from "@/app/_components/Card";
import type { SolanaBlock } from "@/types/solana";

interface ComputeUnitsGaugeProps {
  block: SolanaBlock;
}

export function ComputeUnitsGauge({ block }: ComputeUnitsGaugeProps) {
  // Solana has a per-block compute unit limit
  // Note: This is a simplified version - actual compute units per transaction
  // would need to be extracted from transaction metadata
  const SOLANA_MAX_COMPUTE_UNITS = 48_000_000; // Per block compute unit limit
  
  // For now, estimate based on transaction count (this is approximate)
  const estimatedComputeUnits = block.transactions.length * 200_000; // Avg per tx
  const efficiency = Math.min((estimatedComputeUnits / SOLANA_MAX_COMPUTE_UNITS) * 100, 100);
  const rotation = (efficiency / 100) * 180 - 90;

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold tracking-tighter mb-3 sm:mb-4">
        Compute Units
      </h3>
      <div className="relative w-full max-w-md mx-auto bg-slate-200 rounded-md p-3 sm:p-4">
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
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono text-slate-900">
            {efficiency.toFixed(1)}%
          </div>
          <div className="text-xs sm:text-sm font-semibold text-muted-foreground">
            Est. Utilization
          </div>
        </div>
      </div>
      <div className="mt-3 sm:mt-4 space-y-2 text-xs sm:text-sm bg-slate-200 rounded-md p-3 sm:p-4">
        <div className="flex justify-between items-center gap-2">
          <span className="text-muted-foreground font-semibold">Est. Used</span>
          <span className="font-mono text-slate-900 break-all text-right">
            {estimatedComputeUnits.toLocaleString()} CU
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-muted-foreground font-semibold">Block Limit</span>
          <div className="font-mono text-slate-900 break-all text-right">
            {SOLANA_MAX_COMPUTE_UNITS.toLocaleString()} CU
          </div>
        </div>
      </div>
    </Card>
  );
}

