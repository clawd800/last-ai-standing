import { useGameState } from "@/hooks/useGameState";
import { fmtUsdc, fmtDuration } from "@/config/utils";

function Stat({ label, value, colorClass, glowClass }: { label: string; value: string; colorClass?: string; glowClass?: string }) {
  return (
    <div className="terminal rounded p-5">
      <div className="text-[11px] text-accent/50 uppercase tracking-[0.2em] mb-2 font-bold">{label}</div>
      <div className={`text-2xl font-bold font-mono tabular-nums ${colorClass || "text-accent/90"} ${glowClass || ""}`}>
        {value}
      </div>
    </div>
  );
}

export function GameStats() {
  const {
    totalAlive, totalDead, totalPool, totalRewardsDistributed,
    epochDuration, costPerEpoch, isLoading,
  } = useGameState();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="terminal rounded p-5 h-[104px] animate-pulse" />
        ))}
      </div>
    );
  }

  const epochSecs = epochDuration ? Number(epochDuration) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      <Stat label="Alive" value={totalAlive?.toString() ?? "—"} colorClass="text-alive" glowClass="text-glow" />
      <Stat label="Dead" value={totalDead?.toString() ?? "—"} colorClass="text-dead" glowClass="text-glow" />
      <Stat label="Pool" value={fmtUsdc(totalPool, true)} colorClass="text-killable" glowClass="text-glow" />
      <Stat label="Distributed" value={fmtUsdc(totalRewardsDistributed, true)} colorClass="text-accent/90" glowClass="text-glow-dim" />
      <Stat label="Epoch" value={epochSecs ? fmtDuration(epochSecs) : "—"} colorClass="text-accent/90" glowClass="text-glow-dim" />
      <Stat label="Cost" value={fmtUsdc(costPerEpoch, true)} colorClass="text-accent/90" glowClass="text-glow-dim" />
    </div>
  );
}
