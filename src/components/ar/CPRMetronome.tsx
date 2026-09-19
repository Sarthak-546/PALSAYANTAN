import { useEffect, useRef } from 'react';

interface CPRMetronomeProps {
  /** When true the 110 BPM click track plays via the Web Audio API. */
  isActive: boolean;
}

const BPM = 110;
const INTERVAL_MS = (60 / BPM) * 1000; // ~545.45 ms

/**
 * Plays a short percussive tick at the given AudioContext time.
 * Triangle wave at 800 Hz, rapid exponential decay → crisp, non-intrusive click.
 */
function scheduleTick(ctx: AudioContext, when: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, when);
  gain.gain.setValueAtTime(0.35, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.08);
  osc.connect(gain).connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.08);
}

/**
 * Browser-native 110 BPM metronome using the Web Audio API.
 * Runs entirely offline — no external audio files required.
 * Renders nothing visible; pair with the SternumOverlay cprPump animation.
 */
export const CPRMetronome = ({ isActive }: CPRMetronomeProps) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctxRef.current = ctx;

    // Browsers suspend AudioContext until a user gesture; resume defensively.
    const resume = () => { ctx.state === 'suspended' && ctx.resume(); };
    resume();
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });

    // Schedule the first tick immediately, then repeat at 110 BPM.
    scheduleTick(ctx, ctx.currentTime);
    intervalRef.current = window.setInterval(() => {
      scheduleTick(ctx, ctx.currentTime);
    }, INTERVAL_MS);

    return () => {
      window.clearInterval(intervalRef.current);
      document.removeEventListener('click', resume);
      document.removeEventListener('touchstart', resume);
      ctx.close().catch(() => {});
      ctxRef.current = null;
    };
  }, [isActive]);

  // Audio-only component — no DOM output.
  return null;
};

export default CPRMetronome;
