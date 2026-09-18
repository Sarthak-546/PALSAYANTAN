import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmergencySession } from '../contexts/EmergencySessionContext';
import { Button } from '../components/ui/Button';
import { CameraViewport } from '../components/camera/CameraViewport';
import { AROverlay } from '../components/ar/AROverlay';
import { InstructionOverlay } from '../components/ar/InstructionOverlay';
import { ProgressIndicator } from '../components/ar/ProgressIndicator';
import { ChestTarget } from '../components/ar/ChestTarget';
import { emergencyScenarios } from '../data/emergencyScenarios';

export const ArFirstAid = () => {
  const { scenario } = useParams<{ scenario: string }>();
  const navigate = useNavigate();
  const { demoMode, voiceGuidance, setVoiceGuidance } = useEmergencySession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGuidanceActive, setIsGuidanceActive] = useState(false);
  const [trackingState, setTrackingState] = useState('SEARCHING_FOR_TARGET');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Find the current scenario
  const currentScenario = emergencyScenarios.find(s => s.id === scenario) || emergencyScenarios[0];
  const totalSteps = currentScenario?.steps.length || 0;

  useEffect(() => {
    // Start guidance when component mounts
    setIsGuidanceActive(true);

    // Simulate AR tracking
    const trackingInterval = setInterval(() => {
      if (trackingState === 'SEARCHING_FOR_TARGET') {
        setTrackingState('LOCKED');
      }
    }, 2000);

    return () => {
      clearInterval(trackingInterval);
    };
  }, []);

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      // Reset tracking state for next step
      setTrackingState('SEARCHING_FOR_TARGET');

      // Play audio guidance for next step if enabled
      // Audio guidance functionality removed - AudioGuidance component deleted
    } else {
      // Guidance completed
      setIsGuidanceActive(false);
      navigate('/emergency-detected'); // Return to emergency screen or show completion
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setTrackingState('SEARCHING_FOR_TARGET');

      // Play audio guidance for previous step if enabled
      // Audio guidance functionality removed - AudioGuidance component deleted
    }
  };

  const handleExitGuidance = () => {
    navigate('/emergency-detected');
  };

  const handleToggleVoiceGuidance = () => {
    setVoiceGuidance(!voiceGuidance);
  };

  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Scenario Not Found</h1>
        <p className="text-gray-300 mb-6">The requested emergency scenario could not be loaded.</p>
        <Button onClick={() => navigate('/emergency-detected')} variant="outline">
          Return to Emergency
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative">
        {/* Camera Viewport */}
        <div className="absolute inset-0">
          <CameraViewport
            videoRef={videoRef}
            className="object-cover w-full h-full"
          />

          {/* AR Overlay */}
          <AROverlay
            trackingState={trackingState}
            demoMode={demoMode}
          />

          {/* Chest Target */}
          <ChestTarget
            trackingState={trackingState}
          />

          {/* Directional Arrows (would be part of AROverlay in full implementation) */}
          {trackingState === 'LOCKED' && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                {/* Animated arrows pointing to chest area */}
                <path
                  d="M50 20 L50 40"
                  stroke="red"
                  strokeWidth="2"
                  fill="none"
                  marker-end="url(#arrowhead)"
                >
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0 -10"
                    to="0 10"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </path>
                <path
                  d="M50 60 L50 80"
                  stroke="red"
                  strokeWidth="2"
                  fill="none"
                  marker-end="url(#arrowhead)"
                >
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0 10"
                    to="0 -10"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </path>
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7"
                    refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="red" />
                  </marker>
                </defs>
              </svg>
            </div>
          )}

          {/* Instruction Overlay */}
          <InstructionOverlay
            step={currentStep + 1}
            totalSteps={totalSteps}
            instruction={currentScenario?.steps[currentStep]?.instruction || ''}
            scenarioTitle={currentScenario.title}
          />

          {/* Progress Indicator */}
          <ProgressIndicator
            currentStep={currentStep + 1}
            totalSteps={totalSteps}
          />
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              className="px-4 py-2"
            >
              PREVIOUS
            </Button>
          )}
          {currentStep < totalSteps - 1 && (
            <Button
              variant="primary"
              onClick={handleNextStep}
              className="px-4 py-2"
            >
              NEXT
            </Button>
          )}
          {!isGuidanceActive && (
            <Button
              variant="secondary"
              onClick={handleExitGuidance}
              className="px-4 py-2"
            >
              EXIT
            </Button>
          )}
          <Button
            variant={voiceGuidance ? 'outline' : 'secondary'}
            onClick={handleToggleVoiceGuidance}
            className="px-4 py-2"
          >
            {voiceGuidance ? 'VOICE ON' : 'VOICE OFF'}
          </Button>
        </div>
      </div>
    </div>
  );
};