"use client";

import { WaveIcon } from "@/components/ui/WaveIcon";
import { displayName, getInitials } from "@/lib/initials";
import type { SessionMember } from "@/lib/sessions";
import {
  CopyIcon,
  LeaveIcon,
  LockIcon,
  MenuIcon,
  PeopleIcon,
} from "./icons";

type Props = {
  inviteCode: string;
  peopleCount: number;
  members: SessionMember[];
  onLeave: () => void;
  leaving?: boolean;
};

export function KaraokeHouseHeader({
  inviteCode,
  peopleCount,
  members,
  onLeave,
  leaving = false,
}: Props) {
  const preview = members.slice(0, 3);
  const extra = Math.max(peopleCount - preview.length, 0);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
    } catch {
      // ignore
    }
  };

  return (
    <header className="relative z-20 border-b border-white/5 bg-black/40 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 px-4 py-3 lg:hidden">
        <button type="button" aria-label="Menu" className="text-white/80">
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            <WaveIcon className="h-3.5 w-3.5" />
          </span>
          <span className="text-lg font-bold text-white">
            Off<span className="text-red-500">Pitch</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1.5 text-[11px] text-white/80"
          >
            <PeopleIcon className="h-3.5 w-3.5" />
            People ({peopleCount})
          </button>
          <button
            type="button"
            disabled={leaving}
            onClick={onLeave}
            className="flex items-center gap-1 rounded-full border border-red-500/50 px-2.5 py-1.5 text-[11px] font-medium text-red-400 disabled:opacity-50"
          >
            <LeaveIcon className="h-3.5 w-3.5" />
            {leaving ? "Leaving…" : "Leave"}
          </button>
        </div>
      </div>

      <div className="hidden items-center justify-between gap-4 px-6 py-4 lg:flex xl:px-8">
        <div className="flex min-w-0 items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-500 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.55)]">
              <WaveIcon className="h-4 w-4" />
            </span>
            <span className="text-xl font-bold text-white">
              Off<span className="text-red-500">Pitch</span>
            </span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              Karaoke House
              <LockIcon className="h-3.5 w-3.5 text-white/50" />
            </div>
            <button
              type="button"
              onClick={copyCode}
              className="mt-0.5 flex items-center gap-1.5 text-xs text-white/45 transition hover:text-white/70"
            >
              Room ID: {inviteCode}
              <CopyIcon className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2">
            {preview.map((m) => (
              <span
                key={m.id}
                title={displayName(m.name, m.username, m.email)}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-zinc-800 text-[10px] font-semibold text-white"
              >
                {getInitials(m.name, m.username, m.email)}
              </span>
            ))}
            {extra > 0 && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-zinc-800 text-[10px] font-semibold text-white">
                +{extra}
              </span>
            )}
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white/85 transition hover:bg-white/10"
          >
            <PeopleIcon className="h-4 w-4" />
            People ({peopleCount})
          </button>

          <button
            type="button"
            disabled={leaving}
            onClick={onLeave}
            className="flex items-center gap-2 rounded-full border border-red-500/45 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            <LeaveIcon className="h-4 w-4" />
            {leaving ? "Leaving…" : "Leave Room"}
          </button>
        </div>
      </div>
    </header>
  );
}

export function RoomInfoCard({ inviteCode }: { inviteCode: string }) {
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 lg:hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          Karaoke House
          <LockIcon className="h-3.5 w-3.5 text-white/45" />
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-1.5 text-xs text-white/50"
        >
          Room ID: {inviteCode}
          <CopyIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
