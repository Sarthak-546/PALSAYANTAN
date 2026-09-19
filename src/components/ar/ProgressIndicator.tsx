import React from "react";
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressIndicator = ({ currentStep, totalSteps, className = '' }: ProgressIndicatorProps) => {
  // Guard: the old formula divided by (totalSteps - 1) -> NaN for a one-step scenario.
  const pct = totalSteps > 0 ? Math.min(100, (currentStep / totalSteps) * 100) : 0;

  return (
    <div className={`relative w-32 h-2 bg-gray-200 rounded-full ${className}`}>
      <div className="absolute inset-y-0 left-0 bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xs text-gray-600">
          {currentStep}/{totalSteps}
        </span>
      </div>
    </div>
  );
};
