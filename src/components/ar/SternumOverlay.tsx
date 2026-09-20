import React from 'react';
import { Hand, ChevronDown } from 'lucide-react';

interface SternumOverlayProps {
  targetX?: number;
  targetY?: number;
}

export const SternumOverlay: React.FC<SternumOverlayProps> = ({ targetX, targetY }) => {
  // Determine positioning: prefer normalized/centered percent on mobile viewports
  const posX = targetX ? `${targetX}px` : '50%';
  const posY = targetY ? `${targetY}px` : '46%';

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 flex flex-col items-center"
      style={{ left: posX, top: posY }}
    >
      {/* Downward Compressing Guidance Arrow */}
      <ChevronDown className="w-9 h-9 text-red-500 animate-bounce drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"/>

      {/* Outer Pulsing Target Ring */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-40" />
        <div className="absolute inset-2 rounded-full border-4 border-dashed border-red-500 bg-red-600/20 backdrop-blur-xs flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.7)]">
          {/* Interlocked Rescuer Hands Icon */}
          <div className="relative flex items-center justify-center">
            <Hand className="w-12 h-12 text-white drop-shadow-lg -rotate-12"/>
            <Hand className="w-12 h-12 text-amber-200 drop-shadow-lg rotate-12 absolute -top-1 -left-1 opacity-90"/>
          </div>
        </div>
      </div>

      {/* Sternum Anatomical Label */}
      <span className="mt-2 text-[11px] font-black uppercase tracking-wider text-white bg-red-600 px-3 py-1 rounded-full shadow-xl border border-white/20">
        COMPRESS STERNUM HERE
      </span>
    </div>
  );
};
export default SternumOverlay;
