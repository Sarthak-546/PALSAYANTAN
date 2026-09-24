import { useCallback, useEffect, useRef } from 'react';

interface BleedingDetectorProps {
  /** The live camera <video> element to sample frames from. */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Called when blood/wound is detected; coords are normalized 0..1. */
  onWoundStatus: (coords: { x: number; y: number } | null) => void;
  /** Optional spatial mask to limit detection to torso region (normalized 0..1) */
  scanMask?: { minX: number; maxX: number; minY: number; maxY: number };
}

/**
 * Perform real-time edge-computed wound detection locally using broad-spectrum red detection.
 * Detects ANY red substance (markers, ketchup, red cloth) for demo lighting compatibility.
 */
export const BleedingDetector = ({
  videoRef,
  onWoundStatus,
  scanMask,
}: BleedingDetectorProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const consecutiveEmptyFramesRef = useRef(0);

  // Ref to track last reported wound position for debouncing
  const lastWoundPositionRef = useRef<{ x: number; y: number } | null>(null);

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

    // Process each pixel
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // High-sensitivity red detector: accepts any saturated red substance
        // Broad-spectrum detection for markers, ketchup, red cloth, etc.
        const isRedPixel =
          r > 100 &&
          r > g * 1.35 &&
          r > b * 1.35 &&
          (r - Math.max(g, b) > 35);

        // Apply spatial masking if provided
        if (isRedPixel && scanMask) {
          const normX = x / canvas.width;
          const normY = y / canvas.height;

          // Skip if outside the masked region
          if (
            normX < scanMask.minX ||
            normX > scanMask.maxX ||
            normY < scanMask.minY ||
            normY > scanMask.maxY
          ) {
            continue;
          }
        }

        if (isRedPixel) {
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

      // Calculate centroid
      const centroidX = (sumX / count) / canvas.width;
      const centroidY = (sumY / count) / canvas.height;

      // Performance optimization: debounce state updates - only report if moved > 3px
      const newPosition = { x: centroidX, y: centroidY };
      const lastPosition = lastWoundPositionRef.current;

      const shouldUpdate = !lastPosition ||
        Math.abs(newPosition.x - lastPosition.x) * canvas.width > 3 ||
        Math.abs(newPosition.y - lastPosition.y) * canvas.height > 3;

      if (shouldUpdate) {
        lastWoundPositionRef.current = newPosition;
        onWoundStatus(newPosition);
      }
    } else {
      consecutiveEmptyFramesRef.current += 1;
      // If no blood is detected for 3 consecutive frames, emit null
      if (consecutiveEmptyFramesRef.current >= 3) {
        // Also debounce null updates
        const nullPosition = { x: 0, y: 0 }; // dummy values, we only care that it's null
        const lastPosition = lastWoundPositionRef.current;

        const shouldUpdateNull = !lastPosition || lastPosition === null ||
          // Only update if we weren't already reporting null (to prevent excessive null updates)
          (lastPosition && (lastPosition.x !== 0 || lastPosition.y !== 0));

        if (shouldUpdateNull) {
          lastWoundPositionRef.current = { x: 0, y: 0 }; // mark as null state
          onWoundStatus(null);
        }
      }
    }
  }, [videoRef, onWoundStatus, scanMask]);

  useEffect(() => {
    const interval = setInterval(processFrame, 200); // 5 FPS (200ms)
    return () => clearInterval(interval);
  }, [processFrame]);

  return null;
};

export default BleedingDetector;