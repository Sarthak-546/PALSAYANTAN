import { useEffect, useRef, useState } from 'react';

interface CPRMetronomeProps {
  isActive: boolean;
  demoMode: boolean;
  className?: string;
}

export const CPRMetronome = ({ isActive, demoMode, className = '' }: CPRMetronomeProps) => {
  const [beat, setBeat] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const scheduledBeatRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const isRunningRef = useRef(false);
  const beatInterval = 60 / 110; // 110 BPM in seconds per beat

  useEffect(() => {
    if (isActive) {
      startMetronome();
    } else {
      stopMetronome();
    }
    return () => {
      stopMetronome();
    };
  }, [isActive, demoMode]);

  const startMetronome = () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    // Initialize audio context if not already
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const playClick = (time: number) => {
      if (!audioCtxRef.current) return;
      const oscillator = audioCtxRef.current.createOscillator();
      const gainNode = audioCtxRef.current.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);
      oscillator.frequency.setValueAtTime(1000, time); // 1kHz click
      gainNode.gain.setValueAtTime(0.0001, time); // very quiet
      gainNode.gain.exponentialRampToValueAtTime(0.1, time + 0.005); // attack
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.02); // decay
      oscillator.start(time);
      oscillator.stop(time + 0.03);
    };

    const scheduleBeat = (currentTime: number) => {
      if (!isRunningRef.current) return;
      // Play the click
      playClick(currentTime);
      // Schedule visual pulse via requestAnimationFrame to update beat state
      animationFrameRef.current = requestAnimationFrame(() => {
        setBeat(prev => prev + 1);
      });
      // Schedule next beat
      const nextTime = currentTime + beatInterval;
      scheduledBeatRef.current = nextTime;
      // Use the audio context to schedule the next callback
      audioCtxRef.current?.createOscillator(); // dummy to ensure context is not suspended?
      // Actually, we can't schedule a callback from the audio context for future times without creating an event.
      // Instead, we'll use a timeout based on the audio context's current time, but we have to adjust for clock differences.
      // For simplicity, we'll use a setTimeout with the beat interval, but note: this may drift.
      // We'll use a more accurate method: schedule the next beat using the audio context's time.
      // We can create a periodic wave or use a timer node, but let's use a recursive approach with the audio context.
      // We'll create an oscillator that we don't actually play, but we use its context to get the time.
      // Instead, we'll use a single repeating event by scheduling the next beat from within the callback.
      // We already have the nextTime, so we can set a timeout based on the audio context's current time.
      // However, we don't have a way to get the current time in the audio context without calling it.
      // We'll approximate: we'll set a timeout for (nextTime - audioCtxRef.current.currentTime) * 1000.
      // But note: the audio context's current time changes.
      // We'll do:
      const delayMs = (nextTime - audioCtxRef.current!.currentTime) * 1000;
      if (delayMs > 0) {
        // We'll use a setTimeout for simplicity, but note: this is not sample-accurate.
        // For a prototype, this is acceptable.
        setTimeout(() => {
          scheduleBeat(audioCtxRef.current!.currentTime);
        }, delayMs);
      } else {
        // If delay is negative, we are behind schedule, so schedule immediately
        scheduleBeat(audioCtxRef.current!.currentTime);
      }
    };

    // Start the first beat
    const startTime = audioCtxRef.current!.currentTime + 0.1; // start shortly after
    scheduleBeat(startTime);
  };

  const stopMetronome = () => {
    isRunningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    // Note: We don't close the audio context because we might want to reuse it.
    // We'll leave it running but silent.
  };

  // We'll create a visual pulse element that is keyed by the beat state to restart an animation
  return (
    <div className={`relative w-12 h-12 ${className}`}>
      {/* Visual pulse indicator - a circle that pulses on each beat */}
      <div
        className={`absolute inset-0 flex items-center justify-center`}
        key={beat}
      >
        <div className="w-6 h-6 bg-red-500/50 rounded-full animate-pulse" />
      </div>
      {/* Optional: BPM label in demo mode */}
      {demoMode && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-red-600">
          110 BPM
        </div>
      )}
    </div>
  );
};