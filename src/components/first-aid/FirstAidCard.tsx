import type { EmergencyScenario } from '../../data/emergencyScenarios';
import { t } from '../../data/emergencyScenarios';
import { useLanguage } from '../../contexts/LanguageContext';

interface FirstAidCardProps {
  scenario: EmergencyScenario;
  onSelect: () => void;
  className?: string;
}

const SEVERITY_STYLES: Record<EmergencyScenario['severity'], { bg: string; text: string; ring: string }> = {
  CRITICAL: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-400', ring: 'ring-red-300 dark:ring-red-900/60' },
  URGENT: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-400', ring: 'ring-amber-300 dark:ring-amber-900/60' },
  STABLE: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-400', ring: 'ring-blue-300 dark:ring-blue-900/60' },
};

const CATEGORY_EMOJI: Record<string, string> = {
  'Critical Life Support': '❤️‍🩹',
  'Trauma & Injury': '🩹',
  'Environmental & Allergic': '🌡️',
};

export const FirstAidCard = ({ scenario, onSelect, className = '' }: FirstAidCardProps) => {
  const { language } = useLanguage();
  const sev = SEVERITY_STYLES[scenario.severity];

  // Extract the light color base for the ribbon (e.g. bg-red-100 -> bg-red-500)
  const ribColorMatch = sev.bg.match(/bg-([a-z]+)-100/);
  const ribColor = ribColorMatch ? `bg-${ribColorMatch[1]}-500` : 'bg-gray-500';

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-xl ring-1 ${sev.ring} transition-all cursor-pointer overflow-hidden ${className}`}
    >
      {/* Severity ribbon */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${ribColor}`} />

      <div className="p-5 pt-4">
        {/* Top row: category + severity */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">
            {CATEGORY_EMOJI[t(scenario.category, 'en') as keyof typeof CATEGORY_EMOJI]} {t(scenario.category, language)}
          </span>
          <span className={`text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>
            {scenario.severity}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1.5 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
          {t(scenario.title, language)}
        </h3>

        {/* Overview */}
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
          {t(scenario.overview, language)}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[11px] font-semibold rounded-full">
            {scenario.steps.length} {language === 'hi' ? 'कदम' : 'Steps'}
          </span>
          <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-[11px] font-medium rounded-full">
            {t(scenario.estimatedTime, language)}
          </span>
          {scenario.hasArGuide && (
            <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[11px] font-semibold rounded-full">
              {language === 'hi' ? 'एआर गाइड' : 'AR Guide'}
            </span>
          )}
        </div>
      </div>

      {/* Quick-action footer */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-red-600 dark:text-red-400 tracking-wide">
          ⚡ {t(scenario.quickActionBadge, language)}
        </span>
        <svg className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};
