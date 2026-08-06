import { getSession } from "next-auth/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type LyricLine = {
  line: number;
  startMs: number;
  endMs: number;
  text: string;
};

export type SongSummary = {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  durationSeconds: number;
  audioUrl: string;
};

export type SongPlayback = SongSummary & {
  startedAt: string;
  serverNow: string;
  isPaused?: boolean;
  positionMs?: number;
  timeline: {
    lyrics: LyricLine[];
    effects: unknown[];
  };
};

export type PlaybackAction = "pause" | "play" | "seek" | "replay";

async function authHeaders(): Promise<HeadersInit> {
  const session = await getSession();
  if (!session?.idToken) {
    throw new Error("You must sign in first.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.idToken}`,
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }
  if (!res.ok) {
    const obj = typeof data === "object" && data ? (data as Record<string, unknown>) : null;
    const message =
      (obj && (obj.error || obj.detail || obj.title || obj.message)) ||
      `Request failed (${res.status})`;
    throw new Error(String(message));
  }
  return data as T;
}

export async function listSongs(): Promise<SongSummary[]> {
  const res = await fetch(`${API_BASE_URL}/api/songs`, {
    headers: await authHeaders(),
  });
  return parseJson<SongSummary[]>(res);
}

export async function selectSessionSong(
  inviteCode: string,
  songId: string,
): Promise<unknown> {
  const res = await fetch(
    `${API_BASE_URL}/api/sessions/${encodeURIComponent(inviteCode)}/songs/${songId}`,
    {
      method: "POST",
      headers: await authHeaders(),
    },
  );
  return parseJson(res);
}

export async function updateSessionPlayback(
  inviteCode: string,
  action: PlaybackAction,
  positionMs: number,
): Promise<unknown> {
  const res = await fetch(
    `${API_BASE_URL}/api/sessions/${encodeURIComponent(inviteCode)}/playback`,
    {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ action, positionMs }),
    },
  );
  return parseJson(res);
}

export function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
