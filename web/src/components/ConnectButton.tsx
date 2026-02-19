import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortAddr } from "@/config/utils";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="flex items-center gap-2 px-3 py-1.5 border border-accent/30 rounded text-xs text-accent/80 hover:text-accent hover:border-accent/60 transition-all cursor-pointer font-mono"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
        {shortAddr(address)}
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((c) => (
        <button
          key={c.uid}
          onClick={() => connect({ connector: c })}
          className="px-4 py-1.5 border border-accent/40 rounded text-xs text-accent hover:bg-accent/10 hover:border-accent hover:shadow-[0_0_12px_rgba(0,255,65,0.2)] transition-all cursor-pointer font-mono"
        >
          [{c.name === "Injected" ? "CONNECT" : c.name.toUpperCase()}]
        </button>
      ))}
    </div>
  );
}
