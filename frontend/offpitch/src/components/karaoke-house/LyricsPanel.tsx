"use client";

import { useMemo } from "react";
import type { LyricLine } from "@/lib/songs";
import { AudioWaveform } from "./AudioWaveform";
import { WaveMini } from "./icons";

/** Delay red fill slightly so it lands with the karaoke mix. */
const LYRICS_LAG_MS = 450;

type LyricsPanelProps = {
  lyrics?: LyricLine[];
  currentMs?: number;
};

export function LyricsPanel({ lyrics = [], currentMs = 0 }: LyricsPanelProps) {
  const lyricMs = Math.max(0, currentMs - LYRICS_LAG_MS);

  const activeIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyricMs >= lyrics[i].startMs) idx = i;
      else break;
    }
    return idx;
  }, [lyrics, lyricMs]);

  const visible = useMemo(() => {
    if (!lyrics.length) return [];
    if (activeIndex < 0) return lyrics.slice(0, 4);
    const start = Math.max(0, activeIndex);
    return lyrics.slice(start, start + 4);
  }, [lyrics, activeIndex]);

  const activeLine = activeIndex >= 0 ? lyrics[activeIndex] : null;

  return (
    <div className="relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl border border-red-500/25 bg-black/60 shadow-[0_0_30px_rgba(239,68,68,0.12)] backdrop-blur-sm sm:min-h-[280px] lg:min-h-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.12),transparent_65%)]" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-8 sm:px-8">
        <div className="mb-5 flex items-center gap-1.5 rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-400 sm:mb-6">
          <WaveMini className="h-3 w-3.5" />
          Now Singing
        </div>

        <div className="w-full space-y-2 text-center sm:space-y-2.5">
          {visible.length === 0 && (
            <p className="text-base text-white/40 sm:text-xl">Lyrics loading…</p>
          )}
          {visible.map((line, i) => {
            const isActive = activeLine != null && line.line === activeLine.line;
            return (
              <p
                key={`${line.line}-${line.startMs}`}
                className={`text-base font-medium leading-relaxed sm:text-xl lg:text-2xl ${
                  isActive
                    ? "text-white"
                    : i === 0
                      ? "text-white/80"
                      : "text-white/35"
                }`}
              >
                {isActive ? (
                  <KaraokeLine
                    text={line.text}
                    startMs={line.startMs}
                    endMs={line.endMs}
                    lyricMs={lyricMs}
                  />
                ) : (
                  line.text
                )}
              </p>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 px-4 pb-4 sm:px-6 sm:pb-5">
        <AudioWaveform />
      </div>
    </div>
  );
}

function KaraokeLine({
  text,
  startMs,
  endMs,
  lyricMs,
}: {
  text: string;
  startMs: number;
  endMs: number;
  lyricMs: number;
}) {
  const duration = Math.max(1, endMs - startMs);
  const progress = Math.min(1, Math.max(0, (lyricMs - startMs) / duration));
  const pct = progress * 100;

  return (
    <span
      className="bg-clip-text text-transparent"
      style={{
        backgroundImage: `linear-gradient(90deg, #ef4444 ${pct}%, rgba(255,255,255,0.88) ${pct}%)`,
      }}
    >
      {text}
    </span>
  );
}
