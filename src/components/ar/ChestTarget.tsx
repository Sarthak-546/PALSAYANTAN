import React, { useState } from 'react';

interface ChestTargetProps {
  trackingState: 'SEARCHING_FOR_TARGET' | 'LOCKED';
  className?: string;
}

export const ChestTarget = ({ trackingState, className = '' }: ChestTargetProps) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Chest target outline */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 border-2 border-red-400/50 rounded-full" />
        <div className="absolute inset-0 border-2 border-red-400/30 rounded-full" />
        <div className="absolute inset-0 border-2 border-red-400/20 rounded-full" />
      </div>

      {/* Pulsing dot when locked */}
      {trackingState === 'LOCKED' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-red-500/50 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};