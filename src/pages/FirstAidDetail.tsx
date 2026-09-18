import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmergencySession } from '../contexts/EmergencySessionContext';
import { Button } from '../components/ui/Button';
import { ProgressIndicator } from '../components/ar/ProgressIndicator';
import { AudioGuidance } from '../components/ar/AudioGuidance';
import { emergencyScenarios } from '../data/emergencyScenarios';

export const FirstAidDetail = () => {
  const { scenario } = useParams<{ scenario: string }>();
  const navigate = useNavigate();
  const { voiceGuidance, setVoiceGuidance } = useEmergencySession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGuidanceActive, setIsGuidanceActive] = useState(false);
  const audioGuidanceRef = useRef<AudioGuidance>(null);

  // Find the current scenario
  const currentScenario = emergencyScenarios.find(s => s.id === scenario);

  useEffect(() => {
    // Initialize audio guidance if voice guidance is enabled
    if (voiceGuidance && audioGuidanceRef.current) {
      audioGuidanceRef.current.initialize();
    }

    // Start guidance when component mounts
    setIsGuidanceActive(true);

    // Speak the first step instruction if voice guidance is enabled
    if (voiceGuidance && audioGuidanceRef.current && currentScenario?.steps[0]) {
      audioGuidanceRef.current.speak(currentScenario.steps[0].audioText || currentScenario.steps[0].instruction);
    }

    return () => {
      if (audioGuidanceRef.current) {
        audioGuidanceRef.current.cleanup();
      }
    };
  }, [voiceGuidance]);

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);

      // Speak the previous step instruction if voice guidance is enabled
      if (voiceGuidance && audioGuidanceRef.current && currentScenario?.steps[currentStep - 1]) {
        audioGuidanceRef.current.speak(
          currentScenario.steps[currentStep - 1].audioText ||
          currentScenario.steps[currentStep - 1].instruction
        );
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep < (currentScenario?.steps.length || 0) - 1) {
      setCurrentStep(prev => prev + 1);

      // Speak the next step instruction if voice guidance is enabled
      if (voiceGuidance && audioGuidanceRef.current && currentScenario?.steps[currentStep + 1]) {
        audioGuidanceRef.current.speak(
          currentScenario.steps[currentStep + 1].audioText ||
          currentScenario.steps[currentStep + 1].instruction
        );
      }
    } else {
      // Guidance completed
      setIsGuidanceActive(false);
    }
  };

  const handleExitGuidance = () => {
    navigate('/first-aid');
  };

  const handleToggleVoiceGuidance = () => {
    setVoiceGuidance(!voiceGuidance);
    if (!voiceGuidance && audioGuidanceRef.current) {
      audioGuidanceRef.current.pause();
    } else if (voiceGuidance && audioGuidanceRef.current) {
      audioGuidanceRef.current.resume();
    }
  };

  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Scenario Not Found</h1>
        <p className="text-gray-600 mb-6">The requested emergency scenario could not be loaded.</p>
        <Button onClick={() => navigate('/first-aid')} variant="outline">
          Return to First Aid Library
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {currentScenario.title}
          </h1>
          <Button
            variant={voiceGuidance ? 'outline' : 'secondary'}
            size="medium"
            onClick={handleToggleVoiceGuidance}
            className="text-sm"
          >
            {voiceGuidance ? 'VOICE ON' : 'VOICE OFF'}
          </Button>
        </div>

        {/* Scenario Overview */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Situation Overview
          </h2>
          <p className="text-gray-700">
            {currentScenario.description}
          </p>
        </div>

        {/* Current Step Instructions */}
        {isGuidanceActive && currentScenario && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Step {currentStep + 1} of {currentScenario.steps.length}
              </h2>
              <ProgressIndicator
                currentStep={currentStep + 1}
                totalSteps={currentScenario.steps.length}
                className="flex-shrink-0"
              />
            </div>

            <div className="space-y-6">
              {/* Visual Indicator Placeholder */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-gray-400 text-lg">
                  {/* In a real implementation, this would show relevant visuals/animations */}
                  <div className="space-y-2">
                    <div className="text-gray-600 font-medium">Visual Guidance</div>
                    <div className="text-gray-400">
                      {currentScenario.steps[currentStep]?.visualType || 'Follow the illustrated steps'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instruction Text */}
              <div className="text-center">
                <p className="text-gray-800 text-lg font-medium mb-2">
                  {currentScenario.steps[currentStep]?.title || ''}
                </p>
                <p className="text-gray-600 text-lg">
                  {currentScenario.steps[currentStep]?.instruction || ''}
                </p>
              </div>

              {/* Audio indicator */}
              {voiceGuidance && currentScenario.steps[currentStep]?.audioText && (
                <div className="mt-4 flex items-center space-x-3 text-gray-500 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Audio guidance available</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                className="px-4 py-2"
              >
                PREVIOUS
              </Button>
            )}
            {isGuidanceActive && currentStep < (currentScenario?.steps.length || 0) - 1 && (
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
          </div>
        </div>
      </div>
    </div>
  );
};