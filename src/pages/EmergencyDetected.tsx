import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergencySession } from '../contexts/EmergencySessionContext';
import { Button } from '../components/ui/Button';
import { EmergencyTimer } from '../components/emergency/EmergencyTimer';
import { LocationSharing } from '../components/location/LocationSharing';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';

export const EmergencyDetected = () => {
  const navigate = useNavigate();
  const { demoMode, setDemoMode, voiceGuidance, setVoiceGuidance } = useEmergencySession();
  const [isCalling, setIsCalling] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [emergencyTimer, setEmergencyTimer] = useState(0);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(voiceGuidance);

  useEffect(() => {
    const timer = setInterval(() => {
      setEmergencyTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCallEmergency = () => {
    setIsCalling(true);
    // Simulate call initiation
    setTimeout(() => {
      alert('Emergency services called. (Demo: In a real app, this would initiate a call)');
      setIsCalling(false);
    }, 1500);
  };

  const handleStartFirstAid = () => {
    navigate('/ar-first-aid/cpr');
  };

  const handleShareLocation = () => {
    setIsSharingLocation(true);
    // Simulate location sharing
    setTimeout(() => {
      alert('Location shared via available method. (Demo: In a real app, this would use the Web Share API)');
      setIsSharingLocation(false);
    }, 1500);
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4">
                <h1 className="text-3xl font-bold text-red-400 mb-2">
                  POSSIBLE MEDICAL EMERGENCY
                </h1>
                <LanguageSwitcher className="ml-4" />
              </div>
              <p className="text-gray-300 text-lg max-w-md mx-auto">
                The prototype assessment indicates that immediate assistance may be required.
              </p>
            </div>

            {/* AI Assessment Info */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h2 className="text-xl font-semibold text-gray-100 mb-3">
                AI ASSESSMENT
              </h2>
              <p className="text-gray-400 text-sm mb-2">Prototype Simulation</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Scenario:</div>
                  <div className="text-gray-200">Possible cardiac emergency</div>
                </div>
                <div>
                  <div className="text-gray-500">Confidence:</div>
                  <div className="text-gray-200">Demo result</div>
                </div>
              </div>
              <p className="mt-3 text-gray-400 text-sm">
                Do not represent this as a clinically validated diagnosis.
              </p>
            </div>

            {/* Emergency Actions */}
            <div className="space-y-4">
              <Button
                variant="destructive"
                size="large"
                onClick={handleCallEmergency}
                disabled={isCalling}
                className="w-full"
              >
                {isCalling ? 'Calling...' : 'CALL EMERGENCY SERVICES'}
              </Button>
              <Button
                variant="primary"
                size="large"
                onClick={handleStartFirstAid}
                className="w-full"
              >
                START FIRST-AID GUIDANCE
              </Button>
              <Button
                variant="outline"
                size="large"
                onClick={handleShareLocation}
                disabled={isSharingLocation}
                className="w-full"
              >
                {isSharingLocation ? 'Sharing...' : 'SHARE LOCATION'}
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="space-y-3">
              <Button
                variant="link"
                onClick={handleCancel}
                className="w-full text-sm"
              >
                CANCEL / RETURN TO ASSESSMENT
              </Button>
            </div>
          </div>
        </div>

        {/* Side Panel with Timer and Voice Guidance */}
        <div className="w-64 bg-gray-800/50 backdrop-blur-sm border-l-2 border-gray-700 flex flex-col items-center p-6">
          <EmergencyTimer timeInSeconds={emergencyTimer} />
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              VOICE GUIDANCE
            </h2>
            <Button
              variant={voiceGuidanceEnabled ? 'outline' : 'secondary'}
              size="medium"
              onClick={() => setVoiceGuidanceEnabled(!voiceGuidanceEnabled)}
              className="w-full"
            >
              {voiceGuidanceEnabled ? 'VOICE GUIDANCE ON' : 'VOICE GUIDANCE OFF'}
            </Button>
            {voiceGuidanceEnabled && (
              <p className="mt-2 text-gray-400 text-sm text-center">
                Audio guidance will provide step-by-step instructions.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};