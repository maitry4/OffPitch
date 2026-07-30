"use client";

import Image from "next/image";
import type { SongPlayback } from "@/lib/songs";
import { formatDuration } from "@/lib/songs";
import { CameraIcon, PauseIcon } from "./icons";

type PlayerBarProps = {
  playback: SongPlayback | null;
  currentMs: number;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
};

export function PlayerBar({ playback, currentMs, audioRef }: PlayerBarProps) {
  const durationMs = (playback?.durationSeconds ?? 0) * 1000;
  const progress = durationMs > 0 ? Math.min(100, (currentMs / durationMs) * 100) : 0;

  return (
    <div className="border-t border-white/5 bg-black/70 backdrop-blur-xl">
      <audio ref={audioRef} src={playback?.audioUrl || undefined} preload="auto" className="hidden" />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:py-4 xl:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 sm:h-14 sm:w-14">
            {playback?.coverUrl ? (
              <Image src={playback.coverUrl} alt="" fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-red-400">♪</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3 lg:block">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white sm:text-base">
                  {playback?.title ?? "No song selected"}
                </p>
                <p className="truncate text-xs text-white/45">
                  {playback?.artist ?? "Pick a track to begin"}
                </p>
              </div>

              <button
                type="button"
                aria-label="Pause"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] transition hover:bg-red-500 lg:hidden"
              >
                <PauseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2 lg:mt-2.5">
              <span className="hidden text-[10px] text-white/40 tabular-nums sm:inline">
                {formatClock(currentMs)}
              </span>
              <div className="relative h-1.5 flex-1 rounded-full bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-red-500"
                  style={{ width: `${progress}%` }}
                />
                <span
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              </div>
              <span className="text-[10px] text-white/40 tabular-nums">
                {playback ? formatDuration(playback.durationSeconds) : "0:00"}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Pause"
          className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_24px_rgba(239,68,68,0.55)] transition hover:bg-red-500 lg:flex"
        >
          <PauseIcon className="h-5 w-5" />
        </button>

        <div className="flex justify-center lg:min-w-[200px] lg:justify-end">
          <CaptureMomentButton />
        </div>
      </div>
    </div>
  );
}

export function CaptureMomentButton() {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
    >
      <CameraIcon className="h-4 w-4 text-red-400" />
      <span>Capture Moment</span>
      <span className="text-amber-300" aria-hidden>
        ✦
      </span>
    </button>
  );
}

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
