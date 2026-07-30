export function AudioWaveform({ className }: { className?: string }) {
  const bars = [
    18, 32, 24, 48, 36, 58, 42, 64, 50, 72, 56, 68, 44, 60, 38, 70, 52, 66, 40, 58,
    34, 62, 46, 74, 54, 68, 42, 56, 30, 48, 36, 60, 44, 70, 50, 64, 38, 52, 28, 46,
  ];

  return (
    <div className={`flex h-12 items-end justify-center gap-[3px] sm:h-16 sm:gap-1 ${className ?? ""}`}>
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] sm:w-[3px]"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
