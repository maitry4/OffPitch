"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSession } from "next-auth/react";
import type { PlaybackAction } from "@/lib/songs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

export type PeerMediaState = {
  camOn: boolean;
  micOn: boolean;
};

export type PlaybackControlEvent = {
  action: PlaybackAction;
  positionMs: number;
  from: string;
};

export type RoomRtcState = {
  remoteStreams: Map<string, MediaStream>;
  peerMedia: Map<string, PeerMediaState>;
  connected: boolean;
  sendPlaybackControl: (action: PlaybackAction, positionMs: number) => void;
};

type SignalInbound =
  | { type: "welcome"; userId: string; peers: { userId: string; camOn: boolean; micOn: boolean }[] }
  | { type: "peer-joined"; userId: string; camOn: boolean; micOn: boolean }
  | { type: "peer-left"; userId: string }
  | { type: "offer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string; candidate: RTCIceCandidateInit | null }
  | { type: "media-state"; userId: string; camOn: boolean; micOn: boolean }
  | { type: "playback-control"; from: string; action: PlaybackAction; positionMs: number };

export function useRoomRtc(
  inviteCode: string | null,
  localStream: MediaStream | null,
  camOn: boolean,
  micOn: boolean,
  onPlaybackControl?: (event: PlaybackControlEvent) => void,
  onPeerMembershipChange?: () => void,
): RoomRtcState {
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [peerMedia, setPeerMedia] = useState<Map<string, PeerMediaState>>(new Map());
  const [connected, setConnected] = useState(false);

  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(localStream);
  const mediaStateRef = useRef({ camOn, micOn });
  const selfIdRef = useRef<string | null>(null);
  const onPlaybackRef = useRef(onPlaybackControl);
  const onPeerMembershipRef = useRef(onPeerMembershipChange);

  localStreamRef.current = localStream;
  mediaStateRef.current = { camOn, micOn };
  onPlaybackRef.current = onPlaybackControl;
  onPeerMembershipRef.current = onPeerMembershipChange;

  const upsertRemote = (userId: string, stream: MediaStream) => {
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.set(userId, stream);
      return next;
    });
  };

  const removeRemote = (userId: string) => {
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
    setPeerMedia((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  };

  const send = (payload: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  };

  const sendPlaybackControl = useCallback((action: PlaybackAction, positionMs: number) => {
    send({
      type: "playback-control",
      action,
      positionMs: Math.max(0, Math.round(positionMs)),
    });
  }, []);

  const attachLocalTracks = (pc: RTCPeerConnection) => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const senders = pc.getSenders();
    for (const track of stream.getTracks()) {
      const existing = senders.find((s) => s.track?.kind === track.kind);
      if (existing) {
        void existing.replaceTrack(track);
      } else {
        pc.addTrack(track, stream);
      }
    }
  };

  const ensurePc = (peerId: string): RTCPeerConnection => {
    const existing = pcsRef.current.get(peerId);
    if (existing) return existing;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcsRef.current.set(peerId, pc);
    attachLocalTracks(pc);

    pc.onicecandidate = (event) => {
      send({
        type: "ice",
        to: peerId,
        candidate: event.candidate ? event.candidate.toJSON() : null,
      });
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      upsertRemote(peerId, stream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        pc.close();
        pcsRef.current.delete(peerId);
        removeRemote(peerId);
      }
    };

    return pc;
  };

  const createOfferTo = async (peerId: string) => {
    const pc = ensurePc(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    send({ type: "offer", to: peerId, sdp: offer });
  };

  useEffect(() => {
    if (!inviteCode) return;

    let cancelled = false;
    let ws: WebSocket | null = null;

    const connect = async () => {
      const session = await getSession();
      if (cancelled || !session?.idToken) return;

      const proto = API_BASE_URL.startsWith("https") ? "wss" : "ws";
      const host = API_BASE_URL.replace(/^https?:\/\//, "");
      const url =
        `${proto}://${host}/ws/signal` +
        `?token=${encodeURIComponent(session.idToken)}` +
        `&inviteCode=${encodeURIComponent(inviteCode)}`;

      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!cancelled) {
          setConnected(true);
          const { camOn: c, micOn: m } = mediaStateRef.current;
          ws?.send(JSON.stringify({ type: "media-state", camOn: c, micOn: m }));
        }
      };

      ws.onclose = () => {
        if (!cancelled) setConnected(false);
      };

      ws.onerror = () => {
        if (!cancelled) setConnected(false);
      };

      ws.onmessage = (event) => {
        void (async () => {
          let msg: SignalInbound;
          try {
            msg = JSON.parse(String(event.data)) as SignalInbound;
          } catch {
            return;
          }

          switch (msg.type) {
            case "welcome": {
              selfIdRef.current = msg.userId;
              const media = new Map<string, PeerMediaState>();
              for (const peer of msg.peers) {
                media.set(peer.userId, { camOn: peer.camOn, micOn: peer.micOn });
                await createOfferTo(peer.userId);
              }
              setPeerMedia(media);
              break;
            }
            case "peer-joined": {
              setPeerMedia((prev) => {
                const next = new Map(prev);
                next.set(msg.userId, { camOn: msg.camOn, micOn: msg.micOn });
                return next;
              });
              onPeerMembershipRef.current?.();
              break;
            }
            case "peer-left": {
              const pc = pcsRef.current.get(msg.userId);
              pc?.close();
              pcsRef.current.delete(msg.userId);
              removeRemote(msg.userId);
              onPeerMembershipRef.current?.();
              break;
            }
            case "offer": {
              const pc = ensurePc(msg.from);
              await pc.setRemoteDescription(msg.sdp);
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              send({ type: "answer", to: msg.from, sdp: answer });
              break;
            }
            case "answer": {
              const pc = pcsRef.current.get(msg.from);
              if (pc) {
                await pc.setRemoteDescription(msg.sdp);
              }
              break;
            }
            case "ice": {
              const pc = pcsRef.current.get(msg.from);
              if (pc && msg.candidate) {
                try {
                  await pc.addIceCandidate(msg.candidate);
                } catch {
                  // ignore
                }
              }
              break;
            }
            case "media-state": {
              setPeerMedia((prev) => {
                const next = new Map(prev);
                next.set(msg.userId, { camOn: msg.camOn, micOn: msg.micOn });
                return next;
              });
              break;
            }
            case "playback-control": {
              if (msg.from === selfIdRef.current) break;
              onPlaybackRef.current?.({
                action: msg.action,
                positionMs: msg.positionMs ?? 0,
                from: msg.from,
              });
              break;
            }
          }
        })();
      };
    };

    void connect();

    return () => {
      cancelled = true;
      ws?.close();
      wsRef.current = null;
      for (const pc of pcsRef.current.values()) {
        pc.close();
      }
      pcsRef.current.clear();
      setRemoteStreams(new Map());
      setPeerMedia(new Map());
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteCode]);

  useEffect(() => {
    if (!localStream) return;
    void (async () => {
      for (const [peerId, pc] of pcsRef.current.entries()) {
        attachLocalTracks(pc);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send({ type: "offer", to: peerId, sdp: offer });
        } catch {
          // ignore
        }
      }
    })();
  }, [localStream]);

  useEffect(() => {
    send({ type: "media-state", camOn, micOn });
  }, [camOn, micOn]);

  return { remoteStreams, peerMedia, connected, sendPlaybackControl };
}
