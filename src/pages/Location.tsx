import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergencySession } from '../contexts/EmergencySessionContext';
import { Button } from '../components/ui/Button';
import { LocationPanel } from '../components/location/LocationPanel';
import { LocationSharing } from '../components/location/LocationSharing';

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
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleGetLocation = () => {
    getCurrentLocation();
  };

  const handleShareLocation = () => {
    if (!currentLocation) {
      alert('Please get your current location first');
      return;
    }

    // In a real app, this would use the Web Share API
    // For demo, we'll show a simulated sharing experience
    const shareMessage = `EMERGENCY ASSISTANCE REQUEST\n\nSituation: Possible medical emergency\nCoordinates: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}\nTimestamp: ${new Date(currentLocation.timestamp).toLocaleString()}`;

    // Try to use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Emergency Assistance Request',
        text: shareMessage,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareMessage).then(() => {
          alert('Location details copied to clipboard. You can now share this information with emergency services.');
        });
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareMessage).then(() => {
        alert('Location details copied to clipboard. You can now share this information with emergency services.');
      });
    }
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
          <Button
            variant="outline"
            onClick={handleNavigateHome}
            className="text-sm"
          >
            Home
          </Button>
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