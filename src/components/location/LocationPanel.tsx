import { useEffect, useState } from 'react';

interface LocationPanelProps {
  className?: string;
}

export const LocationPanel = ({ className = '' }: LocationPanelProps) => {
  const [locationStatus, setLocationStatus] = useState<{
    available: boolean;
    fetching: boolean;
    error: string | null;
  }>({
    available: false,
    fetching: false,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus({
        available: false,
        fetching: false,
        error: 'Geolocation is not supported by your browser',
      });
      return;
    }

    setLocationStatus(prev => ({ ...prev, fetching: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus({
          available: true,
          fetching: false,
          error: null,
        });
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
        setLocationStatus({
          available: false,
          fetching: false,
          error: errorMessage,
        });
      }
    );
  }, []);

  if (locationStatus.fetching) {
    return (
      <div className={`flex flex-col items-center py-4 ${className}`}>
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-sm text-gray-600">Requesting location...</p>
      </div>
    );
  }

  if (locationStatus.error) {
    return (
      <div className={`flex flex-col items-center py-4 text-center ${className}`}>
        <p className="text-red-600">{locationStatus.error}</p>
      </div>
    );
  }

  if (locationStatus.available) {
    return (
      <div className={`flex flex-col items-center py-4 ${className}`}>
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <p className="mt-2 text-sm text-gray-600">Location available</p>
      </div>
    );
  }

  // Default state - not available, not fetching
  return (
    <div className={`flex flex-col items-center py-4 ${className}`}>
      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 16.5a9 9 0 10-18 0 9 9 0 1018 0z"></path>
        </svg>
      </div>
      <p className="mt-2 text-sm text-gray-600">Location unavailable</p>
    </div>
  );
};