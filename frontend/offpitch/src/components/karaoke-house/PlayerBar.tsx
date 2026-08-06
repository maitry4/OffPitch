"use client";

import Image from "next/image";
import type { SongPlayback } from "@/lib/songs";
import { formatDuration } from "@/lib/songs";
import { CameraIcon, PauseIcon, PlayIcon, ReplayIcon } from "./icons";
import { MediaControls } from "./MediaControls";

type PlayerBarProps = {
  playback: SongPlayback | null;
  currentMs: number;
  isPlaying: boolean;
  disabled?: boolean;
  onTogglePlay: () => void;
  onSeek: (ms: number) => void;
  onReplay: () => void;
  camOn?: boolean;
  micOn?: boolean;
  mediaError?: string | null;
  onToggleCam?: () => void;
  onToggleMic?: () => void;
  onCaptureMoment?: () => void;
  isCapturingMoment?: boolean;
  captureSecondsRemaining?: number;
  captureError?: string | null;
};

export function PlayerBar({
  playback,
  currentMs,
  isPlaying,
  disabled = false,
  onTogglePlay,
  onSeek,
  onReplay,
  camOn = false,
  micOn = false,
  mediaError = null,
  onToggleCam,
  onToggleMic,
  onCaptureMoment,
  isCapturingMoment = false,
  captureSecondsRemaining = 0,
  captureError = null,
}: PlayerBarProps) {
  const durationMs = (playback?.durationSeconds ?? 0) * 1000;
  const progress = durationMs > 0 ? Math.min(100, (currentMs / durationMs) * 100) : 0;
  const canControl = Boolean(playback) && !disabled;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canControl || durationMs <= 0) return;
    const pct = Number(e.target.value);
    onSeek((pct / 100) * durationMs);
  };

  return (
    <div className="border-t border-white/5 bg-black/70 backdrop-blur-xl">
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

              <div className="flex items-center gap-2 lg:hidden">
                <ControlButton
                  label="Replay"
                  onClick={onReplay}
                  disabled={!canControl}
                  className="h-10 w-10 border border-white/15 bg-white/5"
                >
                  <ReplayIcon className="h-4 w-4" />
                </ControlButton>
                <ControlButton
                  label={isPlaying ? "Pause" : "Play"}
                  onClick={onTogglePlay}
                  disabled={!canControl}
                  className="h-11 w-11 bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:bg-red-500"
                >
                  {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                </ControlButton>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2 lg:mt-2.5">
              <span className="hidden text-[10px] text-white/40 tabular-nums sm:inline">
                {formatClock(currentMs)}
              </span>
              <div className="relative h-1.5 flex-1">
                <div className="absolute inset-0 rounded-full bg-white/10" />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-red-500"
                  style={{ width: `${progress}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={progress}
                  disabled={!canControl}
                  onChange={handleSliderChange}
                  aria-label="Seek"
                  className="absolute inset-0 z-10 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(239,68,68,0.8)] [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-red-500"
                />
              </div>
              <span className="text-[10px] text-white/40 tabular-nums">
                {playback ? formatDuration(playback.durationSeconds) : "0:00"}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ControlButton
            label="Replay"
            onClick={onReplay}
            disabled={!canControl}
            className="h-11 w-11 border border-white/15 bg-white/5 hover:bg-white/10"
          >
            <ReplayIcon className="h-4 w-4" />
          </ControlButton>
          <ControlButton
            label={isPlaying ? "Pause" : "Play"}
            onClick={onTogglePlay}
            disabled={!canControl}
            className="h-12 w-12 bg-red-600 shadow-[0_0_24px_rgba(239,68,68,0.55)] hover:bg-red-500"
          >
            {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
          </ControlButton>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:min-w-[260px] lg:justify-end">
          {onToggleCam && onToggleMic && (
            <MediaControls
              camOn={camOn}
              micOn={micOn}
              error={mediaError}
              onToggleCam={onToggleCam}
              onToggleMic={onToggleMic}
            />
          )}
          <CaptureMomentButton
            onClick={onCaptureMoment}
            isCapturing={isCapturingMoment}
            secondsRemaining={captureSecondsRemaining}
            error={captureError}
          />
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex shrink-0 items-center justify-center rounded-full text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function CaptureMomentButton({
  onClick,
  isCapturing,
  secondsRemaining,
  error,
}: {
  onClick?: () => void;
  isCapturing: boolean;
  secondsRemaining: number;
  error: string | null;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick || isCapturing}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CameraIcon className="h-4 w-4 text-red-400" />
        <span>{isCapturing ? `Capturing ${secondsRemaining}s` : "Capture screen (30s)"}</span>
        {!isCapturing && (
          <span className="text-amber-300" aria-hidden>
            ✦
          </span>
        )}
      </button>
      {error && <p className="max-w-52 text-center text-[10px] text-red-300">{error}</p>}
    </div>
  );
}

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
