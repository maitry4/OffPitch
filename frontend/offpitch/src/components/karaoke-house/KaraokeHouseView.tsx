"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocalMedia } from "@/hooks/useLocalMedia";
import { useMomentCapture } from "@/hooks/useMomentCapture";
import {
  useRoomRtc,
  type PlaybackControlEvent,
} from "@/hooks/useRoomRtc";
import { displayName, getInitials } from "@/lib/initials";
import {
  getSessionRoom,
  leaveSession,
  type KaraokeSessionResponse,
} from "@/lib/sessions";
import {
  updateSessionPlayback,
  type PlaybackAction,
  type SongPlayback,
} from "@/lib/songs";
import { KaraokeHouseHeader, RoomInfoCard } from "./KaraokeHouseHeader";
import { LyricsPanel } from "./LyricsPanel";
import { MemberTile } from "./MemberTile";
import { ParticipantGrid } from "./ParticipantGrid";
import { PlayerBar } from "./PlayerBar";
import { SongPicker } from "./SongPicker";

export function KaraokeHouseView({ inviteCode }: { inviteCode: string }) {
  const router = useRouter();
  const [room, setRoom] = useState<KaraokeSessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeSongIdRef = useRef<string | null>(null);
  const applyingRemoteRef = useRef(false);
  const playbackHandlerRef = useRef<(event: PlaybackControlEvent) => void>(() => {});
  const leftRef = useRef(false);

  const load = useCallback(async () => {
    if (leftRef.current) return;
    try {
      const data = await getSessionRoom(inviteCode);
      setRoom(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [inviteCode]);

  const localMedia = useLocalMedia();
  const momentCapture = useMomentCapture();
  const rtc = useRoomRtc(
    room ? inviteCode : null,
    localMedia.stream,
    localMedia.camOn,
    localMedia.micOn,
    (event) => playbackHandlerRef.current(event),
    () => void load(),
  );

  const handleLeave = useCallback(async () => {
    if (leaving || leftRef.current) return;
    setLeaving(true);
    leftRef.current = true;
    try {
      await leaveSession(inviteCode);
    } catch {
      // Still navigate away; WebSocket close also removes membership as a fallback.
    }
    router.push("/dashboard");
  }, [inviteCode, leaving, router]);

  const handleCaptureMoment = useCallback(async () => {
    try {
      const [localStream, displayStream] = await Promise.all([
        localMedia.enableForCapture(),
        navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        }),
      ]);
      momentCapture.startCapture(
        displayStream,
        localStream,
        [...rtc.remoteStreams.values()],
      );
    } catch {
      momentCapture.setError(
        "Screen capture was cancelled. Select the OffPitch tab and enable Share tab audio.",
      );
    }
  }, [localMedia, momentCapture, rtc.remoteStreams]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      void load();
    }, 4000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let raf = 0;
    const syncFromAudio = () => {
      setCurrentMs(audio.currentTime * 1000);
    };
    const tick = () => {
      syncFromAudio();
      raf = window.requestAnimationFrame(tick);
    };

    const onPlay = () => {
      setIsPlaying(true);
      cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(tick);
    };
    const onPause = () => {
      setIsPlaying(false);
      cancelAnimationFrame(raf);
      syncFromAudio();
    };
    const onSeeked = () => syncFromAudio();
    const onEnded = () => {
      setIsPlaying(false);
      cancelAnimationFrame(raf);
      syncFromAudio();
    };
    const onError = () => {
      console.error("Audio element error:", audio.error?.message ?? audio.error?.code, audio.src);
      setIsPlaying(false);
      cancelAnimationFrame(raf);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("seeked", onSeeked);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    if (!audio.paused) {
      raf = window.requestAnimationFrame(tick);
    } else {
      syncFromAudio();
    }

    return () => {
      cancelAnimationFrame(raf);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("seeked", onSeeked);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const ensureSrc = useCallback((playback: SongPlayback) => {
    const audio = audioRef.current;
    if (!audio || !playback.audioUrl) return false;

    const absolute = new URL(playback.audioUrl, window.location.href).href;
    if (audio.src !== absolute) {
      audio.src = playback.audioUrl;
      audio.load();
    }
    return true;
  }, []);

  const playAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    const waitUntilCanPlay = () =>
      new Promise<void>((resolve) => {
        if (audio.readyState >= 2) {
          resolve();
          return;
        }
        const done = () => {
          audio.removeEventListener("canplay", done);
          resolve();
        };
        audio.addEventListener("canplay", done, { once: true });
      });

    try {
      await waitUntilCanPlay();
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Audio play failed:", err);
      setIsPlaying(false);
    }
  }, []);

  const seekAudio = useCallback((ms: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = Math.max(0, ms) / 1000;
    } catch {
      // ignore
    }
    setCurrentMs(Math.max(0, ms));
  }, []);

  const applyPlaybackAction = useCallback(
    async (action: PlaybackAction, positionMs: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      applyingRemoteRef.current = true;
      try {
        switch (action) {
          case "pause":
            seekAudio(positionMs);
            audio.pause();
            setIsPlaying(false);
            break;
          case "play":
            seekAudio(positionMs);
            await playAudio();
            break;
          case "seek":
            seekAudio(positionMs);
            break;
          case "replay":
            seekAudio(0);
            await playAudio();
            break;
        }
      } finally {
        window.setTimeout(() => {
          applyingRemoteRef.current = false;
        }, 50);
      }
    },
    [playAudio, seekAudio],
  );

  const broadcastPlayback = useCallback(
    (action: PlaybackAction, positionMs: number) => {
      rtc.sendPlaybackControl(action, positionMs);
      void updateSessionPlayback(inviteCode, action, positionMs).catch((err) => {
        console.error("Failed to sync playback:", err);
      });
    },
    [inviteCode, rtc],
  );

  useEffect(() => {
    playbackHandlerRef.current = (event) => {
      void applyPlaybackAction(event.action, event.positionMs);
    };
  }, [applyPlaybackAction]);

  useEffect(() => {
    const audio = audioRef.current;
    const playback = room?.playback;
    if (!audio) return;

    if (!playback?.audioUrl) {
      if (activeSongIdRef.current) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        activeSongIdRef.current = null;
        setCurrentMs(0);
        setIsPlaying(false);
      }
      return;
    }

    if (activeSongIdRef.current === playback.id) {
      if (!applyingRemoteRef.current && playback.isPaused && !audio.paused) {
        void applyPlaybackAction("pause", playback.positionMs ?? audio.currentTime * 1000);
      }
      return;
    }

    activeSongIdRef.current = playback.id;
    ensureSrc(playback);

    const serverNow = Date.parse(playback.serverNow);
    const startedAt = Date.parse(playback.startedAt);
    const skew = Number.isFinite(serverNow) ? serverNow - Date.now() : 0;
    const elapsedSec = playback.isPaused
      ? (playback.positionMs ?? 0) / 1000
      : Math.max(0, (Date.now() + skew - startedAt) / 1000);
    const maxSec =
      playback.durationSeconds > 0 ? Math.max(0, playback.durationSeconds - 0.25) : elapsedSec;
    const seekTo = Math.max(0, Math.min(elapsedSec, maxSec));
    const shouldPlay = !playback.isPaused;

    let started = false;
    const start = () => {
      if (started) return;
      started = true;

      let done = false;
      const afterSeek = () => {
        if (done) return;
        done = true;
        setCurrentMs(audio.currentTime * 1000);
        if (shouldPlay) {
          void playAudio();
        } else {
          audio.pause();
          setIsPlaying(false);
        }
      };

      try {
        if (Math.abs(audio.currentTime - seekTo) > 0.15) {
          let fallback = 0;
          const onSeeked = () => {
            audio.removeEventListener("seeked", onSeeked);
            window.clearTimeout(fallback);
            afterSeek();
          };
          audio.addEventListener("seeked", onSeeked);
          fallback = window.setTimeout(() => {
            audio.removeEventListener("seeked", onSeeked);
            afterSeek();
          }, 400);
          audio.currentTime = seekTo;
          return;
        }
      } catch {
        // ignore
      }
      afterSeek();
    };

    if (audio.readyState >= 1) {
      start();
      return;
    }

    audio.addEventListener("loadedmetadata", start, { once: true });
    audio.addEventListener("canplay", start, { once: true });
  }, [room?.playback, ensureSrc, playAudio, applyPlaybackAction]);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    const playback = room?.playback;
    if (!audio || !playback) return;

    if (audio.paused) {
      ensureSrc(playback);
      const pos = audio.currentTime * 1000;
      void playAudio();
      broadcastPlayback("play", pos);
    } else {
      const pos = audio.currentTime * 1000;
      audio.pause();
      setIsPlaying(false);
      broadcastPlayback("pause", pos);
    }
  };

  const handleSeek = (ms: number) => {
    const audio = audioRef.current;
    const playback = room?.playback;
    if (!audio || !playback) return;

    ensureSrc(playback);
    const durationMs = (playback.durationSeconds || 0) * 1000;
    const clamped = Math.max(0, Math.min(ms, durationMs || ms));
    seekAudio(clamped);
    broadcastPlayback("seek", clamped);
  };

  const handleReplay = () => {
    const audio = audioRef.current;
    const playback = room?.playback;
    if (!audio || !playback) return;

    ensureSrc(playback);
    seekAudio(0);
    void playAudio();
    broadcastPlayback("replay", 0);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] font-sans text-white">
      <audio ref={audioRef} preload="auto" className="hidden" />

      {loading && (
        <div className="flex flex-1 items-center justify-center text-white/60">
          Loading room…
        </div>
      )}

      {!loading && (error || !room) && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-white/70">{error ?? "Session not found"}</p>
          <Link
            href="/dashboard"
            className="rounded-full border border-red-500/50 px-5 py-2 text-sm text-red-400"
          >
            Back to dashboard
          </Link>
        </div>
      )}

      {!loading && room && (
        <>
          <KaraokeHouseHeader
            inviteCode={room.inviteCode}
            peopleCount={room.peopleCount}
            members={room.members}
            onLeave={() => void handleLeave()}
            leaving={leaving}
          />

          <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:gap-5 xl:px-8">
            <RoomInfoCard inviteCode={room.inviteCode} />

            <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-5">
              {room.playback ? (
                <LyricsPanel
                  lyrics={room.playback.timeline?.lyrics ?? []}
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
                {(() => {
                  const active =
                    room.members.find((m) => m.isYou) ??
                    room.members.find((m) => m.isHost) ??
                    room.members[0];
                  const hasSong = Boolean(room.playback);

                  if (!active) {
                    return (
                      <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-white/10 text-white/40">
                        No singers yet
                      </div>
                    );
                  }

                  const remote = rtc.peerMedia.get(active.id);
                  const stream = active.isYou
                    ? localMedia.stream
                    : rtc.remoteStreams.get(active.id) ?? null;
                  const camOn = active.isYou
                    ? localMedia.camOn
                    : Boolean(remote?.camOn && stream);
                  const micOn = active.isYou
                    ? localMedia.micOn
                    : remote?.micOn ?? true;

                  return (
                    <MemberTile
                      name={
                        active.isYou
                          ? "You"
                          : displayName(active.name, active.username, active.email)
                      }
                      initials={getInitials(active.name, active.username, active.email)}
                      size="lg"
                      showCrown={hasSong}
                      isActive={hasSong}
                      className="h-full min-h-[280px]"
                      stream={stream}
                      camOn={camOn}
                      micOn={micOn}
                      muted={active.isYou}
                    />
                  );
                })()}
              </div>
            </section>

            <ParticipantGrid
              members={room.members}
              localStream={localMedia.stream}
              localCamOn={localMedia.camOn}
              localMicOn={localMedia.micOn}
              remoteStreams={rtc.remoteStreams}
              peerMedia={rtc.peerMedia}
            />
          </main>

          <PlayerBar
            playback={room.playback}
            currentMs={currentMs}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            onReplay={handleReplay}
            camOn={localMedia.camOn}
            micOn={localMedia.micOn}
            mediaError={localMedia.error}
            onToggleCam={() => void localMedia.toggleCam()}
            onToggleMic={() => void localMedia.toggleMic()}
            onCaptureMoment={() => void handleCaptureMoment()}
            isCapturingMoment={momentCapture.isCapturing}
            captureSecondsRemaining={momentCapture.secondsRemaining}
            captureError={momentCapture.error}
          />
        </>
      )}
    </div>
  );
}
