import { useEffect, useRef, useState } from 'react';
import * as pose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

interface PoseDetectionCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onPoseDetected: (sternumPoint: { x: number; y: number } | null) => void;
  onError: (error: string) => void;
  className?: string;
}

export const PoseDetectionCamera = ({
  videoRef,
  onPoseDetected,
  onError,
  className = ''
}: PoseDetectionCameraProps) => {
  const cameraRef = useRef<Camera | null>(null);
  const poseRef = useRef<pose.Pose | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      onError('Video element not found');
      return;
    }

    // Initialize Pose
    const pose = new pose.Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });
    pose.setOptions({
      selfieMode: false,
      upperBodyOnly: true,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    pose.onResults((results) => {
      if (results.poseLandmarks) {
        // Calculate sternum point as midpoint between shoulders
        const leftShoulder = results.poseLandmarks[pose.LEFT_SHOULDER];
        const rightShoulder = results.poseLandmarks[pose.RIGHT_SHOULDER];
        if (leftShoulder && rightShoulder) {
          const x = (leftShoulder.x + rightShoulder.x) / 2;
          const y = (leftShoulder.y + rightShoulder.y) / 2 + 0.05; // offset downwards slightly
          onPoseDetected({ x, y });
        } else {
          onPoseDetected(null);
        }
      } else {
        onPoseDetected(null);
      }
    });

    // Initialize Camera
    const camera = new Camera(video, {
      onFrame: async () => {
        await pose.send({ image: video });
      },
      width: 1280,
      height: 720
    });
    cameraRef.current = camera;
    camera.start();

    // Cleanup
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      poseRef.current = null;
    };
  }, [videoRef, onPoseDetected, onError]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`object-cover w-full h-full ${className}`}
    />
  );
};