import { useEffect } from "react";

interface TxStatusProps {
  hash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  onDone: () => void;
}

export function TxStatus({ hash, isPending, isConfirming, isSuccess, error, onDone }: TxStatusProps) {
  useEffect(() => {
    if (isSuccess) {
      const t = setTimeout(onDone, 2000);
      return () => clearTimeout(t);
    }
  }, [isSuccess, onDone]);

  if (!isPending && !isConfirming && !isSuccess && !error) return null;

  return (
    <div className="text-[11px] font-mono mt-3 px-3 py-2 rounded border border-accent/10 bg-accent/[0.02]">
      {isPending && <p className="text-killable">&gt; Awaiting wallet confirmation...</p>}
      {isConfirming && (
        <p className="text-accent/60">
          &gt; Confirming tx{" "}
          {hash && (
            <a
              href={`https://basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent/80 hover:text-accent underline underline-offset-2"
            >
              {hash.slice(0, 10)}…
            </a>
          )}
        </p>
      )}
      {isSuccess && <p className="text-alive text-glow-dim">&gt; Transaction confirmed ✓</p>}
      {error && (
        <p className="text-dead">
          &gt; {error.message.includes("User rejected") ? "Rejected by user" : error.message.slice(0, 80)}
        </p>
      )}
    </div>
  );
}
