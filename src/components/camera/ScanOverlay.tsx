import { useEffect, useState } from 'react';

interface ScanOverlayProps {
  isScanning: boolean;
  scanProgress: number;
  className?: string;
}

export const ScanOverlay = ({ isScanning, scanProgress, className = '' }: ScanOverlayProps) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Scanning corners */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-red-400"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-red-400"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-red-400"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-red-400"></div>
      </div>

      {/* Animated scan line */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none flex items-center">
          <div className="w-full h-0.5 bg-red-400/50"
               style={{ transform: `translateY(${scanProgress}%)` }}
               ></div>
        </div>
      )}

      {/* Target reticle */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-red-400 rounded-full"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-red-400/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Status text */}
      {isScanning && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center text-sm text-red-400">
          ASSESSING
        </div>
      )}

      {!isScanning && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center text-sm text-gray-400">
          Ready to scan
        </div>
      )}
    </div>
  );
};