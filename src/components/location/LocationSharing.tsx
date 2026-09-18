import { useState } from 'react';

interface LocationSharingProps {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  };
  onShare: () => void;
  demoMode: boolean;
  className?: string;
}

export const LocationSharing = ({ location, onShare, demoMode, className = '' }: LocationSharingProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [shareMethod, setShareMethod] = useState<'sms' | 'webshare' | 'clipboard' | null>(null);

  const handleShare = async () => {
    if (!location) return;
    setIsSharing(true);
    setShareStatus('idle');
    setShareMethod(null);

    const message = `EMERGENCY ASSISTANCE REQUEST\n\nSituation: Possible medical emergency\nCoordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\nTimestamp: ${new Date(location.timestamp).toLocaleString()}`;

    // Try SMS URI first
    try {
      const smsUri = `sms:?body=${encodeURIComponent(message)}`;
      const win = window.open(smsUri, '_blank');
      if (win) {
        // Browser allowed it to open
        setShareMethod('sms');
        setShareStatus('success');
        // Note: We cannot know if the user actually sent the SMS, but we assume they will.
        // We'll still call the onShare callback to allow the parent to know sharing was attempted.
        onShare();
        setIsSharing(false);
        return;
      } else {
        throw new Error('Failed to open SMS URI');
      }
    } catch (smsError) {
      console.warn('SMS URI failed, falling back to Web Share API or clipboard:', smsError);
    }

    // Fallback to Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Assistance Request',
          text: message,
        });
        setShareMethod('webshare');
        setShareStatus('success');
        onShare();
        setIsSharing(false);
        return;
      } catch (shareError) {
        console.warn('Web Share API failed, falling back to clipboard:', shareError);
      }
    }

    // Final fallback to clipboard
    try {
      await navigator.clipboard.writeText(message);
      setShareMethod('clipboard');
      setShareStatus('success');
      alert('Location details copied to clipboard. You can now share this information with emergency services.');
      onShare();
      setIsSharing(false);
    } catch (clipboardError) {
      console.error('Error copying to clipboard:', clipboardError);
      setShareStatus('error');
      setIsSharing(false);
      alert('Failed to share location. Please try again or manually copy the information.');
    }
  };

  const getStatusText = () => {
    if (shareStatus === 'success') return 'Shared successfully!';
    if (shareStatus === 'error') return 'Failed to share';
    return isSharing ? 'Sharing...' : 'Share Location';
  };

  const getStatusColor = () => {
    if (shareStatus === 'success') return 'text-green-600';
    if (shareStatus === 'error') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        SHARE LOCATION
      </h2>

      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Share your location with emergency services or contacts.
        </p>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM9 10a1 1 0 112 0v4a1 1 0 11-2 0v-4zm6 0a1 1 0 112 0v4a1 1 0 11-2 0v-4zm1-9a6 6 0 100-12 6 6 0 000 12z" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-gray-800 font-medium">Emergency Assistance Request</div>
                <div className="text-gray-600 text-sm">
                  Situation: Possible medical emergency<br />
                  Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}<br />
                  Timestamp: ${new Date(location.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className={`w-full items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${getStatusColor()}`}
          >
            {isSharing ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9c0 4.411 2.612 8.124 6 10.662a9.028 9.028 0 004.257 2.189" />
                </svg>
                Sharing via {shareMethod === 'sms' ? 'SMS' : shareMethod === 'webshare' ? 'Web Share' : 'Clipboard'}...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Share Location
              </>
            )}
          </button>

          {shareStatus !== 'idle' && (
            <p className={`mt-2 text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          )}
        </div>

        {demoMode && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Note: In demo mode, this simulates location sharing. In a real app, this would use the device's location services and sharing capabilities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};