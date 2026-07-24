export function WaveIcon({ className }: { className?: string }) {
  const heights = [4, 8, 12, 16, 10, 6, 12, 8, 4];
  return (
    <svg viewBox="0 0 36 20" className={className} fill="none" aria-hidden>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 4}
          y={10 - h / 2}
          width="2"
          height={h}
          rx="1"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
