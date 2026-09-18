import React from 'react';

interface ScanOverlayProps {
  isScanning: boolean;
  scanProgress: number;
}

export const ScanOverlay = ({ isScanning, scanProgress }: ScanOverlayProps) => {
  if (!isScanning) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="w-64 h-64 border-2 border-green-500 rounded-lg relative overflow-hidden">
        {/* Scanning laser line */}
        <div 
          className="absolute left-0 right-0 h-1 bg-green-400 shadow-[0_0_15px_#4ade80] transition-all duration-200"
          style={{ top: `${scanProgress}%` }}
        />
        {/* Semi-transparent fill */}
        <div 
          className="absolute top-0 left-0 right-0 bg-green-500/20 transition-all duration-200"
          style={{ height: `${scanProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ScanOverlay;