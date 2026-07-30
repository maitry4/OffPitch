type MemberTileProps = {
  name: string;
  initials: string;
  size?: "sm" | "lg";
  showCrown?: boolean;
  isActive?: boolean;
  className?: string;
};

export function MemberTile({
  name,
  initials,
  size = "sm",
  showCrown = false,
  isActive = false,
  className,
}: MemberTileProps) {
  const isLarge = size === "lg";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-zinc-900 ${
        isActive || isLarge
          ? "border-2 border-red-500 shadow-[0_0_28px_rgba(239,68,68,0.45)]"
          : "border border-white/10"
      } ${className ?? ""}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-zinc-900 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.18),transparent_60%)]" />

      <div className="relative z-10 flex h-full min-h-[110px] flex-col items-center justify-center gap-2 p-3 sm:min-h-[120px]">
        {showCrown && (
          <span className="absolute left-1/2 top-3 -translate-x-1/2 text-amber-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.9)]">
            <CrownIcon className={isLarge ? "h-7 w-7 sm:h-8 sm:w-8" : "h-5 w-5"} />
          </span>
        )}

        {isLarge && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-red-500/50 bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            Now Singing
          </div>
        )}

        <span
          className={`flex items-center justify-center rounded-full border border-red-500/40 bg-black/50 font-semibold text-white shadow-[0_0_16px_rgba(239,68,68,0.25)] ${
            isLarge ? "h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl" : "h-14 w-14 text-lg"
          }`}
        >
          {initials}
        </span>

        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded-md bg-black/45 px-2 py-1 backdrop-blur-sm">
          <span className={`font-medium text-white ${isLarge ? "text-xs sm:text-sm" : "text-[11px]"}`}>
            {name}
          </span>
          <SignalBars className="h-2.5 w-3.5 text-emerald-400" />
        </div>
      </div>
    </div>
  );
}

function SignalBars({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 12" fill="currentColor" aria-hidden>
      <rect x="0" y="8" width="2.5" height="4" rx="0.5" />
      <rect x="4.5" y="5" width="2.5" height="7" rx="0.5" />
      <rect x="9" y="2" width="2.5" height="10" rx="0.5" />
      <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" opacity="0.35" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17h18l-1.5-9-4.5 4L12 5l-3 7-4.5-4L3 17zm1.5 2h15v2h-15v-2z" />
    </svg>
  );
}
