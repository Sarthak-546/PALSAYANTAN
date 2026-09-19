import { useEffect, useRef } from 'react';

const Pose = (window as any).Pose;
const Camera = (window as any).Camera;

const POSE_LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
};

interface PoseDetectionCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
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
}

export const PoseDetectionCamera = ({
  videoRef,
  onPoseDetected,
  onError,
  className = ''
}: PoseDetectionCameraProps) => {
  const cameraRef = useRef<any>(null);
  const poseRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      onError('Video element not found');
      return;
    }

    try {
      // Initialize Pose
      const pose = new Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });
      poseRef.current = pose;

      pose.setOptions({
        selfieMode: false,
        upperBodyOnly: true,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults((results: any) => {
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
            const y = (leftShoulder.y + rightShoulder.y) / 2 + 0.05; // offset downwards slightly
            sternum = { x, y };
          }

          onPoseDetected({
            sternum,
            leftWrist: leftWrist ? { x: leftWrist.x, y: leftWrist.y } : null,
            rightWrist: rightWrist ? { x: rightWrist.x, y: rightWrist.y } : null,
            leftElbow: leftElbow ? { x: leftElbow.x, y: leftElbow.y } : null,
            rightElbow: rightElbow ? { x: rightElbow.x, y: rightElbow.y } : null,
            leftShoulder: leftShoulder ? { x: leftShoulder.x, y: leftShoulder.y } : null,
            rightShoulder: rightShoulder ? { x: rightShoulder.x, y: rightShoulder.y } : null
          });
        } else {
          onPoseDetected(null);
        }
      });

      // Initialize Camera
      const camera = new Camera(video, {
        onFrame: async () => {
          if (poseRef.current) {
            await poseRef.current.send({ image: video });
          }
        },
        width: 1280,
        height: 720
      });
      cameraRef.current = camera;
      camera.start();
    } catch (err: any) {
      onError(err?.message || 'Failed to initialize pose detection');
    }

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