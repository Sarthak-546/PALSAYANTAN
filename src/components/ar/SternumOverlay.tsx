import React, { useEffect } from 'react';

interface SternumOverlayProps {
  targetX: number; // horizontal position in pixels
  targetY: number; // vertical position in pixels
  mode?: 'cpr' | 'bleeding'; // what graphical elements to show
}

export const SternumOverlay: React.FC<SternumOverlayProps> = ({ targetX, targetY, mode = 'cpr' }) => {
  useEffect(() => {
    // Inject strictly scoped keyframes to prevent overriding Tailwind defaults
    if (!document.getElementById('cpr-hand-styles')) {
      const style = document.createElement('style');
      style.id = 'cpr-hand-styles';
      // 110 BPM = ~0.545 seconds per beat cycle
      style.textContent = `
        @keyframes cprPump {
          0%, 100% { transform: translate(-50%, -50%) scale(1) translateY(0); }
          50% { transform: translate(-50%, -50%) scale(0.92) translateY(18px); }
        }
        @keyframes expandRing {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 1; border-width: 6px; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; border-width: 1px; }
        }
        @keyframes pulseAlert {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Prevent rendering at 0,0 if computer vision coordinates haven't populated yet
  if (!targetX || !targetY || isNaN(targetX) || isNaN(targetY)) return null;

  return (
    <div
      className="pointer-events-none absolute z-50"
      style={{
        left: targetX,
        top: targetY,
        width: 112,
        height: 112,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {mode === 'cpr' ? (
        <>
          {/* Visual Metronome Ring synced to 110 BPM */}
          <div 
            className="absolute left-1/2 top-1/2 rounded-full border-red-500"
            style={{
              width: '100px',
              height: '100px',
              animation: 'expandRing 0.545s infinite cubic-bezier(0.1, 0.0, 0.3, 1)'
            }} 
          />

          {/* Animated CPR Hand Image */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              animation: 'cprPump 0.545s infinite ease-in-out',
            }}
          >
            <img
              src="/images/hand.png"
              alt="CPR Hand Placement"
              className="w-24 h-24 object-contain pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/hand.png';
              }}
            />
          </div>
          
          {/* High-visibility Action Badge */}
          <div 
            className="absolute top-full left-1/2 mt-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-red-600 px-4 py-1.5 text-[11px] font-black tracking-widest text-white shadow-lg border border-red-400"
          >
            PUSH TO BEAT
          </div>
        </>
      ) : (
        <>
          {/* Bleeding Target Overlay */}
          <div 
            className="absolute left-1/2 top-1/2 rounded-full border-2 border-amber-500 bg-amber-500/20"
            style={{
              width: '80px',
              height: '80px',
              animation: 'pulseAlert 1s infinite ease-in-out'
            }} 
          />
          <div 
            className="absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-600 px-3 py-1 text-[10px] font-bold tracking-widest text-white shadow-lg border border-amber-400"
          >
            APPLY PRESSURE
          </div>
        </>
      )}
    </div>
  );
};

export default SternumOverlay;
