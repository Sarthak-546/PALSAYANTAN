import React, { useState } from 'react';

export const EmergencyActionPanel = ({ onEmergencyDetected }: { onEmergencyDetected?: () => void }) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const triggerEmergencySms = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    // Fallback if device has no GPS capability
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by browser.');
      setIsGettingLocation(false);
      if (onEmergencyDetected) onEmergencyDetected();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // Format the offline SMS trigger
        const smsBody = `Medical Emergency at ${lat.toFixed(6)},${lon.toFixed(6)}`;
        const smsUri = `sms:112?body=${encodeURIComponent(smsBody)}`;
        
        // Launch the native SMS app
        window.location.href = smsUri;
        
        setIsGettingLocation(false);
        if (onEmergencyDetected) onEmergencyDetected();
      },
      (error) => {
        setLocationError(error.message || 'Unable to get GPS lock');
        setIsGettingLocation(false);
        if (onEmergencyDetected) onEmergencyDetected();
      },
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4">
      {locationError && (
        <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
          {locationError}
        </div>
      )}
      <button 
        onClick={triggerEmergencySms}
        disabled={isGettingLocation}
        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all flex items-center justify-center disabled:opacity-50"
      >
        <span>{isGettingLocation ? 'Acquiring GPS...' : 'SOS - Share Location & Alert 112'}</span>
      </button>
    </div>
  );
};