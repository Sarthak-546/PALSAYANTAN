import { useEffect, useRef, useState } from 'react';

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
 * Syncs with the hardware vibration motor via navigator.vibrate.
 */
export const CPRMetronome = ({ isActive }: CPRMetronomeProps) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number>(0);
  const [hasVibrate, setHasVibrate] = useState(false);
  const [pacingEnabled, setPacingEnabled] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      setHasVibrate(true);
    }

    if (!isActive) {
      setPacingEnabled(false);
      if (hasVibrate && 'vibrate' in navigator) {
        try {
          navigator.vibrate(0);
        } catch {}
      }
      return;
    }

    if (!pacingEnabled) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctxRef.current = ctx;

    const resume = () => { ctx.state === 'suspended' && ctx.resume(); };
    resume();
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });

    const triggerBeat = () => {
      scheduleTick(ctx, ctx.currentTime);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(80);
        } catch {}
      }
    };

    triggerBeat();
    intervalRef.current = window.setInterval(triggerBeat, INTERVAL_MS);

    return () => {
      window.clearInterval(intervalRef.current);
      document.removeEventListener('click', resume);
      document.removeEventListener('touchstart', resume);
      ctx.close().catch(() => {});
      ctxRef.current = null;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(0);
        } catch {}
      }
    };
  }, [isActive, pacingEnabled, hasVibrate]);

  if (!isActive || !hasVibrate) return null;

  if (!pacingEnabled) {
    return (
      <div className="absolute top-28 inset-x-4 max-w-sm mx-auto z-40 pointer-events-auto flex justify-center">
        <button
          onClick={() => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate(80); } catch {}
            }
            setPacingEnabled(true);
          }}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-full text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.6)] border border-red-400 active:scale-95 transition-transform"
        >
          Start CPR Pacing
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-28 inset-x-4 max-w-sm mx-auto z-40 pointer-events-none flex justify-center">
      <span className="text-[10px] sm:text-[11px] font-mono tracking-wider font-bold text-emerald-400 bg-emerald-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-lg flex items-center">
        <span className="mr-1.5 text-base leading-none">📳</span>
        Haptic Pulse Active
      </span>
    </div>
  );
};

export default CPRMetronome;
