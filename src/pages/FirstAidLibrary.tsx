import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Volume2, VolumeX } from 'lucide-react';
import { useEmergencySession } from '../contexts/EmergencySessionContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { t } from '../data/emergencyScenarios';
import { FirstAidCard } from '../components/first-aid/FirstAidCard';
import { emergencyScenarios } from '../data/emergencyScenarios';
import type { EmergencyScenario } from '../data/emergencyScenarios';
import { ROUTES, firstAidDetailPath } from '../routes';

const CATEGORIES = [
  'Critical Life Support',
  'Trauma & Injury',
  'Environmental & Allergic',
  'Critical Medical'
];

const translateCat = (catStr: string, lang: 'en' | 'hi') => {
  if (lang === 'en') return catStr;
  const hm: Record<string, string> = {
    'Critical Life Support': 'गंभीर जीवन रक्षक',
    'Trauma & Injury': 'चोट व घाव',
    'Environmental & Allergic': 'पर्यावरणीय व रासायनिक',
    'Critical Medical': 'गंभीर चिकित्सा'
  };
  return hm[catStr] || catStr;
};


export const FirstAidLibrary = () => {
  const navigate = useNavigate();
  const { voiceGuidance, setVoiceGuidance } = useEmergencySession();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<EmergencyScenario['category'] | null>(null);

  const filteredScenarios = emergencyScenarios.filter((s) => {
    const matchesSearch =
      !searchTerm ||
      t(s.title, language).toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(s.overview, language).toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(s.category, language).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || t(s.category, language) === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(ROUTES.home)}
            className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
          </button>

          <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-50 tracking-tight">
            {language === 'hi' ? 'प्राथमिक चिकित्सा लाइब्रेरी' : 'First Aid Library'}
          </h1>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVoiceGuidance(!voiceGuidance)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                voiceGuidance
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {voiceGuidance ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{voiceGuidance ? (language === 'hi' ? 'वॉयस चालू' : 'Voice On') : (language === 'hi' ? 'वॉयस बंद' : 'Voice Off')}</span>
            </button>
            <ThemeToggle className="scale-90" />
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white tracking-wider active:scale-95 transition-all"
            >
              {language === 'en' ? '🇮🇳 HI' : '🌐 EN'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-5 pb-10">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'आपात स्थितियों को खोजें...' : 'Search emergencies…'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-colors"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              activeCategory === null
                ? 'bg-gray-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {language === 'hi' ? 'सभी' : 'All'}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={translateCat(cat, language)}
              onClick={() => setActiveCategory(activeCategory === translateCat(cat, language) ? null : translateCat(cat, language))}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                activeCategory === translateCat(cat, language)
                  ? 'bg-gray-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {translateCat(cat, language)}
            </button>
          ))}
        </div>

        {/* Results */}
        {filteredScenarios.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 dark:text-slate-500 text-sm">{language === 'hi' ? 'कोई आपात स्थिति नहीं मिली। फ़िल्टर बदल कर प्रयास करें।' : 'No scenarios match your search. Try adjusting your filters.'}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredScenarios.map((scenario) => (
              <FirstAidCard
                key={scenario.id}
                scenario={scenario}
                onSelect={() => navigate(firstAidDetailPath(scenario.id))}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FirstAidLibrary;
