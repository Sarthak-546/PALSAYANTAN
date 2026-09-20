import React, { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface CameraViewportProps {
  videoRef?: RefObject<HTMLVideoElement | null>;
  onError?: (message: string) => void;
  className?: string;
  facingMode?: 'environment' | 'user';
}

export const CameraViewport = ({ videoRef, onError, className = '', facingMode = 'environment' }: CameraViewportProps) => {
  const localRef = useRef<HTMLVideoElement | null>(null);
  const ref = videoRef ?? localRef;

  // Keep the latest onError without restarting the camera when the parent re-renders.
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const video = ref.current;
    let stream: MediaStream | null = null;
    let cancelled = false;
    const fail = (msg: string) => {
      if (!cancelled) onErrorRef.current?.(msg);
    };

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        fail(
          window.isSecureContext
            ? 'Camera not supported on this device'
            : 'Camera needs HTTPS (or localhost) to work',
        );
        return;
      }
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        // Unmounted (or React StrictMode re-mounted) while the permission prompt was open:
        // release this stream or the camera stays "in use" and the next attempt fails.
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (video) {
          video.srcObject = s;
          await video.play().catch(() => {});
        }
      } catch (err) {
        const name = (err as DOMException)?.name;
        if (name === 'NotAllowedError') fail('Camera permission denied');
        else if (name === 'NotFoundError') fail('No camera found');
        else if (name === 'NotReadableError') fail('Camera is already in use');
        else fail('Unable to access camera');
      }
    }

    start();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (video) video.srcObject = null;
    };
  }, [ref, facingMode]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      className={`object-cover w-full h-full ${facingMode === 'user' ? '-scale-x-100' : ''} ${className}`}
    />
  );
};
