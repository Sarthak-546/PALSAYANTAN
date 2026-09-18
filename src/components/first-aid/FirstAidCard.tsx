import { ReactNode } from 'react';

interface FirstAidCardProps {
  scenario: {
    id: string;
    title: string;
    description: string;
    icon: string;
    steps: {
      id: string;
      title: string;
      instruction: string;
      visualType: string;
      audioText?: string;
    }[];
  };
  onSelect: () => void;
  className?: string;
}

export const FirstAidCard = ({ scenario, onSelect, className = '' }: FirstAidCardProps) => {
  // Map icon names to actual icons (using Lucide React icon names)
  const iconMap: Record<string, string> = {
    'heart-pulse': 'HeartPulse',
    'droplet': 'Droplet',
    'fire': 'Fire',
    'lungs': 'Lungs',
  };

  const IconComponent = iconMap[scenario.icon] || 'Activity'; // Default to Activity if icon not found

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${className}`}
    >
      <div className="flex items-start space-x-4">
        {/* Icon placeholder */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {/* In a real app, we'd import and use actual Lucide icons here */}
            {/* For now, we'll use a simple text representation */}
            <span className="text-blue-600 text-lg">{scenario.icon === 'heart-pulse' ? '❤' :
                                                   scenario.icon === 'droplet' ? '💧' :
                                                   scenario.icon === 'fire' ? '🔥' :
                                                   scenario.icon === 'lungs' ? '🫁' : '⚡'}</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {scenario.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {scenario.description}
          </p>
          <div className="mt-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs rounded-full">
              {scenario.steps.length} steps
            </span>
          </div>
        </div>
      </div>

      {/* Arrow indicator */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Select to view guidance
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>
    </div>
  );
};