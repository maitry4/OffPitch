"use client";

import { useSession } from "next-auth/react";
import { WaveIcon } from "@/components/ui/WaveIcon";
import { getInitials } from "@/lib/initials";

export function DashboardHeader() {
  const { data: session } = useSession();
  const initials = getInitials(
    session?.user?.name,
    session?.username,
    session?.user?.email,
  );

  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10 sm:py-6">
      <div className="flex items-center gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-red-500 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]">
          <WaveIcon className="h-5 w-5" />
        </span>
        <span className="text-xl font-bold text-white sm:text-2xl">
          Off<span className="text-red-500">Pitch</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="text-white/80 transition hover:text-white"
        >
          <BellIcon />
        </button>

        <button
          type="button"
          aria-label="Account menu"
          className="flex items-center gap-2"
        >
          <span className="relative h-9 w-9 overflow-hidden rounded-full border border-red-500/40 bg-gradient-to-br from-red-900/80 to-black shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/90">
              {initials}
            </span>
          </span>
          <ChevronDownIcon />
        </button>
      </div>
    </header>
  );
}

function BellIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
