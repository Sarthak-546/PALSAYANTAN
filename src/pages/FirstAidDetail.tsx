import { useEffect, useState } from 'react';
import { BurnSlideshow } from '../components/first-aid/BurnSlideshow';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Shield, Volume2, VolumeX, XCircle, Video } from 'lucide-react';
import { AudioGuidance } from '../components/ar/AudioGuidance';
import { useEmergencySession } from '../contexts/EmergencySessionContext';
import { useScenario } from '../hooks/useScenario';
import { ROUTES, arFirstAidPath } from '../routes';
import type { EmergencyScenario } from '../data/emergencyScenarios';

const SEVERITY_STYLES: Record<EmergencyScenario['severity'], string> = {
  CRITICAL: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 ring-1 ring-red-300 dark:ring-red-900/60',
  URGENT: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-900/60',
  STABLE: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-900/60',
};

export const FirstAidDetail = () => {
  const navigate = useNavigate();
  const { voiceGuidance, setVoiceGuidance } = useEmergencySession();
  const { scenario } = useScenario();
  const [currentStep, setCurrentStep] = useState(0);
  const [showDos, setShowDos] = useState(true);
  const [selectedChokingVideo, setSelectedChokingVideo] = useState<'A' | 'B'>('A');

  useEffect(() => {
    setCurrentStep(0);
  }, [scenario?.id]);

  useEffect(() => {
    if (scenario?.id === 'choking' && scenario.steps && scenario.steps[currentStep]) {
      const stepObj = scenario.steps[currentStep];
      const text = stepObj.instruction.toLowerCase() + stepObj.detail.toLowerCase();
      if (text.includes('abdominal thrust') || text.includes('heimlich')) {
        setSelectedChokingVideo('B');
      } else if (text.includes('back blow') || text.includes('back-blow')) {
        setSelectedChokingVideo('A');
      }
    }
  }, [currentStep, scenario]);

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors">
        <h1 className="text-2xl font-bold text-red-500 mb-3">Scenario Not Found</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm">The requested emergency scenario could not be loaded.</p>
        <button
          onClick={() => navigate(ROUTES.firstAid)}
          className="px-5 py-2.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-white transition-colors"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const steps = scenario.steps;
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Voice guidance */}
      {scenario.id !== 'burns' && (
        <AudioGuidance text={step.audioText ?? step.instruction} isActive={voiceGuidance} />
      )}

      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(ROUTES.firstAid)}
            className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Library
          </button>

          <span className={`text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-full ${SEVERITY_STYLES[scenario.severity] ?? ''}`}>
            {scenario.severity}
          </span>

          <button
            onClick={() => setVoiceGuidance(!voiceGuidance)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              voiceGuidance ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
            }`}
          >
            {voiceGuidance ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-slate-800">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-5 pb-10">
        {/* Title & meta */}
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-50 mb-1.5 transition-colors">{scenario.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
            <span>{scenario.category}</span>
            <span>·</span>
            <span>{scenario.estimatedTime}</span>
            <span>·</span>
            <span>{scenario.steps.length} steps</span>
          </div>
        </div>

        {/* Overview card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-slate-800 p-4 mb-5 transition-colors">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Overview</h2>
          <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">{scenario.overview}</p>
        </div>

        {/* ── Optional Offline Video Demonstration (Choking) ── */}
        {(scenario.id === 'choking' || scenario.id === 'choke') && (
          <div className="w-full max-w-xl mx-auto mb-6 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Technique Video Demonstration
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                OFFLINE VIDEO
              </span>
            </div>

            {/* Sub-selector Pills */}
            <div className="flex bg-slate-950 p-1.5 gap-2 border-b border-white/5">
              <button
                onClick={() => setSelectedChokingVideo('A')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  selectedChokingVideo === 'A' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Back Blows Demo
              </button>
              <button
                onClick={() => setSelectedChokingVideo('B')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  selectedChokingVideo === 'B' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Abdominal Thrusts Demo
              </button>
            </div>

            {/* Video Viewport (No Cropping) */}
            <div className="relative w-full aspect-[16/9] bg-black flex items-center justify-center overflow-hidden">
              <video
                key={selectedChokingVideo}
                src={selectedChokingVideo === 'A' ? '/videos/A.mp4' : '/videos/B.mp4'}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain pointer-events-none"
                onError={(e) => {
                  const vid = e.currentTarget as HTMLVideoElement;
                  if (!vid.src.includes('/A.mp4') && !vid.src.includes('/B.mp4')) return;
                  // Try root fallback once if /videos/ path fails
                  vid.src = selectedChokingVideo === 'A' ? '/A.mp4' : '/B.mp4';
                }}
              />
            </div>
          </div>
        )}

        {scenario.id === 'burns' ? (
          <div className="mb-5">
            <BurnSlideshow isCompact />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md ring-1 ring-gray-100 dark:ring-slate-800 overflow-hidden mb-5 transition-colors">
            {/* Step header */}
          <div className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm font-black text-blue-600 dark:text-blue-400 tracking-wide uppercase">
              STEP {step.stepNumber} <span className="text-blue-300 dark:text-blue-700 font-semibold px-1">/</span> {steps.length}
            </span>
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep ? 'w-6 bg-blue-600 dark:bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.5)]' : i < currentStep ? 'w-2 bg-blue-300 dark:bg-blue-800' : 'w-2 bg-gray-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="px-5 py-5 space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-slate-50 tracking-tight leading-tight">{step.instruction}</h3>
            <p className="text-gray-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-medium">{step.detail}</p>
            {step.criticalWarning && (
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-xl p-4 shadow-sm">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-amber-900 dark:text-amber-100 text-sm font-bold tracking-wide uppercase mb-0.5">Critical Warning</p>
                  <p className="text-amber-800 dark:text-amber-200/90 text-sm font-semibold leading-snug">{step.criticalWarning}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-5 pb-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {isLast ? (
              <button
                onClick={() => navigate(ROUTES.firstAid)}
                className="px-5 py-2 bg-green-600 hover:bg-green-500 dark:bg-green-700 dark:hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors"
              >
                ✓ Finish
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="flex items-center gap-1 px-5 py-2 bg-blue-600 hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        )}

        {/* ── Do's & Don'ts ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md ring-1 ring-gray-100 dark:ring-slate-800 overflow-hidden mb-5 transition-colors">
          <div className="flex border-b border-gray-100 dark:border-slate-800">
            <button
              onClick={() => setShowDos(true)}
              className={`flex-1 py-3 text-xs sm:text-sm font-black tracking-wider text-center transition-colors uppercase ${
                showDos ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-b-2 border-green-600 dark:border-green-500' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 bg-gray-50/50 dark:bg-slate-900/50'
              }`}
            >
              DO
            </button>
            <button
              onClick={() => setShowDos(false)}
              className={`flex-1 py-3 text-xs sm:text-sm font-black tracking-wider text-center transition-colors uppercase ${
                !showDos ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-b-2 border-red-600 dark:border-red-500' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 bg-gray-50/50 dark:bg-slate-900/50'
              }`}
            >
              DON&apos;T
            </button>
          </div>
          <ul className="px-5 py-5 space-y-3">
            {(showDos ? scenario.dos : scenario.donts).map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3">
                {showDos ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Action buttons ── */}
        <div className="space-y-2.5">
          {scenario.hasArGuide && (
            <button
              onClick={() => navigate(scenario.arRoute ?? arFirstAidPath(scenario.id))}
              className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 dark:bg-purple-700 dark:hover:bg-purple-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-purple-600/20 dark:shadow-purple-900/40 transition-all active:scale-[0.98]"
            >
              <Shield className="h-4 w-4" />
              Open Live AR Guidance
            </button>
          )}
          <button
            onClick={() => navigate(ROUTES.firstAid)}
            className="w-full text-sm font-medium text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 py-2 transition-colors"
          >
            ← Back to Library
          </button>
        </div>
      </main>
    </div>
  );
};

export default FirstAidDetail;
