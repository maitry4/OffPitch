"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { WaveIcon } from "@/components/ui/WaveIcon";
import { getInitials } from "@/lib/initials";

export function DashboardHeader() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const initials = getInitials(
    session?.user?.name,
    session?.username,
    session?.user?.email,
  );

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    void signOut({ callbackUrl: "/" });
  };

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

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2"
          >
            <span className="relative h-9 w-9 overflow-hidden rounded-full border border-red-500/40 bg-gradient-to-br from-red-900/80 to-black shadow-[0_0_12px_rgba(239,68,68,0.3)]">
              <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/90">
                {initials}
              </span>
            </span>
            <ChevronDownIcon />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 min-w-[160px] rounded-xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-xl backdrop-blur-md">
              {(session?.user?.name || session?.user?.email) && (
                <p className="truncate px-3 py-2 text-xs text-white/45">
                  {session.user?.name || session.user?.email}
                </p>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
              >
                Log out
              </button>
            </div>
          )}
        </div>
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
