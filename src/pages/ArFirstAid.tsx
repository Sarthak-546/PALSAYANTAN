import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEmergencySession } from '../contexts/EmergencySessionContext';
import { Button } from '../components/ui/Button';
import { AROverlay } from '../components/ar/AROverlay';
import { InstructionOverlay } from '../components/ar/InstructionOverlay';
import { ProgressIndicator } from '../components/ar/ProgressIndicator';
import { SternumOverlay } from '../components/ar/SternumOverlay';
import { AudioGuidance } from '../components/ar/AudioGuidance';
import { useScenario } from '../hooks/useScenario';
import { useElementSize, mapNormalizedToCover } from '../hooks/useElementSize';
import { ROUTES } from '../routes';
import { PoseDetectionCamera } from '../components/camera/PoseDetectionCamera';
import { useCPRTracker } from '../utils/cprTracker';

type Tracking = 'SEARCHING_FOR_TARGET' | 'LOCKED';

export const ArFirstAid = () => {
  const navigate = useNavigate();
  const { demoMode, voiceGuidance, setVoiceGuidance } = useEmergencySession();

  // Works for /ar-first-aid?type=cpr, /ar-first-aid/cpr, and bare /ar-first-aid (defaults to CPR)
  const { scenario } = useScenario('cpr');

  const [currentStep, setCurrentStep] = useState(0);
  const [trackingState, setTrackingState] = useState<Tracking>('SEARCHING_FOR_TARGET');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const size = useElementSize(containerRef);
  const handleCameraError = useCallback((m: string) => setCameraError(m), []);

  const { feedback: cprFeedback, updateTracker, resetTracker } = useCPRTracker();

  const scenarioId = scenario?.id;
  const totalSteps = scenario?.steps.length ?? 0;

  useEffect(() => {
    setCurrentStep(0);
  }, [scenarioId]);

  // Simulated AR tracking: re-acquire the target on every step.
  useEffect(() => {
    setTrackingState('SEARCHING_FOR_TARGET');
    const t = window.setTimeout(() => setTrackingState('LOCKED'), 1500);
    return () => window.clearTimeout(t);
  }, [scenarioId, currentStep]);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Scenario Not Found</h1>
        <p className="text-gray-300 mb-6">The requested emergency scenario could not be loaded.</p>
        <Button onClick={() => navigate(ROUTES.home)} variant="outline" className="bg-white">
          Back to Home
        </Button>
      </div>
    );
  }

  const step = scenario.steps[currentStep];
  const isLast = currentStep === totalSteps - 1;
  const target =
    size.width > 0 ? mapNormalizedToCover(0.5, 0.4, size, videoRef.current) : null;

  return (
    <div className="relative w-full overflow-hidden bg-gray-900" style={{ height: '100dvh' }}>
      <AudioGuidance text={step.audioText ?? step.instruction} isActive={voiceGuidance} />

      {/* CPR Feedback Display (only for CPR scenario) */}
      {scenario.id === 'cpr' && trackingState === 'LOCKED' && (
        <div className="absolute top-20 left-4 right-4 z-50 flex flex-col items-center gap-2 text-sm text-green-400">
          {cprFeedback.compressionsPerMinute !== null && (
            <div className="font-mono">
              BPM: {cprFeedback.compressionsPerMinute}
              {cprFeedback.compressionQuality === 'TOO_FAST' && ' ⚡'}
              {cprFeedback.compressionQuality === 'TOO_SLOW' && ' 🐢'}
              {cprFeedback.compressionQuality === 'INSUFFICIENT_RECOIL' && ' ↩️'}
              {cprFeedback.compressionQuality === 'GOOD' && ' ✅'}
            </div>
          )}
          {cprFeedback.elbowAngleFeedback === 'LOCK_ELBOWS' && (
            <div>💪 Lock elbows</div>
          )}
          {cprFeedback.voiceFeedback && (
            <div className="italic text-amber-300">
              "{cprFeedback.voiceFeedback}"
            </div>
          )}
        </div>
      )}

      {/* Camera + AR layer */}
      <div ref={containerRef} className="absolute inset-0">
        <PoseDetectionCamera
          videoRef={videoRef}
          onPoseDetected={updateTracker}
          onError={handleCameraError}
          className="absolute inset-0"
        />
        <AROverlay trackingState={trackingState} demoMode={demoMode} />

        {scenario.id === 'cpr' && trackingState === 'LOCKED' && target && (
          <SternumOverlay targetX={target.x} targetY={target.y} />
        )}

        <InstructionOverlay
          step={currentStep + 1}
          totalSteps={totalSteps}
          instruction={step.instruction}
          scenarioTitle={scenario.title}
          className="!bottom-28"
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => navigate(ROUTES.home)} className="flex items-center space-x-2 text-gray-200 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          <span>Exit</span>
        </button>
        <ProgressIndicator currentStep={currentStep + 1} totalSteps={totalSteps} />
      </div>

      {cameraError && (
        <div className="absolute top-16 left-4 right-4 z-50 rounded-lg bg-amber-900/80 border border-amber-500 p-3 text-sm text-amber-100">
          {cameraError}. Step-by-step guidance still works.
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-center gap-3 p-4 bg-gradient-to-t from-black/85 to-transparent">
        {currentStep > 0 && (
          <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)} className="px-4 bg-white">
            PREVIOUS
          </Button>
        )}
        {isLast ? (
          <Button variant="primary" onClick={() => navigate(ROUTES.home)} className="px-4">
            FINISH
          </Button>
        ) : (
          <Button variant="primary" onClick={() => setCurrentStep((s) => s + 1)} className="px-4">
            NEXT
          </Button>
        )}
        <Button
          variant={voiceGuidance ? 'outline' : 'secondary'}
          onClick={() => setVoiceGuidance(!voiceGuidance)}
          className={`px-4 ${voiceGuidance ? 'bg-white' : ''}`}
        >
          {voiceGuidance ? 'VOICE ON' : 'VOICE OFF'}
        </Button>
      </div>
    </div>
  );
};

export default ArFirstAid;
