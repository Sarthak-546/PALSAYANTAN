import React from "react";

interface TrackingTargetProps {
  className?: string;
}

export const TrackingTarget = ({ className = '' }: TrackingTargetProps) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Pulsing target rings */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 border-2 border-red-400/50 rounded-full animate-pulse duration-2000 infinite" />
        <div className="absolute inset-0 border-2 border-red-400/30 rounded-full animate-pulse duration-3000 infinite delay-500" />
        <div className="absolute inset-0 border-2 border-red-400/20 rounded-full animate-pulse duration-4000 infinite delay-1000" />
      </div>

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-red-500 rounded-full" />
      </div>
    </div>
  );
};