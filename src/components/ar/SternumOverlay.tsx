import React, { useEffect } from 'react';

interface SternumOverlayProps {
  targetX: number; // horizontal position in pixels
  targetY: number; // vertical position in pixels
}

export const SternumOverlay: React.FC<SternumOverlayProps> = ({ targetX, targetY }) => {
  useEffect(() => {
    // Insert styles for pulse animation and arrow only once
    if (!document.getElementById('sternum-overlay-styles')) {
      const style = document.createElement('style');
      style.id = 'sternum-overlay-styles';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes bounceDown {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, 8px); }
        }
        .sternum-overlay-circle {
          width: 24px;
          height: 24px;
          background-color: #ff0000;
          border-radius: 50%;
          position: absolute;
          animation: pulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.8);
        }
        .sternum-overlay-arrow {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 16px solid #ff0000;
          position: absolute;
          top: 32px; /* positions arrow below the circle */
          left: 50%;
          transform: translateX(-50%);
          animation: bounceDown 1.5s ease-in-out infinite;
          filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Prevent rendering at 0,0 if coordinates haven't populated yet
  if (!targetX || !targetY || isNaN(targetX) || isNaN(targetY)) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: targetX - 12, // adjust to center the 24px circle
        top: targetY - 12,  
        pointerEvents: 'none', 
        zIndex: 50 
      }}
    >
      <div className="sternum-overlay-circle" />
      <div className="sternum-overlay-arrow" />
    </div>
  );
};

export default SternumOverlay;