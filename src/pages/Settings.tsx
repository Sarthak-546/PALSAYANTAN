import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergencySession } from '../contexts/EmergencySessionContext';
import { Button } from '../components/ui/Button';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';

export const Settings = () => {
  const navigate = useNavigate();
  const {
    demoMode,
    setDemoMode,
    voiceGuidance,
    setVoiceGuidance,
    setEmergencySession
  } = useEmergencySession();

  const [isSaving, setIsSaving] = useState(false);
  const [emergencyNumber, setEmergencyNumber] = useState('');

  useEffect(() => {
    // Load saved settings on mount
    const savedNumber = localStorage.getItem('emergencyNumber') || '911'; // Default to common emergency number
    setEmergencyNumber(savedNumber);
  }, []);

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Save emergency number to localStorage
    localStorage.setItem('emergencyNumber', emergencyNumber);

    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const handleResetToDefaults = () => {
    setEmergencyNumber('911');
    setDemoMode(false);
    setVoiceGuidance(true);
    localStorage.setItem('emergencyNumber', '911');
    localStorage.removeItem('emergencySession'); // Clear session data
    setEmergencySession(null);
    alert('Settings reset to defaults');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            SETTINGS
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="text-sm"
          >
            Home
          </Button>
        </div>

        {/* Demo Mode */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Demo Mode
              </h2>
              <p className="text-gray-600 text-sm">
                When enabled, AI results are simulated for demonstration purposes.
              </p>
            </div>
            <ToggleSwitch
              checked={demoMode}
              onChange={setDemoMode}
              className="ml-4"
            />
          </div>
        </div>

        {/* Voice Guidance */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Voice Guidance
              </h2>
              <p className="text-gray-600 text-sm">
                Audio instructions during emergency guidance.
              </p>
            </div>
            <ToggleSwitch
              checked={voiceGuidance}
              onChange={setVoiceGuidance}
              className="ml-4"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Emergency Contact
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Services Number
              </label>
              <input
                type="tel"
                placeholder="Enter emergency number (e.g., 911, 112, 999)"
                value={emergencyNumber}
                onChange={(e) => setEmergencyNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-gray-500 text-sm">
                This number will be used for emergency calls in the application.
              </p>
            </div>
          </div>
        </div>

        {/* About Prototype */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            About Prototype
          </h2>
          <p className="text-gray-700 mb-4">
            This application is a prototype demonstrating an emergency first-aid assistance workflow.
            AI assessment and AR guidance shown in this prototype are simulations and are not a
            substitute for professional medical diagnosis or emergency services.
          </p>
          <p className="text-gray-600 text-sm">
            For medical emergencies, always contact professional emergency services immediately.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={handleResetToDefaults}
            className="w-full mb-4"
          >
            RESET TO DEFAULTS
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'SAVE SETTINGS'}
          </Button>
        </div>
      </div>
    </div>
  );
};