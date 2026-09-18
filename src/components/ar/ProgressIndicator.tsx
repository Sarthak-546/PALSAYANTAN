import { useState } from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressIndicator = ({ currentStep, totalSteps, className = '' }: ProgressIndicatorProps) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={`relative w-32 h-2 bg-gray-200 rounded-full ${className}`}>
      <div
        className="absolute inset-0 bg-blue-600 rounded-full"
        style={{ width: `${progressPercentage}%` }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xs text-gray-600">
          {currentStep}/{totalSteps}
        </span>
      </div>
    </div>
  );
};