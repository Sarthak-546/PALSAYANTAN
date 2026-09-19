import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/** Live pixel size of an element (used to place AR overlays in real pixels). */
export function useElementSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      setSize((prev) =>
        prev.width === r.width && prev.height === r.height ? prev : { width: r.width, height: r.height },
      );
    };
    update();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}

/**
 * Maps a point normalised to the VIDEO FRAME (0..1, like MediaPipe landmarks)
 * to pixels inside a container that shows the video with `object-cover`.
 * object-cover scales the frame to fill the box and crops the overflow evenly,
 * so we have to undo that crop or the target drifts off the chest.
 */
export function mapNormalizedToCover(
  nx: number,
  ny: number,
  container: { width: number; height: number },
  video?: { videoWidth: number; videoHeight: number } | null,
) {
  const vw = video?.videoWidth ?? 0;
  const vh = video?.videoHeight ?? 0;
  if (!vw || !vh) return { x: nx * container.width, y: ny * container.height };

  const scale = Math.max(container.width / vw, container.height / vh);
  const drawnW = vw * scale;
  const drawnH = vh * scale;
  return {
    x: (container.width - drawnW) / 2 + nx * drawnW,
    y: (container.height - drawnH) / 2 + ny * drawnH,
  };
}
