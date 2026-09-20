import React, { useEffect, useRef } from 'react';

const Pose = (window as any).Pose;

const POSE_LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
};

interface PoseDetectionCameraProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onPoseDetected: (poseData: {
    sternum: { x: number; y: number } | null;
    leftWrist: { x: number; y: number } | null;
    rightWrist: { x: number; y: number } | null;
    leftElbow: { x: number; y: number } | null;
    rightElbow: { x: number; y: number } | null;
    leftShoulder: { x: number; y: number } | null;
    rightShoulder: { x: number; y: number } | null;
  } | null) => void;
  onError: (error: string) => void;
  className?: string;
  facingMode?: 'environment' | 'user';
}

export const PoseDetectionCamera = ({
  videoRef,
  onPoseDetected,
  onError,
  className = '',
  facingMode = 'environment'
}: PoseDetectionCameraProps) => {
  const poseRef = useRef<any>(null);

  // 1. Robust manual camera initialization
  useEffect(() => {
    let cancelled = false;
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode }
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        if (cancelled) return;
        if (err.name === 'NotAllowedError') onError('Camera permission denied');
        else onError(err.message || 'Camera access error');
      }
    }
    startCamera();

    return () => {
      cancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      } else if (videoRef.current?.srcObject) {
         // Fallback just in case
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach((t) => t.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [facingMode, onError, videoRef]);

  // 2. Pose tracking via raw requestAnimationFrame (avoids MediaPipe Camera crashes)
  useEffect(() => {
    if (typeof Pose !== 'function') {
      onError('Pose tracking is unavailable (MediaPipe script not loaded).');
      return;
    }

    let isSubscribed = true;
    let animFrameId = 0;

    try {
      const pose = new Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });
      poseRef.current = pose;

      pose.setOptions({
        selfieMode: facingMode === 'user',
        upperBodyOnly: true,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults((results: any) => {
        if (!isSubscribed) return;
        if (results.poseLandmarks) {
          const leftShoulder = results.poseLandmarks[POSE_LANDMARKS.LEFT_SHOULDER];
          const rightShoulder = results.poseLandmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
          const leftElbow = results.poseLandmarks[POSE_LANDMARKS.LEFT_ELBOW];
          const rightElbow = results.poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW];
          const leftWrist = results.poseLandmarks[POSE_LANDMARKS.LEFT_WRIST];
          const rightWrist = results.poseLandmarks[POSE_LANDMARKS.RIGHT_WRIST];

          let sternum = null;
          if (leftShoulder && rightShoulder) {
            const x = (leftShoulder.x + rightShoulder.x) / 2;
            const y = (leftShoulder.y + rightShoulder.y) / 2 + 0.05;
            sternum = { x, y };
          }

          onPoseDetected({
            sternum,
            leftWrist: leftWrist ? { x: leftWrist.x, y: leftWrist.y } : undefined,
            rightWrist: rightWrist ? { x: rightWrist.x, y: rightWrist.y } : undefined,
            leftElbow: leftElbow ? { x: leftElbow.x, y: leftElbow.y } : undefined,
            rightElbow: rightElbow ? { x: rightElbow.x, y: rightElbow.y } : undefined,
            leftShoulder: leftShoulder ? { x: leftShoulder.x, y: leftShoulder.y } : undefined,
            rightShoulder: rightShoulder ? { x: rightShoulder.x, y: rightShoulder.y } : undefined
          } as any);
        } else {
          onPoseDetected(null);
        }
      });

    } catch (err: any) {
      onError(err?.message || 'Failed to initialize pose detection');
      return;
    }

    let busy = false;
    const processFrame = async () => {
      if (!isSubscribed) return;
      const video = videoRef.current;
      if (!busy && video && video.readyState >= 2 && !video.paused) {
        busy = true;
        try {
          await poseRef.current.send({ image: video });
        } catch (err) {
          console.error('Pose frame error:', err);
        } finally {
          busy = false;
        }
      }
      if (isSubscribed) {
        animFrameId = requestAnimationFrame(processFrame);
      }
    };
    processFrame();

    return () => {
      isSubscribed = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      try {
        poseRef.current?.close?.();
      } catch {
        /* ignore */
      }
    };
  }, [facingMode, onPoseDetected, onError, videoRef]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`object-cover w-full h-full ${facingMode === 'user' ? '-scale-x-100' : ''} ${className}`}
    />
  );
};
