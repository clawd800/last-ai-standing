export function SectionHeader({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span className="text-accent/80 text-[11px] tracking-[0.4em] font-bold shrink-0">/// {label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-accent/30 via-accent/10 to-transparent shadow-[0_0_10px_rgba(214,222,243,0.1)]" />
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
