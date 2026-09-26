import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergencySession } from '../contexts/EmergencySessionContext';
import { Button } from '../components/ui/Button';
import { LocationPanel } from '../components/location/LocationPanel';
import { LocationSharing } from '../components/location/LocationSharing';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { Phone } from 'lucide-react';

export const Location = () => {
  const navigate = useNavigate();
  const { demoMode, setDemoMode } = useEmergencySession();
  const [isFetching, setIsFetching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    // Get initial location on mount
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsFetching(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setIsFetching(false);
      },
      (error) => {
        let errorMessage = 'Unknown error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
            break;
        }
        setLocationError(errorMessage);
        setIsFetching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  };

  const handleGetLocation = () => {
    getCurrentLocation();
  };

  const handleShareLocation = () => {
    if (!currentLocation) {
      // Provide fallback message when GPS is unavailable
      const mapsUrl = `https://maps.google.com/?q=0,0`;
      const message = `EMERGENCY: Immediate medical assistance required! Location: ${mapsUrl} (Lat: 0.000000, Long: 0.000000)`;
      const smsUri = `sms:112?&body=${encodeURIComponent(message)}`;
      window.location.href = smsUri;
      return;
    }

    // Format payload for cross-platform cellular SMS URI standard
    const mapsUrl = `https://maps.google.com/?q=${currentLocation.latitude.toFixed(6)},${currentLocation.longitude.toFixed(6)}`;
    const message = `EMERGENCY: Immediate medical assistance required! Location: ${mapsUrl} (Lat: ${currentLocation.latitude.toFixed(6)}, Long: ${currentLocation.longitude.toFixed(6)})`;
    const smsUri = `sms:112?&body=${encodeURIComponent(message)}`;

    // Wire the primary "Share Location" button directly to SMS URI
    window.location.href = smsUri;
  };

  const handleUseDemoLocation = () => {
    // Use a demo location (e.g., coordinates for a known location)
    setCurrentLocation({
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 15,
      timestamp: Date.now(),
    });
    setLocationError(null);
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            LOCATION SHARING
          </h1>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher className="ml-3" />
            <Button
              variant="outline"
              onClick={handleNavigateHome}
              className="text-sm"
            >
              Home
            </Button>
          </div>
        </div>

        {/* Location Status */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            LOCATION
          </h2>

          {locationError && (
            <div className="bg-red-50 border-l-4 border-red-200 p-4 mb-4">
              <p className="text-red-700">
                {locationError}
              </p>
              {demoMode && (
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleUseDemoLocation}
                  className="mt-2"
                >
                  USE DEMO LOCATION
                </Button>
              )}
            </div>
          )}

          {!locationError && !isFetching && !currentLocation && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Tap the button below to get your current location.
              </p>
            </div>
          )}

          {isFetching && !currentLocation && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Requesting location...</span>
              </div>
            </div>
          )}

          {currentLocation && !locationError && (
            <div className="space-y-4">
              {/* Offline Telemetry UI */}
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
                  Offline Location Fix
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Latitude:</span>
                    <span className="font-mono text-gray-800 dark:text-slate-200">
                      {currentLocation.latitude.toFixed(6)}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Longitude:</span>
                    <span className="font-mono text-gray-800 dark:text-slate-200">
                      {currentLocation.longitude.toFixed(6)}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-slate-400">Accuracy:</span>
                    <span className="text-gray-800 dark:text-slate-200">
                      {Math.round(currentLocation.accuracy)} meters
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Dial Buttons */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
                  Emergency Contacts
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href="tel:112"
                    className="flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    <span>National Emergency (112)</span>
                  </a>
                  <a
                    href="tel:108"
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    <span>Ambulance (108)</span>
                  </a>
                </div>
              </div>

              {/* Coordinate Display (existing) */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Latitude:</div>
                  <div className="font-mono text-gray-800">
                    {currentLocation.latitude.toFixed(6)}°
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Longitude:</div>
                  <div className="font-mono text-gray-800">
                    {currentLocation.longitude.toFixed(6)}°
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Accuracy:</div>
                  <div className="text-gray-800">
                    {Math.round(currentLocation.accuracy)} meters
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Timestamp:</div>
                  <div className="text-gray-800 text-sm">
                    {new Date(currentLocation.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Location Sharing Section */}
        {currentLocation && !locationError && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <LocationSharing
              location={currentLocation}
              onShare={handleShareLocation}
              demoMode={demoMode}
            />
          </div>
        )}

        {/* Action Buttons */}
        {!locationError && (
          <div className="mt-8">
            {(!isFetching && !currentLocation) && (
              <Button
                variant="primary"
                onClick={handleGetLocation}
                className="w-full mb-4"
              >
                GET CURRENT LOCATION
              </Button>
            )}

            {currentLocation && (
              <Button
                variant="outline"
                onClick={handleShareLocation}
                className="w-full"
              >
                SHARE LOCATION
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};