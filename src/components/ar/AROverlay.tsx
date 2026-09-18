
interface AROverlayProps {
  trackingState: 'SEARCHING_FOR_TARGET' | 'LOCKED';
  demoMode: boolean;
  className?: string;
}

export const AROverlay = ({ trackingState, demoMode, className = '' }: AROverlayProps) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* AR Tracking indicators */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-3 text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${trackingState === 'LOCKED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-gray-300">
            {trackingState === 'LOCKED' ? 'TRACKING' : 'SEARCHING FOR TARGET'}
          </span>
        </div>

        {demoMode && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-300">DEMO MODE</span>
          </div>
        )}
      </div>

      {/* AR visual effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Pulsing effect when searching */}
        {trackingState === 'SEARCHING_FOR_TARGET' && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 border-2 border-red-400/50 rounded-lg animate-pulse" />
          </div>
        )}

        {/* Locked effect when tracking */}
        {trackingState === 'LOCKED' && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 border-2 border-red-400 rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};