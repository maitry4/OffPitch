"use client";

import { useEffect, useState } from "react";
import { formatDuration, listSongs, selectSessionSong, type SongSummary } from "@/lib/songs";

type SongPickerProps = {
  inviteCode: string;
  isHost: boolean;
  onSelected: () => void;
};

export function SongPicker({ inviteCode, isHost, onSelected }: SongPickerProps) {
  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listSongs();
        if (!cancelled) setSongs(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load songs");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = async (songId: string) => {
    if (!isHost) return;
    setSelectingId(songId);
    setError(null);
    try {
      await selectSessionSong(inviteCode, songId);
      onSelected();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select song");
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-red-500/25 bg-black/60 shadow-[0_0_30px_rgba(239,68,68,0.12)] backdrop-blur-sm lg:min-h-[360px]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.12),transparent_60%)]" />

      <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 text-center sm:mb-5">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">Select a Song</h2>
          <p className="mt-2 text-sm text-white/45">
            {isHost
              ? "Pick a track from the catalog to start singing together."
              : "Waiting for the host to choose a song…"}
          </p>
        </div>

        {loading && (
          <p className="flex-1 text-center text-sm text-white/40">Loading songs…</p>
        )}

        {!loading && error && (
          <p className="mb-3 text-center text-sm text-red-400">{error}</p>
        )}

        {!loading && songs.length === 0 && !error && (
          <p className="flex-1 text-center text-sm text-white/40">
            No songs in the catalog yet. Seed songs / upload to Cloudinary first.
          </p>
        )}

        <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
          {songs.map((song) => (
            <button
              key={song.id}
              type="button"
              disabled={!isHost || selectingId !== null}
              onClick={() => handleSelect(song.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left transition hover:border-red-500/40 hover:bg-red-500/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-gradient-to-br from-red-900/60 to-black text-xs font-semibold text-red-300">
                ♪
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">
                  {song.title}
                </span>
                <span className="block truncate text-xs text-white/45">{song.artist}</span>
              </span>
              <span className="shrink-0 text-xs tabular-nums text-white/35">
                {formatDuration(song.durationSeconds)}
              </span>
              {isHost && (
                <span className="shrink-0 rounded-full border border-red-500/40 px-2.5 py-1 text-[11px] font-medium text-red-400">
                  {selectingId === song.id ? "Starting…" : "Select"}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
