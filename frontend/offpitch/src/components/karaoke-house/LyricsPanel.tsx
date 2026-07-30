"use client";

import { useMemo } from "react";
import type { LyricLine } from "@/lib/songs";
import { AudioWaveform } from "./AudioWaveform";
import { WaveMini } from "./icons";

type LyricsPanelProps = {
  lyrics?: LyricLine[];
  currentMs?: number;
};

export function LyricsPanel({ lyrics = [], currentMs = 0 }: LyricsPanelProps) {
  const activeIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentMs >= lyrics[i].startMs) idx = i;
      else break;
    }
    return idx;
  }, [lyrics, currentMs]);

  const visible = useMemo(() => {
    if (!lyrics.length) return [];
    if (activeIndex < 0) return lyrics.slice(0, 4);
    const start = Math.max(0, activeIndex);
    return lyrics.slice(start, start + 4);
  }, [lyrics, activeIndex]);

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
            const isActive = activeIndex >= 0 && line.line === lyrics[activeIndex]?.line;
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
                {isActive ? highlightFirstWords(line.text) : line.text}
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

function highlightFirstWords(text: string) {
  const parts = text.split(" ");
  if (parts.length <= 2) {
    return <span className="text-red-500">{text}</span>;
  }
  return (
    <>
      <span className="text-red-500">{parts.slice(0, 2).join(" ")}</span>{" "}
      {parts.slice(2).join(" ")}
    </>
  );
}
