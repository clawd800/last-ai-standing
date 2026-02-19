import { useGameState } from "@/hooks/useGameState";
import { useAgentList, type AgentInfo } from "@/hooks/useAgentList";
import { shortAddr, fmtUsdc, fmtAge } from "@/config/utils";

function StatusBadge({ agent }: { agent: AgentInfo }) {
  if (agent.killable) {
    return (
      <span className="inline-flex items-center gap-1.5 text-killable text-[11px] font-bold tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-killable animate-pulse" />
        KILLABLE
      </span>
    );
  }
  if (agent.alive) {
    return (
      <span className="inline-flex items-center gap-1.5 text-alive text-[11px]">
        <span className="w-1.5 h-1.5 rounded-full bg-alive" />
        ALIVE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-dead/60 text-[11px]">
      <span className="w-1.5 h-1.5 rounded-full bg-dead/30" />
      DEAD
    </span>
  );
}

function AgentRow({ agent, epochDuration }: { agent: AgentInfo; epochDuration: bigint }) {
  return (
    <tr className="border-b border-accent/5 matrix-row transition-colors">
      <td className="py-2.5 px-3">
        <a
          href={`https://basescan.org/address/${agent.addr}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-accent/50 hover:text-accent transition-colors"
        >
          {shortAddr(agent.addr)}
        </a>
      </td>
      <td className="py-2.5 px-3"><StatusBadge agent={agent} /></td>
      <td className="py-2.5 px-3 font-mono text-[11px] text-accent/60">{fmtAge(agent.age, epochDuration)}</td>
      <td className="py-2.5 px-3 font-mono text-[11px] text-accent/40">{fmtUsdc(agent.totalPaid)}</td>
      <td className="py-2.5 px-3 font-mono text-[11px] text-accent/60">{fmtUsdc(agent.pendingReward)}</td>
    </tr>
  );
}

export function AgentTable() {
  const { registryLength, epochDuration, isLoading: stateLoading } = useGameState();
  const { agents, isLoading: listLoading } = useAgentList(registryLength);

  if (stateLoading || listLoading) {
    return (
      <div className="terminal rounded p-6">
        <div className="text-accent/20 text-xs font-mono animate-pulse">Loading arena data...</div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="terminal rounded p-10 text-center">
        <div className="text-accent/10 text-3xl mb-3 font-mono">[ ]</div>
        <p className="text-accent/30 text-xs">NO AGENTS IN THE ARENA</p>
        <p className="text-accent/15 text-[10px] mt-1">Be the first to register</p>
      </div>
    );
  }

  const ed = epochDuration ?? 600n;

  const sorted = [...agents].sort((a, b) => {
    if (a.alive !== b.alive) return a.alive ? -1 : 1;
    if (a.killable !== b.killable) return a.killable ? -1 : 1;
    return Number(b.age - a.age);
  });

  return (
    <div className="terminal rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-accent/10">
              {["AGENT", "STATUS", "AGE", "PAID", "REWARDS"].map((h) => (
                <th key={h} className="py-2.5 px-3 text-[9px] text-accent/25 uppercase tracking-[0.2em] font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((agent) => (
              <AgentRow key={agent.addr} agent={agent} epochDuration={ed} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
