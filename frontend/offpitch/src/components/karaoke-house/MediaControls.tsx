"use client";

import { CameraIcon, CameraOffIcon, MicIcon, MicOffIcon } from "./icons";

type MediaControlsProps = {
  camOn: boolean;
  micOn: boolean;
  error?: string | null;
  onToggleCam: () => void;
  onToggleMic: () => void;
};

export function MediaControls({
  camOn,
  micOn,
  error,
  onToggleCam,
  onToggleMic,
}: MediaControlsProps) {
  return (
    <div className="flex flex-col items-center gap-1 lg:items-end">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={camOn ? "Turn camera off" : "Turn camera on"}
          onClick={onToggleCam}
          className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
            camOn
              ? "border-red-500/50 bg-red-600 text-white hover:bg-red-500"
              : "border-white/15 bg-white/5 text-white hover:bg-white/10"
          }`}
        >
          {camOn ? <CameraIcon className="h-4 w-4" /> : <CameraOffIcon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          onClick={onToggleMic}
          className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
            micOn
              ? "border-emerald-500/40 bg-emerald-600/80 text-white hover:bg-emerald-500"
              : "border-white/15 bg-white/5 text-white hover:bg-white/10"
          }`}
        >
          {micOn ? <MicIcon className="h-4 w-4" /> : <MicOffIcon className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="max-w-[200px] text-center text-[10px] text-red-400 lg:text-right">{error}</p>}
    </div>
  );
}
