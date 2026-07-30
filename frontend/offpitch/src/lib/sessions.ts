import { getSession } from "next-auth/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

import type { SongPlayback } from "./songs";

export type SessionMember = {
  id: string;
  name: string;
  username: string;
  email: string;
  isHost: boolean;
  isYou: boolean;
  joinedAt: string;
};

export type KaraokeSessionResponse = {
  id: string;
  inviteCode: string;
  expiresAt: string;
  createdAt: string;
  peopleCount: number;
  members: SessionMember[];
  isHost: boolean;
  playback: SongPlayback | null;
};

async function authHeaders(): Promise<HeadersInit> {
  const session = await getSession();
  if (!session?.idToken) {
    throw new Error("You must sign in before creating or joining a session.");
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

export async function createSession(): Promise<KaraokeSessionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: "POST",
    headers: await authHeaders(),
  });
  return parseJson<KaraokeSessionResponse>(res);
}

export async function joinSession(inviteCode: string): Promise<KaraokeSessionResponse> {
  const code = inviteCode.trim().toUpperCase();
  const res = await fetch(`${API_BASE_URL}/api/sessions/${encodeURIComponent(code)}/join`, {
    method: "POST",
    headers: await authHeaders(),
  });
  return parseJson<KaraokeSessionResponse>(res);
}

export async function getSessionRoom(inviteCode: string): Promise<KaraokeSessionResponse> {
  const code = inviteCode.trim().toUpperCase();
  const res = await fetch(`${API_BASE_URL}/api/sessions/${encodeURIComponent(code)}`, {
    method: "GET",
    headers: await authHeaders(),
  });
  return parseJson<KaraokeSessionResponse>(res);
}
