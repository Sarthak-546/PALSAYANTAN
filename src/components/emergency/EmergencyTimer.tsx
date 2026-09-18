import { useEffect, useState } from 'react';

interface EmergencyTimerProps {
  timeInSeconds: number;
  className?: string;
}

export const EmergencyTimer = ({ timeInSeconds, className = '' }: EmergencyTimerProps) => {
  const [displayTime, setDisplayTime] = useState('00:00');

  useEffect(() => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    setDisplayTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }, [timeInSeconds]);

  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 text-center ${className}`}>
      <h2 className="text-xl font-semibold text-gray-100 mb-2">
        ELAPSED TIME
      </h2>
      <div className="text-4xl font-mono text-red-400 font-bold">
        {displayTime}
      </div>
      <p className="mt-2 text-sm text-gray-400">
        since emergency detected
      </p>
    </div>
  );
};