import { useCallback, useEffect, useRef } from 'react';

interface BleedingDetectorProps {
  /** The live camera <video> element to sample frames from. */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Called when blood/wound is detected; coords are normalized 0..1. */
  onWoundStatus: (coords: { x: number; y: number } | null) => void;
}

// Downscaled working resolution — enough detail for wound-sized blobs, cheap to scan.
const CANVAS_W = 320;
const CANVAS_H = 240;

// Grid used for connected-component (flood-fill) blob detection.
const CELL = 16; // px per cell
const COLS = Math.floor(CANVAS_W / CELL); // 20
const ROWS = Math.floor(CANVAS_H / CELL); // 15

// A cell counts as "hot" once this fraction of its pixels look like blood.
const CELL_HOT_RATIO = 0.22; // ~57 of 256 px in a 16x16 cell
// Minimum cluster size (in pixels) before we trust it's a real wound, not noise.
const MIN_CLUSTER_PIXELS = Math.round(CANVAS_W * CANVAS_H * 0.006); // ~0.6% of frame

// Frames a detection must persist before we report it (debounce false positives),
// and frames of "nothing" before we clear it (avoid flicker on a missed frame).
const CONFIRM_FRAMES = 2;
const CLEAR_FRAMES = 3;

// Smoothing for the reported point so the on-screen marker doesn't jump frame to frame.
const SMOOTHING_ALPHA = 0.35;

/**
 * Fast RGB -> HSV. Returns h in [0,1), s in [0,1], v in [0,1].
 */
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
    if (h < 0) h += 1;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return [h, s, v];
}

/**
 * Blood-specific test in HSV space. Tuned to reject the two most common
 * false positives: skin tones (lower saturation, higher value at a given
 * hue) and saturated red fabric/plastic (often near-max value / too uniform).
 */
function isBloodPixel(h: number, s: number, v: number): boolean {
  const nearRedHue = h < 0.045 || h > 0.965; // ~ -16° to +16° around true red
  return nearRedHue && s > 0.42 && v > 0.12 && v < 0.8;
}

export const BleedingDetector = ({ videoRef, onWoundStatus }: BleedingDetectorProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cellCountRef = useRef<Int32Array>(new Int32Array(COLS * ROWS));
  const cellSumXRef = useRef<Float64Array>(new Float64Array(COLS * ROWS));
  const cellSumYRef = useRef<Float64Array>(new Float64Array(COLS * ROWS));
  const visitedRef = useRef<Uint8Array>(new Uint8Array(COLS * ROWS));

  const foundStreakRef = useRef(0);
  const emptyStreakRef = useRef(0);
  const isReportingRef = useRef(false);
  const smoothedRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    canvasRef.current = canvas;
  }, []);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const cellCount = cellCountRef.current;
    const cellSumX = cellSumXRef.current;
    const cellSumY = cellSumYRef.current;
    cellCount.fill(0);
    cellSumX.fill(0);
    cellSumY.fill(0);

    // Sample every other pixel in each direction — 4x fewer samples, still
    // plenty of resolution for a wound-sized region, leaves headroom for HSV math.
    const STRIDE = 2;
    for (let y = 0; y < canvas.height; y += STRIDE) {
      const cellRow = Math.min(ROWS - 1, Math.floor(y / CELL));
      for (let x = 0; x < canvas.width; x += STRIDE) {
        const i = (y * canvas.width + x) * 4;
        const [h, s, v] = rgbToHsv(data[i], data[i + 1], data[i + 2]);
        if (!isBloodPixel(h, s, v)) continue;

        const cellCol = Math.min(COLS - 1, Math.floor(x / CELL));
        const idx = cellRow * COLS + cellCol;
        cellCount[idx] += 1;
        cellSumX[idx] += x;
        cellSumY[idx] += y;
      }
    }

    // A cell's pixel budget is halved by STRIDE=2 in both axes -> CELL*CELL/4 samples.
    const cellHotThreshold = Math.round((CELL * CELL) / (STRIDE * STRIDE) * CELL_HOT_RATIO);

    // Flood-fill over "hot" cells to find the single largest coherent blob,
    // instead of trusting a global centroid of every red pixel in the frame.
    const visited = visitedRef.current;
    visited.fill(0);
    let bestCount = 0, bestSumX = 0, bestSumY = 0;

    for (let start = 0; start < COLS * ROWS; start++) {
      if (visited[start] || cellCount[start] < cellHotThreshold) continue;

      let clusterCount = 0, clusterSumX = 0, clusterSumY = 0;
      const stack = [start];
      visited[start] = 1;

      while (stack.length) {
        const idx = stack.pop() as number;
        clusterCount += cellCount[idx];
        clusterSumX += cellSumX[idx];
        clusterSumY += cellSumY[idx];

        const col = idx % COLS;
        const row = (idx - col) / COLS;
        const neighbors = [
          col > 0 ? idx - 1 : -1,
          col < COLS - 1 ? idx + 1 : -1,
          row > 0 ? idx - COLS : -1,
          row < ROWS - 1 ? idx + COLS : -1,
        ];
        for (const n of neighbors) {
          if (n >= 0 && !visited[n] && cellCount[n] >= cellHotThreshold) {
            visited[n] = 1;
            stack.push(n);
          }
        }
      }

      if (clusterCount > bestCount) {
        bestCount = clusterCount;
        bestSumX = clusterSumX;
        bestSumY = clusterSumY;
      }
    }

    const foundThisFrame = bestCount >= MIN_CLUSTER_PIXELS;

    if (foundThisFrame) {
      emptyStreakRef.current = 0;
      foundStreakRef.current += 1;

      const rawX = bestSumX / bestCount / canvas.width;
      const rawY = bestSumY / bestCount / canvas.height;

      // Exponential moving average so the marker doesn't teleport frame to frame.
      smoothedRef.current = smoothedRef.current
        ? {
            x: smoothedRef.current.x + SMOOTHING_ALPHA * (rawX - smoothedRef.current.x),
            y: smoothedRef.current.y + SMOOTHING_ALPHA * (rawY - smoothedRef.current.y),
          }
        : { x: rawX, y: rawY };

      // Debounce: require a couple of consecutive confirming frames before
      // we start reporting, so a single lucky frame doesn't trigger a false alarm.
      if (!isReportingRef.current && foundStreakRef.current >= CONFIRM_FRAMES) {
        isReportingRef.current = true;
      }
      if (isReportingRef.current) {
        onWoundStatus(smoothedRef.current);
      }
    } else {
      foundStreakRef.current = 0;
      emptyStreakRef.current += 1;
      if (isReportingRef.current && emptyStreakRef.current >= CLEAR_FRAMES) {
        isReportingRef.current = false;
        smoothedRef.current = null;
        onWoundStatus(null);
      }
    }
  }, [videoRef, onWoundStatus]);

  useEffect(() => {
    const interval = setInterval(processFrame, 200); // 5 FPS
    return () => clearInterval(interval);
  }, [processFrame]);

  return null;
};

export default BleedingDetector;
