"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CAPTURE_DURATION_MS = 30_000;

export type MomentCaptureState = {
  isCapturing: boolean;
  secondsRemaining: number;
  error: string | null;
  startCapture: (
    displayStream: MediaStream,
    localStream: MediaStream | null,
    remoteStreams: MediaStream[],
  ) => void;
  setError: (error: string | null) => void;
};

function supportedMimeType() {
  if (typeof MediaRecorder === "undefined") return undefined;

  return [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ].find((type) => MediaRecorder.isTypeSupported(type));
}

export function useMomentCapture(): MomentCaptureState {
  const [isCapturing, setIsCapturing] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (countdownRef.current !== null) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const startCapture = useCallback((
    displayStream: MediaStream,
    localStream: MediaStream | null,
    remoteStreams: MediaStream[],
  ) => {
    if (recorderRef.current?.state === "recording") return;
    if (!window.MediaRecorder || !displayStream.getVideoTracks().length) {
      setError("Screen recording is not supported in this browser.");
      return;
    }

    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    const screenHasAudio = displayStream.getAudioTracks().length > 0;
    const audioSources = [
      displayStream,
      localStream,
      ...(screenHasAudio ? [] : remoteStreams),
    ].filter((stream): stream is MediaStream => Boolean(stream?.getAudioTracks().length));

    for (const sourceStream of audioSources) {
      audioContext.createMediaStreamSource(sourceStream).connect(destination);
    }

    const recordingStream = new MediaStream([
      ...displayStream.getVideoTracks(),
      ...destination.stream.getAudioTracks(),
    ]);
    const chunks: BlobPart[] = [];
    const mimeType = supportedMimeType();
    const recorder = new MediaRecorder(
      recordingStream,
      mimeType ? { mimeType, videoBitsPerSecond: 2_500_000 } : undefined,
    );
    recorderRef.current = recorder;
    setError(null);
    setIsCapturing(true);
    setSecondsRemaining(CAPTURE_DURATION_MS / 1000);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onerror = () => {
      setError("Could not record this moment.");
    };
    recorder.onstop = () => {
      clearTimers();
      displayStream.getTracks().forEach((track) => track.stop());
      void audioContext.close();
      recorderRef.current = null;
      setIsCapturing(false);
      setSecondsRemaining(0);
      if (!chunks.length) return;

      const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      const download = document.createElement("a");
      download.href = url;
      download.download = `offpitch-moment-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
      document.body.appendChild(download);
      download.click();
      download.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    };

    recorder.start(1_000);
    displayStream.getVideoTracks()[0].onended = () => {
      if (recorder.state === "recording") recorder.stop();
    };
    const startedAt = Date.now();
    countdownRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setSecondsRemaining(Math.max(0, Math.ceil((CAPTURE_DURATION_MS - elapsed) / 1000)));
    }, 250);
    stopTimerRef.current = window.setTimeout(() => recorder.stop(), CAPTURE_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
    };
  }, []);

  return { isCapturing, secondsRemaining, error, startCapture, setError };
}
