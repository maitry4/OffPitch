"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession, joinSession } from "@/lib/sessions";

type SessionCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function SessionCard({ icon, title, description, children }: SessionCardProps) {
  return (
    <div className="rounded-3xl border border-red-500/25 bg-black/70 p-6 shadow-[0_0_30px_rgba(239,68,68,0.12)] backdrop-blur-sm sm:p-8">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/40 bg-black/50 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
        {icon}
      </div>

      <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/45">{description}</p>

      <div className="mt-6">{children}</div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function CreateSessionCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await createSession();
      router.push(`/karaoke-house/${session.inviteCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SessionCard
      icon={<PlusIcon />}
      title="Create a Session"
      description="Start your own karaoke room and invite friends."
    >
      <button
        type="button"
        onClick={handleCreate}
        disabled={loading}
        className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(239,68,68,0.45)] transition hover:shadow-[0_0_32px_rgba(239,68,68,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex-1 text-center">
          {loading ? "Creating..." : "Create Session"}
        </span>
        <ArrowIcon />
      </button>
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </SessionCard>
  );
}

export function JoinSessionCard() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError("Enter a session ID");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const session = await joinSession(inviteCode);
      router.push(`/karaoke-house/${session.inviteCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SessionCard
      icon={<UsersIcon />}
      title="Join a Session"
      description="Enter a session ID from your friend and join the fun."
    >
      <form className="flex gap-3" onSubmit={handleJoin}>
        <input
          type="text"
          name="sessionId"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          placeholder="Enter Session ID"
          className="min-w-0 flex-1 rounded-xl border border-red-500/30 bg-black/80 px-4 py-3 text-sm uppercase tracking-wider text-white placeholder:normal-case placeholder:tracking-normal placeholder:text-white/30 outline-none transition focus:border-red-500/50 focus:shadow-[0_0_12px_rgba(239,68,68,0.15)]"
        />
        <button
          type="submit"
          aria-label="Join session"
          disabled={loading}
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-red-500/50 bg-black/60 text-white shadow-[0_0_15px_rgba(239,68,68,0.25)] transition hover:border-red-500/70 hover:shadow-[0_0_20px_rgba(239,68,68,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowIcon />
        </button>
      </form>
      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
    </SessionCard>
  );
}
