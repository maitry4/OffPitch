"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type LocalMediaState = {
  stream: MediaStream | null;
  camOn: boolean;
  micOn: boolean;
  error: string | null;
  toggleCam: () => Promise<void>;
  toggleMic: () => Promise<void>;
  enableForCapture: () => Promise<MediaStream>;
};

export function useLocalMedia(): LocalMediaState {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const ensureStream = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      media.getVideoTracks().forEach((t) => {
        t.enabled = false;
      });
      media.getAudioTracks().forEach((t) => {
        t.enabled = false;
      });
      streamRef.current = media;
      setStream(media);
      setError(null);
      return media;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Camera/microphone permission denied";
      setError(message);
      throw err;
    }
  }, []);

  const toggleCam = useCallback(async () => {
    try {
      const media = await ensureStream();
      const next = !camOn;
      media.getVideoTracks().forEach((t) => {
        t.enabled = next;
      });
      setCamOn(next);
      setError(null);
    } catch {
      // error already set
    }
  }, [camOn, ensureStream]);

  const toggleMic = useCallback(async () => {
    try {
      const media = await ensureStream();
      const next = !micOn;
      media.getAudioTracks().forEach((t) => {
        t.enabled = next;
      });
      setMicOn(next);
      setError(null);
    } catch {
      // error already set
    }
  }, [micOn, ensureStream]);

  const enableForCapture = useCallback(async () => {
    const media = await ensureStream();
    media.getVideoTracks().forEach((track) => {
      track.enabled = true;
    });
    media.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    setCamOn(true);
    setMicOn(true);
    setError(null);
    return media;
  }, [ensureStream]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  return { stream, camOn, micOn, error, toggleCam, toggleMic, enableForCapture };
}
