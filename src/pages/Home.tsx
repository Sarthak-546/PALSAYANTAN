import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Heart, Droplet, ShieldAlert, Camera, BookOpen, MapPin, Baby } from 'lucide-react';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ROUTES } from '../routes';

export const Home = () => {
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(true);
  const [systemsReady, setSystemsReady] = useState({
    camera: false,
    ai: false,
    offline: false,
    gps: false,
  });

  useEffect(() => {
    // Staged "boot" animation. Timers are cleared on unmount so leaving Home early is safe.
    const timers = [
      window.setTimeout(() => setSystemsReady(p => ({ ...p, camera: true })), 500),
      window.setTimeout(() => setSystemsReady(p => ({ ...p, ai: true })), 1000),
      window.setTimeout(() => setSystemsReady(p => ({ ...p, offline: true })), 1500),
      window.setTimeout(() => {
        setSystemsReady(p => ({ ...p, gps: true }));
        setInitializing(false);
      }, 2000),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  // ── Initializing Boot Screen ──
  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-slate-100 transition-colors">
        <HeartPulse className="w-16 h-16 text-red-500 animate-pulse mb-6" />
        <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-center">
          AR Emergency Assistant
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 text-center max-w-xs">
          Real-time guidance when every second matters.
        </p>

        <div className="space-y-4 w-full max-w-[200px] mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-colors duration-500 ${systemsReady.camera ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-600 shadow-transparent'}`} />
            <span className="text-xs font-medium tracking-wide">Camera System</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-colors duration-500 ${systemsReady.ai ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-600 shadow-transparent'}`} />
            <span className="text-xs font-medium tracking-wide">AI Assessment</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-colors duration-500 ${systemsReady.offline ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-600 shadow-transparent'}`} />
            <span className="text-xs font-medium tracking-wide">Offline Core</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-colors duration-500 ${systemsReady.gps ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-600 shadow-transparent'}`} />
            <span className="text-xs font-medium tracking-wide">GPS Uplink</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Home Interface ──
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 transition-colors">

      {/* ── Main Layout Wrapper ── */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-5 flex-1 justify-center relative pb-10">

        {/* ── Top Header Bar ── */}
        <header className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <HeartPulse className="w-6 h-6 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              AR Emergency Assistant
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono bg-slate-100 dark:bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full tracking-wider font-bold shadow-sm">
              OFFLINE ENGINE ACTIVE
            </span>
            <ThemeToggle className="scale-90" />
          </div>
        </header>

        {/* ── Quick Emergency Protocols (Triage Cards) ── */}
        <section className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            onClick={() => navigate('/emergency-scan?protocol=cpr')}
            className="flex flex-col items-center justify-center gap-2 text-center bg-red-100/50 dark:bg-red-950/40 border border-red-300 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-500/60 p-3 sm:p-3.5 rounded-2xl shadow-sm transition-all active:scale-95 group"
          >
            <Heart className="w-5 h-5 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform drop-shadow-sm" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-red-900 dark:text-red-100 mb-0.5">CPR</p>
              <p className="text-[9px] sm:text-[10px] text-red-700 dark:text-red-300/70 font-medium leading-tight hidden sm:block">110 BPM Sternum Pacing</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/emergency-scan?protocol=bleeding')}
            className="flex flex-col items-center justify-center gap-2 text-center bg-amber-100/50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/60 p-3 sm:p-3.5 rounded-2xl shadow-sm transition-all active:scale-95 group"
          >
            <Droplet className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform drop-shadow-sm" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-100 mb-0.5">Bleeding</p>
              <p className="text-[9px] sm:text-[10px] text-amber-700 dark:text-amber-300/70 font-medium leading-tight hidden sm:block">Direct Arterial Pressure</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/emergency-scan?protocol=choking')}
            className="flex flex-col items-center justify-center gap-2 text-center bg-cyan-100/50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-500/30 hover:border-cyan-400 dark:hover:border-cyan-500/60 p-3 sm:p-3.5 rounded-2xl shadow-sm transition-all active:scale-95 group"
          >
            <ShieldAlert className="w-5 h-5 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform drop-shadow-sm" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-cyan-900 dark:text-cyan-100 mb-0.5">Choking</p>
              <p className="text-[9px] sm:text-[10px] text-cyan-700 dark:text-cyan-300/70 font-medium leading-tight hidden sm:block">5 Back Blows & Thrusts</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/first-aid/pregnancy')}
            className="flex flex-col items-center justify-center gap-2 text-center bg-fuchsia-100/50 dark:bg-fuchsia-950/40 border border-fuchsia-300 dark:border-fuchsia-500/30 hover:border-fuchsia-400 dark:hover:border-fuchsia-500/60 p-3 sm:p-3.5 rounded-2xl shadow-sm transition-all active:scale-95 group"
          >
            <Baby className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110 transition-transform drop-shadow-sm" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-fuchsia-900 dark:text-fuchsia-100 mb-0.5">Pregnancy</p>
              <p className="text-[9px] sm:text-[10px] text-fuchsia-700 dark:text-fuchsia-300/70 font-medium leading-tight hidden sm:block">L.U.D. & Recovery</p>
            </div>
          </button>
        </section>

        {/* ── Primary Emergency Hero Card ── */}
        <section className="bg-white/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-[1.5rem] p-5 sm:p-6 shadow-xl dark:shadow-2xl backdrop-blur-md">
          <div className="text-center mb-5 mt-1">
            <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight mb-1.5">
              Need Immediate Assistance?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
              Start an assisted emergency assessment.
            </p>
          </div>

          <button
            onClick={() => navigate(ROUTES.emergencyScan)}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] active:scale-95 transition-all flex items-center justify-center gap-3 mb-4"
          >
            <Camera className="w-5 h-5 flex-shrink-0" />
            <span className="tracking-wide">START AR EMERGENCY SCAN</span>
          </button>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => navigate(ROUTES.firstAid)}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200/60 dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 py-3 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold tracking-wide transition-colors active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              First Aid Library
            </button>
            <button
              onClick={() => navigate(ROUTES.location)}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200/60 dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 py-3 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold tracking-wide transition-colors active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Share Location
            </button>
          </div>
        </section>

      </div>

      {/* ── Hardware Diagnostics Status Pill Bar (Footer) ── */}
      <footer className="w-full max-w-md mx-auto">
        <div className="w-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl py-3 px-3 sm:px-4 flex items-center justify-between backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-1.5 focus:outline-none" title="Camera Status">
            <div className={`w-2 h-2 rounded-full ${systemsReady.camera ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-300 dark:bg-slate-700'}`} />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-600 dark:text-slate-400 uppercase">Camera</span>
          </div>
          <div className="flex items-center gap-1.5 focus:outline-none" title="AI Engine Status">
            <div className={`w-2 h-2 rounded-full ${systemsReady.ai ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-300 dark:bg-slate-700'}`} />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-600 dark:text-slate-400 uppercase">AI Engine</span>
          </div>
          <div className="flex items-center gap-1.5 focus:outline-none" title="GPS Status">
            <div className={`w-2 h-2 rounded-full ${systemsReady.gps ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-300 dark:bg-slate-700'}`} />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-600 dark:text-slate-400 uppercase">GPS</span>
          </div>
          <div className="flex items-center gap-1.5 focus:outline-none" title="Offline Cache Status">
            <div className={`w-2 h-2 rounded-full ${systemsReady.offline ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-600 dark:text-slate-400 uppercase">Offline Cache</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;