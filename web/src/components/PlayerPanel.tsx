import { useAccount } from "wagmi";
import { usePlayerState } from "@/hooks/usePlayerState";
import { useGameState } from "@/hooks/useGameState";
import { useActions } from "@/hooks/useActions";
import { fmtUsdc, fmtAge } from "@/config/utils";
import { TxStatus } from "./TxStatus";

export function PlayerPanel() {
  const { address, isConnected } = useAccount();
  const player = usePlayerState();
  const game = useGameState();
  const actions = useActions();

  if (!isConnected || !address) {
    return (
      <div className="terminal rounded p-8 text-center">
        <div className="text-accent/20 text-4xl mb-3 font-mono">&gt;_</div>
        <p className="text-accent/30 text-xs">CONNECT WALLET TO ENTER THE ARENA</p>
      </div>
    );
  }

  const needsApproval =
    player.usdcAllowance !== undefined &&
    game.costPerEpoch !== undefined &&
    player.usdcAllowance < game.costPerEpoch;

  const isRegistered = player.age !== undefined && player.age > 0n;
  const isDead = isRegistered && !player.isAlive;
  const canClaim = player.pendingReward !== undefined && player.pendingReward > 0n;
  const epochDuration = game.epochDuration ?? 600n;

  const statusColor = player.isAlive ? "text-alive" : isDead ? "text-dead" : "text-accent/30";
  const statusText = player.isAlive ? "ALIVE" : isDead ? "DEAD" : "UNREGISTERED";

  return (
    <div className="terminal-accent rounded p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-lg ${statusColor} ${player.isAlive ? "text-glow-dim" : ""}`}>
            {player.isAlive ? "◉" : isDead ? "✕" : "○"}
          </span>
          <div>
            <div className="text-xs text-accent/50 tracking-widest">YOUR AGENT</div>
            <span className={`text-xs font-bold tracking-wider ${statusColor}`}>[{statusText}]</span>
          </div>
        </div>
        {player.isAlive && (
          <span className="w-2 h-2 rounded-full bg-alive animate-pulse-dot shadow-[0_0_8px_rgba(0,255,65,0.5)]" />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="AGE" value={player.age ? fmtAge(player.age, epochDuration) : "—"} />
        <MiniStat label="REWARDS" value={`${fmtUsdc(player.pendingReward)} USDC`} accent={canClaim} />
        <MiniStat label="BALANCE" value={`${fmtUsdc(player.usdcBalance)} USDC`} />
        <MiniStat label="APPROVAL" value={needsApproval ? "REQUIRED" : "OK"} warn={needsApproval} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {needsApproval ? (
          <ActionBtn onClick={actions.approve} disabled={actions.isPending}>
            [APPROVE USDC]
          </ActionBtn>
        ) : (
          <>
            {(!isRegistered || isDead) && (
              <ActionBtn onClick={actions.register} disabled={actions.isPending} primary>
                [REGISTER]
              </ActionBtn>
            )}
            {player.isAlive && (
              <ActionBtn onClick={actions.heartbeat} disabled={actions.isPending} primary>
                [HEARTBEAT]
              </ActionBtn>
            )}
            {canClaim && (
              <ActionBtn onClick={actions.claim} disabled={actions.isPending} success>
                [CLAIM]
              </ActionBtn>
            )}
          </>
        )}
      </div>

      <TxStatus
        hash={actions.hash}
        isPending={actions.isPending}
        isConfirming={actions.isConfirming}
        isSuccess={actions.isSuccess}
        error={actions.error}
        onDone={() => { actions.reset(); player.refetch(); game.refetch(); }}
      />
    </div>
  );
}

function MiniStat({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div>
      <div className="text-[9px] text-accent/25 tracking-widest">{label}</div>
      <div className={`text-xs font-mono ${warn ? "text-killable" : accent ? "text-accent text-glow-dim" : "text-accent/70"}`}>
        {value}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, disabled, primary, success, children }: {
  onClick: () => void;
  disabled: boolean;
  primary?: boolean;
  success?: boolean;
  children: React.ReactNode;
}) {
  const base = "px-4 py-1.5 rounded text-xs font-mono font-bold transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer border";
  const style = success
    ? "border-alive/40 text-alive hover:bg-alive/10 hover:border-alive/60 hover:shadow-[0_0_12px_rgba(0,255,65,0.2)]"
    : primary
    ? "border-accent/40 text-accent hover:bg-accent/10 hover:border-accent/60 hover:shadow-[0_0_12px_rgba(0,255,65,0.2)]"
    : "border-accent/20 text-accent/60 hover:bg-accent/5 hover:border-accent/40";

  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${style}`}>
      {children}
    </button>
  );
}
