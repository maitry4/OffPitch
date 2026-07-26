const heights = [6, 14, 8, 18, 6, 12, 16, 8, 14, 6, 10, 18, 8, 14, 6, 10, 16, 8, 12, 6];

export function WaveDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 20" className={className} fill="none" aria-hidden>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 10}
          y={10 - h / 2}
          width="3"
          height={h}
          rx="1.5"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

export function WaveVertical({ className }: { className?: string }) {
  const bars = [12, 28, 18, 36, 14, 24, 32, 16, 28, 12, 22, 34, 16, 26, 12, 20, 30, 14, 22, 10];
  return (
    <svg viewBox="0 0 24 120" className={className} fill="none" aria-hidden>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 1.15}
          y={(120 - h) / 2}
          width="1.5"
          height={h}
          rx="0.75"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
