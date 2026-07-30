"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { displayName, getInitials } from "@/lib/initials";
import {
  getSessionRoom,
  type KaraokeSessionResponse,
} from "@/lib/sessions";
import { KaraokeHouseHeader, RoomInfoCard } from "./KaraokeHouseHeader";
import { LyricsPanel } from "./LyricsPanel";
import { MemberTile } from "./MemberTile";
import { ParticipantGrid } from "./ParticipantGrid";
import { PlayerBar } from "./PlayerBar";
import { SongPicker } from "./SongPicker";

export function KaraokeHouseView({ inviteCode }: { inviteCode: string }) {
  const [room, setRoom] = useState<KaraokeSessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMs, setCurrentMs] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getSessionRoom(inviteCode);
      setRoom(data);
      setError(null);

      if (data.playback?.startedAt) {
        const serverNow = Date.parse(data.playback.serverNow);
        const startedAt = Date.parse(data.playback.startedAt);
        const skew = Number.isFinite(serverNow) ? serverNow - Date.now() : 0;
        startedAtRef.current = startedAt - skew;
      } else {
        startedAtRef.current = null;
        setCurrentMs(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [inviteCode]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      void load();
    }, 4000);
    return () => window.clearInterval(id);
  }, [load]);

  // Sync playback clock + Cloudinary audio element
  useEffect(() => {
    const audio = audioRef.current;
    const playback = room?.playback;

    if (!playback || !startedAtRef.current) {
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
      }
      return;
    }

    const tick = () => {
      if (!startedAtRef.current) return;
      const elapsed = Math.max(0, Date.now() - startedAtRef.current);
      setCurrentMs(elapsed);

      if (audio && playback.audioUrl) {
        if (audio.src !== playback.audioUrl) {
          audio.src = playback.audioUrl;
        }
        const targetSec = elapsed / 1000;
        if (Math.abs((audio.currentTime || 0) - targetSec) > 0.75) {
          try {
            audio.currentTime = targetSec;
          } catch {
            // ignore seek errors while buffering
          }
        }
        if (audio.paused) {
          void audio.play().catch(() => {
            // autoplay may be blocked until user gesture — host select counts as gesture
          });
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [room?.playback]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white/60">
        Loading room…
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#050505] px-6 text-center">
        <p className="text-white/70">{error ?? "Session not found"}</p>
        <Link
          href="/dashboard"
          className="rounded-full border border-red-500/50 px-5 py-2 text-sm text-red-400"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const active =
    room.members.find((m) => m.isYou) ??
    room.members.find((m) => m.isHost) ??
    room.members[0];

  const hasSong = Boolean(room.playback);

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] font-sans text-white">
      <KaraokeHouseHeader
        inviteCode={room.inviteCode}
        peopleCount={room.peopleCount}
        members={room.members}
      />

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:gap-5 xl:px-8">
        <RoomInfoCard inviteCode={room.inviteCode} />

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-5">
          {hasSong ? (
            <LyricsPanel
              lyrics={room.playback?.timeline?.lyrics ?? []}
              currentMs={currentMs}
            />
          ) : (
            <SongPicker
              inviteCode={room.inviteCode}
              isHost={room.isHost}
              onSelected={() => void load()}
            />
          )}

          <div className="hidden lg:block">
            {active ? (
              <MemberTile
                name={active.isYou ? "You" : displayName(active.name, active.username, active.email)}
                initials={getInitials(active.name, active.username, active.email)}
                size="lg"
                showCrown={hasSong}
                isActive={hasSong}
                className="h-full min-h-[280px]"
              />
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-white/10 text-white/40">
                No singers yet
              </div>
            )}
          </div>
        </section>

        <ParticipantGrid members={room.members} />
      </main>

      <PlayerBar playback={room.playback} currentMs={currentMs} audioRef={audioRef} />
    </div>
  );
}
