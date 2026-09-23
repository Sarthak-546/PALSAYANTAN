import React, { useEffect } from 'react';

interface SternumOverlayProps {
  targetX?: number; // horizontal position in pixels
  targetY?: number; // vertical position in pixels
}

export const SternumOverlay: React.FC<SternumOverlayProps> = ({ targetX, targetY }) => {
  useEffect(() => {
    // Inject custom heartbeat animation locked to 110 BPM (approx 0.545s per beat)
    if (!document.getElementById('cpr-heartbeat-anim')) {
      const style = document.createElement('style');
      style.id = 'cpr-heartbeat-anim';
      style.textContent = `
        @keyframes heartbeatCPR {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const posX = targetX ? `${targetX}px` : '50%';
  const posY = targetY ? `${targetY}px` : '55%';

  return (
    <img
      src="/hand.png"
      alt="CPR Hand Placement"
      style={{
        position: 'absolute',
        left: posX,
        top: posY,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 50,
        width: 'clamp(90px, 25vw, 120px)',
        animation: 'heartbeatCPR 0.545s infinite ease-in-out',
        filter: 'drop-shadow(0px 8px 16px rgba(220, 38, 38, 0.7))'
      }}
      onError={(e) => {
        (e.target as HTMLImageElement).src = '/images/hand.png';
      }}
    />
  );
};

export default SternumOverlay;
