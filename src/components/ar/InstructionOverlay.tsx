import React from "react";

interface InstructionOverlayProps {
  step: number;
  totalSteps: number;
  instruction: string;
  scenarioTitle: string;
  className?: string;
}

export const InstructionOverlay = ({ step, totalSteps, instruction, scenarioTitle, className = '' }: InstructionOverlayProps) => {
  return (
    <div className={`absolute bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 ${className}`}>
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 py-3 text-center max-w-xs">
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span>{scenarioTitle}</span>
        </div>
        <div className="mt-2">
          <div className="text-sm text-gray-400">
            STEP {step} OF {totalSteps}
          </div>
          <div className="mt-1 text-lg font-semibold text-white">
            {instruction}
          </div>
        </div>
      </div>

      {/* Arrow pointing up to indicate it's from the bottom */}
      <div className="w-4 h-4 bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
        <div className="w-0.5 h-2 bg-white"></div>
      </div>
    </div>
  );
};