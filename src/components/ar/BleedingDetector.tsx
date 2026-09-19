import { useCallback, useEffect, useRef } from 'react';

interface BleedingDetectorProps {
  /** The live camera <video> element to sample frames from. */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Called when blood/wound is detected; coords are normalized 0..1. */
  onWoundStatus: (coords: { x: number; y: number } | null) => void;
}

/**
 * Perform real-time edge-computed wound detection locally.
 */
export const BleedingDetector = ({ videoRef, onWoundStatus }: BleedingDetectorProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const consecutiveEmptyFramesRef = useRef(0);

  useEffect(() => {
    // 320x240 for performance
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    canvasRef.current = canvas;
  }, []);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData; // Uint8ClampedArray

    let sumX = 0;
    let sumY = 0;
    let count = 0;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Relaxed filter for digital screen emission and glare
        const isBloodPixel = r >= 90 && g <= 90 && b <= 90 && (r / (g + b + 1) > 1.5) && (r - g > 30);

        if (isBloodPixel) {
          sumX += x;
          sumY += y;
          count++;
        }
      }
    }

    const totalPixels = canvas.width * canvas.height;
    const thresholdPixels = totalPixels * 0.015; // >1.5% of frame

    // Only report if clustering density is significant (>1.5% of pixels)
    if (count > thresholdPixels) {
      consecutiveEmptyFramesRef.current = 0;
      onWoundStatus({
        // Convert centroid to actual normalized video element coordinates (0..1)
        x: (sumX / count) / canvas.width,
        y: (sumY / count) / canvas.height,
      });
    } else {
      consecutiveEmptyFramesRef.current += 1;
      // If no blood is detected for 3 consecutive frames, emit null
      if (consecutiveEmptyFramesRef.current >= 3) {
        onWoundStatus(null);
      }
    }
  }, [videoRef, onWoundStatus]);

  useEffect(() => {
    const interval = setInterval(processFrame, 200); // 5 FPS (200ms)
    return () => clearInterval(interval);
  }, [processFrame]);

  return null;
};

export default BleedingDetector;
