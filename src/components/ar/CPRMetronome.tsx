import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { language } = useLanguage();
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number>(0);
  const [hasVibrate, setHasVibrate] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      setHasVibrate(true);
    }

    if (!isActive) {
      if (hasVibrate && 'vibrate' in navigator) {
        try {
          navigator.vibrate(0);
        } catch {}
      }
      return;
    }

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
  }, [isActive, hasVibrate]);

  if (!isActive) return null;

  return (
    <div className="absolute top-28 inset-x-4 max-w-sm mx-auto z-40 pointer-events-none flex justify-center">
      <span className="text-[10px] sm:text-[11px] font-mono tracking-wider font-bold text-emerald-400 bg-emerald-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-lg flex items-center">
        <span className="mr-1.5 text-base leading-none">📳</span>
        {language === 'en' ? 'PUSH TO THE BEAT (110 BPM)' : 'बीट के साथ दबाएं (110 BPM)'}
      </span>
    </div>
  );
};

export default CPRMetronome;
