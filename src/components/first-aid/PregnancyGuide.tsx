import { useState, useRef, useEffect } from 'react';
import { Video } from 'lucide-react';
import { AudioGuidance } from '../ar/AudioGuidance';
import { useEmergencySession } from '../../contexts/EmergencySessionContext';

const PREGNANCY_CPR_TEXT = "Wait! Standard CPR on a pregnant woman can reduce blood flow by 30 percent due to caval compression. If she is unconscious and not breathing normally, call 102 immediately. You must continuously shift the pregnant belly to her left side using Left Uterine Displacement while applying chest compressions at 100 to 120 beats per minute on the lower half of the sternum. Never lay her flat on her back without shifting the uterus to the left.";

const PREGNANCY_RECOVERY_TEXT = "If the pregnant patient is unconscious but breathing, you must roll her onto her left side. This is called the Left Lateral Recovery Position. It restores crucial blood flow to the heart and the fetus. Bend her top knee forward at a 90-degree angle for stability, and tuck a pillow or wedge under her right hip to maintain a 15 to 30 degree left tilt. Gently tilt her head back to ensure a clear airway.";

export const PregnancyGuide = () => {
  const [activeTab, setActiveTab] = useState<'CPR' | 'RECOVERY'>('CPR');
  const { voiceGuidance } = useEmergencySession();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Preload both videos on mount to reduce latency when switching tabs
  useEffect(() => {
    const preloadVideo = (src: string) => {
      const video = document.createElement('video');
      video.src = src;
      video.preload = 'auto';
      // Using decode() if available for better preloading
      if ('decode' in video) {
        video.decode().catch(() => {}); // Ignore errors
      }
    };
    preloadVideo('/videos/pcpr.mp4');
    preloadVideo('/videos/pcpr2.mp4');
  }, []);

  // Update video source when tab changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = activeTab === 'CPR' ? '/videos/pcpr.mp4' : '/videos/pcpr2.mp4';
      videoRef.current.load(); // Reload with new source
      videoRef.current.play().catch(() => {}); // Try to play (may be blocked by autoplay policies)
    }
  }, [activeTab]);

  return (
    <div className="w-full flex-shrink-0 flex flex-col gap-4">
      {/* Dynamic Audio Guidance */}
      <AudioGuidance
        text={activeTab === 'CPR' ? PREGNANCY_CPR_TEXT : PREGNANCY_RECOVERY_TEXT}
        isActive={voiceGuidance}
      />

      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 gap-2 rounded-2xl border border-gray-200 dark:border-fuchsia-500/20">
        <button
          onClick={() => setActiveTab('CPR')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'CPR' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          1. Maternal CPR & L.U.D.
        </button>
        <button
          onClick={() => setActiveTab('RECOVERY')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'RECOVERY' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          2. Left Recovery Pos.
        </button>
      </div>

      <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4 text-fuchsia-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Technique Demonstration
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
            OFFLINE VIDEO
          </span>
        </div>

        <div className="relative w-full aspect-[16/9] bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain pointer-events-none"
            onError={(e) => {
              if (videoRef.current) {
                if (activeTab === 'CPR' && (e.currentTarget.src.endsWith('/videos/pcpr.mp4'))) {
                  e.currentTarget.src = '/pcpr.mp4';
                  e.currentTarget.load();
                  return;
                }
                if (activeTab === 'RECOVERY' && (e.currentTarget.src.endsWith('/videos/pcpr2.mp4'))) {
                  e.currentTarget.src = '/2pcpr.mp4';
                  e.currentTarget.load();
                  return;
                }
              }
              const img = document.createElement('img');
              img.src = '/images/burns/3.png'; // fallback graphic
              img.className = "w-full h-full object-contain";
              e.currentTarget.parentNode?.replaceChild(img, e.currentTarget);
            }}
          />
        </div>
      </div>

      {activeTab === 'CPR' ? (
        <div className="bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-fuchsia-500/30 rounded-2xl p-4 sm:p-5 transition-colors shadow-sm dark:shadow-none">
          <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-3">Maternal CPR + Left Uterine Displacement (LUD)</h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
            <li><strong className="text-fuchsia-600 dark:text-fuchsia-400">Assess:</strong> If unconscious and not breathing normally, call 102/112 immediately.</li>
            <li><strong className="text-fuchsia-600 dark:text-fuchsia-400">L.U.D. Technique:</strong> A second rescuer (or primary rescuer) must firmly pull or push the pregnant belly toward the patient's LEFT side to relieve inferior vena cava compression.</li>
            <li><strong className="text-fuchsia-600 dark:text-fuchsia-400">Compressions:</strong> Interlock hands at the lower half of the sternum and compress hard and fast at 100–120 BPM.</li>
            <li><strong className="text-red-500 dark:text-red-400">Critical Warning:</strong> Supine hypotensive syndrome can reduce cardiac output by 30%—never lay her flat without tilting or shifting the uterus to the left.</li>
          </ul>
        </div>
      ) : (
        <div className="bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-fuchsia-500/30 rounded-2xl p-4 sm:p-5 transition-colors shadow-sm dark:shadow-none">
          <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-3">Left Lateral Recovery Position</h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
            <li><strong className="text-fuchsia-600 dark:text-fuchsia-400">Position:</strong> Gently roll the patient completely onto her LEFT side (never the right).</li>
            <li><strong className="text-fuchsia-600 dark:text-fuchsia-400">Support Leg:</strong> Bend her top (right) knee forward at a 90° angle to create a stable kickstand.</li>
            <li><strong className="text-fuchsia-600 dark:text-fuchsia-400">Tilt Support:</strong> Tuck a pillow, folded jacket, or wedge under her right hip to maintain a 15°–30° left tilt.</li>
            <li><strong className="text-fuchsia-600 dark:text-fuchsia-400">Airway:</strong> Tilt head back gently to ensure a clear airway.</li>
          </ul>
        </div>
      )}

      {/* Emergency Action Footer */}
      <div className="flex gap-3 mt-2">
        <a href="tel:102" className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-fuchsia-600/30 transition-all active:scale-95">
          🚑 Call 102 (Maternity)
        </a>
        <a href="tel:112" className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-red-600/30 transition-all active:scale-95">
          📞 Call 112 (National SOS)
        </a>
      </div>
    </div>
  );
};
